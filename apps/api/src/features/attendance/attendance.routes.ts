import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase';
import { ApiResponse } from '../../utils/apiResponse';
import { requireAuth } from '../../middleware/auth';
import { requireRoles } from '../../middleware/rbac';
import { UserRole } from '@schoolbee/shared-types';
import { BadRequestError } from '../../utils/errors';

const router = Router();

// Mark Attendance session
router.post('/', requireAuth, requireRoles([UserRole.TEACHER, UserRole.SCHOOL_ADMIN]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { classId, sectionId, date, records } = req.body;

    if (!classId || !date || !records || !Array.isArray(records)) {
      throw new BadRequestError('classId, date, and records array are required');
    }

    // Begin simulated tx by nesting insert
    // 1. Create or update session
    const { data: session, error: sErr } = await supabaseAdmin
      .from('attendance_sessions')
      .upsert({
        school_id: schoolId,
        class_id: classId,
        section_id: sectionId,
        date,
        marked_by_id: req.user?.id,
        is_complete: true,
      }, { onConflict: 'class_id,section_id,date' })
      .select()
      .single();

    if (sErr || !session) throw new BadRequestError(sErr?.message || 'Failed creating attendance session');

    // 2. Insert records
    const recordsToInsert = records.map((rec: any) => ({
      school_id: schoolId,
      session_id: session.id,
      student_id: rec.studentId,
      status: rec.status,
      notes: rec.notes,
      marked_by_id: req.user?.id,
      date,
    }));

    const { error: rErr } = await supabaseAdmin
      .from('attendance_records')
      .upsert(recordsToInsert, { onConflict: 'session_id,student_id' });

    if (rErr) throw new BadRequestError(rErr.message);

    return ApiResponse.success(res, { sessionId: session.id });
  } catch (error) {
    next(error);
  }
});

export default router;
