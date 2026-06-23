import { useState, useCallback } from 'react';
import { AdminService } from '../../shared/api/services/admin.service';
import { Governorate, City, Bank } from '../../types/models';
import { createInitialResponse, ApiResponse } from '../../utils/responsePattern';

export function useMaintenance() {
  const [governorates, setGovernorates] = useState<ApiResponse<Governorate[]>>(createInitialResponse([]));
  const [cities, setCities] = useState<ApiResponse<City[]>>(createInitialResponse([]));
  const [banks, setBanks] = useState<ApiResponse<Bank[]>>(createInitialResponse([]));
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fetchGovernorates = useCallback(async () => {
    setGovernorates(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const response = await AdminService.getGovernorates();
      if (response.data.success) {
        setGovernorates({ data: response.data.data, status: 'success', error: null });
      } else {
        setGovernorates({ data: [], status: 'error', error: response.data.message });
      }
    } catch (err) {
      setGovernorates({ data: [], status: 'error', error: 'خطأ في تحميل المحافظات' });
    }
  }, []);

  const fetchCities = useCallback(async (govId: number) => {
    setCities(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const response = await AdminService.getGovernorateCities(govId);
      if (response.data.success) {
        setCities({ data: response.data.data, status: 'success', error: null });
      } else {
        setCities({ data: [], status: 'error', error: response.data.message });
      }
    } catch (err) {
      setCities({ data: [], status: 'error', error: 'خطأ في تحميل المدن' });
    }
  }, []);

  const fetchBanks = useCallback(async () => {
    setBanks(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const response = await AdminService.getBanks();
      if (response.data.success) {
        setBanks({ data: response.data.data, status: 'success', error: null });
      } else {
        setBanks({ data: [], status: 'error', error: response.data.message });
      }
    } catch (err) {
      setBanks({ data: [], status: 'error', error: 'خطأ في تحميل البنوك' });
    }
  }, []);

  return {
    governorates,
    cities,
    banks,
    globalError,
    setGlobalError,
    fetchGovernorates,
    fetchCities,
    fetchBanks
  };
}
