import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { UnauthorizedError } from '../utils/errors';
import { UserRole } from '@schoolbee/shared-types';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    // In a full implementation, we fetch school roles from our DB or JWT custom claims.
    // For scaffolding, we query user details and roles associated with user.
    // We mock role fetching or simulate it from Supabase.
    req.user = {
      id: user.id,
      email: user.email || '',
      supabaseUserId: user.id,
      roles: (user.user_metadata?.roles || []).map((r: any) => ({
        schoolId: r.schoolId,
        role: r.role as UserRole,
      })),
    };

    next();
  } catch (error) {
    next(error);
  }
};
