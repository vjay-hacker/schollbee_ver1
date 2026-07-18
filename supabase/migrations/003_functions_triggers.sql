-- ============================================
-- SchoolBee Database Migration: 003_functions_triggers.sql
-- Functions, Triggers, Views and Materialized Views for reporting and automatons.
-- ============================================

-- ───────────────────────────────────────────
-- AUTOMATIC UPDATED_AT TRIGGER
-- ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables that have it
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.columns 
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER trigger_update_timestamp_%I
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();', t, t);
    END LOOP;
END;
$$;

-- ───────────────────────────────────────────
-- HELPER FUNCTIONS FOR ROLES & AUTH
-- ───────────────────────────────────────────

-- Get User Role for a Specific School
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID, p_school_id UUID)
RETURNS user_role AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role 
    FROM user_roles 
    WHERE user_id = p_user_id AND school_id = p_school_id AND is_active = true
    LIMIT 1;
    
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if User is Super Admin
CREATE OR REPLACE FUNCTION is_super_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = p_user_id AND role = 'super_admin' AND is_active = true
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to Automatically create profile on SignUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (email, first_name, last_name, supabase_user_id, is_active)
  VALUES (
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', 'First'),
    COALESCE(new.raw_user_meta_data->>'last_name', 'Last'),
    new.id,
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user trigger link
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ───────────────────────────────────────────
-- REPORTING & ANALYTICS VIEWS
-- ───────────────────────────────────────────

-- School Attendance Summary (Materialized for performance)
CREATE MATERIALIZED VIEW school_attendance_summary AS
SELECT 
    school_id,
    date,
    COUNT(id) FILTER (WHERE status = 'present') AS present_count,
    COUNT(id) FILTER (WHERE status = 'absent') AS absent_count,
    COUNT(id) FILTER (WHERE status = 'late') AS late_count,
    COUNT(id) FILTER (WHERE status = 'half_day') AS half_day_count,
    COUNT(id) FILTER (WHERE status = 'excused') AS excused_count,
    ROUND(COUNT(id) FILTER (WHERE status = 'present')::DECIMAL / NULLIF(COUNT(id), 0) * 100, 2) AS attendance_rate
FROM attendance_records
GROUP BY school_id, date
WITH NO DATA;

CREATE UNIQUE INDEX idx_school_attendance_summary_uid ON school_attendance_summary(school_id, date);

-- Student Performance Summary
CREATE MATERIALIZED VIEW student_performance_summary AS
SELECT 
    g.school_id,
    g.student_id,
    a.subject_id,
    COUNT(g.id) AS assignments_graded,
    AVG(g.percentage) AS average_percentage,
    MIN(g.percentage) AS min_percentage,
    MAX(g.percentage) AS max_percentage
FROM grades g
JOIN assignments a ON g.assignment_id = a.id
GROUP BY g.school_id, g.student_id, a.subject_id
WITH NO DATA;

CREATE UNIQUE INDEX idx_student_performance_summary_uid ON student_performance_summary(school_id, student_id, subject_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY school_attendance_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY student_performance_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
