/**
 * Pending Subscription Renewals
 */
export interface PendingSubscriptionRequest {
  companySubscriptionId: number;
  companyId: number;
  companyName: string;
  planType: number;
  subscriptionDate: string;
  paymentSlipUrl: string;
  requestType: number;
}
