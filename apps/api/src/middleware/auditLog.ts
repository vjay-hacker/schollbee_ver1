import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

export const auditLog = (action: string, entity: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (body) {
      res.json = originalJson; // Restore
      const responseBody = body;
      
      // Push auditing task to background
      Promise.resolve().then(async () => {
        try {
          const schoolId = req.tenant?.schoolId;
          const userId = req.user?.id;

          if (res.statusCode >= 200 && res.statusCode < 300) {
            await supabaseAdmin.from('audit_logs').insert({
              school_id: schoolId,
              user_id: userId,
              action,
              entity,
              ip_address: req.ip,
              user_agent: req.headers['user-agent'],
              new_value: req.method !== 'GET' ? req.body : undefined,
            });
          }
        } catch (auditError: any) {
          logger.error('Failed writing audit log:', auditError.message);
        }
      });

      return res.json(body);
    };

    next();
  };
};
