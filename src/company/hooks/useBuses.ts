import { useState, useCallback } from 'react';
import { BusService } from '../../shared/api/services/bus.service';
import { Bus } from '../../types/bus';
import { createInitialResponse, ApiResponse } from '../../utils/responsePattern';

export function useBuses() {
  const [buses, setBuses] = useState<ApiResponse<Bus[]>>(createInitialResponse([]));
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBuses = useCallback(async () => {
    setBuses(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const response = await BusService.getBuses();
      if (response.data.success) {
        setBuses({ data: response.data.data, status: 'success', error: null });
      } else {
        setBuses({ data: [], status: 'error', error: response.data.message });
      }
    } catch (err: any) {
      setBuses({ data: [], status: 'error', error: 'فشل في تحميل بيانات أسطول الحافلات من الخادم' });
    }
  }, []);

  const addBus = async (data: { plateNumber: string; model: string; capacity: number }) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await BusService.createBus(data);
      if (res.data.success) {
        await fetchBuses();
        return { success: true };
      } else {
        setGlobalError(res.data.message || 'فشل في إضافة الحافلة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'اسم اللوحة مكرر أو حدث خطأ أثناء إضافة الحافلة';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const editBus = async (id: number, data: { model?: string; capacity?: number; status?: number }) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await BusService.updateBus(id, data);
      if (res.data.success) {
        await fetchBuses();
        return { success: true };
      } else {
        setGlobalError(res.data.message || 'فشل في تعديل بيانات الحافلة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'حدث خطأ أثناء تعديل بيانات الحافلة';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeBus = async (id: number) => {
    setGlobalError(null);
    try {
      const res = await BusService.deleteBus(id);
      if (res.data.success) {
        await fetchBuses();
        return { success: true };
      } else {
        setGlobalError(res.data.message || 'فشل في حذف الحافلة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'لا يمكن حذف الحافلة المرتبطة برحلات جارية أو حدث خطأ';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const toggleMaintenance = async (id: number) => {
    setGlobalError(null);
    try {
      const res = await BusService.toggleBusMaintenance(id);
      if (res.data.success) {
        await fetchBuses();
        return { success: true };
      } else {
        setGlobalError(res.data.message || 'فشل في تغيير حالة الصيانة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'حدث خطأ أثناء تغيير حالة الصيانة';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  return {
    buses,
    globalError,
    isSubmitting,
    setGlobalError,
    fetchBuses,
    addBus,
    editBus,
    removeBus,
    toggleMaintenance
  };
}
