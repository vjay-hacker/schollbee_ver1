import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase';
import { ApiResponse } from '../../utils/apiResponse';
import { BadRequestError } from '../../utils/errors';
import { requireAuth } from '../../middleware/auth';
import { requireRoles } from '../../middleware/rbac';
import { UserRole } from '@schoolbee/shared-types';

const router = Router();

// Create new School (SaaS Admin / Super Admin capability or trial signup)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, email, timezone, primaryColor, secondaryColor } = req.body;
    if (!name || !code || !email) {
      throw new BadRequestError('Name, Code and Email are required parameters');
    }

    const { data, error } = await supabaseAdmin.from('schools').insert({
      name,
      code,
      email,
      timezone: timezone || 'America/New_York',
      primary_color: primaryColor || '#6C5CE7',
      secondary_color: secondaryColor || '#00CEC9',
    }).select().single();

    if (error) {
      throw new BadRequestError(error.message);
    }

    return ApiResponse.success(res, data, 201);
  } catch (error) {
    next(error);
  }
});

// Get School Profile
router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('schools')
      .select('*, white_label_configs(*)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      throw new BadRequestError('School profiles not found');
    }

    return ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
});

export default router;
