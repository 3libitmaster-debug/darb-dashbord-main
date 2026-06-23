export interface Trip {
  tripId: number;
  startGoveName: string;
  endGoveName: string;
  price: number;
  departureDate: string;
  status: string | number;
  availableSeats: number;
  busId: number;
}

export interface TripCreateInput {
  startGoveId: number;
  endGoveId: number;
  departureDate: string;
  period: number;
  busId: number;
}

export interface TripUpdateInput {
  departureDate?: string;
  busId?: number;
}

export interface TripRouteInput {
  stationId: number;
  departureTime: string;
}

export interface CompanyStats {
  upcomingTrips: number;
  soldTickets: number;
}
