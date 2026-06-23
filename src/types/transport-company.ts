/**
 * Transport Company profiles
 */
export interface TransportCompany {
  companyId?: number;
  userId?: number;
  email: string;
  password?: string;
  name: string;
  address: string;
  license?: string;
  licenseFile?: File;
  logoUrl?: string;
  logoFile?: File;
  averageRating?: number;
  isActive?: boolean;
  joinDate?: string;
}
