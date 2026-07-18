import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ApiResponse } from '../../utils/apiResponse';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { supabaseAdmin } from '../../config/supabase';
import { logger } from '../../utils/logger';
import { z } from 'zod';

const router = Router();

// ─── ASSIGNMENT SCHEMAS ───────────────────────────────────────────────────────

const CreateAssignmentSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  subject_id: z.string().uuid(),
  class_id: z.string().uuid(),
  section_id: z.string().uuid().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  max_marks: z.number().positive().default(100),
  assignment_type: z.enum(['homework', 'classwork', 'project', 'exam', 'quiz']).default('homework'),
  attachment_urls: z.array(z.string().url()).optional().default([]),
});

const GradeSubmissionSchema = z.object({
  assignment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  marks_obtained: z.number().min(0),
  feedback: z.string().optional(),
  grade_type: z.enum(['grade', 'percentage', 'pass_fail']).default('grade'),
  submission_url: z.string().url().optional(),
});

const BulkGradeSchema = z.object({
  assignment_id: z.string().uuid(),
  grades: z.array(z.object({
    student_id: z.string().uuid(),
    marks_obtained: z.number().min(0),
    feedback: z.string().optional(),
  })),
});

// ─── HELPER: Grade Letter from Percentage ────────────────────────────────────

