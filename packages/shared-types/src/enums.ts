// ============================================
// SchoolBee — Shared Enums
// ============================================

/** User roles in the system */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',
  TEACHER = 'teacher',
  PARENT = 'parent',
  DRIVER = 'driver',
  STUDENT = 'student',
}

/** School subscription status */
export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/** School subscription plan tiers */
export enum PlanTier {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

/** Attendance status */
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  EXCUSED = 'excused',
}

/** Leave request status */
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

/** Trip status for bus tracking */
export enum TripStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/** Trip type (morning pickup vs evening drop) */
export enum TripType {
  MORNING_PICKUP = 'morning_pickup',
  EVENING_DROP = 'evening_drop',
  FIELD_TRIP = 'field_trip',
}

/** Student boarding status on bus */
export enum BoardingStatus {
  NOT_BOARDED = 'not_boarded',
  BOARDED = 'boarded',
  DROPPED = 'dropped',
  ABSENT = 'absent',
}

/** Food tracking meal type */
export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  SNACK = 'snack',
}

/** Food tracking status */
export enum FoodStatus {
  TAKEN = 'taken',
  NOT_TAKEN = 'not_taken',
  PARTIAL = 'partial',
}

/** Health log severity */
export enum HealthSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  EMERGENCY = 'emergency',
}

/** Health log type */
export enum HealthLogType {
  DAILY_CHECK = 'daily_check',
  SICK = 'sick',
  FIRST_AID = 'first_aid',
  NURSE_VISIT = 'nurse_visit',
  MEDICATION = 'medication',
  EMERGENCY = 'emergency',
}

/** Assignment/Homework status */
export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  LATE = 'late',
  MISSING = 'missing',
}

/** Grade type */
export enum GradeType {
  ASSIGNMENT = 'assignment',
  TEST = 'test',
  QUIZ = 'quiz',
  PROJECT = 'project',
  EXAM = 'exam',
  PARTICIPATION = 'participation',
}

/** Notification type */
export enum NotificationType {
  ATTENDANCE = 'attendance',
  BUS_TRACKING = 'bus_tracking',
  HOMEWORK = 'homework',
  GRADE = 'grade',
  FOOD = 'food',
  HEALTH = 'health',
  LEAVE = 'leave',
  ANNOUNCEMENT = 'announcement',
  MESSAGE = 'message',
  EMERGENCY = 'emergency',
  SYSTEM = 'system',
}

/** Notification channel */
export enum NotificationChannel {
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  IN_APP = 'in_app',
}

/** Announcement priority */
export enum AnnouncementPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/** Announcement target audience */
export enum AnnouncementAudience {
  ALL = 'all',
  PARENTS = 'parents',
  TEACHERS = 'teachers',
  DRIVERS = 'drivers',
  STUDENTS = 'students',
  SPECIFIC_CLASS = 'specific_class',
}

/** Gender */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

/** Blood group */
export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

/** Academic term */
export enum AcademicTerm {
  TERM_1 = 'term_1',
  TERM_2 = 'term_2',
  TERM_3 = 'term_3',
  SEMESTER_1 = 'semester_1',
  SEMESTER_2 = 'semester_2',
}

/** Audit log action */
export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
}

/** Feature flag names */
export enum FeatureFlag {
  GPS_TRACKING = 'gps_tracking',
  AI_ASSISTANT = 'ai_assistant',
  FOOD_TRACKING = 'food_tracking',
  HEALTH_MODULE = 'health_module',
  WHATSAPP_NOTIFICATIONS = 'whatsapp_notifications',
  REPORT_CARDS = 'report_cards',
  WHITE_LABEL = 'white_label',
  PARENT_CHAT = 'parent_chat',
  ADVANCED_ANALYTICS = 'advanced_analytics',
}

/** Support ticket status */
export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_ON_CUSTOMER = 'waiting_on_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

/** AI conversation type */
export enum AIConversationType {
  ATTENDANCE_QUERY = 'attendance_query',
  HOMEWORK_QUERY = 'homework_query',
  BUS_QUERY = 'bus_query',
  LEAVE_REQUEST = 'leave_request',
  GENERAL = 'general',
  PERFORMANCE_QUERY = 'performance_query',
  FOOD_QUERY = 'food_query',
  HEALTH_QUERY = 'health_query',
}
