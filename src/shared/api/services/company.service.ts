import api from '../api';
import { ApiResponse } from '../../../types/models';
import { Company } from '../../../types/company';
import { API_ENDPOINTS } from '../endpoints';

export const CompanyAdminService = {
  getCompanies: () => 
    api.get<ApiResponse<Company[]>>(API_ENDPOINTS.ADMIN.PARTNER_COMPANIES),
  
  createCompany: (data: Partial<Company>) => 
    api.post<ApiResponse<any>>(API_ENDPOINTS.ADMIN.PARTNER_COMPANIES, data),
  
  updateCompany: (id: number, data: Partial<Company>) => 
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.PARTNER_DETAILS(id), data),
  
  deleteCompany: (id: number) => 
    api.delete<ApiResponse<any>>(API_ENDPOINTS.ADMIN.PARTNER_DETAILS(id)),
};
