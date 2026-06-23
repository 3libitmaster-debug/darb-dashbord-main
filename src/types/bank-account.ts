export interface BankAccount {
  bankAccountId: number;
  accountNumber: string;
  accountHolderName: string;
  bankId: number;
  bankName: string;
  companyId: number;
}

export interface BankAccountCreateInput {
  accountNumber: string;
  accountHolderName: string;
  bankId: number;
}

export interface BankAccountUpdateInput {
  accountNumber?: string;
  accountHolderName?: string;
  bankId?: number;
}
