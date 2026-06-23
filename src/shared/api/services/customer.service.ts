import api from '../api';
import { ApiResponse, Customer } from '../../../types/models';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Customer profile management service.
 * Handles administrator workflows to register, edit, delete, and toggle activation states of passengers.
 */
export const CustomerService = {
  /**
   * List all registered passenger profiles.
   * Path: /Admin/Customers [GET]
   */
  getCustomers: () => 
    api.get<ApiResponse<Customer[]>>(API_ENDPOINTS.ADMIN.CUSTOMERS),
  
  /**
   * Register a new passenger account manually with national ID credentials.
   * Path: /Admin/Customers [POST]
   */
  createCustomer: (data: Customer) => 
    api.post<ApiResponse<any>>(API_ENDPOINTS.ADMIN.CUSTOMERS, null, {
      params: {
        Email: data.email,
        Password: data.password,
        FullName: data.fullName,
        DateOfBirth: data.dateOfBirth,
        Phone: data.phone,
        Address: data.address,
        NationalId: data.nationalId
      }
    }),
  
  /**
   * Update details of an active customer account.
   * Path: /Admin/Customers/{id} [PUT]
   */
  updateCustomer: (id: any, data: any) => 
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.CUSTOMER_DETAILS(id), null, {
      params: {
        Email: data.email,
        FullName: data.fullName,
        DateOfBirth: data.dateOfBirth,
        Phone: data.phone,
        Address: data.address,
        NationalId: data.nationalId
      }
    }),
  
  /**
   * Delete or withdraw a passenger profile from the user base.
   * Path: /Admin/Customers/{id} [DELETE]
   */
  deleteCustomer: (id: any) => 
    api.delete<ApiResponse<any>>(API_ENDPOINTS.ADMIN.CUSTOMER_DETAILS(id)),

  /**
   * Activate a suspended passenger profile.
   * Path: /Admin/Customers/{id}/activate [PUT]
   */
  activateCustomer: (id: number) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.ACTIVATE_CUSTOMER(id), {}),

  /**
   * Temporarily ban or lock passenger access.
   * Path: /Admin/Customers/{id}/deactivate [PUT]
   */
  deactivateCustomer: (id: number) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.DEACTIVATE_CUSTOMER(id), {}),

  /**
   * Dual-action toggle between suspended/unblocked state.
   * Path: /Admin/Customers/{userId}/toggle [PUT]
   */
  toggleCustomerActivation: (userId: number) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.TOGGLE_COMPANY_ACTIVATION(userId), {}),
};
