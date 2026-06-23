import api from '../api';
import { ApiResponse } from '../../../types/models';
import { TripFare, TripFareCreateInput, TripFareUpdateInput } from '../../../types/trip-fare';
import { API_ENDPOINTS } from '../endpoints';

export const TripFareService = {
  getFares: () =>
    api.get<ApiResponse<TripFare[]>>(API_ENDPOINTS.COMPANY.TRIP_FARES),

  createFare: (data: TripFareCreateInput) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.COMPANY.TRIP_FARES, null, {
      params: {
        FromGovId: data.fromGovId,
        ToGovId: data.toGovId,
        StationId: data.stationId,
        Price: data.price,
        IsMainStation: data.isMainStation,
      }
    }),

  updateFare: (id: number, data: TripFareUpdateInput) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.COMPANY.TRIP_FARE_DETAILS(id), null, {
      params: {
        Price: data.price,
        IsMainStation: data.isMainStation,
      }
    }),

  deleteFare: (id: number) =>
    api.delete<ApiResponse<any>>(API_ENDPOINTS.COMPANY.TRIP_FARE_DETAILS(id)),
};
