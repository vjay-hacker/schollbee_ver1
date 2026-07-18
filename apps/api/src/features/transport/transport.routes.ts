import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase';
import { ApiResponse } from '../../utils/apiResponse';
import { BadRequestError } from '../../utils/errors';
import { requireAuth } from '../../middleware/auth';
import { requireRoles } from '../../middleware/rbac';
import { UserRole } from '@schoolbee/shared-types';

const router = Router();

// Start a Trip (Driver only)
router.post('/trips/start', requireAuth, requireRoles([UserRole.DRIVER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { routeId, busId, type } = req.body;

    if (!routeId || !busId || !type) {
      throw new BadRequestError('routeId, busId and type are required parameters');
    }

    // Get Driver Profile
    const { data: driver } = await supabaseAdmin
      .from('drivers')
      .select('id')
      .eq('user_id', req.user?.id)
      .single();

    if (!driver) throw new BadRequestError('Authenticated user is not registered as a driver');

    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .insert({
        school_id: schoolId,
        route_id: routeId,
        bus_id: busId,
        driver_id: driver.id,
        type,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, trip);
  } catch (error) {
    next(error);
  }
});

// Update Bus GPS Coordinates (Driver App background worker)
router.post('/gps', requireAuth, requireRoles([UserRole.DRIVER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { tripId, latitude, longitude, speed, heading, accuracy } = req.body;

    if (!tripId || latitude === undefined || longitude === undefined) {
      throw new BadRequestError('tripId, latitude and longitude are required');
    }

    const { data: log, error } = await supabaseAdmin
      .from('gps_logs')
      .insert({
        school_id: schoolId,
        trip_id: tripId,
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, log);
  } catch (error) {
    next(error);
  }
});

// Get Live Bus Location (For Parents)
router.get('/live/:studentId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { studentId } = req.params;

    // Verify parent has access to student
    const { data: link } = await supabaseAdmin
      .from('parent_student_links')
      .select('id')
      .eq('student_id', studentId)
      .eq('parent_id', (
        await supabaseAdmin.from('parents').select('id').eq('user_id', req.user?.id).single()
      ).data?.id)
      .single();

    if (!link && !isSuperAdmin(req.user?.roles)) {
      throw new BadRequestError('You are not authorized to track this student');
    }

    // Get active trip for student's bus route
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('bus_route_id')
      .eq('id', studentId)
      .single();

    if (!student?.bus_route_id) {
      throw new BadRequestError('Student is not registered on any bus route');
    }

    const { data: trip } = await supabaseAdmin
      .from('trips')
      .select('id, bus_id, driver_id, status')
      .eq('route_id', student.bus_route_id)
      .eq('status', 'in_progress')
      .single();

    if (!trip) {
      return ApiResponse.success(res, { status: 'inactive', message: 'No active trip for this route' });
    }

    // Get latest GPS log for active trip
    const { data: gps } = await supabaseAdmin
      .from('gps_logs')
      .select('*')
      .eq('trip_id', trip.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    return ApiResponse.success(res, {
      status: 'active',
      tripId: trip.id,
      busId: trip.bus_id,
      gps,
    });
  } catch (error) {
    next(error);
  }
});

function isSuperAdmin(roles: any[]): boolean {
  return roles.some(r => r.role === UserRole.SUPER_ADMIN);
}

export default router;
