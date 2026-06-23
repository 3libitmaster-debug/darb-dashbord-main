import api from '../api';
import { ApiResponse, Bank } from '../../../types/models';
import { BankAccount, BankAccountCreateInput, BankAccountUpdateInput } from '../../../types/bank-account';
import { API_ENDPOINTS } from '../endpoints';

export const BankAccountService = {
  getAccounts: () =>
    api.get<ApiResponse<BankAccount[]>>(API_ENDPOINTS.COMPANY.BANK_ACCOUNTS),

  createAccount: (data: BankAccountCreateInput) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.COMPANY.BANK_ACCOUNTS, data),

  updateAccount: (id: number, data: BankAccountUpdateInput) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.COMPANY.BANK_ACCOUNT_DETAILS(id), data),

  deleteAccount: (id: number) =>
    api.delete<ApiResponse<any>>(API_ENDPOINTS.COMPANY.BANK_ACCOUNT_DETAILS(id)),

  getBanks: () =>
    api.get<ApiResponse<Bank[]>>(API_ENDPOINTS.ADMIN.BANKS),
};
