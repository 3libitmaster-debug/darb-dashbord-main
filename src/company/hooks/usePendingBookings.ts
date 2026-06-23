import { useState, useCallback } from 'react';
import { BookingService } from '../../shared/api/services/booking.service';
import { PendingBooking } from '../../types/booking';

export function usePendingBookings() {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState<number | null>(null); // bookingId being processed

  const fetchPendingBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await BookingService.getPendingBookings();
      if (res.data.success) {
        setPendingBookings(res.data.data || []);
      } else {
        setError(res.data.message || 'فشل في استرداد الحجوزات المعلقة');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'حدث خطأ غير متوقع أثناء تحميل الحجوزات المعلقة');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmBooking = async (bookingId: number) => {
    setIsActioning(bookingId);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await BookingService.confirmBooking(bookingId);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم تأكيد الحجز وإنشآء التذكرة الإلكترونية بنجاح!');
        await fetchPendingBookings();
        return { success: true, message: res.data.message };
      } else {
        setError(res.data.message || 'فشل في تأكيد الحجز');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'حدث خطأ أثناء محاولة تأكيد الحجز';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsActioning(null);
    }
  };

  const rejectBooking = async (bookingId: number) => {
    setIsActioning(bookingId);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await BookingService.rejectBooking(bookingId);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم إلغاء ورفض الحجز بنجاح.');
        await fetchPendingBookings();
        return { success: true, message: res.data.message };
      } else {
        setError(res.data.message || 'فشل في رفض الحجز');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'حدث خطأ أثناء محاولة رفض الحجز';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsActioning(null);
    }
  };

  return {
    pendingBookings,
    isLoading,
    error,
    successMessage,
    isActioning,
    setError,
    setSuccessMessage,
    fetchPendingBookings,
    confirmBooking,
    rejectBooking,
  };
}
