-- ============================================
-- SchoolBee Database Migration: 002_rls_policies.sql
-- Enables Row Level Security (RLS) and defines roles policies for tenant isolation.
-- ============================================

-- Helper functions for querying context must be defined before policies.
-- These will be fully declared in the triggers/functions migration, but we create skeletons/stubs
-- or use local subqueries to make sure they compile, or define them briefly here.

-- ───────────────────────────────────────────
-- ENABLE ROW LEVEL SECURITY
-- ───────────────────────────────────────────

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────
-- MULTI-TENANT HELPERS (INLINE LOGIC OR FUNCTIONS)
-- ───────────────────────────────────────────

-- We assume get_user_school_ids() returns the list of school_ids the authenticated user belongs to.
-- We also assume checking if user is super_admin.

-- ───────────────────────────────────────────
-- RLS POLICIES DEFINITION
-- ───────────────────────────────────────────

-- 1. SCHOOLS
CREATE POLICY "Super Admins can do everything on schools" ON schools
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'super_admin'
        )
    );

CREATE POLICY "School Admins/Teachers/Parents/Drivers/Students can read their school" ON schools
    FOR SELECT USING (
        id IN (
            SELECT school_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 2. USERS
CREATE POLICY "Users can read themselves" ON users
    FOR SELECT USING (id = auth.uid() OR supabase_user_id = auth.uid());

CREATE POLICY "Users can update themselves" ON users
    FOR UPDATE USING (id = auth.uid() OR supabase_user_id = auth.uid());

CREATE POLICY "School Admins can read all users in their school" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur_admin
            JOIN user_roles ur_target ON ur_admin.school_id = ur_target.school_id
            WHERE ur_admin.user_id = auth.uid() AND ur_admin.role = 'school_admin' AND ur_target.user_id = users.id
        )
    );

-- 3. STUDENTS
CREATE POLICY "School members can select students in their school" ON students
    FOR SELECT USING (
        school_id IN (
            SELECT school_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "School Admin and Teachers can insert/update/delete students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
              AND user_roles.school_id = students.school_id 
              AND user_roles.role IN ('school_admin', 'teacher')
        )
    );

CREATE POLICY "Parents can view their linked students" ON students
    FOR SELECT USING (
        id IN (
            SELECT student_id FROM parent_student_links psl
            JOIN parents p ON psl.parent_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- 4. PARENTS
CREATE POLICY "School Admins/Teachers can view all parents in school" ON parents
    FOR SELECT USING (
        school_id IN (
            SELECT school_id FROM user_roles 
            WHERE user_id = auth.uid() AND role IN ('school_admin', 'teacher')
        )
    );

CREATE POLICY "Parents can view themselves" ON parents
    FOR SELECT USING (user_id = auth.uid());

-- 5. TEACHERS
CREATE POLICY "School members can view teachers" ON teachers
    FOR SELECT USING (
        school_id IN (
            SELECT school_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "School Admins can manage teachers" ON teachers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
              AND user_roles.school_id = teachers.school_id 
              AND user_roles.role = 'school_admin'
        )
    );

-- 6. CLASSES & SECTIONS
CREATE POLICY "School members can view classes" ON classes
    FOR SELECT USING (
        school_id IN (
            SELECT school_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "School Admin can manage classes" ON classes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
              AND user_roles.school_id = classes.school_id 
              AND user_roles.role = 'school_admin'
        )
    );

CREATE POLICY "School members can view sections" ON sections
    FOR SELECT USING (
        school_id IN (
            SELECT school_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 7. ATTENDANCE SESSIONS & RECORDS
CREATE POLICY "School Admins and Teachers can manage attendance" ON attendance_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
              AND user_roles.school_id = attendance_sessions.school_id 
              AND user_roles.role IN ('school_admin', 'teacher')
        )
    );

CREATE POLICY "Parents can read attendance of their students" ON attendance_records
    FOR SELECT USING (
        student_id IN (
            SELECT student_id FROM parent_student_links psl
            JOIN parents p ON psl.parent_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins/Teachers can manage attendance records" ON attendance_records
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('school_admin', 'teacher')
        )
    );

-- 8. LEAVE REQUESTS
CREATE POLICY "Parents can view and create leave requests for their children" ON leave_requests
    FOR ALL USING (
        student_id IN (
            SELECT student_id FROM parent_student_links psl
            JOIN parents p ON psl.parent_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "School Admins and Teachers can review leave requests" ON leave_requests
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('school_admin', 'teacher')
        )
    );

-- 9. BUSES, ROUTES & GPS LOGS
CREATE POLICY "School members can view routes and stops" ON bus_routes
    FOR SELECT USING (
        school_id IN (
            SELECT school_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Drivers can view/update their own routes" ON bus_routes
    FOR ALL USING (
        driver_id IN (
            SELECT id FROM drivers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "School Admins can manage routes" ON bus_routes
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND role = 'school_admin'
        )
    );

CREATE POLICY "School members can read GPS logs" ON gps_logs
    FOR SELECT USING (
        school_id IN (
            SELECT school_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Drivers can insert GPS logs" ON gps_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'driver'
        )
    );

-- 10. FOOD LOGS
CREATE POLICY "Parents can view food logs of their children" ON food_logs
    FOR SELECT USING (
        student_id IN (
            SELECT student_id FROM parent_student_links psl
            JOIN parents p ON psl.parent_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers and School Admins can manage food logs" ON food_logs
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND role IN ('school_admin', 'teacher')
        )
    );

-- 11. HEALTH LOGS
CREATE POLICY "Parents can view health logs of their children" ON health_logs
    FOR SELECT USING (
        student_id IN (
            SELECT student_id FROM parent_student_links psl
            JOIN parents p ON psl.parent_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "School Admins and Teachers can view and manage health logs" ON health_logs
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND role IN ('school_admin', 'teacher')
        )
    );

-- 12. ASSIGNMENTS & GRADES
CREATE POLICY "Teachers can manage assignments" ON assignments
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND role = 'teacher'
        )
    );

CREATE POLICY "Parents/Students can view assignments" ON assignments
    FOR SELECT USING (
        school_id IN (
            SELECT school_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Parents can view grades of their children" ON grades
    FOR SELECT USING (
        student_id IN (
            SELECT student_id FROM parent_student_links psl
            JOIN parents p ON psl.parent_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can manage grades" ON grades
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND role = 'teacher'
        )
    );

-- 13. ANNOUNCEMENTS & NOTIFICATIONS
CREATE POLICY "School members can read announcements" ON announcements
    FOR SELECT USING (
        school_id IN (
            SELECT school_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "School Admins and Teachers can manage announcements" ON announcements
    FOR ALL USING (
        school_id IN (
            SELECT school_id FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND role IN ('school_admin', 'teacher')
        )
    );

CREATE POLICY "Users can view and update their own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- 14. CHAT MESSAGES
CREATE POLICY "Users can manage their own chat messages" ON chat_messages
    FOR ALL USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- 15. AI CONVERSATIONS
CREATE POLICY "Users can manage their AI conversations" ON ai_conversations
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their AI messages" ON ai_messages
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM ai_conversations WHERE user_id = auth.uid()
        )
    );

-- 16. AUDIT LOGS
CREATE POLICY "Super admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'super_admin'
        )
    );

CREATE POLICY "School Admins can view their school's audit logs" ON audit_logs
    FOR SELECT USING (
        school_id IN (
            SELECT school_id FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND role = 'school_admin'
        )
    );
