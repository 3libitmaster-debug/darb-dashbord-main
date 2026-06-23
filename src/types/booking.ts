export interface PendingBooking {
  bookingId: number;
  customerName: string;
  tripId: number;
  tripRouteId: number;
  startGovernorate: string;
  endGovernorate: string;
  departureDate: string;
  reservedSeatsCount: number;
  totalAmount: number;
  receiptImagePath: string;
  status: 'AwaitingConfirmation' | 'Confirmed' | 'Rejected' | string;
  bookingAt: string;
}

export interface CancellationRequest {
  bookingId: number;
  customerName: string;
  tripId: number;
  tripRouteId: number;
  startGovernorate: string;
  endGovernorate: string;
  departureDate: string;
  reservedSeatsCount: number;
  totalAmount: number;
  receiptImagePath: string;
  status: 'AwaitingCancellation' | string;
  bookingAt: string;
}

