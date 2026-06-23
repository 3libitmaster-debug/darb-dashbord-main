import api from '../api';
import { ApiResponse } from '../../../types/models';
import { PendingBooking, CancellationRequest } from '../../../types/booking';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Booking Integration Service Model
 * Fully captures passenger reservation workflows including approvals, cancellations,
 * and live ticket validation using the electronic QR transit pass.
 */
export const BookingService = {
  /**
   * Fetch all bookings awaiting provider validation for the logged-in transportation firm.
   * Path: /Company/trip/bookings/pending [GET]
   */
  getPendingBookings: () =>
    api.get<ApiResponse<PendingBooking[]>>(API_ENDPOINTS.COMPANY.PENDING_BOOKINGS),

  /**
   * Approve a reservation request, triggering ticket generation and seat reservations.
   * Path: /Company/trip/bookings/{id}/confirm [POST]
   */
  confirmBooking: (bookingId: number) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.COMPANY.CONFIRM_BOOKING(bookingId)),

  /**
   * Refuse a booking reservation request.
   * Path: /Company/trip/bookings/{id}/reject [POST]
   */
  rejectBooking: (bookingId: number) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.COMPANY.REJECT_BOOKING(bookingId)),

  /**
   * Retrieve passenger-requested cancellation appeals and refund demands.
   * Path: /Company/trip/bookings/cancellations [GET]
   */
  getCancellations: () =>
    api.get<ApiResponse<CancellationRequest[]>>(API_ENDPOINTS.COMPANY.CANCELLATIONS),

  /**
   * Approve an active cancellation, marking seats vacant and triggering refund flows.
   * Path: /Company/trip/bookings/{id}/cancellation/accept [POST]
   */
  acceptCancellation: (bookingId: number) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.COMPANY.ACCEPT_CANCELLATION(bookingId)),

  /**
   * Disapprove a cancellation request, keeping the reservation and seat assignments intact.
   * Path: /Company/trip/bookings/{id}/cancellation/reject [POST]
   */
  rejectCancellation: (bookingId: number) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.COMPANY.REJECT_CANCELLATION(bookingId)),

  /**
   * Validate scanned QR boarding keys directly from the mobile app.
   * Supports smart GET/POST query execution depending on server-side capabilities.
   * Path: /Company/trip/bookings/scan?qrCode={code} [POST/GET]
   */
  scanTicket: (qrCode: string, method: 'POST' | 'GET' = 'POST') => {
    const path = API_ENDPOINTS.COMPANY.SCAN_TICKET(qrCode);
    return method === 'POST' ? api.post<ApiResponse<any>>(path) : api.get<ApiResponse<any>>(path);
  }
};


