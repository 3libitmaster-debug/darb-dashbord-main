import React from 'react';
import { Trash2, ShieldAlert } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/FormElements';
import { Trip } from '../../../types/models';

interface DeleteTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrip: Trip | null;
  onDelete: () => void;
}

export const DeleteTripModal: React.FC<DeleteTripModalProps> = ({
  isOpen,
  onClose,
  selectedTrip,
  onDelete,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إلغاء وحذف مسار الرحلة نهائياً"
      subtitle="حظر النشر وسحب الرحلة من قائمة حجز تذاكر الركاب"
      icon={<Trash2 size={24} />}
      maxWidth="max-w-md"
    >
      <div className="space-y-6" dir="rtl">
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-650 text-xs font-bold leading-relaxed text-right">
          <ShieldAlert size={20} className="shrink-0 mt-0.5 text-red-600" />
          <div>
            <p className="font-extrabold mb-1">تحذير أمان حذف الرحلة!</p>
            <p className="font-medium text-gray-655 font-sans">
              هل أنت متأكد من رغبتك في حذف وإلغاء الرحلة التشغيلية رقم <strong className="text-red-750 font-black">#TRP-{selectedTrip?.tripId}</strong> بالكامل؟ 
              خط سير الرحلة المستهدفة: <strong>({selectedTrip?.startGoveName} ➔ {selectedTrip?.endGoveName})</strong>.
              هذا الإجراء غير قابل للتراجع وسيقوم بحجب الرحلة عن التطبيقات والمسافرين.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
          <Button 
            onClick={onDelete} 
            variant="danger" 
            className="flex-1 bg-red-650 hover:bg-red-700 text-white font-black rounded-2xl"
          >
            نعم، تأكيد الحذف والإلغاء نهائياً
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            className="px-6 rounded-2xl"
          >
            تراجع وإبقاء الرحلة
          </Button>
        </div>
      </div>
    </Modal>
  );
};
