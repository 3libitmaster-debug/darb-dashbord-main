import api from '../api';
import { ApiResponse } from '../../../types/models';
import { Station, StationCreateInput, StationUpdateInput } from '../../../types/station';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Station and Hub Location Management Service
 * Configures transportation ports, stop-over geographic hubs, and route nodes.
 */
export const StationService = {
  /**
   * Retrieve all transit stations registered under the transportation firm.
   * Path: /Company/stations [GET]
   */
  getStations: () =>
    api.get<ApiResponse<Station[]>>(API_ENDPOINTS.COMPANY.STATIONS),

  /**
   * Create a transit stop or passenger center with regional metadata.
   * Path: /Company/stations [POST]
   */
  createStation: (data: StationCreateInput) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.COMPANY.STATIONS, null, {
      params: {
        Address: data.address,
        CityId: data.cityId,
        GovernorateId: data.governorateId,
      }
    }),

  /**
   * Modify parameters of an existing transit hub or terminal.
   * Path: /Company/stations/{stationId} [PUT]
   */
  updateStation: (stationId: number, data: StationUpdateInput) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.COMPANY.STATION_DETAILS(stationId), null, {
      params: {
        Address: data.address,
        CityId: data.cityId,
        GovernorateId: data.governorateId,
      }
    }),

  /**
   * Delete or withdraw a terminal from public routing.
   * Path: /Company/stations/{stationId} [DELETE]
   */
  deleteStation: (stationId: number) =>
    api.delete<ApiResponse<any>>(API_ENDPOINTS.COMPANY.STATION_DETAILS(stationId)),
};
