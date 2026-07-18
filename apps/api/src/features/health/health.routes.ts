import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase';
import { ApiResponse } from '../../utils/apiResponse';
import { BadRequestError } from '../../utils/errors';
import { requireAuth } from '../../middleware/auth';
import { requireRoles } from '../../middleware/rbac';
import { UserRole } from '@schoolbee/shared-types';

const router = Router();

// Log nurse visit or health issue (Teachers / Admin)
router.post('/logs', requireAuth, requireRoles([UserRole.TEACHER, UserRole.SCHOOL_ADMIN]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { studentId, type, severity, description, temperature, actionTaken, medications, parentNotified } = req.body;

    if (!studentId || !type || !severity || !description) {
      throw new BadRequestError('studentId, type, severity, and description are required parameters');
    }

    const { data, error } = await supabaseAdmin
      .from('health_logs')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        type,
        severity,
        description,
        temperature,
        action_taken: actionTaken,
        medications,
        parent_notified: parentNotified || false,
        reported_by_id: req.user?.id,
      })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
});

// View health history for a student
router.get('/:studentId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    const { data, error } = await supabaseAdmin
      .from('health_logs')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
});

export default router;
