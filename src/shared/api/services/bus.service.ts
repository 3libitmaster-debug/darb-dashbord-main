import api from '../api';
import { ApiResponse } from '../../../types/models';
import { API_ENDPOINTS } from '../endpoints';
import { Bus } from '../../../types/bus';

export const BusService = {
  getBuses: () =>
    api.get<ApiResponse<Bus[]>>(API_ENDPOINTS.COMPANY.BUSES),

  createBus: (data: { plateNumber: string; model: string; capacity: number }) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.COMPANY.BUSES, data),

  updateBus: (id: number, data: { model?: string; capacity?: number; status?: number }) =>
    api.put<ApiResponse<any>>(`${API_ENDPOINTS.COMPANY.BUSES}/${id}`, data),

  deleteBus: (id: number) =>
    api.delete<ApiResponse<any>>(`${API_ENDPOINTS.COMPANY.BUSES}/${id}`),

  toggleBusMaintenance: (id: number) =>
    api.patch<ApiResponse<any>>(`${API_ENDPOINTS.COMPANY.BUSES}/${id}/toggle-maintenance`),
};
