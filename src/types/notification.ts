/**
 * System and In-App Notifications
 */
export interface AppNotification {
  id: number;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  receiverId?: number;
  notificationType?: number;
  senderType?: number;
}
