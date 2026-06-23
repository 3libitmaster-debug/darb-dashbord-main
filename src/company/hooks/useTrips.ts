import { useState, useCallback } from 'react';
import { TripService } from '../../shared/api/services/trip.service';
import { Trip, TripCreateInput, TripUpdateInput } from '../../types/trip';
import { createInitialResponse, ApiResponse } from '../../utils/responsePattern';

export function useTrips() {
  const [trips, setTrips] = useState<ApiResponse<Trip[]>>(createInitialResponse([]));
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTrips = useCallback(async () => {
    setTrips(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      const response = await TripService.getTrips();
      if (response.data.success) {
        setTrips({ data: response.data.data, status: 'success', error: null });
      } else {
        setTrips({ data: [], status: 'error', error: response.data.message });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'فشل في تحميل الرحلات الخاصة بشركتكم';
      setTrips({ data: [], status: 'error', error: errMsg });
    }
  }, []);

  const addTrip = async (data: TripCreateInput) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await TripService.createTrip(data);
      if (res.data.success) {
        await fetchTrips();
        return { 
          success: true, 
          message: res.data.message || 'تم تسجيل الرحلة بنجاح', 
          data: res.data.data 
        };
      } else {
        setGlobalError(res.data.message || 'فشل في إضافة الرحلة الجديدة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'بيانات الرحلة غير صالحة أو حدث خطأ أثناء الإضافة';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRoute = async (tripId: number, data: { stationId: number; departureTime: string }) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await TripService.addTripRoute(tripId, data);
      return { 
        success: res.data.success, 
        message: res.data.message || 'تمت إضافة المسار بنجاح' 
      };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'تفاصيل المسار غير صالحة أو حدث خطأ أثناء الإضافة';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoutes = async (tripId: number) => {
    try {
      const res = await TripService.getTripRoutes(tripId);
      return {
        success: res.data.success,
        data: res.data.data || [],
        message: res.data.message
      };
    } catch (err: any) {
      return { success: false, data: [], message: err.message };
    }
  };

  const getBookings = async (tripId: number) => {
    try {
      const res = await TripService.getTripBookings(tripId);
      return {
        success: res.data.success,
        data: res.data.data || [],
        message: res.data.message
      };
    } catch (err: any) {
      return { success: false, data: [], message: err.response?.data?.message || err.message || 'فشل في تحميل حجوزات هذه الرحلة' };
    }
  };

  const removeRoute = async (routeId: number) => {
    try {
      const res = await TripService.deleteTripRoute(routeId);
      return {
        success: res.data.success,
        message: res.data.message || 'تم حذف المسار بنجاح'
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const updateRoute = async (routeId: number, data: { departureTime: string }) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await TripService.updateTripRoute(routeId, data);
      return {
        success: res.data.success,
        message: res.data.message || 'تم تحديث توقيت المسار بنجاح'
      };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'حدث خطأ أثناء تعديل توقيت المحطة بالمسار';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const editTrip = async (id: number, data: TripUpdateInput) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const res = await TripService.updateTrip(id, data);
      if (res.data.success) {
        await fetchTrips();
        return { success: true, message: res.data.message || 'تمت تعديل بيانات الرحلة بنجاح' };
      } else {
        setGlobalError(res.data.message || 'فشل في تعديل تفاصيل الرحلة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'حدث خطأ أثناء تعديل بيانات الرحلة';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeTrip = async (id: number) => {
    setGlobalError(null);
    try {
      const res = await TripService.deleteTrip(id);
      if (res.data.success) {
        await fetchTrips();
        return { success: true, message: res.data.message || 'تم حذف الرحلة بنجاح' };
      } else {
        setGlobalError(res.data.message || 'فشل في حذف الرحلة المحددة');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'لا يمكن حذف هذه الرحلة أو حدث خطأ بالنظام';
      setGlobalError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  return {
    trips,
    globalError,
    isSubmitting,
    setGlobalError,
    fetchTrips,
    addTrip,
    editTrip,
    removeTrip,
    addRoute,
    getRoutes,
    getBookings,
    removeRoute,
    updateRoute,
  };
}
