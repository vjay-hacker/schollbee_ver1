import { z } from 'zod';
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
  AuditAction,
  FeatureFlag,
  TicketStatus,
  AIConversationType,
} from './enums';

// ============================================
// Base Schemas
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = z.object({
  query: z.string().min(1).max(200),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const otpRequestSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
});

export const otpVerifySchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
  schoolId: z.string().uuid().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ============================================
// School Schemas
// ============================================

export const createSchoolSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(20).regex(/^[A-Z0-9]+$/, 'School code must be uppercase alphanumeric'),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('IN'),
  postalCode: z.string().optional(),
  website: z.string().url().optional(),
  timezone: z.string().default('Asia/Kolkata'),
  logo: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6C5CE7'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#00CEC9'),
  planTier: z.nativeEnum(PlanTier).default(PlanTier.TRIAL),
});

export const updateSchoolSchema = createSchoolSchema.partial();

// ============================================
// Student Schemas
// ============================================

export const createStudentSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  gender: z.nativeEnum(Gender),
  admissionNumber: z.string().min(1).max(50),
  classId: z.string().uuid(),
  sectionId: z.string().uuid().optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  allergies: z.array(z.string()).optional(),
  medicalNotes: z.string().optional(),
  photo: z.string().url().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  busRouteId: z.string().uuid().optional(),
  parentIds: z.array(z.string().uuid()).optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

// ============================================
// Teacher Schemas
// ============================================

export const createTeacherSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  employeeId: z.string().min(1).max(50),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  dateOfJoining: z.string().optional(),
  classIds: z.array(z.string().uuid()).optional(),
  subjectIds: z.array(z.string().uuid()).optional(),
  photo: z.string().url().optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

// ============================================
// Parent Schemas
// ============================================

export const createParentSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  relationship: z.enum(['father', 'mother', 'guardian', 'other']),
  occupation: z.string().optional(),
  address: z.string().optional(),
  studentIds: z.array(z.string().uuid()).optional(),
  photo: z.string().url().optional(),
});

export const updateParentSchema = createParentSchema.partial();

// ============================================
// Class Schemas
// ============================================

export const createClassSchema = z.object({
  name: z.string().min(1).max(100),
  grade: z.string().min(1).max(20),
  academicYearId: z.string().uuid(),
  classTeacherId: z.string().uuid().optional(),
  capacity: z.number().int().positive().optional(),
});

export const createSectionSchema = z.object({
  name: z.string().min(1).max(50),
  classId: z.string().uuid(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  description: z.string().optional(),
  isElective: z.boolean().default(false),
});

// ============================================
// Attendance Schemas
// ============================================

export const markAttendanceSchema = z.object({
  classId: z.string().uuid(),
  sectionId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  records: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.nativeEnum(AttendanceStatus),
    notes: z.string().optional(),
    arrivedAt: z.string().datetime().optional(),
  })),
});

export const attendanceQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
}).merge(paginationSchema);

// ============================================
// Leave Request Schemas
// ============================================

export const createLeaveRequestSchema = z.object({
  studentId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(5).max(500),
  type: z.enum(['sick', 'personal', 'family', 'other']),
  attachments: z.array(z.string().url()).optional(),
});

export const updateLeaveStatusSchema = z.object({
  status: z.nativeEnum(LeaveStatus),
  responseNote: z.string().optional(),
});

// ============================================
// Food Tracking Schemas
// ============================================

export const markFoodSchema = z.object({
  classId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.nativeEnum(MealType),
  records: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.nativeEnum(FoodStatus),
    menuItem: z.string().optional(),
    notes: z.string().optional(),
  })),
});

// ============================================
// Health Schemas
// ============================================

export const createHealthLogSchema = z.object({
  studentId: z.string().uuid(),
  type: z.nativeEnum(HealthLogType),
  severity: z.nativeEnum(HealthSeverity),
  description: z.string().min(1).max(1000),
  temperature: z.number().min(90).max(110).optional(),
  actionTaken: z.string().optional(),
  medications: z.array(z.string()).optional(),
  parentNotified: z.boolean().default(false),
  attachments: z.array(z.string().url()).optional(),
});

// ============================================
// Assignment / Homework Schemas
// ============================================

export const createAssignmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  type: z.enum(['homework', 'classwork', 'project', 'test']),
  dueDate: z.string().datetime(),
  totalMarks: z.number().positive().optional(),
  attachments: z.array(z.string().url()).optional(),
});

export const gradeSubmissionSchema = z.object({
  studentId: z.string().uuid(),
  assignmentId: z.string().uuid(),
  marksObtained: z.number().min(0),
  feedback: z.string().optional(),
  status: z.nativeEnum(AssignmentStatus),
});

// ============================================
// Announcement Schemas
// ============================================

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  priority: z.nativeEnum(AnnouncementPriority).default(AnnouncementPriority.NORMAL),
  audience: z.nativeEnum(AnnouncementAudience).default(AnnouncementAudience.ALL),
  targetClassIds: z.array(z.string().uuid()).optional(),
  publishAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  attachments: z.array(z.string().url()).optional(),
  sendPush: z.boolean().default(true),
  sendEmail: z.boolean().default(false),
  sendSms: z.boolean().default(false),
});

// ============================================
// Transport Schemas
// ============================================

export const createBusRouteSchema = z.object({
  name: z.string().min(1).max(100),
  routeNumber: z.string().min(1).max(20),
  busId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  stops: z.array(z.object({
    name: z.string(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    order: z.number().int().positive(),
    estimatedTime: z.string().optional(),
  })).optional(),
});

export const gpsUpdateSchema = z.object({
  tripId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  accuracy: z.number().positive().optional(),
  timestamp: z.string().datetime(),
});

export const startTripSchema = z.object({
  routeId: z.string().uuid(),
  type: z.nativeEnum(TripType),
  busId: z.string().uuid(),
});

export const studentBoardingSchema = z.object({
  tripId: z.string().uuid(),
  studentId: z.string().uuid(),
  status: z.nativeEnum(BoardingStatus),
  stopId: z.string().uuid().optional(),
  timestamp: z.string().datetime(),
});

// ============================================
// AI Assistant Schemas
// ============================================

export const aiChatMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(2000),
  type: z.nativeEnum(AIConversationType).default(AIConversationType.GENERAL),
});

// ============================================
// Admin Schemas
// ============================================

export const updateFeatureFlagSchema = z.object({
  schoolId: z.string().uuid(),
  feature: z.nativeEnum(FeatureFlag),
  enabled: z.boolean(),
});

export const updateSubscriptionSchema = z.object({
  schoolId: z.string().uuid(),
  planTier: z.nativeEnum(PlanTier),
  status: z.nativeEnum(SubscriptionStatus),
  expiresAt: z.string().datetime().optional(),
});
