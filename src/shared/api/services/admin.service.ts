import api from '../api';
import { 
  ApiResponse, 
  Governorate, 
  City, 
  Bank, 
  Advertisement, 
  Complaint
} from '../../../types/models';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Global Admin Dashboard and System Parameters Service
 * Handles core global settings, geographical governorates, cities, financial banks, 
 * promotional advertisements, complaints, and general administrative statistics.
 */
export const AdminService = {
  /**
   * Fetch all geographical governorates (regions) registered in the system.
   * Path: /Admin/Governorates [GET]
   */
  getGovernorates: () => 
    api.get<ApiResponse<Governorate[]>>(API_ENDPOINTS.ADMIN.GOVERNORATES),
  
  /**
   * Register a new geographic governorate.
   * Path: /Admin/Governorates [POST]
   */
  createGovernorate: (name: string) => 
    api.post<ApiResponse<any>>(API_ENDPOINTS.ADMIN.GOVERNORATES, { name }),
  
  /**
   * Update geographic governorate details.
   * Path: /Admin/Governorates/{id} [PUT]
   */
  updateGovernorate: (id: number, name: string) => 
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.GOVERNORATE_DETAILS(id), { name }),
  
  /**
   * Delete a governorate completely.
   * Path: /Admin/Governorates/{id} [DELETE]
   */
  deleteGovernorate: (id: number) => 
    api.delete<ApiResponse<any>>(API_ENDPOINTS.ADMIN.GOVERNORATE_DETAILS(id)),

  /**
   * Fetch all cities under a parent governorate.
   * Path: /Admin/Governorates/{govId}/cities [GET]
   */
  getGovernorateCities: (govId: number) => 
    api.get<ApiResponse<City[]>>(API_ENDPOINTS.ADMIN.GOVERNORATE_CITIES(govId)),
  
  /**
   * Create a new city associated with a specific governorate ID.
   * Path: /Admin/Cities [POST]
   */
  createCity: (name: string, governorateId: number) => 
    api.post<ApiResponse<any>>(API_ENDPOINTS.ADMIN.CITIES, { name, governorateId }),
  
  /**
   * Update city description/association records.
   * Path: /Admin/Cities/{id} [PUT]
   */
  updateCity: (id: number, name: string, governorateId: number) => 
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.CITY_DETAILS(id), { name, governorateId }),
  
  /**
   * Delete a city.
   * Path: /Admin/Cities/{id} [DELETE]
   */
  deleteCity: (id: number) => 
    api.delete<ApiResponse<any>>(API_ENDPOINTS.ADMIN.CITY_DETAILS(id)),

  /**
   * List of supported financial banks for transfers.
   * Path: /Admin/Banks [GET]
   */
  getBanks: () => 
    api.get<ApiResponse<Bank[]>>(API_ENDPOINTS.ADMIN.BANKS),
  
  /**
   * Create or update a financial bank with logo assets.
   * Path: /Admin/Banks [POST] or /Admin/Banks/{id} [PUT]
   */
  upsertBank: (id: number | null, bankName: string, logoFile?: File) => {
    const formData = new FormData();
    formData.append('BankName', bankName);
    if (logoFile) formData.append('LogoFile', logoFile);

    const url = id ? API_ENDPOINTS.ADMIN.BANK_DETAILS(id) : API_ENDPOINTS.ADMIN.BANKS;
    const method = id ? 'put' : 'post';

    return api({
      method,
      url,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Permanently delete a financial bank option.
   * Path: /Admin/Banks/{id} [DELETE]
   */
  deleteBank: (id: number) => 
    api.delete<ApiResponse<any>>(API_ENDPOINTS.ADMIN.BANK_DETAILS(id)),

  /**
   * List all promotional/campaign banner advertisements.
   * Path: /Admin/Advertisements [GET]
   */
  getAds: () => 
    api.get<ApiResponse<Advertisement[]>>(API_ENDPOINTS.ADMIN.ADS),

  /**
   * Publish a new advertisement campaign banner with image assets.
   * Path: /Admin/Advertisements [POST]
   */
  createAd: (formData: FormData) => 
    api.post<ApiResponse<any>>(API_ENDPOINTS.ADMIN.ADS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  /**
   * Update an existing advertisement campaign banner or schedule.
   * Path: /Admin/Advertisements/{id} [PUT]
   */
  updateAd: (id: number, formData: FormData) => 
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.AD_DETAILS(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  /**
   * Remove an active advertisement campaign.
   * Path: /Admin/Advertisements/{id} [DELETE]
   */
  deleteAd: (id: number) => 
    api.delete<ApiResponse<any>>(API_ENDPOINTS.ADMIN.AD_DETAILS(id)),

  /**
   * Retrieve active counts and status indicators for the main Admin dashboard view.
   * Path: /Admin/dashboard-stats [GET]
   */
  getDashboardStats: () =>
    api.get<ApiResponse<{
      newRegistrationsCount: number;
      renewalRequestsCount: number;
      totalCustomersCount: number;
      activeAdsCount: number;
    }>>(API_ENDPOINTS.ADMIN.DASHBOARD_STATS),

  /**
   * List of customer and company complaints.
   * Path: /Admin/Complaints [GET]
   */
  getComplaints: () =>
    api.get<ApiResponse<Complaint[]>>(API_ENDPOINTS.ADMIN.COMPLAINTS),

  /**
   * System provider complaint record logs.
   * Path: /Admin/complaints/company [GET]
   */
  getCompanyComplaints: () =>
    api.get<ApiResponse<Complaint[]>>(API_ENDPOINTS.ADMIN.COMPLAINTS_COMPANY),

  /**
   * Technical-specific issue logs.
   * Path: /Admin/complaints/technical [GET]
   */
  getTechnicalComplaints: () =>
    api.get<ApiResponse<Complaint[]>>(API_ENDPOINTS.ADMIN.COMPLAINTS_TECHNICAL),

  /**
   * Respond to a specific corporate complaint with targeted notifications.
   * Path: /Admin/complaints/{id}/respond/company [POST/PUT]
   */
  respondToCompanyComplaint: (id: number, title: string, body: string) => {
    const payload = {
      companyNotificationTitle: title,
      companyNotificationBody: body,
    };
    const url = API_ENDPOINTS.ADMIN.RESPOND_COMPANY_COMPLAINT(id);
    return api.post<ApiResponse<any>>(url, payload)
      .catch(() => api.put<ApiResponse<any>>(url, payload));
  },

  /**
   * Resolve a technical-oriented user issue.
   * Path: /Admin/complaints/{id}/respond/technical [POST/PUT/GET]
   */
  respondToTechnicalComplaint: (id: number) => {
    const url = API_ENDPOINTS.ADMIN.RESPOND_TECHNICAL_COMPLAINT(id);
    return api.post<ApiResponse<any>>(url, {})
      .catch(() => api.put<ApiResponse<any>>(url, {}))
      .catch(() => api.post<ApiResponse<any>>(url))
      .catch(() => api.put<ApiResponse<any>>(url))
      .catch(() => api.get<ApiResponse<any>>(url));
  }
};
