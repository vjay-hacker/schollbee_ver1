import { UserRole } from '@schoolbee/shared-types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        supabaseUserId: string;
        roles: {
          schoolId: string;
          role: UserRole;
        }[];
      };
      tenant?: {
        schoolId: string;
      };
      requestId?: string;
    }
  }
}
export {};
