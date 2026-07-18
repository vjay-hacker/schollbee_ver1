import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@schoolbee/shared-types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const userRoles = req.user.roles;
      const schoolId = req.headers['x-school-id'] as string || req.tenant?.schoolId;

      if (!schoolId && !userRoles.some(r => r.role === UserRole.SUPER_ADMIN)) {
        throw new ForbiddenError('Tenant Context (X-School-Id) is required to evaluate roles');
      }

      const hasRole = userRoles.some(r => 
        (r.role === UserRole.SUPER_ADMIN) || 
        (r.schoolId === schoolId && allowedRoles.includes(r.role))
      );

      if (!hasRole) {
        throw new ForbiddenError('You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
