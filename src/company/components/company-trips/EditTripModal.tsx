import React from 'react';
import { Edit3, AlertCircle } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/FormElements';
import { Trip, Bus } from '../../../types/models';

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrip: Trip | null;
  editForm: {
    departureDate: string;
    busId: number;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    departureDate: string;
    busId: number;
  }>>;
  buses: Bus[];
  formError: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditTripModal: React.FC<EditTripModalProps> = ({
  isOpen,
  onClose,
  selectedTrip,
  editForm,
  setEditForm,
  buses,
  formError,
  isSubmitting,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تحديث تفاصيل تشغيل الرحلة"
      subtitle="تعديل تاريخ المغادرة و الحافلة المعينة للرحلة المجدولة"
      icon={<Edit3 size={24} />}
      maxWidth="max-w-md"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {formError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold animate-pulse">
            <AlertCircle size={16} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-2xl space-y-1.5 border border-gray-100 my-2 text-right">
          <p className="text-[10px] text-gray-450 font-bold">معلومات مسار المغادرة لخط الرحلة</p>
          <h5 className="text-xs font-black text-gray-900 flex items-center gap-2">
            <span>{selectedTrip?.startGoveName}</span>
            <span className="text-gray-400">➔</span>
            <span>{selectedTrip?.endGoveName}</span>
          </h5>
          <div className="flex gap-4 text-[10px] font-bold text-gray-500 mt-2 font-sans">
            <span>رمز التعريف: #TRP-{selectedTrip?.tripId}</span>
            <span>سعر التذكرة المعلن: {selectedTrip?.price?.toLocaleString()} ر.ي</span>
          </div>
        </div>

        {/* Edit date departure */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
            تاريخ المغادرة المجدول الجديد *
          </label>
          <input 
            type="date"
            value={editForm.departureDate}
            onChange={(e) => setEditForm(prev => ({ ...prev, departureDate: e.target.value }))}
            className="w-full px-6 py-4 bg-gray-50/30 border border-gray-100 rounded-2xl text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-black text-gray-850"
          />
        </div>

        {/* Edit selected bus */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block font-sans">
            إعادة تعيين الحافلة المعينة للرحلة *
          </label>
          {buses.length > 0 ? (
            <select 
              value={editForm.busId}
              onChange={(e) => setEditForm(prev => ({ ...prev, busId: parseInt(e.target.value) || 0 }))}
              className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-805 cursor-pointer"
            >
              <option value={0} disabled>-- اختر الحافلة البديلة --</option>
              {buses.map(bus => (
                <option key={bus.busId} value={bus.busId}>
                  لوحة رقم ({bus.plateNumber}) - سعة {bus.capacity} مقعد ({bus.model})
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold font-sans">
              لا يوجد حافلات مسجلة.
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isSubmitting}
            className="flex-1 rounded-2xl py-4 font-black text-xs"
          >
            تحديث وحفظ الرحلة بالخادم
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            className="px-6 rounded-2xl"
          >
            إلغاء التراجع
          </Button>
        </div>
      </form>
    </Modal>
  );
};
