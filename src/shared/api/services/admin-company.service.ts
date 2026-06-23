import api from '../api';
import { ApiResponse, TransportCompany, CompanyRegistrationRequest, PendingSubscriptionRequest } from '../../../types/models';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Admin transport company management service.
 * Handles registering transport providers, monitoring approval status, and tracking plan subscriptions.
 */
export const AdminCompanyService = {
  /**
   * Fetch all transport partner company profiles currently active or suspended.
   * Path: /Admin/Companies [GET]
   */
  getCompanies: () => 
    api.get<ApiResponse<TransportCompany[]>>(API_ENDPOINTS.ADMIN.COMPANIES),

  /**
   * Manually provision a transport partner company.
   * Multipart/formform-data request with license proofs and logo files.
   * Path: /Admin/Companies [POST]
   */
  createCompany: (data: TransportCompany) => {
    const formData = new FormData();
    formData.append('Email', data.email);
    formData.append('Password', data.password || '');
    formData.append('Name', data.name);
    formData.append('Address', data.address);
    formData.append('IsActive', String(data.isActive ?? true));
    
    if (data.logoFile) {
      formData.append('LogoFile', data.logoFile);
    }
    if (data.licenseFile) {
      formData.append('LicenseFile', data.licenseFile);
    }
    
    return api.post<ApiResponse<any>>(API_ENDPOINTS.ADMIN.COMPANIES, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update company records such as business location or branding logos.
   * Path: /Admin/Companies/{id} [PUT]
   */
  updateCompany: (id: number, data: Partial<TransportCompany>) => {
    const formData = new FormData();
    if (data.email) formData.append('Email', data.email);
    if (data.name) formData.append('Name', data.name);
    if (data.address) formData.append('Address', data.address);
    if (data.logoFile) formData.append('LogoFile', data.logoFile);
    if (data.licenseFile) formData.append('LicenseFile', data.licenseFile);
    
    return api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.COMPANY_DETAILS(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Permanently delete a partner profile and remove their routing records.
   * Path: /Admin/Companies/{id} [DELETE]
   */
  deleteCompany: (id: number) => 
    api.delete<ApiResponse<any>>(API_ENDPOINTS.ADMIN.COMPANY_DETAILS(id)),

  /**
   * Unblock or activate a transit company.
   * Path: /Admin/Companies/{id}/activate [PUT]
   */
  activateCompany: (id: number) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.ACTIVATE_COMPANY(id), {}),

  /**
   * Temporarily suspend a transit company's services.
   * Path: /Admin/Companies/{id}/deactivate [PUT]
   */
  deactivateCompany: (id: number) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.DEACTIVATE_COMPANY(id), {}),

  /**
   * Dual-action toggle between suspended/unblocked state.
   * Path: /Admin/Companies/{userId}/toggle [PUT]
   */
  toggleCompanyActivation: (userId: number) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.TOGGLE_COMPANY_ACTIVATION(userId), {}),

  /**
   * Fetch onboardings awaiting administrator licensing review.
   * Path: /Admin/Companies/pending [GET]
   */
  getPendingCompanies: () =>
    api.get<ApiResponse<CompanyRegistrationRequest[]>>(API_ENDPOINTS.ADMIN.PENDING_COMPANIES),

  /**
   * Retrieve carrier subscription and payment receipts submitted for review.
   * Path: /Admin/Subscriptions/pending [GET]
   */
  getPendingSubscriptions: () =>
    api.get<ApiResponse<PendingSubscriptionRequest[]>>(API_ENDPOINTS.ADMIN.PENDING_SUBSCRIPTIONS),

  /**
   * Approve a plan subscription, validating the associated bank transfer receipt.
   * Path: /Admin/Subscriptions/{id}/accept [PUT]
   */
  acceptSubscription: (subscriptionId: number) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.ACCEPT_SUBSCRIPTION(subscriptionId), { subscriptionId }),

  /**
   * Decline a renewal or registration subscription request.
   * Path: /Admin/Subscriptions/{id}/reject [PUT]
   */
  rejectSubscription: (subscriptionId: number) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.REJECT_SUBSCRIPTION(subscriptionId), { subscriptionId }),
};
