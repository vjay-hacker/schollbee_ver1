/** Standardized API response envelope */
export interface ApiResponseEnvelope<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiErrorDetail | null;
  meta: ApiMeta | null;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  timestamp: string;
  requestId?: string;
}

/** Pagination query parameters */
export interface PaginationParams {
  page: number;
  limit: number;
}

/** User roles in the system */
export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'teacher'
  | 'parent'
  | 'student';

/** Attendance status enum */
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

/** Announcement priority levels */
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

/** Announcement target audience */
export type AnnouncementAudience = 'all' | 'teachers' | 'parents' | 'students' | 'staff';

/** Audit log action types */
export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT';
