import {
  UserRole,
  SubscriptionStatus,
  PlanTier,
  AttendanceStatus,
  LeaveStatus,
  TripStatus,
  TripType,
  BoardingStatus,
  MealType,
  FoodStatus,
  HealthSeverity,
  HealthLogType,
  AssignmentStatus,
  GradeType,
  NotificationType,
  NotificationChannel,
  AnnouncementPriority,
  AnnouncementAudience,
  Gender,
  BloodGroup,
  AcademicTerm,
} from './enums';

// ============================================
// Base Types
// ============================================

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantEntity extends BaseEntity {
  schoolId: string;
}

export interface SoftDeletable {
  deletedAt: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// ============================================
// Organization & School
// ============================================

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  contactEmail: string;
}

export interface School extends BaseEntity, SoftDeletable {
  organizationId?: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  website?: string;
  timezone: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  subscriptionStatus: SubscriptionStatus;
  planTier: PlanTier;
  isActive: boolean;
  maxStudents: number;
  maxTeachers: number;
}

export interface WhiteLabelConfig extends TenantEntity {
  appName: string;
  logo: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  fontFamily?: string;
  customDomain?: string;
  emailTemplate?: string;
  smsTemplate?: string;
  pushTemplate?: string;
}

// ============================================
// Users & Auth
// ============================================

export interface User extends BaseEntity, SoftDeletable {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  authProvider: string;
  supabaseUserId: string;
}

export interface UserRoleMapping extends BaseEntity {
  userId: string;
  schoolId: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: string;
}

export interface AuthUser {
  user: User;
  roles: UserRoleMapping[];
  activeRole: UserRole;
  activeSchoolId?: string;
  tokens: AuthTokens;
}

// ============================================
// People — Students, Parents, Teachers, Drivers
// ============================================

export interface Student extends TenantEntity, SoftDeletable {
  userId?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  admissionNumber: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup?: BloodGroup;
  photo?: string;
  classId: string;
  sectionId?: string;
  busRouteId?: string;
  address?: string;
  allergies?: string[];
  medicalNotes?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  isActive: boolean;
}

export interface Parent extends TenantEntity, SoftDeletable {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  relationship: 'father' | 'mother' | 'guardian' | 'other';
  occupation?: string;
  address?: string;
  photo?: string;
  isActive: boolean;
}

export interface ParentStudentLink extends BaseEntity {
  parentId: string;
  studentId: string;
  schoolId: string;
  isPrimary: boolean;
}

export interface Teacher extends TenantEntity, SoftDeletable {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  employeeId: string;
  qualification?: string;
  specialization?: string;
  dateOfJoining?: string;
  photo?: string;
  isActive: boolean;
}

export interface Driver extends TenantEntity, SoftDeletable {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry?: string;
  photo?: string;
  isActive: boolean;
}

// ============================================
// Academic Structure
// ============================================

export interface AcademicYear extends TenantEntity {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Class extends TenantEntity {
  name: string;
  grade: string;
  academicYearId: string;
  classTeacherId?: string;
  capacity?: number;
  studentCount?: number;
}

export interface Section extends TenantEntity {
  name: string;
  classId: string;
}

export interface Subject extends TenantEntity {
  name: string;
  code: string;
  description?: string;
  isElective: boolean;
}

export interface ClassSubject extends BaseEntity {
  classId: string;
  subjectId: string;
  teacherId?: string;
  schoolId: string;
}

// ============================================
// Attendance
// ============================================

export interface AttendanceSession extends TenantEntity {
  classId: string;
  sectionId?: string;
  date: string;
  markedById: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  isComplete: boolean;
}

export interface AttendanceRecord extends TenantEntity {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
  arrivedAt?: string;
  markedById: string;
  date: string;
}

// ============================================
// Leave Requests
// ============================================

export interface LeaveRequest extends TenantEntity {
  studentId: string;
  requestedById: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: 'sick' | 'personal' | 'family' | 'other';
  status: LeaveStatus;
  respondedById?: string;
  responseNote?: string;
  respondedAt?: string;
  attachments?: string[];
}

// ============================================
// Transport / GPS
// ============================================

export interface Bus extends TenantEntity {
  busNumber: string;
  licensePlate: string;
  capacity: number;
  make?: string;
  model?: string;
  year?: number;
  isActive: boolean;
}

export interface BusRoute extends TenantEntity {
  name: string;
  routeNumber: string;
  busId?: string;
  driverId?: string;
  isActive: boolean;
}

export interface RouteStop extends TenantEntity {
  routeId: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  estimatedTime?: string;
}

export interface Trip extends TenantEntity {
  routeId: string;
  busId: string;
  driverId: string;
  type: TripType;
  status: TripStatus;
  startedAt?: string;
  completedAt?: string;
  totalStudents: number;
  boardedStudents: number;
}

export interface TripStudent extends BaseEntity {
  tripId: string;
  studentId: string;
  status: BoardingStatus;
  boardedAt?: string;
  droppedAt?: string;
  stopId?: string;
  schoolId: string;
}

export interface GPSLog extends BaseEntity {
  tripId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: string;
  schoolId: string;
}

// ============================================
// Food Tracking
// ============================================

export interface FoodLog extends TenantEntity {
  studentId: string;
  date: string;
  mealType: MealType;
  status: FoodStatus;
  menuItem?: string;
  notes?: string;
  markedById: string;
}

// ============================================
// Health
// ============================================

export interface HealthLog extends TenantEntity {
  studentId: string;
  type: HealthLogType;
  severity: HealthSeverity;
  description: string;
  temperature?: number;
  actionTaken?: string;
  medications?: string[];
  parentNotified: boolean;
  reportedById: string;
  attachments?: string[];
}

// ============================================
// Assignments & Grades
// ============================================

export interface Assignment extends TenantEntity {
  title: string;
  description?: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  type: 'homework' | 'classwork' | 'project' | 'test';
  dueDate: string;
  totalMarks?: number;
  status: AssignmentStatus;
  attachments?: string[];
}

export interface Grade extends TenantEntity {
  studentId: string;
  assignmentId: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade?: string;
  feedback?: string;
  gradedById: string;
  status: AssignmentStatus;
}

// ============================================
// Communication
// ============================================

export interface Announcement extends TenantEntity {
  title: string;
  content: string;
  authorId: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  targetClassIds?: string[];
  publishAt?: string;
  expiresAt?: string;
  isPublished: boolean;
  attachments?: string[];
}

export interface Notification extends TenantEntity {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channel: NotificationChannel;
  isRead: boolean;
  readAt?: string;
  sentAt?: string;
}

export interface ChatMessage extends TenantEntity {
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  attachments?: string[];
}

// ============================================
// AI Assistant
// ============================================

export interface AIConversation extends TenantEntity {
  userId: string;
  studentId?: string;
  type: string;
  title?: string;
  isActive: boolean;
}

export interface AIMessage extends BaseEntity {
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  schoolId: string;
}

// ============================================
// Billing & Subscriptions
// ============================================

export interface SubscriptionPlan extends BaseEntity {
  name: string;
  tier: PlanTier;
  priceMonthly: number;
  priceYearly: number;
  maxStudents: number;
  maxTeachers: number;
  features: string[];
  isActive: boolean;
}

export interface Subscription extends TenantEntity {
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
  cancelledAt?: string;
}

// ============================================
// System
// ============================================

export interface AuditLog extends BaseEntity {
  schoolId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface SchoolFeatureFlag extends TenantEntity {
  feature: string;
  isEnabled: boolean;
}

export interface SupportTicket extends TenantEntity {
  userId: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: string;
  resolvedAt?: string;
}
