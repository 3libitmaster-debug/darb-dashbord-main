import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bus as BusIcon, Search, RefreshCw, AlertCircle, CheckCircle, 
  Wrench, Users, Info, Settings, ShieldAlert, Sliders, PlayCircle,
  Plus, Edit3, Trash2, ShieldCheck, X
} from 'lucide-react';
import CompanyLayout from '../components/CompanyLayout';
import { UserRole } from '../../types/auth';
import { useBuses } from '../hooks/useBuses';
import { Bus } from '../../types/models';
import { Button, Input } from '../../shared/components/FormElements';
import { Modal } from '../../shared/components/Modal';

type BusStatusFilter = 'all' | 'Available' | 'UnderMaintenance';

export default function CompanyBuses() {
  const { 
    buses, 
    globalError, 
    isSubmitting,
    setGlobalError,
    fetchBuses,
    addBus,
    editBus,
    removeBus
  } = useBuses();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BusStatusFilter>('all');

  // Modals visibility states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected bus for edit or delete
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  // Form states and field errors
  const [addForm, setAddForm] = useState({ plateNumber: '', model: '', capacity: 45 });
  const [editForm, setEditForm] = useState({ model: '', capacity: 45, status: 'Available' });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  // Statistics calculation
  const totalBuses = buses.data?.length || 0;
  const availableBuses = buses.data?.filter(b => b.status === 'Available').length || 0;
  const maintenanceBuses = buses.data?.filter(b => b.status === 'UnderMaintenance').length || 0;

  // Filtered List
  const filteredBuses = (buses.data || []).filter(bus => {
    const matchesSearch = 
      (bus.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bus.model || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || bus.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleOpenAdd = () => {
    setAddForm({ plateNumber: '', model: '', capacity: 45 });
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.plateNumber.trim()) {
      setFormError('يرجى إدخال رقم لوحة الحافلة');
      return;
    }
    if (!addForm.model.trim()) {
      setFormError('يرجى تحديد موديل وفئة الحافلة');
      return;
    }
    if (addForm.capacity < 5 || addForm.capacity > 100) {
      setFormError('السعة الاستيعابية يجب أن تكون بين 5 و 100 راكب');
      return;
    }

    setFormError(null);
    const result = await addBus(addForm);
    if (result.success) {
      setIsAddOpen(false);
    } else {
      setFormError(result.message || 'فشل إضافة الحافلة');
    }
  };

  const handleOpenEdit = (bus: Bus) => {
    setSelectedBus(bus);
    setEditForm({
      model: bus.model || '',
      capacity: bus.capacity || 45,
      status: bus.status || 'Available'
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBus) return;

    if (!editForm.model.trim()) {
      setFormError('يرجى تحديد موديل وفئة الحافلة');
      return;
    }
    if (editForm.capacity < 5 || editForm.capacity > 100) {
      setFormError('السعة الاستيعابية يجب أن تكون بين 5 و 100 راكب');
      return;
    }

    setFormError(null);
    const numericStatus = editForm.status === 'Available' ? 0 : 1;
    const result = await editBus(selectedBus.busId, {
      model: editForm.model,
      capacity: editForm.capacity,
      status: numericStatus
    });
    if (result.success) {
      setIsEditOpen(false);
    } else {
      setFormError(result.message || 'فشل تحديث الحافلة');
    }
  };

  const handleOpenDelete = (bus: Bus) => {
    setSelectedBus(bus);
    setGlobalError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBus) return;
    const result = await removeBus(selectedBus.busId);
    if (result.success) {
      setIsDeleteOpen(false);
    }
  };

  return (
    <CompanyLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl animate-fade-in" dir="rtl">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-100 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <BusIcon className="text-orange-600 animate-pulse" size={32} />
              إدارة أسطول الحافلات
            </h1>
            <p className="text-gray-500 text-sm font-semibold">استعراض وإضافة وتعديل حافلات الشركة وجدولتها في نظام درب</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={fetchBuses} 
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 rounded-2xl transition-all shadow-none flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <RefreshCw size={14} className={buses.status === 'loading' ? 'animate-spin' : ''} />
              تحديث البيانات
            </button>
            <Button 
              onClick={handleOpenAdd}
              icon={<Plus size={16} />} 
              variant="primary"
              className="px-6 h-12 rounded-2xl text-xs font-black"
            >
              إضافة حافلة جديدة
            </Button>
          </div>
        </div>

        {/* Global Error Display */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold shadow-sm">
            <ShieldAlert size={16} className="shrink-0" /> 
            <span>{globalError}</span>
          </div>
        )}

        {/* Fleet KPI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">إجمالي حافلات الأسطول</p>
              <h3 className="text-4xl font-black text-gray-900 tabular-nums leading-none mt-1">
                {buses.status === 'loading' ? '...' : totalBuses}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <BusIcon size={22} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">حافلات جاهزة ومتاحة للرحلات</p>
              <h3 className="text-4xl font-black text-gray-900 tabular-nums leading-none mt-1 text-emerald-600">
                {buses.status === 'loading' ? '...' : availableBuses}
              </h3>
            </div>
            <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <CheckCircle size={22} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">في الخضوع للصيانة الفنية</p>
              <h3 className="text-4xl font-black text-gray-900 tabular-nums leading-none mt-1 text-amber-600">
                {buses.status === 'loading' ? '...' : maintenanceBuses}
              </h3>
            </div>
            <div className="h-12 w-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
              <Wrench size={22} />
            </div>
          </motion.div>
        </div>

        {/* Toolbar (Search & Filter) */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-3xl shadow-sm mb-8">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث برقم اللوحة الفولاذية أو الموديل..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-550 transition-all outline-none"
            />
          </div>

          {/* Filter Segmented Control */}
          <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1 w-full md:w-auto overflow-x-auto">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'all' 
                  ? 'bg-white text-gray-850 shadow-xs' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              الكل ({totalBuses})
            </button>
            <button 
              onClick={() => setStatusFilter('Available')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'Available' 
                  ? 'bg-emerald-500 text-white shadow-xs' 
                  : 'text-emerald-600 hover:bg-emerald-50/50'
              }`}
            >
              متاحة للخدمة ({availableBuses})
            </button>
            <button 
              onClick={() => setStatusFilter('UnderMaintenance')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'UnderMaintenance' 
                  ? 'bg-amber-500 text-white shadow-xs' 
                  : 'text-amber-600 hover:bg-amber-50/50'
              }`}
            >
              تحت الصيانة ({maintenanceBuses})
            </button>
          </div>
        </div>

        {/* Buses Directory Table View */}
        {buses.status === 'loading' ? (
          <div id="buses-skeleton-loader" className="bg-white rounded-[2rem] p-8 shadow-sm space-y-4 animate-pulse">
            <div className="h-6 bg-gray-100 rounded-lg w-1/4 mb-6"></div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl w-full"></div>
            ))}
          </div>
        ) : filteredBuses.length > 0 ? (
          <div id="buses-table-container" className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 font-bold text-xs select-none">
                    <th id="th-bus-id" className="p-5 font-black">رمز الحافلة</th>
                    <th id="th-plate" className="p-5 font-black">لوحة الترخيص</th>
                    <th id="th-model" className="p-5 font-black">طراز الحافلة</th>
                    <th id="th-capacity" className="p-5 font-black">السعة المقعدية</th>
                    <th id="th-status" className="p-5 font-black">الحالة التشغيلية</th>
                    <th id="th-actions" className="p-5 font-black text-left">خيارات التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBuses.map((bus, i) => (
                    <motion.tr 
                      key={bus.busId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50/50 transition-colors text-xs text-gray-700"
                    >
                      {/* Bus Code */}
                      <td className="p-5 font-black text-gray-900"># BUS-{bus.busId}</td>
                      
                      {/* Plate number with custom layout badge */}
                      <td className="p-5">
                        <div className="inline-flex items-stretch border border-gray-300 rounded-md overflow-hidden bg-white shadow-xs h-7">
                          <div className="bg-blue-600 w-1"></div>
                          <span className="font-extrabold text-gray-800 px-2.5 py-1 font-mono tracking-wider select-all leading-none flex items-center">
                            {bus.plateNumber || '---'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Model */}
                      <td className="p-5 font-bold text-gray-650">{bus.model || 'غير مصنف'}</td>
                      
                      {/* Capacity */}
                      <td className="p-5 font-black text-gray-800 mb-0.5">{bus.capacity} راكب</td>
                      
                      {/* Status */}
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                          bus.status === 'Available' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${bus.status === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                          {bus.status === 'Available' ? 'جاهزة ومتاحة' : 'تحت أعمال الصيانة'}
                        </span>
                      </td>

                      {/* Action buttons (Modifying/Deleting) */}
                      <td className="p-5 text-left flex items-center justify-end gap-2">
                        {/* Edit button */}
                        <button 
                          onClick={() => handleOpenEdit(bus)}
                          title="تعديل التفاصيل"
                          className="p-2.5 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all flex items-center justify-center cursor-pointer-none hover:scale-105 active:scale-95"
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Delete button */}
                        <button 
                          onClick={() => handleOpenDelete(bus)}
                          title="حذف الحافلة"
                          className="p-2.5 rounded-xl border border-red-150 text-red-600 bg-red-50/50 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center cursor-pointer-none hover:scale-105 active:scale-95"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div id="buses-empty-state" className="py-24 text-center border-2 border-dashed border-gray-150 rounded-[2rem] bg-white">
            <ShieldAlert size={40} className="mx-auto text-gray-300 mb-4 animate-bounce" />
            <h4 className="text-base font-bold text-gray-500">لا توجد نتائج مطابقة</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">تأكد من اختيار الفلتر الصحيح أو تعديل نص البحث</p>
          </div>
        )}

        {/* ======================================= */}
        {/* MODAL 1: ADD BUS */}
        {/* ======================================= */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="تسجيل حافلة جديدة"
          subtitle="إضافة حافلة جديدة إلى أسطول النقل للبدء بجدولتها"
          icon={<BusIcon size={24} />}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreate} className="space-y-6">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1">
              <Input 
                label="رقم لوحة الحافلة (أ ب ج 123)"
                placeholder="أدخل رقم اللوحة الفولاذية..."
                value={addForm.plateNumber}
                onChange={(e) => setAddForm(prev => ({ ...prev, plateNumber: e.target.value }))}
                maxLength={20}
              />
              <p className="text-[10px] text-gray-400 font-bold px-2">يجب أن يكون رقم اللوحة فريداً لكل حافلة</p>
            </div>

            <Input 
              label="فئة وموديل الحافلة (مثلاً: مرسيدس 2024)"
              placeholder="مثال: يوتونغ مريحة..."
              value={addForm.model}
              onChange={(e) => setAddForm(prev => ({ ...prev, model: e.target.value }))}
            />

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px- block">
                السعة الاستيعابية (عدد المقاعد)
              </label>
              <input 
                type="number"
                min={5}
                max={100}
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-900 shadow-sm"
                value={addForm.capacity}
                onChange={(e) => setAddForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
              />
              <div className="flex justify-between items-center px-1 text-[10px] text-gray-400 font-bold">
                <span>الحد الأدنى: 5 مقاعد</span>
                <span>الحد الأقصى: 100 مقعد</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSubmitting}
                className="flex-1"
              >
                تأكيد وبدء التسجيل
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsAddOpen(false)}
                className="px-6"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Modal>

        {/* ======================================= */}
        {/* MODAL 2: EDIT BUS */}
        {/* ======================================= */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="تعديل تفاصيل الحافلة"
          subtitle={`تعديل معلومات الحافلة لوحة: ${selectedBus?.plateNumber || ''}`}
          icon={<Edit3 size={24} />}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdate} className="space-y-6">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Read-Only Plate field */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">رقم اللوحة (لا يمكن تعديله)</span>
              <div className="w-full rounded-2xl border border-gray-100 bg-gray-100/50 px-6 py-4 text-sm text-gray-500 font-extrabold tracking-widest font-mono">
                {selectedBus?.plateNumber}
              </div>
            </div>

            <Input 
              label="فئة وموديل الحافلة"
              placeholder="مثال: يوتونغ مريحة..."
              value={editForm.model}
              onChange={(e) => setEditForm(prev => ({ ...prev, model: e.target.value }))}
            />

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">
                السعة الاستيعابية (عدد المقاعد)
              </label>
              <input 
                type="number"
                min={5}
                max={100}
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-900 shadow-sm"
                value={editForm.capacity}
                onChange={(e) => setEditForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
              />
              <div className="flex justify-between items-center px-1 text-[10px] text-gray-400 font-bold">
                <span>الحد الأدنى: 5 مقاعد</span>
                <span>الحد الأقصى: 100 مقعد</span>
              </div>
            </div>

            {/* Status Select form factor */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">
                جاهزية الترسانة والعملية للحافلة
              </label>
              <select 
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-black text-gray-800"
              >
                <option value="Available">جاهزة ومتاحة للخدمة (Available)</option>
                <option value="UnderMaintenance">تحت أعمال الصيانة الدورية (UnderMaintenance)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSubmitting}
                className="flex-1"
              >
                حفظ التعديلات
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsEditOpen(false)}
                className="px-6"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Modal>

        {/* ======================================= */}
        {/* MODAL 3: CONFIRM DELETE BUS */}
        {/* ======================================= */}
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="حذف الحافلة من الأسطول"
          subtitle="طلب تأكيد الحذف النهائي"
          icon={<Trash2 size={24} />}
          maxWidth="max-w-md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-650 text-xs font-bold leading-relaxed">
              <ShieldAlert size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold mb-1">تنبيه أمان وحذف!</p>
                <p className="font-medium text-gray-650">
                  هل أنت متأكد من رغبتك بالقيام بحذف الحافلة ذي اللوحة رقم <strong className="text-red-700 font-extrabold select-all">({selectedBus?.plateNumber})</strong> نهائياً من سجلات الأسطول الخاصة بالشركة؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                onClick={handleDelete} 
                variant="danger" 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black"
              >
                تأكيد حذف الحافلة
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsDeleteOpen(false)}
                className="px-6"
              >
                إلغاء التراجع
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </CompanyLayout>
  );
}
