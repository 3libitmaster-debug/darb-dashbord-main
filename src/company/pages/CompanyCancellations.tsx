import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, Eye, Search, MapPin, RefreshCw, AlertCircle, 
  Info, Receipt, ExternalLink, DollarSign, Inbox, Smile,
  Calendar, ShieldAlert, ArrowLeftRight
} from 'lucide-react';
import CompanyLayout from '../components/CompanyLayout';
import { useCancellations } from '../hooks/useCancellations';
import { Modal } from '../../shared/components/Modal';
import { CancellationRequest } from '../../types/booking';

export default function CompanyCancellations() {
  const {
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
  } = useCancellations();

  // Search and visual states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  
  // Accept/Reject confirmation states
  const [requestToProcess, setRequestToProcess] = useState<CancellationRequest | null>(null);
  const [processType, setProcessType] = useState<'accept' | 'reject' | null>(null);

  useEffect(() => {
    fetchCancellations();
  }, [fetchCancellations]);

  // Auto-clearing notifications
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  // Filter and sort requests (newest first based on bookingId)
  const sortedCancellations = [...cancellations]
    .filter((req) => {
      const term = searchTerm.toLowerCase();
      const idMatches = req.bookingId.toString().includes(term);
      const tripMatches = req.tripId.toString().includes(term);
      const customerMatches = (req.customerName || '').toLowerCase().includes(term);
      const startGovMatches = (req.startGovernorate || '').toLowerCase().includes(term);
      const endGovMatches = (req.endGovernorate || '').toLowerCase().includes(term);

      return idMatches || tripMatches || customerMatches || startGovMatches || endGovMatches;
    })
    .sort((a, b) => b.bookingId - a.bookingId);

  // Calculate quick stats with sorted data
  const totalAmountRefunding = sortedCancellations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalSeatsRefunding = sortedCancellations.reduce((sum, r) => sum + (r.reservedSeatsCount || 0), 0);

  const handleOpenActionConfirm = (req: CancellationRequest, type: 'accept' | 'reject') => {
    setRequestToProcess(req);
    setProcessType(type);
  };

  const handleConfirmAction = async () => {
    if (requestToProcess && processType) {
      const { bookingId } = requestToProcess;
      let res;
      if (processType === 'accept') {
        res = await acceptCancellation(bookingId);
      } else {
        res = await rejectCancellation(bookingId);
      }

      if (res.success) {
        setRequestToProcess(null);
        setProcessType(null);
      }
    }
  };

  return (
    <CompanyLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl animate-fade-in font-sans space-y-8" dir="rtl">
        
        {/* PAGE HEADER */}
        <div id="cancellations-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight flex items-center gap-3 justify-start">
              <span className="p-3 bg-red-600 text-white rounded-[1.25rem] shadow-lg shadow-red-100/50">
                <ShieldAlert size={28} />
              </span>
              طلبات إلغاء الحجز والترجيع
            </h1>
            <p className="text-sm font-semibold text-gray-400 mt-2 pr-1">
              مراجعة وإدارة طلبات إلغاء تذاكر الركاب المستلمة من منصة درب، ومعالجة قرارات فك حجز المقاعد والترجيع المالي
            </p>
          </div>
          
          <button
            onClick={fetchCancellations}
            disabled={isLoading}
            className="self-start md:self-center px-5 py-3.5 bg-white hover:bg-slate-50 border border-gray-200 text-gray-600 text-xs font-bold rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`shrink-0 text-red-650 ${isLoading ? 'animate-spin' : ''}`} size={14} />
            تحديث الطلبات من الخادم
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
                <h4 className="font-extrabold text-emerald-950">تمت معالجة الطلب!</h4>
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
        <div id="cancellations-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat 1: Pending count */}
          <div className="bg-white p-6 rounded-[2.25rem] shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none">إجمالي المعاملات قيد النظر</span>
              <span className="text-2xl font-black text-gray-900 font-sans block leading-none">
                {cancellations.length} <span className="text-xs text-gray-400 font-bold">طلب إلغاء معلق</span>
              </span>
            </div>
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
              <ShieldAlert size={24} className="animate-pulse" />
            </div>
          </div>

          {/* Stat 2: Seats count */}
          <div className="bg-white p-6 rounded-[2.25rem] shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none">مجموع مقاعد يراد فك حجزها</span>
              <span className="text-2xl font-black text-gray-900 font-sans block leading-none">
                {totalSeatsRefunding} <span className="text-xs text-gray-400 font-bold">مقعد</span>
              </span>
            </div>
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
              <ArrowLeftRight size={24} />
            </div>
          </div>

          {/* Stat 3: Total expected revenue */}
          <div className="bg-white p-6 rounded-[2.25rem] shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block leading-none">قيمة المبالغ قيد المطالبة</span>
              <span className="text-2xl font-black text-red-655 font-sans block leading-none">
                {totalAmountRefunding.toLocaleString()} <span className="text-xs text-gray-400 font-bold">ريال يمني</span>
              </span>
            </div>
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* SEARCH AND SEARCH BAR ACTIONS */}
        <div id="cancellations-search-bar" className="bg-white p-5 rounded-[2rem] shadow-sm flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بواسطة اسم المسافر، المحافظة، ورقم المعاملة أو رقم الرحلة..."
              className="w-full bg-slate-50/50 pr-12 pl-6 py-4 rounded-xl text-sm font-bold text-gray-900 outline-none focus:bg-slate-50 focus:ring-4 focus:ring-red-100/30 transition-all placeholder:text-gray-300"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs font-black text-gray-400 hover:text-gray-900 shrink-0 pointer border border-gray-100 hover:border-gray-200 px-4 py-4 rounded-xl transition-all hover:bg-gray-50 bg-white shadow-sm"
            >
              مسح تصفية البحث
            </button>
          )}
        </div>

        {/* MAIN DATA TABLE / GRID SYSTEM */}
        {isLoading ? (
          <div className="py-24 text-center rounded-[2.5rem] bg-white text-gray-450 font-bold flex flex-col items-center justify-center gap-4 shadow-sm">
            <RefreshCw className="text-red-600 animate-spin" size={36} />
            <span className="text-sm">جاري جلب طلبات إلغاء الحجوزات من خادم درب...</span>
            <span className="text-[10px] text-gray-400 font-semibold">تأكد من استقرار اتصال الإنترنت للاتصال بالخادم السحابي بشكل سليم</span>
          </div>
        ) : sortedCancellations.length > 0 ? (
          <div className="rounded-[2rem] bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                    <th className="p-5 font-black">رقم الحجز</th>
                    <th className="p-5 font-black">المسافر والعميل</th>
                    <th className="p-5 font-black text-center">مسار الرحلة الملغاة</th>
                    <th className="p-5 font-black text-center">تاريخ ونوع الموعد</th>
                    <th className="p-5 font-black text-center">المقاعد المراد تحريرها</th>
                    <th className="p-5 font-black">المبلغ المدفوع للترجيع</th>
                    <th className="p-5 font-black text-center">سند السداد الأصلي</th>
                    <th className="p-5 font-black text-center">الإجراء والتحكم بالطلب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-semibold">
                  {sortedCancellations.map((req, index) => {
                    let formattedDate = '-------';
                    if (req.departureDate) {
                      try {
                        const d = new Date(req.departureDate);
                        formattedDate = d.toLocaleDateString('ar-YE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      } catch (_) {}
                    }

                    const isBeingProcessed = isActioning === req.bookingId;

                    return (
                      <motion.tr
                        key={req.bookingId}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-slate-50/40 transition-all font-semibold text-gray-700"
                      >
                        {/* Booking Code */}
                        <td className="p-5">
                          <span className="bg-red-50 text-red-700 font-black font-sans text-xs px-2.5 py-1 rounded-xl border border-red-100 shadow-sm inline-block">
                            #{req.bookingId}
                          </span>
                        </td>

                        {/* Customer Details */}
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-sans text-sm font-black shadow-sm">
                              {req.customerName ? req.customerName.charAt(0) : 'D'}
                            </div>
                            <div>
                              <span className="text-gray-900 block font-black text-sm">{req.customerName || 'مستخدم درب'}</span>
                              <span className="text-[10px] text-gray-400 font-extrabold block">رحلة رقم: #{req.tripId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Route Path */}
                        <td className="p-5 text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-100">
                            <span className="text-gray-900 font-extrabold text-[11px]">{req.startGovernorate}</span>
                            <MapPin size={12} className="text-red-500" />
                            <span className="text-gray-900 font-extrabold text-[11px]">{req.endGovernorate}</span>
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
                          <span className="bg-red-50 text-red-700 px-3 py-1 rounded-xl border border-red-100">
                            {req.reservedSeatsCount} مقعد
                          </span>
                        </td>

                        {/* pricing */}
                        <td className="p-5 font-sans font-extrabold text-red-700 text-[13px]">
                          {req.totalAmount?.toLocaleString()} <span className="text-[10px] text-gray-450 font-bold block sm:inline">ر.ي</span>
                        </td>

                        {/* Payment slip details */}
                        <td className="p-5 text-center">
                          {req.receiptImagePath ? (
                            <button
                              type="button"
                              onClick={() => {
                                const fullUrl = req.receiptImagePath.startsWith('http')
                                  ? req.receiptImagePath
                                  : `https://server-darb.runasp.net${req.receiptImagePath}`;
                                setSelectedReceiptUrl(fullUrl);
                              }}
                              className="px-3.5 py-2 text-[10px] font-black border border-red-200 text-red-750 bg-red-50/50 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            >
                              <Receipt size={14} />
                              معاينة الوفد المالي
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-bold italic">لا يحوي مرفق</span>
                          )}
                        </td>

                        {/* Approval Actions */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Approve Cancellation Button */}
                            <button
                              type="button"
                              disabled={isBeingProcessed}
                              onClick={() => handleOpenActionConfirm(req, 'accept')}
                              title="الموافقة على الإلغاء وتحرير المقاعد"
                              className="h-9 w-22 text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Check size={13} />
                              موافقة
                            </button>

                            {/* Reject Cancellation Button */}
                            <button
                              type="button"
                              disabled={isBeingProcessed}
                              onClick={() => handleOpenActionConfirm(req, 'reject')}
                              title="رفض طلب الإلغاء وإبقاء المقاعد محجوزة للعميل"
                              className="h-9 w-22 text-[11px] font-black bg-red-50 hover:bg-red-650 text-red-750 hover:text-white border border-red-150 hover:border-red-600 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <X size={13} />
                              رفض الطلب
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
          <div id="cancellations-empty-state" className="py-24 text-center rounded-[2.5rem] bg-white max-w-7xl mx-auto px-6 shadow-sm">
            <Inbox size={48} className="mx-auto text-gray-300 mb-5 animate-bounce" />
            <h4 className="text-base font-extrabold text-gray-500">لا توجد طلبات إلغاء معلقة حالياً</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1.5 max-w-xl mx-auto leading-relaxed">
              لم يقم أي مسافر بتقديم طلب إلغاء لرحلات شركتكم. جميع حجوزات الركاب الحالية مستقرة ومؤكدة بانتظام.
            </p>
          </div>
        )}

        {/* MODAL: IMAGE RECEIPT PREVIEW */}
        <Modal
          isOpen={selectedReceiptUrl !== null}
          onClose={() => setSelectedReceiptUrl(null)}
          title="معاينة سند السداد الأصلي للحجز"
          subtitle="صورة الحوالة لإثبات الدفع الأصلي قبل طلب الإلغاء الحالي"
          icon={<Receipt size={24} className="text-red-600" />}
          maxWidth="max-w-2xl"
        >
          {selectedReceiptUrl && (
            <div className="space-y-6 text-right font-sans" dir="rtl">
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                مراجعة إثبات التحويل المالي الأصلي المسجل للمسافر للتحقق من المبلغ والبيانات قبل إتمام عملية رد الرسوخ المالي.
              </p>

              <div className="border border-gray-150 rounded-[1.5rem] overflow-hidden shadow-sm bg-stone-50/50 p-4 flex items-center justify-center max-w-lg mx-auto">
                <img
                  src={selectedReceiptUrl}
                  alt="سند الدفع المالي ومرفق إثبات الحوالة"
                  className="max-h-[380px] object-contain w-full rounded-xl select-none"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
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
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5 shrink-0 pointer"
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

        {/* MODAL: ACTION CONFIRMATION */}
        <Modal
          isOpen={requestToProcess !== null}
          onClose={() => {
            setRequestToProcess(null);
            setProcessType(null);
          }}
          title={processType === 'accept' ? 'تأكيد قبول طلب إلغاء الحجز' : 'تأكيد رفض طلب إلغاء الحجز'}
          subtitle={processType === 'accept' ? 'سيؤدي قبول الطلب لتحرير مقاعد الحافلة ورفع الحجز' : 'سيؤدي رفض الطلب لإبقاء حجز المسافر قائماً وتجاهل الإلغاء'}
          icon={<ShieldAlert size={24} className={processType === 'accept' ? 'text-emerald-600' : 'text-red-650'} />}
          maxWidth="max-w-lg"
        >
          {requestToProcess && (
            <div className="space-y-6 text-right font-sans" dir="rtl">
              <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed font-semibold ${
                processType === 'accept' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                  : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                <Info size={16} className={`shrink-0 mt-0.5 ${processType === 'accept' ? 'text-emerald-600' : 'text-red-600'}`} />
                <span>
                  {processType === 'accept' ? (
                    <>
                      تنبيه: أنت بصدد <b className="font-black text-emerald-950">الموافقة على طلب إلغاء</b> تذكرة المسافر {' '}
                      <b className="text-gray-900 font-black">"{requestToProcess.customerName || 'المسافر درب'}"</b> ذات الرقم #{requestToProcess.bookingId}.
                      سيتم فك حجز المقاعد وإتاحتها للبيع للجمهور فوراً، وسيتم إقرار استرجاع قيمة الحجز مخصوماً منها الرسوخ المعتمدة. هل ترغب بالاستمرار؟
                    </>
                  ) : (
                    <>
                      تنبيه: أنت بصدد <b className="font-black text-red-950">رفض طلب إلغاء</b> تذكرة المسافر {' '}
                      <b className="text-gray-900 font-black">"{requestToProcess.customerName || 'المسافر درب'}"</b> ذات الرقم #{requestToProcess.bookingId}.
                      ستظل المقاعد محجوزة وتفاصيل التذكرة مفعلة للرحلة رقم #{requestToProcess.tripId}. هل ترغب بالاستمرار؟
                    </>
                  )}
                </span>
              </div>

              <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-xs space-y-2 font-semibold text-gray-600">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span>المبلغ المالي المعني:</span>
                  <span className="font-extrabold text-gray-900 font-sans">{requestToProcess.totalAmount?.toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>عدد وحجم المقاعد:</span>
                  <span className="font-extrabold text-blue-700 font-sans">{requestToProcess.reservedSeatsCount} مقاعد</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isActioning !== null}
                  onClick={handleConfirmAction}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50 text-white ${
                    processType === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isActioning === requestToProcess.bookingId ? (
                    <RefreshCw className="animate-spin" size={12} />
                  ) : (
                    processType === 'accept' ? <Check size={13} /> : <X size={13} />
                  )}
                  {processType === 'accept' ? 'أؤكد تفعيل الترجيع والإلغاء' : 'أؤكد رفض الطلب وإبقاء الرحلة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRequestToProcess(null);
                    setProcessType(null);
                  }}
                  className="px-6 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-xs cursor-pointer"
                >
                  تراجع
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </CompanyLayout>
  );
}
