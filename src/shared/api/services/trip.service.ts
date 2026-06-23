import api from '../api';
import { ApiResponse } from '../../../types/models';
import { Trip, TripCreateInput, TripUpdateInput } from '../../../types/trip';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Trip Management Integration Service
 * Manages route planning, schedule parameters, passenger seat allocations,
 * and high-level performance indicators (KPIs) for transport providers.
 */
export const TripService = {
  /**
   * Fetch all scheduled transport trips maintained by the current company.
   * Path: /Company/trips [GET]
   */
  getTrips: () =>
    api.get<ApiResponse<Trip[]>>(API_ENDPOINTS.COMPANY.TRIPS),

  /**
   * Register a new scheduled inter-city or regional trip.
   * Path: /Company/trips [POST]
   */
  createTrip: (data: TripCreateInput) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.COMPANY.TRIPS, data),

  /**
   * Modify trip parameters such as departure times, bus assignment, and stop sequence.
   * Path: /Company/trips/{id} [PUT]
   */
  updateTrip: (id: number, data: TripUpdateInput) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.COMPANY.TRIP_DETAILS(id), data),

  /**
   * Cancel or permanently remove a planned schedule.
   * Path: /Company/trips/{id} [DELETE]
   */
  deleteTrip: (id: number) =>
    api.delete<ApiResponse<any>>(API_ENDPOINTS.COMPANY.TRIP_DETAILS(id)),

  /**
   * Retrieve total revenue, active bus configurations, and ticketing KPIs.
   * Path: /Company/Stats [GET]
   */
  getStats: () =>
    api.get<ApiResponse<any>>(API_ENDPOINTS.COMPANY.DASHBOARD_STATS),

  /**
   * Get all stops/routes associated with a particular trip.
   * Path: /Company/trips/{tripId}/routes [GET]
   */
  getTripRoutes: (tripId: number) =>
    api.get<ApiResponse<any[]>>(API_ENDPOINTS.COMPANY.TRIP_ROUTES(tripId)),

  /**
   * Append an intermediate station stop onto an active trip track.
   * Path: /Company/trips/{tripId}/routes [POST]
   */
  addTripRoute: (tripId: number, data: { stationId: number; departureTime: string }) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.COMPANY.TRIP_ROUTES(tripId), data),

  /**
   * Remove an intermediate station stop from a trip track.
   * Path: /Company/trips/routes/{id} [DELETE]
   */
  deleteTripRoute: (id: number) =>
    api.delete<ApiResponse<any>>(API_ENDPOINTS.COMPANY.TRIP_ROUTE_DETAILS(id)),

  /**
   * Adjust stop schedules and arrival windows for a specific station sub-route.
   * Path: /Company/trips/routes/{id} [PUT]
   */
  updateTripRoute: (id: number, data: { departureTime: string }) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.COMPANY.TRIP_ROUTE_DETAILS(id), data),

  /**
   * List all confirmed tickets, bookings and seat assignments for a single trip.
   * Path: /Company/trips/{tripId}/bookings [GET]
   */
  getTripBookings: (tripId: number) =>
    api.get<ApiResponse<any[]>>(API_ENDPOINTS.COMPANY.TRIP_BOOKINGS(tripId)),
};

