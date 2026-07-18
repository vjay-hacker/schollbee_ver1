import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';

export const injectTenant = (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.headers['x-school-id'] as string;
    
    if (!schoolId && req.path !== '/schools' && !req.path.startsWith('/auth')) {
      throw new BadRequestError('Multi-tenant header X-School-Id is missing');
    }

    if (schoolId) {
      req.tenant = { schoolId };
    }

    next();
  } catch (error) {
    next(error);
  }
};
