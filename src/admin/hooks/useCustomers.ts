import { useState, useCallback } from 'react';
import { CustomerService } from '../../shared/api/services/customer.service';
import { Customer } from '../../types/models';
import { createInitialResponse, ApiResponse } from '../../utils/responsePattern';

export function useCustomers() {
  const [customers, setCustomers] = useState<ApiResponse<Customer[]>>(createInitialResponse([]));
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setCustomers(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const response = await CustomerService.getCustomers();
      if (response.data.success) {
        setCustomers({ data: response.data.data, status: 'success', error: null });
      } else {
        setCustomers({ data: [], status: 'error', error: response.data.message });
      }
    } catch (err) {
      setCustomers({ data: [], status: 'error', error: 'خطأ في تحميل بيانات العملاء' });
    }
  }, []);

  return {
    customers,
    globalError,
    setGlobalError,
    fetchCustomers
  };
}
