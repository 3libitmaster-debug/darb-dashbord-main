import { useState, useCallback } from 'react';
import { TripFareService } from '../../shared/api/services/trip-fare.service';
import { TripFare, TripFareCreateInput, TripFareUpdateInput } from '../../types/trip-fare';
import { createInitialResponse, ApiResponse } from '../../utils/responsePattern';

export function useTripFares() {
  const [fares, setFares] = useState<ApiResponse<TripFare[]>>(createInitialResponse([]));
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFares = useCallback(async () => {
    setFares(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const response = await TripFareService.getFares();
      if (response.data.success) {
        setFares({ data: response.data.data, status: 'success', error: null });
      } else {
        setFares({ data: [], status: 'error', error: response.data.message });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'فشل في تحميل أسعار واشتراكات الرحلات لشركتكم';
      setFares({ data: [], status: 'error', error: errMsg });
    }
  }, []);

  const addFare = async (data: TripFareCreateInput) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await TripFareService.createFare(data);
      if (res.data.success) {
        await fetchFares();
        return { success: true, message: res.data.message };
      } else {
        setGlobalError(res.data.message || 'فشل في إضافة تسعيرة للرحلة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'تفاصيل التسعيرة غير صالحة أو حدث خطأ أثناء الإضافة';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const editFare = async (id: number, data: TripFareUpdateInput) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await TripFareService.updateFare(id, data);
      if (res.data.success) {
        await fetchFares();
        return { success: true, message: res.data.message };
      } else {
        setGlobalError(res.data.message || 'فشل في تعديل تفاصيل تسعيرة الرحلة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'حدث خطأ أثناء تعديل تسعيرة الرحلة';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFare = async (id: number) => {
    setGlobalError(null);
    try {
      const res = await TripFareService.deleteFare(id);
      if (res.data.success) {
        await fetchFares();
        return { success: true, message: res.data.message };
      } else {
        setGlobalError(res.data.message || 'فشل في حذف تسعيرة الرحلة لتعلقها بسجلات أخرى');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'لا يمكن حذف تسعيرة الرحلة لأنها مستخدمة في رحلات قائمة أو حدث خطأ';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  return {
    fares,
    globalError,
    isSubmitting,
    setGlobalError,
    fetchFares,
    addFare,
    editFare,
    removeFare,
  };
}
