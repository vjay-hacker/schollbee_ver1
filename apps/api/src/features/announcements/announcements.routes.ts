import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase';
import { ApiResponse } from '../../utils/apiResponse';
import { requireAuth } from '../../middleware/auth';
import { requireRoles } from '../../middleware/rbac';
import { UserRole } from '@schoolbee/shared-types';
import { BadRequestError } from '../../utils/errors';

const router = Router();

// Create Announcement
router.post('/', requireAuth, requireRoles([UserRole.SCHOOL_ADMIN, UserRole.TEACHER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { title, content, priority, audience, targetClassIds } = req.body;

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        school_id: schoolId,
        title,
        content,
        priority: priority || 'normal',
        audience: audience || 'all',
        target_class_ids: targetClassIds,
        author_id: req.user?.id,
      })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, data, 201);
  } catch (error) {
    next(error);
  }
});

// Get Announcements
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
});

export default router;
