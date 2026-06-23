import { useState, useCallback } from 'react';
import { BankAccountService } from '../../shared/api/services/bank-account.service';
import { Bank } from '../../types/models';
import { BankAccount, BankAccountCreateInput, BankAccountUpdateInput } from '../../types/bank-account';
import { createInitialResponse, ApiResponse } from '../../utils/responsePattern';

export function useBankAccounts() {
  const [accounts, setAccounts] = useState<ApiResponse<BankAccount[]>>(createInitialResponse([]));
  const [banks, setBanks] = useState<ApiResponse<Bank[]>>(createInitialResponse([]));
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setAccounts(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const response = await BankAccountService.getAccounts();
      if (response.data.success) {
        setAccounts({ data: response.data.data, status: 'success', error: null });
      } else {
        setAccounts({ data: [], status: 'error', error: response.data.message });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'فشل في تحميل الحسابات البنكية';
      setAccounts({ data: [], status: 'error', error: errMsg });
    }
  }, []);

  const fetchBanks = useCallback(async () => {
    setBanks(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const response = await BankAccountService.getBanks();
      if (response.data.success) {
        setBanks({ data: response.data.data, status: 'success', error: null });
      } else {
        setBanks({ data: [], status: 'error', error: response.data.message });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'فشل في تحميل قائمة البنوك المتاحة';
      setBanks({ data: [], status: 'error', error: errMsg });
    }
  }, []);

  const addAccount = async (data: BankAccountCreateInput) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await BankAccountService.createAccount(data);
      if (res.data.success) {
        await fetchAccounts();
        return { success: true };
      } else {
        setGlobalError(res.data.message || 'فشل في إضافة الحساب البنكي');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'تفاصيل الحساب البنكي غير صالحة أو حدث خطأ أثناء الإضافة';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const editAccount = async (id: number, data: BankAccountUpdateInput) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await BankAccountService.updateAccount(id, data);
      if (res.data.success) {
        await fetchAccounts();
        return { success: true };
      } else {
        setGlobalError(res.data.message || 'فشل في تعديل معلومات الحساب البنكي');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'حدث خطأ أثناء تعديل الحساب البنكي';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAccount = async (id: number) => {
    setGlobalError(null);
    try {
      const res = await BankAccountService.deleteAccount(id);
      if (res.data.success) {
        await fetchAccounts();
        return { success: true };
      } else {
        setGlobalError(res.data.message || 'فشل في حذف الحساب البنكي');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'لا يمكن حذف الحساب البنكي المرتبط بعمليات جارية أو حدث خطأ';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  return {
    accounts,
    banks,
    globalError,
    isSubmitting,
    setGlobalError,
    fetchAccounts,
    fetchBanks,
    addAccount,
    editAccount,
    removeAccount,
  };
}
