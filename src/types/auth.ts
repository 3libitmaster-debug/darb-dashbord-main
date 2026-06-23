export enum UserRole {
  Admin = 'Admin',
  Company = 'Company',
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

export interface UserPayload {
  nameid: string;
  email: string;
  role: UserRole;
  exp: number;
}

export interface RegisterCompanyRequest {
  email: string;
  password: string;
  name: string;
  address: string;
  logo: File;
  license: File;
  planType: number;
  paymentSlip: File;
}
