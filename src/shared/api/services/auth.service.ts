import api from '../api';
import { AuthResponse, RegisterCompanyRequest } from '../../../types/auth';
import { ApiResponse } from '../../../types/models';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Authentication and Session Management Service
 * Employs clean modular practices to handle token decoding, OTP validation, and corporate registration request forms.
 */
export const AuthService = {
  /**
   * Log into the application and receive bearer authorization token.
   * Path: /Auth/login [POST]
   */
  login: (email: string, password: string) => 
    api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, { email, password }),
  
  /**
   * Request a one-time OTP registration or verification sequence.
   * Path: /Auth/send-otp [POST]
   */
  sendOtp: (email: string) => 
    api.post<ApiResponse<any>>(API_ENDPOINTS.AUTH.SEND_OTP, { email }),

  /**
   * Validate the one-time OTP password received by the carrier.
   * Path: /Auth/verify-otp [POST]
   */
  verifyOtp: (email: string, otpCode: string) => 
    api.post<ApiResponse<any>>(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otpCode }),

  /**
   * Register a new corporate account with custom multi-part form files (logo, state certificates).
   * Path: /Auth/register-company [POST]
   */
  registerCompany: (data: RegisterCompanyRequest) => {
    const formData = new FormData();
    formData.append('Email', data.email);
    formData.append('Password', data.password);
    formData.append('Name', data.name);
    formData.append('Address', data.address);
    formData.append('Logo', data.logo);
    formData.append('License', data.license);
    formData.append('PlanType', data.planType.toString());
    formData.append('PaymentSlip', data.paymentSlip);

    return api.post<ApiResponse<any>>(API_ENDPOINTS.AUTH.REGISTER_COMPANY, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Send a payment slip and renew the selected service subscription plan.
   * Path: /Company/subscriptions/renew [POST]
   */
  renewSubscription: (data: { email: string; planType: number; paymentSlip: File }) => {
    const formData = new FormData();
    formData.append('Email', data.email);
    formData.append('PlanType', data.planType.toString());
    formData.append('PaymentSlip', data.paymentSlip);

    return api.post<ApiResponse<any>>(API_ENDPOINTS.COMPANY.SUBSCRIPTION_RENEW, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * List available subscription packages supported for carrier accounts.
   * Path: /Company/subscriptions/plans [GET]
   */
  getSubscriptionPlans: () => {
    return api.get<ApiResponse<Array<{ id: number; name: string }>>>(API_ENDPOINTS.COMPANY.SUBSCRIPTION_PLANS);
  },

  /**
   * Terminate active sessions and clear localStorage tokens.
   */
  logout: () => {
    localStorage.removeItem('token');
  },

  /**
   * Decodes JWT tokens safely to fetch roles, credentials, and authorization limits of the active user.
   */
  decodeToken: (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
};
