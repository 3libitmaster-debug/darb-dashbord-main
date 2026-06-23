/**
 * Pending Company Onboarding Signups
 */
export interface CompanyRegistrationRequest {
  companyId: number;
  name: string;
  address: string;
  logo: string;
  license: string;
  email: string;
  requestDate: string;
  subscriptionId: number;
  planType: string;
  paymentSlipUrl: string;
}
