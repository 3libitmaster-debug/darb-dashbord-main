import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ticket, Clock, Calendar, Check, X, Eye, Search, MapPin, 
  RefreshCw, AlertCircle, Info, Tag, Receipt, ExternalLink,
  DollarSign, Inbox, Sparkles, Smile
} from 'lucide-react';
import CompanyLayout from '../components/CompanyLayout';
import { UserRole } from '../../types/auth';
import { usePendingBookings } from '../hooks/usePendingBookings';
import { Button } from '../../shared/components/FormElements';
import { Modal } from '../../shared/components/Modal';
import { PendingBooking } from '../../types/booking';

export default function CompanyPendingBookings() {
  const {
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
  } = usePendingBookings();

  // Search and visual states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  
  // Reject confirmation modal states
  const [bookingToReject, setBookingToReject] = useState<PendingBooking | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingBookings();
  }, [fetchPendingBookings]);

  // Handle auto-clearing success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle auto-clearing error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  // Filter pending bookings by search term
  const filteredBookings = pendingBookings.filter((booking) => {
    const term = searchTerm.toLowerCase();
    const idMatches = booking.bookingId.toString().includes(term);
    const tripMatches = booking.tripId.toString().includes(term);
    const customerMatches = (booking.customerName || '').toLowerCase().includes(term);
    const startGovMatches = (booking.startGovernorate || '').toLowerCase().includes(term);
    const endGovMatches = (booking.endGovernorate || '').toLowerCase().includes(term);

    return idMatches || tripMatches || customerMatches || startGovMatches || endGovMatches;
  });

  // Calculate quick metrics
  const totalAmountPending = pendingBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalSeatsPending = pendingBookings.reduce((sum, b) => sum + (b.reservedSeatsCount || 0), 0);

  // Quick Action triggers
  const handleConfirmBtnClick = async (bookingId: number) => {
    const confirmAction = window.confirm('هل أنت متأكد من مطابقة وصحة سند الحوالة وتأكيد هذا الحجز لإصدار التذاكر الإلكترونية فورياً؟');
    if (confirmAction) {
      await confirmBooking(bookingId);
    }
  };

  const handleOpenRejectConfirm = (booking: PendingBooking) => {
    setBookingToReject(booking);
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (bookingToReject) {
      const res = await rejectBooking(bookingToReject.bookingId);
      if (res.success) {
        setIsRejectModalOpen(false);
        setBookingToReject(null);
      }
    }
  };

  return (
    <CompanyLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl animate-fade-in font-sans space-y-8" dir="rtl">
        
        {/* PAGE HEADER */}
        <div id="pending-bookings-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight flex items-center gap-3 justify-start">
              <span className="p-3 bg-orange-600 text-white rounded-[1.25rem] shadow-lg shadow-orange-100/50">
                <Ticket size={28} />
              </span>
              الحجوزات المعلقة وقيد الانتظار
            </h1>
            <p className="text-sm font-semibold text-gray-400 mt-2 pr-1">
              تأكيد السداد الملي الرقمي، ومراجعة سندات الحوالة لحجوزات المسافرين بانتظار التصديق وتفعيل بطاقات الركوب
            </p>
          </div>
          
          <button
            onClick={fetchPendingBookings}
            disabled={isLoading}
            className="self-start md:self-center px-5 py-3.5 bg-white hover:bg-slate-50 border border-gray-200 text-gray-600 text-xs font-bold rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`shrink-0 text-orange-600 ${isLoading ? 'animate-spin' : ''}`} size={14} />
            تحديث البيانات من الخادم
          </button>
        </div>

        {/* NOTIFICATIONS & MESSAGES */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-start justify-start gap-4 text-emerald-800 text-xs shadow-sm"
            >
              <Smile size={20} className="shrink-0 text-emerald-600 mt-0.5" />
              <div className="space-y-1 text-right">
                <h4 className="font-extrabold text-emerald-950">تمت العملية بنجاح!</h4>
                <p className="font-semibold leading-relaxed text-emerald-700">{successMessage}</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-start justify-start gap-4 text-red-800 text-xs shadow-sm"
            >
              <AlertCircle size={20} className="shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-1 text-right">
                <h4 className="font-extrabold text-red-950">تنويه من خادم درب</h4>
                <p className="font-semibold leading-relaxed text-red-700">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS BENTO SECTION */}
        <div id="pending-bookings-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat 1: Pending count */}
          <div className="bg-white p-6 rounded-[2.25rem] shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none">إجمالي المعاملات المعلقة</span>
              <span className="text-2xl font-black text-gray-900 font-sans block leading-none">
                {pendingBookings.length} <span className="text-xs text-gray-400 font-bold">حجز قيد التأكيد</span>
              </span>
            </div>
            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
              <Clock size={24} className="animate-pulse" />
            </div>
          </div>

          {/* Stat 2: Seats count */}
          <div className="bg-white p-6 rounded-[2.25rem] shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none">مجموع المقاعد المحجوزة</span>
              <span className="text-2xl font-black text-gray-900 font-sans block leading-none">
                {totalSeatsPending} <span className="text-xs text-gray-400 font-bold">مقاعد بانتظار التخصيص</span>
              </span>
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Inbox size={24} />
            </div>
          </div>

          {/* Stat 3: Total expected revenue */}
          <div className="bg-white p-6 rounded-[2.25rem] shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block leading-none">العائد المجمع المستحق</span>
              <span className="text-2xl font-black text-orange-655 font-sans block leading-none">
                {totalAmountPending.toLocaleString()} <span className="text-xs text-gray-400 font-bold">ريال يمني</span>
              </span>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-100 text-orange-600 rounded-2xl">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* SEARCH AND SEARCH BAR ACTIONS */}
        <div id="pending-bookings-search-bar" className="bg-white p-5 rounded-[2rem] shadow-sm flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بواسطة اسم المسافر، المحافظة، ورقم المعاملة أو رقم الرحلة..."
              className="w-full bg-slate-50/50 pr-12 pl-6 py-4 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-gray-300"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs font-black text-gray-400 hover:text-gray-900 shrink-0 pointer border border-gray-150 px-4 py-4 rounded-xl transition-all hover:bg-gray-50 bg-white shadow-sm"
            >
              مسح تصفية البحث
            </button>
          )}
        </div>

        {/* MAIN DATA TABLE / GRID SYSTEM */}
        {isLoading ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-white text-gray-450 font-bold flex flex-col items-center justify-center gap-4">
            <RefreshCw className="text-orange-600 animate-spin" size={36} />
            <span className="text-sm">جاري جلب معاملات وحجوزات الركاب المعلقة من خادم درب...</span>
            <span className="text-[10px] text-gray-400 font-semibold">تأكد من استقرار اتصال الإنترنت للاتصال بالخادم السحابي بشكل سليم</span>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="rounded-[2rem] bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                    <th className="p-5 font-black">رقم الحجز</th>
                    <th className="p-5 font-black">المسافر والعميل</th>
                    <th className="p-5 font-black text-center">مسار الرحلة</th>
                    <th className="p-5 font-black text-center">تاريخ ونوع الموعد</th>
                    <th className="p-5 font-black text-center">المقاعد</th>
                    <th className="p-5 font-black">كلفة الحجز المدفوعة</th>
                    <th className="p-5 font-black text-center">إثبات سداد الحوالة</th>
                    <th className="p-5 font-black text-center">تحديث وتصديق الحجز</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-semibold">
                  {filteredBookings.map((booking, index) => {
                    let formattedDate = '-------';
                    if (booking.departureDate) {
                      try {
                        const d = new Date(booking.departureDate);
                        formattedDate = d.toLocaleDateString('ar-YE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      } catch (_) {}
                    }

                    const isBeingProcessed = isActioning === booking.bookingId;

                    return (
                      <motion.tr
                        key={booking.bookingId}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-slate-50/40 transition-all font-semibold text-gray-700"
                      >
                        {/* Booking Code */}
                        <td className="p-5">
                          <span className="bg-orange-50 text-orange-700 font-black font-sans text-xs px-2.5 py-1 rounded-xl border border-orange-100 shadow-sm inline-block">
                            #{booking.bookingId}
                          </span>
                        </td>

                        {/* Customer Details */}
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-sans text-sm font-black shadow-sm">
                              {booking.customerName ? booking.customerName.charAt(0) : 'E'}
                            </div>
                            <div>
                              <span className="text-gray-900 block font-black text-sm">{booking.customerName || 'مستخدم درب'}</span>
                              <span className="text-[10px] text-gray-400 font-extrabold block">رحلة رقم: #{booking.tripId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Route Path */}
                        <td className="p-5 text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-100">
                            <span className="text-gray-900 font-extrabold text-[11px]">{booking.startGovernorate}</span>
                            <MapPin size={12} className="text-orange-500" />
                            <span className="text-gray-900 font-extrabold text-[11px]">{booking.endGovernorate}</span>
                          </div>
                        </td>

                        {/* Date details */}
                        <td className="p-5 text-center">
                          <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-bold justify-center">
                            <Calendar size={13} className="text-gray-400" />
                            <span className="font-sans font-semibold">{formattedDate}</span>
                          </div>
                        </td>

                        {/* seats Count */}
                        <td className="p-5 text-center font-sans font-black text-[13px]">
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-100">
                            {booking.reservedSeatsCount} مقعد
                          </span>
                        </td>

                        {/* pricing */}
                        <td className="p-5 font-sans font-extrabold text-[#059669] text-[13px]">
                          {booking.totalAmount?.toLocaleString()} <span className="text-[10px] text-gray-450 font-bold block sm:inline">ر.ي</span>
                        </td>

                        {/* Payment slip details */}
                        <td className="p-5 text-center">
                          {booking.receiptImagePath ? (
                            <button
                              type="button"
                              onClick={() => {
                                const fullUrl = booking.receiptImagePath.startsWith('http')
                                  ? booking.receiptImagePath
                                  : `https://server-darb.runasp.net${booking.receiptImagePath}`;
                                setSelectedReceiptUrl(fullUrl);
                              }}
                              className="px-3.5 py-2 text-[10px] font-black border border-orange-200 text-orange-700 bg-orange-50/50 rounded-xl hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            >
                              <Receipt size={14} />
                              معاينة سند السداد
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-bold italic">لا يحوي مرفق</span>
                          )}
                        </td>

                        {/* Approval Actions */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Approve Button */}
                            <button
                              type="button"
                              disabled={isBeingProcessed}
                              onClick={() => handleConfirmBtnClick(booking.bookingId)}
                              title="تأكيد ومصادقة الدفع لهذا الحجز"
                              className="h-9 w-18 text-[11px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1 shadow-sm font-semibold cursor-pointer"
                            >
                              <Check size={13} />
                              تأكيد
                            </button>

                            {/* Reject Button */}
                            <button
                              type="button"
                              disabled={isBeingProcessed}
                              onClick={() => handleOpenRejectConfirm(booking)}
                              title="إلغاء ورفض معاملة الحجز"
                              className="h-9 w-18 text-[11px] font-extrabold bg-red-50 hover:bg-red-600 text-red-650 hover:text-white border border-red-150 hover:border-red-600 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <X size={13} />
                              رفض
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div id="pending-bookings-empty-state" className="py-24 text-center border-2 border-dashed border-gray-150 rounded-[2.5rem] bg-white max-w-7xl mx-auto px-6">
            <Inbox size={48} className="mx-auto text-gray-300 mb-5 animate-bounce" />
            <h4 className="text-base font-extrabold text-gray-500">لا توجد طلبات حجز معلقة حالياً</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1.5 max-w-xl mx-auto leading-relaxed">
              جميع حجوزات الركاب والبطاقات مفعلة ومؤكدة بشكل سليم. عندما يقوم المسافرون بحجز تذاكر إضافية ودفع تكلفة حجز الحافلة، ستظهر طلبات تأكيد الحوالات والمعاملات والدفع هنا فوراً.
            </p>
          </div>
        )}

        {/* MODAL: IMAGE RECEIPT PREVIEW */}
        <Modal
          isOpen={selectedReceiptUrl !== null}
          onClose={() => setSelectedReceiptUrl(null)}
          title="معاينة سند السداد والتحويل المالي"
          subtitle="سند الدفع الرقمي لصورة الحوالة لإثبات الحساب قبل التفعيل"
          icon={<Receipt size={24} className="text-orange-600" />}
          maxWidth="max-w-2xl"
        >
          {selectedReceiptUrl && (
            <div className="space-y-6 text-right font-sans" dir="rtl">
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                يتم تحميل صورة سند الحساب من قبل النظام كإثبات تأكيد معاملة الحوالة. تأكد من تطابق تفاصيل الحوالة بالصورة مع حساب شركتكم قبل النقر على تأكيد الحجز.
              </p>

              <div className="border border-gray-150 rounded-[1.5rem] overflow-hidden shadow-sm bg-stone-50/50 p-4 flex items-center justify-center max-w-lg mx-auto bg-cover">
                <img
                  src={selectedReceiptUrl}
                  alt="سند الدفع المالي ومرفق إثبات الحوالة"
                  className="max-h-[380px] object-contain w-full rounded-xl select-none"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Falls back cleanly if cannot load
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f3f4f6/a3a3a3?text=No+Receipt+Image+Found';
                  }}
                />
              </div>

              <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 block tracking-wider uppercase mb-0.5">رابط السند المباشر للتحميل</span>
                  <span className="text-xs text-gray-600 font-semibold block truncate max-w-xs">{selectedReceiptUrl}</span>
                </div>
                <a
                  href={selectedReceiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5 shrink-0 pointer"
                >
                  <ExternalLink size={13} />
                  فتح السند كاملاً ↗
                </a>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedReceiptUrl(null)}
                  className="px-6 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إغلاق نافذة المعاينة
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* MODAL: REJECT CONFIRMATION */}
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => {
            setIsRejectModalOpen(false);
            setBookingToReject(null);
          }}
          title="تأكيد رفض معاملة الحجز"
          subtitle="سيؤدي رفض الحجز إلى تجميد المعاملة للعميل والرحلة"
          icon={<AlertCircle size={24} className="text-red-650" />}
          maxWidth="max-w-lg"
        >
          {bookingToReject && (
            <div className="space-y-6 text-right font-sans" dir="rtl">
              <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-red-700 flex items-start gap-3 text-xs leading-relaxed font-semibold">
                <Info size={16} className="shrink-0 text-red-600 mt-0.5" />
                <span>
                  تنبيه: أنت بصدد إلغاء معاملة حجز المقعد للرحلة التشغيلية رقم #{bookingToReject.tripId} العائدة للمسافر {' '}
                  <b className="text-gray-900 font-black">"{bookingToReject.customerName || 'المسافر درب'}"</b>. 
                  هل قمت بالتأكد من عدم وصول الدفعة أو عدم صلاحية سند التحويل الرقمي المرفق؟
                </span>
              </div>

              <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-xs space-y-2 font-semibold text-gray-600">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span>المبلغ المراد إلغاؤه:</span>
                  <span className="font-extrabold text-gray-900 font-sans">{bookingToReject.totalAmount?.toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>عدد وحجم المقاعد:</span>
                  <span className="font-extrabold text-blue-700 font-sans">{bookingToReject.reservedSeatsCount} مقاعد</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isActioning !== null}
                  onClick={handleConfirmReject}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isActioning === bookingToReject.bookingId ? (
                    <RefreshCw className="animate-spin" size={12} />
                  ) : (
                    <X size={13} />
                  )}
                  أؤكد الرفض والحذف للحجز
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setBookingToReject(null);
                  }}
                  className="px-6 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء التراجع
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </CompanyLayout>
  );
}