function calculateGradeLetter(obtained: number, maxMarks: number): string {
  const pct = (obtained / maxMarks) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────

// POST /api/v1/academics/assignments — Teacher creates assignment
router.post('/assignments', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const body = CreateAssignmentSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('assignments')
      .insert({
        school_id: schoolId,
        teacher_id: req.user?.id,
        ...body,
        status: 'published',
      })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);

    logger.info(`Assignment created: ${data.id} by teacher ${req.user?.id}`);
    return ApiResponse.created(res, data, 'Assignment created successfully');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/academics/assignments — List assignments for a class
router.get('/assignments', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { class_id, section_id, student_id, status = 'published', page = '1', limit = '20' } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = supabaseAdmin
      .from('assignments')
      .select(`
        *,
        subjects(name, code),
        classes(name),
        sections(name),
        grades(id, marks_obtained, grade_letter, submitted_at, student_id)
      `, { count: 'exact' })
      .eq('school_id', schoolId)
      .eq('status', status)
      .order('due_date', { ascending: true })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (class_id) query = query.eq('class_id', class_id);
    if (section_id) query = query.eq('section_id', section_id);

    const { data, error, count } = await query;
    if (error) throw new BadRequestError(error.message);

    // If student_id filter, mark which are submitted by that student
    let enriched = data || [];
    if (student_id) {
      enriched = enriched.map((a: any) => ({
        ...a,
        my_submission: (a.grades || []).find((g: any) => g.student_id === student_id) || null,
      }));
    }

    return ApiResponse.success(res, { assignments: enriched, total: count, page: parseInt(page as string) });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/academics/assignments/:id — Single assignment detail
router.get('/assignments/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const schoolId = req.tenant?.schoolId;

    const { data, error } = await supabaseAdmin
      .from('assignments')
      .select(`
        *,
        subjects(name, code),
        classes(name),
        sections(name),
        grades(id, marks_obtained, grade_letter, feedback, submitted_at, student_id, students(first_name, last_name, roll_number))
      `)
      .eq('id', id)
      .eq('school_id', schoolId)
      .single();

    if (error || !data) throw new NotFoundError('Assignment not found');

    // Submission stats
    const totalStudents = (data.grades || []).length;
    const submitted = (data.grades || []).filter((g: any) => g.marks_obtained !== null).length;
    const avgMarks = submitted > 0
      ? (data.grades || []).reduce((sum: number, g: any) => sum + (g.marks_obtained || 0), 0) / submitted
      : 0;

    return ApiResponse.success(res, {
      ...data,
      stats: {
        total_students: totalStudents,
        submitted,
        pending: totalStudents - submitted,
        avg_marks: Math.round(avgMarks * 100) / 100,
        avg_percentage: data.max_marks ? Math.round((avgMarks / data.max_marks) * 10000) / 100 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GRADING ─────────────────────────────────────────────────────────────────

// POST /api/v1/academics/grades — Teacher grades a single student submission
router.post('/grades', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const body = GradeSubmissionSchema.parse(req.body);

    // Fetch assignment for max_marks validation
    const { data: assignment } = await supabaseAdmin
      .from('assignments')
      .select('max_marks, title')
      .eq('id', body.assignment_id)
      .eq('school_id', schoolId)
      .single();

    if (!assignment) throw new NotFoundError('Assignment not found');

    if (body.marks_obtained > assignment.max_marks) {
      throw new BadRequestError(`Marks cannot exceed max marks (${assignment.max_marks})`);
    }

    const gradeLetter = calculateGradeLetter(body.marks_obtained, assignment.max_marks);
    const percentage = Math.round((body.marks_obtained / assignment.max_marks) * 10000) / 100;

    const { data, error } = await supabaseAdmin
      .from('grades')
      .upsert({
        school_id: schoolId,
        assignment_id: body.assignment_id,
        student_id: body.student_id,
        teacher_id: req.user?.id,
        marks_obtained: body.marks_obtained,
        grade_letter: gradeLetter,
        percentage,
        feedback: body.feedback,
        grade_type: body.grade_type,
        submission_url: body.submission_url,
        submitted_at: new Date().toISOString(),
      }, { onConflict: 'assignment_id,student_id' })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);

    logger.info(`Grade recorded: student ${body.student_id}, assignment ${body.assignment_id}, marks: ${body.marks_obtained}`);
    return ApiResponse.success(res, { ...data, grade_letter: gradeLetter, percentage });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/academics/grades/bulk — Teacher bulk grades entire class
router.post('/grades/bulk', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const body = BulkGradeSchema.parse(req.body);

    const { data: assignment } = await supabaseAdmin
      .from('assignments')
      .select('max_marks')
      .eq('id', body.assignment_id)
      .eq('school_id', schoolId)
      .single();

    if (!assignment) throw new NotFoundError('Assignment not found');

    const gradeRecords = body.grades.map((g) => ({
      school_id: schoolId,
      assignment_id: body.assignment_id,
      student_id: g.student_id,
      teacher_id: req.user?.id,
      marks_obtained: g.marks_obtained,
      grade_letter: calculateGradeLetter(g.marks_obtained, assignment.max_marks),
      percentage: Math.round((g.marks_obtained / assignment.max_marks) * 10000) / 100,
      feedback: g.feedback,
      submitted_at: new Date().toISOString(),
    }));

    const { data, error } = await supabaseAdmin
      .from('grades')
      .upsert(gradeRecords, { onConflict: 'assignment_id,student_id' })
      .select();

    if (error) throw new BadRequestError(error.message);

    logger.info(`Bulk grades recorded for assignment ${body.assignment_id}: ${gradeRecords.length} students`);
    return ApiResponse.success(res, { graded: data?.length || 0, records: data });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/academics/students/:studentId/progress — Student performance analytics
router.get('/students/:studentId/progress', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    const schoolId = req.tenant?.schoolId;
    const { term, academic_year_id } = req.query;

    // Fetch all grades for student
    let gradesQuery = supabaseAdmin
      .from('grades')
      .select(`
        marks_obtained,
        percentage,
        grade_letter,
        submitted_at,
        assignments(title, subject_id, max_marks, due_date, assignment_type, subjects(name, code))
      `)
      .eq('student_id', studentId)
      .eq('school_id', schoolId)
      .order('submitted_at', { ascending: false });

    const { data: grades, error } = await gradesQuery;
    if (error) throw new BadRequestError(error.message);

    if (!grades || grades.length === 0) {
      return ApiResponse.success(res, {
        student_id: studentId,
        overall_average: 0,
        grade_letter: 'N/A',
        subjects: [],
        trend: [],
        recent_grades: [],
      });
    }

    // Subject-wise aggregation
    const subjectMap: Record<string, { name: string; code: string; marks: number[]; percentages: number[] }> = {};

    for (const g of grades) {
      const assignment = g.assignments as any;
      const subjectId = assignment?.subject_id;
      const subjectName = assignment?.subjects?.name || 'Unknown';
      const subjectCode = assignment?.subjects?.code || '???';

      if (!subjectMap[subjectId]) {
        subjectMap[subjectId] = { name: subjectName, code: subjectCode, marks: [], percentages: [] };
      }
      if (g.marks_obtained !== null) {
        subjectMap[subjectId].marks.push(g.marks_obtained);
        subjectMap[subjectId].percentages.push(g.percentage || 0);
      }
    }

    const subjectSummaries = Object.entries(subjectMap).map(([subjectId, s]) => {
      const avg = s.percentages.reduce((a, b) => a + b, 0) / s.percentages.length;
      return {
        subject_id: subjectId,
        subject_name: s.name,
        subject_code: s.code,
        avg_percentage: Math.round(avg * 100) / 100,
        grade_letter: calculateGradeLetter(avg, 100),
        total_assignments: s.marks.length,
        highest: Math.max(...s.percentages),
        lowest: Math.min(...s.percentages),
      };
    }).sort((a, b) => b.avg_percentage - a.avg_percentage);

    const overallAvg = subjectSummaries.length > 0
      ? subjectSummaries.reduce((sum, s) => sum + s.avg_percentage, 0) / subjectSummaries.length
      : 0;

    // Monthly trend (last 6 months)
    const trend: Record<string, number[]> = {};
    for (const g of grades) {
      if (g.submitted_at && g.percentage !== null) {
        const month = new Date(g.submitted_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!trend[month]) trend[month] = [];
        trend[month].push(g.percentage || 0);
      }
    }
    const trendPoints = Object.entries(trend).map(([month, values]) => ({
      month,
      avg_percentage: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
    })).slice(-6);

    return ApiResponse.success(res, {
      student_id: studentId,
      overall_average: Math.round(overallAvg * 100) / 100,
      overall_grade_letter: calculateGradeLetter(overallAvg, 100),
      subjects: subjectSummaries,
      trend: trendPoints,
      recent_grades: grades.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/academics/class/:classId/analytics — Class-wide performance dashboard
router.get('/class/:classId/analytics', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { classId } = req.params;
    const schoolId = req.tenant?.schoolId;

    // All grades for assignments in this class
    const { data: grades, error } = await supabaseAdmin
      .from('grades')
      .select(`
        marks_obtained, percentage, student_id,
        assignments(class_id, max_marks, subjects(name))
      `)
      .eq('school_id', schoolId)
      .not('marks_obtained', 'is', null);

    if (error) throw new BadRequestError(error.message);

    const classGrades = (grades || []).filter((g: any) => g.assignments?.class_id === classId);

    const totalGrades = classGrades.length;
    const avgPercentage = totalGrades > 0
      ? classGrades.reduce((s: number, g: any) => s + (g.percentage || 0), 0) / totalGrades
      : 0;

    // Grade distribution
    const distribution = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    for (const g of classGrades) {
      const letter = calculateGradeLetter(g.percentage || 0, 100);
      distribution[letter as keyof typeof distribution]++;
    }

    // Top performers (by avg percentage)
    const studentPerf: Record<string, number[]> = {};
    for (const g of classGrades) {
      if (!studentPerf[g.student_id]) studentPerf[g.student_id] = [];
      studentPerf[g.student_id].push(g.percentage || 0);
    }
    const studentRankings = Object.entries(studentPerf).map(([sid, percs]) => ({
      student_id: sid,
      avg_percentage: Math.round((percs.reduce((a, b) => a + b, 0) / percs.length) * 100) / 100,
    })).sort((a, b) => b.avg_percentage - a.avg_percentage);

    return ApiResponse.success(res, {
      class_id: classId,
      total_graded: totalGrades,
      class_avg_percentage: Math.round(avgPercentage * 100) / 100,
      class_grade_letter: calculateGradeLetter(avgPercentage, 100),
      grade_distribution: distribution,
      top_students: studentRankings.slice(0, 10),
      needs_attention: studentRankings.filter(s => s.avg_percentage < 50).slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
