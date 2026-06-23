/**
 * Customer Complaint file record
 */
export interface Complaint {
  complaintId: number;
  userId?: number;
  customerId: number;
  customerName?: string;
  complaintType: 'Company' | 'Technical' | string;
  companyId?: number;
  companyName?: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}
