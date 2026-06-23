import React from 'react';
import { Ticket, ArrowLeftRight, Calendar, AlertCircle, RefreshCw, Bus as BusIcon, Tag, MapPin, Receipt, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/FormElements';
import { Trip } from '../../../types/models';

interface TripBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTripDetails: Trip | null;
  bookingsError: string | null;
  isLoadingBookings: boolean;
  tripBookings: any[];
  selectedReceiptForPreview: string | null;
  setSelectedReceiptForPreview: (url: string | null) => void;
}

export const TripBookingsModal: React.FC<TripBookingsModalProps> = ({
  isOpen,
  onClose,
  selectedTripDetails,
  bookingsError,
  isLoadingBookings,
  tripBookings,
  selectedReceiptForPreview,
  setSelectedReceiptForPreview,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="سجل حجوزات الرحلة والمبيعات"
      subtitle={`قائمة الحجوزات المؤكدة وتفاصيل المدفوعات للرحلة رقم #TRP-${selectedTripDetails?.tripId}`}
      icon={<Ticket size={24} className="text-emerald-600" />}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6" dir="rtl">
        
        {/* Header pathway status details */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-transparent p-5 rounded-2xl border border-emerald-500/10 text-right">
          <span className="text-[10px] font-black text-emerald-600 block mb-1 uppercase tracking-wider">الرحلة التشغيلية المحددة</span>
          <div className="flex flex-wrap items-center gap-4 justify-start">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gray-950">{selectedTripDetails?.startGoveName}</span>
              <ArrowLeftRight size={14} className="text-emerald-500 shrink-0" />
              <span className="text-sm font-black text-gray-950">{selectedTripDetails?.endGoveName}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg font-bold font-sans">#TRP-{selectedTripDetails?.tripId}</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-bold font-sans flex items-center gap-1">
                <Calendar size={12} className="text-slate-500" />
                {selectedTripDetails?.departureDate ? new Date(selectedTripDetails.departureDate).toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' }) : '---'}
              </span>
            </div>
          </div>
        </div>

        {/* ERROR DISPLAY */}
        {bookingsError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-start gap-2 text-red-650 text-xs font-bold leading-relaxed text-right">
            <AlertCircle size={16} className="shrink-0 text-red-650" />
            <span className="font-semibold">{bookingsError}</span>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoadingBookings ? (
          <div className="text-center py-16 text-gray-400 font-bold flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-emerald-500" size={32} />
            <span className="text-sm text-gray-600">جاري تحميل سجل وحجوزات الركاب من خادم درب...</span>
          </div>
        ) : tripBookings.length > 0 ? (
          <div className="space-y-6">
            
            {/* Visual Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Total confirmed bookings */}
              <div className="bg-gradient-to-br from-white to-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Ticket size={22} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-black block leading-none">إجمالي الحجوزات</span>
                  <span className="text-xl font-extrabold text-gray-900 font-sans mt-1.5 block">{tripBookings.length} حجز مؤكد</span>
                </div>
              </div>

              {/* Total passengers (Seats bought) */}
              <div className="bg-gradient-to-br from-white to-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <BusIcon size={22} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-black block leading-none">المقاعد المحجوزة</span>
                  <span className="text-xl font-extrabold text-gray-900 font-sans mt-1.5 block">
                    {tripBookings.reduce((sum, item) => sum + (item.reservedSeatsCount || 0), 0)} مقعد
                  </span>
                </div>
              </div>

              {/* Total amount accrued */}
              <div className="bg-gradient-to-br from-white to-slate-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-4 shadow-sm">
                <div className="p-3 bg-amber-50 text-amber-655 rounded-xl">
                  <Tag size={22} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-black block leading-none">مبيعات الرحلة الإجمالية</span>
                  <span className="text-xl font-extrabold text-orange-655 font-sans mt-1.5 block">
                    {tripBookings.reduce((sum, item) => sum + (item.totalAmount || 0), 0).toLocaleString()} ر.ي
                  </span>
                </div>
              </div>

            </div>

            {/* Table for bookings lists */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-black text-gray-400">
                    <th className="p-4">اسم العميل ورقم الحساب</th>
                    <th className="p-4 text-center">أماكن الحجز والمحطة</th>
                    <th className="p-4 text-center">المقاعد المحجوزة</th>
                    <th className="p-4">المبلغ المدفوع</th>
                    <th className="p-4">توقيت الحجز</th>
                    <th className="p-4 text-center">سند التحويل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {tripBookings.map((booking, idx) => {
                    let bookingTimeStr = '---';
                    if (booking.bookingAt) {
                      try {
                        const d = new Date(booking.bookingAt);
                        bookingTimeStr = d.toLocaleString('ar-YE', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      } catch (_) {}
                    }

                    return (
                      <tr key={booking.customerId + '-' + idx} className="hover:bg-slate-50/50 font-medium">
                        {/* Client Name & ID */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-black font-sans text-xs">
                              {booking.customerName ? booking.customerName.charAt(0) : '#'}
                            </div>
                            <div>
                              <span className="font-extrabold text-gray-900 block">{booking.customerName || 'مستخدم مجهول'}</span>
                              <span className="text-[9px] text-gray-400 font-bold block">رقم العميل: #{booking.customerId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Ticket station details */}
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-semibold text-[11px]">
                            <MapPin size={11} className="text-slate-400" />
                            {booking.stationName || 'المحطة الرئيسية'}
                          </span>
                        </td>

                        {/* Reserved Seats Count */}
                        <td className="p-4 text-center font-sans font-black text-blue-700 text-[13px]">
                          <span className="bg-blue-50 text-blue-800 border-blue-100 px-3 py-1 rounded-xl">
                            {booking.reservedSeatsCount} مقاعد
                          </span>
                        </td>

                        {/* Total tickets cash accrued */}
                        <td className="p-4 font-sans font-extrabold text-orange-660 text-[13px]">
                          {booking.totalAmount ? `${booking.totalAmount.toLocaleString()} ر.ي` : '---'}
                        </td>

                        {/* Booking Creation At */}
                        <td className="p-4 text-gray-500 text-[11px] font-semibold text-right max-w-[130px]">
                          {bookingTimeStr}
                        </td>

                        {/* Attached document/receipt image */}
                        <td className="p-4 text-center">
                          {booking.receiptImagePath ? (
                            <button
                              type="button"
                              onClick={() => {
                                const fullUrl = booking.receiptImagePath.startsWith('http')
                                  ? booking.receiptImagePath
                                  : `https://server-darb.runasp.net${booking.receiptImagePath}`;
                                setSelectedReceiptForPreview(fullUrl);
                              }}
                              className="px-2.5 py-1.5 text-[10px] font-black border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-600 hover:text-white transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Receipt size={12} />
                              تفاصيل السند
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold">لا يوجد سند</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Sub-block overlay style to display the receipt payment transaction */}
            {selectedReceiptForPreview && (
              <div className="bg-slate-50 border border-emerald-100 p-5 rounded-2xl space-y-3 relative">
                <div className="flex justify-between items-center">
                  <h4 className="text-[12px] font-black text-gray-900 flex items-center gap-1.5">
                    <Receipt size={14} className="text-emerald-500" />
                    سند إثبات الحوالة والدفع المالي المالي
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedReceiptForPreview(null)}
                    className="p-1 hover:bg-slate-200 rounded-lg text-gray-500 transition-all cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                  يتم تخزين هذه الصورة بواسطة محفظة الدفع أو الحوالة كإثبات تأكيد للحساب. انقر على الرابط لمشاهدة السند بحجمه الكامل.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 items-center justify-center p-3">
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white max-w-sm">
                    <img
                      src={selectedReceiptForPreview}
                      alt="سند الدفع المالي الرقمي"
                      className="max-h-[350px] object-contain w-full"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="text-center sm:text-right space-y-3">
                    <span className="text-xs font-bold text-gray-700 block">رابط السند المباشر بالخادم</span>
                    <a
                      href={selectedReceiptForPreview}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block px-5 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm"
                    >
                      فتح السند في نافذة ثانوية مستقلة ↗
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="p-16 text-center border-2 border-dashed border-gray-150 rounded-2xl bg-white text-xs font-bold text-gray-400 flex flex-col items-center justify-center gap-3">
            <Ticket size={36} className="text-gray-300 animate-bounce" />
            <span className="text-sm text-gray-700">لا توجد حجوزات مسجلة لهذه الرحلة اليوم</span>
            <span className="text-[10px] font-semibold text-gray-400">عندما يقوم المسافرون بحجز مقاعدهم والدفع عبر التطبيق، ستظهر معاملات الحجز هنا مباشرة.</span>
          </div>
        )}

        {/* Bottom action bar */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button 
            type="button" 
            onClick={onClose}
            variant="secondary" 
            className="px-6 py-2.5 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
          >
            إغلاق سجل الحجوزات
          </Button>
        </div>

      </div>
    </Modal>
  );
};
