import React from 'react';
import { Compass, AlertCircle } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/FormElements';
import { Governorate, Bus } from '../../../types/models';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  addForm: {
    startGoveId: number;
    endGoveId: number;
    departureDate: string;
    period: number;
    busId: number;
  };
  setAddForm: React.Dispatch<React.SetStateAction<{
    startGoveId: number;
    endGoveId: number;
    departureDate: string;
    period: number;
    busId: number;
  }>>;
  governorates: Governorate[];
  buses: Bus[];
  formError: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddTripModal: React.FC<AddTripModalProps> = ({
  isOpen,
  onClose,
  addForm,
  setAddForm,
  governorates,
  buses,
  formError,
  isSubmitting,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="برمجة وجدولة رحلة جديدة"
      subtitle="إنشاء مسار رحلة تشغيلي جديد وتعيين المركبات وساعة المغادرة"
      icon={<Compass size={24} />}
      maxWidth="max-w-md"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {formError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold animate-pulse">
            <AlertCircle size={16} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Departure Governorate */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
            محطة انطلاق الرحلة (من محافظة) *
          </label>
          <select 
            value={addForm.startGoveId}
            onChange={(e) => setAddForm(prev => ({ ...prev, startGoveId: parseInt(e.target.value) || 0 }))}
            className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800 cursor-pointer"
          >
            <option value={0} disabled>-- اختر محافظة الانطلاق --</option>
            {governorates.map(gov => (
              <option key={gov.id} value={gov.id}>{gov.name}</option>
            ))}
          </select>
        </div>

        {/* End Governorate */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
            محطة الوصول النهائية (إلى محافظة) *
          </label>
          <select 
            value={addForm.endGoveId}
            onChange={(e) => setAddForm(prev => ({ ...prev, endGoveId: parseInt(e.target.value) || 0 }))}
            className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800 cursor-pointer"
          >
            <option value={0} disabled>-- اختر محافظة الوصول --</option>
            {governorates.map(gov => (
              <option key={gov.id} value={gov.id}>{gov.name}</option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
            تاريخ الانطلاق *
          </label>
          <div className="relative">
            <input 
              type="date"
              value={addForm.departureDate}
              onChange={(e) => setAddForm(prev => ({ ...prev, departureDate: e.target.value }))}
              className="w-full px-6 py-4 bg-gray-50/30 border border-gray-100 rounded-2xl text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-black text-gray-850"
            />
          </div>
        </div>

        {/* Trip Period enum (0: Morning, 1: Evening) */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
            فترة الرحلة (العمل والتشغيل) *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAddForm(prev => ({ ...prev, period: 0 }))}
              className={`p-4 rounded-2xl border text-xs font-black text-center transition-all ${addForm.period === 0 ? 'border-orange-400 bg-orange-50/40 text-orange-750 shadow-sm' : 'border-gray-100 bg-gray-50/20 text-gray-500 hover:bg-gray-50/50'}`}
            >
              فترة صباحية (0)
            </button>
            <button
              type="button"
              onClick={() => setAddForm(prev => ({ ...prev, period: 1 }))}
              className={`p-4 rounded-2xl border text-xs font-black text-center transition-all ${addForm.period === 1 ? 'border-orange-400 bg-orange-50/40 text-orange-750 shadow-sm' : 'border-gray-100 bg-gray-50/20 text-gray-500 hover:bg-gray-50/50'}`}
            >
              فترة مسائية (1)
            </button>
          </div>
        </div>

        {/* Bus fleet selection dropdown */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block font-sans">
            تعيين الحافلة المخصصة بالرحلة *
          </label>
          {buses.length > 0 ? (
            <select 
              value={addForm.busId}
              onChange={(e) => setAddForm(prev => ({ ...prev, busId: parseInt(e.target.value) || 0 }))}
              className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800 cursor-pointer"
            >
              <option value={0} disabled>-- اختر الحافلة --</option>
              {buses.map(bus => (
                <option key={bus.busId} value={bus.busId}>
                  لوحة رقم ({bus.plateNumber}) - سعة {bus.capacity} راكب ({bus.model})
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold font-sans">
              لاتوجد حافلات بأسطول شركتكم حالياً. يرجى تهيئتها أولاً في تبويب "الحافلات".
            </div>
          )}
        </div>

        {/* Dialog buttons summary list action */}
        <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
          <Button
            type="submit" 
            variant="primary" 
            isLoading={isSubmitting}
            className="flex-1 rounded-2xl py-4 font-black text-xs"
            disabled={buses.length === 0 || governorates.length === 0}
          >
            تأكيد وجدولة الرحلة بالخادم
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            className="px-6 rounded-2xl"
          >
            إلغاء الرجوع
          </Button>
        </div>
      </form>
    </Modal>
  );
};
