/**
 * Customer profile with contact and authentication credentials
 */
export interface Customer {
  id?: number;
  customerId?: number;
  userId?: number;
  email: string;
  password?: string;
  fullName: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  nationalId: string;
  isAcive?: boolean;
  isActive?: boolean;
}
