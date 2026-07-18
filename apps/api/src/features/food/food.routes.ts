import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase';
import { ApiResponse } from '../../utils/apiResponse';
import { BadRequestError } from '../../utils/errors';
import { requireAuth } from '../../middleware/auth';
import { requireRoles } from '../../middleware/rbac';
import { UserRole } from '@schoolbee/shared-types';

const router = Router();

// Log meal taken status for a classroom (Teachers)
router.post('/logs', requireAuth, requireRoles([UserRole.TEACHER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { date, mealType, records } = req.body;

    if (!date || !mealType || !records || !Array.isArray(records)) {
      throw new BadRequestError('date, mealType, and records array are required parameters');
    }

    const logsToUpsert = records.map((rec: any) => ({
      school_id: schoolId,
      student_id: rec.studentId,
      date,
      meal_type: mealType,
      status: rec.status,
      menu_item: rec.menuItem,
      notes: rec.notes,
      marked_by_id: req.user?.id,
    }));

    const { data, error } = await supabaseAdmin
      .from('food_logs')
      .upsert(logsToUpsert, { onConflict: 'student_id,date,meal_type' })
      .select();

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
});

// View food logs for a student (Parents / Teachers)
router.get('/:studentId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    const { date } = req.query;

    let query = supabaseAdmin
      .from('food_logs')
      .select('*')
      .eq('student_id', studentId);

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
});

export default router;
