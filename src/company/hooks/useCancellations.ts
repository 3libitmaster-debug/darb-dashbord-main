import { useState, useCallback } from 'react';
import { BookingService } from '../../shared/api/services/booking.service';
import { CancellationRequest } from '../../types/booking';

export function useCancellations() {
  const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState<number | null>(null); // bookingId being processed

  const fetchCancellations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await BookingService.getCancellations();
      if (res.data.success) {
        setCancellations(res.data.data || []);
      } else {
        setError(res.data.message || 'فشل في استرداد طلبات إلغاء الحجز');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'حدث خطأ غير متوقع أثناء تحميل طلبات إلغاء الحجز');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptCancellation = async (bookingId: number) => {
    setIsActioning(bookingId);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await BookingService.acceptCancellation(bookingId);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم قبول طلب إلغاء الحجز وتحديث حالة المقاعد بنجاح!');
        await fetchCancellations();
        return { success: true, message: res.data.message };
      } else {
        setError(res.data.message || 'فشل في قبول طلب الإلغاء');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'حدث خطأ أثناء محاولة قبول طلب إلغاء الحجز';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsActioning(null);
    }
  };

  const rejectCancellation = async (bookingId: number) => {
    setIsActioning(bookingId);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await BookingService.rejectCancellation(bookingId);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم رفض طلب إلغاء الحجز وإبقاء التذكرة كما هي.');
        await fetchCancellations();
        return { success: true, message: res.data.message };
      } else {
        setError(res.data.message || 'فشل في رفض طلب الإلغاء');
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'حدث خطأ أثناء محاولة رفض طلب إلغاء الحجز';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsActioning(null);
    }
  };

  return {
    cancellations,
    isLoading,
    error,
    successMessage,
    isActioning,
    setError,
    setSuccessMessage,
    fetchCancellations,
    acceptCancellation,
    rejectCancellation,
  };
}
