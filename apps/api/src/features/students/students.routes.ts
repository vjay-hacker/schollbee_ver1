import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase';
import { ApiResponse } from '../../utils/apiResponse';
import { requireAuth } from '../../middleware/auth';
import { requireRoles } from '../../middleware/rbac';
import { UserRole } from '@schoolbee/shared-types';
import { BadRequestError } from '../../utils/errors';

const router = Router();

// Get Students List
router.get('/', requireAuth, requireRoles([UserRole.SCHOOL_ADMIN, UserRole.TEACHER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { data, error } = await supabaseAdmin
      .from('students')
      .select('*, classes(name)')
      .eq('school_id', schoolId)
      .is('deleted_at', null);

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
});

// Add Student
router.post('/', requireAuth, requireRoles([UserRole.SCHOOL_ADMIN]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { firstName, lastName, admissionNumber, dateOfBirth, gender, classId, sectionId } = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('students')
      .insert({
        school_id: schoolId,
        first_name: firstName,
        last_name: lastName,
        admission_number: admissionNumber,
        date_of_birth: dateOfBirth,
        gender,
        class_id: classId,
        section_id: sectionId,
      })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, data, 201);
  } catch (error) {
    next(error);
  }
});

export default router;
