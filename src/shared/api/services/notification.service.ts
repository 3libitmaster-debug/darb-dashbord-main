import api from '../api';
import { ApiResponse, AppNotification } from '../../../types/models';
import { API_ENDPOINTS } from '../endpoints';

/**
 * System and App Notification Integration Service
 * Manages fetching real-time notifications and flagging them as acknowledged/read.
 */
export const NotificationService = {
  /**
   * Fetch all broadcasted custom notifications for the current corporate session.
   * Path: /Notification/my-notifications [GET]
   */
  getNotifications: () =>
    api.get<ApiResponse<AppNotification[]>>(API_ENDPOINTS.NOTIFICATION.MY_NOTIFICATIONS),
  
  /**
   * Mark a target notification identifier as read. Supports fallbacks for varying routing systems.
   * Path: /Notification/{id}/read [POST/PUT/GET]
   */
  markAsRead: (id: number) => {
    const url = API_ENDPOINTS.NOTIFICATION.MARK_READ(id);
    return api.post<ApiResponse<any>>(url)
      .catch(() => api.put<ApiResponse<any>>(url))
      .catch(() => api.get<ApiResponse<any>>(url));
  }
};
