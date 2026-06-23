import { useState, useCallback } from 'react';
import { StationService } from '../../shared/api/services/station.service';
import { Station, StationCreateInput, StationUpdateInput } from '../../types/station';
import { createInitialResponse, ApiResponse } from '../../utils/responsePattern';

export function useStations() {
  const [stations, setStations] = useState<ApiResponse<Station[]>>(createInitialResponse([]));
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStations = useCallback(async () => {
    setStations(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const response = await StationService.getStations();
      if (response.data.success) {
        setStations({ data: response.data.data, status: 'success', error: null });
      } else {
        setStations({ data: [], status: 'error', error: response.data.message });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'فشل في تحميل المحطات لشركتكم';
      setStations({ data: [], status: 'error', error: errMsg });
    }
  }, []);

  const addStation = async (data: StationCreateInput) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await StationService.createStation(data);
      if (res.data.success) {
        await fetchStations();
        return { success: true, message: res.data.message };
      } else {
        setGlobalError(res.data.message || 'فشل في إضافة المحطة الجديدة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'تفاصيل المحطة غير صالحة أو حدث خطأ أثناء الإضافة';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const editStation = async (id: number, data: StationUpdateInput) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await StationService.updateStation(id, data);
      if (res.data.success) {
        await fetchStations();
        return { success: true, message: res.data.message };
      } else {
        setGlobalError(res.data.message || 'فشل في تعديل تفاصيل المحطة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'حدث خطأ أثناء تعديل المحطة';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeStation = async (id: number) => {
    setGlobalError(null);
    try {
      const res = await StationService.deleteStation(id);
      if (res.data.success) {
        await fetchStations();
        return { success: true, message: res.data.message };
      } else {
        setGlobalError(res.data.message || 'فشل في حذف المحطة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'لا يمكن حذف المحطة لأنها مرتبطة برحلات جارية أو حدث خطأ داخلي في الخادم';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  return {
    stations,
    globalError,
    isSubmitting,
    setGlobalError,
    fetchStations,
    addStation,
    editStation,
    removeStation,
  };
}
