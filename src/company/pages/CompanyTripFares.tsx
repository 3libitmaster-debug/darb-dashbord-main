import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Banknote, Search, RefreshCw, AlertCircle, CheckCircle, 
  Plus, Edit3, Trash2, ShieldAlert, X, DollarSign, Navigation, ArrowLeftRight, Landmark, Compass, Map, Building2, MapPin
} from 'lucide-react';
import CompanyLayout from '../components/CompanyLayout';
import { UserRole } from '../../types/auth';
import { useTripFares } from '../hooks/useTripFares';
import { useStations } from '../hooks/useStations';
import { useMaintenance } from '../../admin/hooks/useMaintenance';
import { TripFare } from '../../types/models';
import { Button, Input } from '../../shared/components/FormElements';
import { Modal } from '../../shared/components/Modal';

export default function CompanyTripFares() {
  const { 
    fares, 
    globalError, 
    isSubmitting,
    setGlobalError, 
    fetchFares,
    addFare,
    editFare,
    removeFare
  } = useTripFares();

  const {
    stations,
    fetchStations
  } = useStations();

  const {
    governorates,
    fetchGovernorates
  } = useMaintenance();

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFromGovId, setSelectedFromGovId] = useState<number>(0);
  const [selectedToGovId, setSelectedToGovId] = useState<number>(0);

  // Modals visibility states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected trip fare for edit or delete
  const [selectedFare, setSelectedFare] = useState<TripFare | null>(null);

  // Form states and field errors
  const [addForm, setAddForm] = useState({ 
    fromGovId: 0, 
    toGovId: 0, 
    stationId: 0, 
    price: 0, 
    isMainStation: true 
  });
  
  const [editForm, setEditForm] = useState({ 
    price: 0, 
    isMainStation: true 
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchFares();
    fetchStations();
    fetchGovernorates();
  }, [fetchFares, fetchStations, fetchGovernorates]);

  // Statistics calculation
  const totalFares = fares.data?.length || 0;
  
  const prices = fares.data?.map(f => f.price) || [];
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  // Filtered List
  const filteredFares = (fares.data || []).filter(fare => {
    // 1. Filter by Departure Governorate
    if (selectedFromGovId !== 0 && fare.fromGovId !== selectedFromGovId) {
      return false;
    }
    // 2. Filter by Arrival Governorate
    if (selectedToGovId !== 0 && fare.toGovId !== selectedToGovId) {
      return false;
    }

    const fromGov = (fare.fromGovernorateName || '').toLowerCase();
    const toGov = (fare.toGovernorateName || '').toLowerCase();
    const station = (fare.cityName || '').toLowerCase();
    const priceStr = String(fare.price);
    const search = searchTerm.toLowerCase();

    return fromGov.includes(search) || 
           toGov.includes(search) || 
           station.includes(search) || 
           priceStr.includes(search);
  });

  // Action handlers
  const handleOpenAdd = () => {
    const defaultGovId = governorates.data?.[0]?.id || 0;
    const matchingStations = (stations.data || []).filter(st => st.governorateId === defaultGovId);
    const defaultStationId = matchingStations.length > 0 ? matchingStations[0].stationId : 0;

    setAddForm({ 
      fromGovId: defaultGovId, 
      toGovId: governorates.data?.[1]?.id || governorates.data?.[0]?.id || 0, 
      stationId: defaultStationId, 
      price: 15000, 
      isMainStation: true 
    });
    setFormError(null);
    setSuccessMessage(null);
    setIsAddOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.fromGovId === 0) {
      setFormError('يرجى اختيار محافظة الانطلاق');
      return;
    }
    if (addForm.toGovId === 0) {
      setFormError('يرجى اختيار محافظة الوصول');
      return;
    }
    if (addForm.fromGovId === addForm.toGovId) {
      setFormError('لا يمكن أن تكون محافظة الانطلاق والوصول متطابقتين');
      return;
    }
    if (addForm.stationId === 0) {
      setFormError('يرجى اختيار محطتكم المعتمدة للرحلة');
      return;
    }
    if (addForm.price <= 0) {
      setFormError('يرجى تحديد سعر تذكرة صالح أكبر من الصفر');
      return;
    }

    setFormError(null);
    setSuccessMessage(null);
    const result = await addFare({
      fromGovId: Number(addForm.fromGovId),
      toGovId: Number(addForm.toGovId),
      stationId: Number(addForm.stationId),
      price: Number(addForm.price),
      isMainStation: Boolean(addForm.isMainStation)
    });
    
    if (result.success) {
      setSuccessMessage(result.message || 'تم تسجيل تسعيرة الرحلة بنجاح');
      setIsAddOpen(false);
    } else {
      setFormError(result.message || 'فشل تسجيل تسعيرة الرحلة');
    }
  };

  const handleOpenEdit = (fare: TripFare) => {
    setSelectedFare(fare);
    setEditForm({
      price: fare.price,
      isMainStation: fare.isMainStation
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFare) return;

    if (editForm.price <= 0) {
      setFormError('سعر الرحلة يجب أن يكون أكبر من الصفر');
      return;
    }

    setFormError(null);
    setSuccessMessage(null);
    const result = await editFare(selectedFare.tripFareId, {
      price: Number(editForm.price),
      isMainStation: Boolean(editForm.isMainStation)
    });

    if (result.success) {
      setSuccessMessage(result.message || 'تمت تعديل بيانات تسعيرة الرحلة بنجاح');
      setIsEditOpen(false);
    } else {
      setFormError(result.message || 'فشل تحديث بيانات تسعيرة الرحلة');
    }
  };

  const handleOpenDelete = (fare: TripFare) => {
    setSelectedFare(fare);
    setGlobalError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedFare) return;
    setSuccessMessage(null);
    const result = await removeFare(selectedFare.tripFareId);
    if (result.success) {
      setSuccessMessage(result.message || 'تم حذف تسعيرة الرحلة بنجاح');
      setIsDeleteOpen(false);
    }
  };

  const forceRefresh = () => {
    fetchFares();
    fetchStations();
    fetchGovernorates();
  };

  return (
    <CompanyLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl animate-fade-in" dir="rtl">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-100 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <DollarSign className="text-orange-600 animate-pulse" size={32} />
              إدارة أسعار الرحلات
            </h1>
            <p className="text-gray-500 text-sm font-semibold">تحديد تسعيرات نقل الركاب بين الخطوط المختلفة بالمحافظات وتعريف طابع المحطات</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={forceRefresh} 
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 rounded-2xl transition-all shadow-none flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <RefreshCw size={14} className={fares.status === 'loading' ? 'animate-spin' : ''} />
              تحديث البيانات
            </button>
            <Button 
              onClick={handleOpenAdd}
              icon={<Plus size={16} />} 
              variant="primary"
              className="px-6 h-12 rounded-2xl text-xs font-black"
              disabled={stations.data?.length === 0}
            >
              إضافة تسعيرة جديدة
            </Button>
          </div>
        </div>

        {/* Global Error Display */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold shadow-sm animate-fade-in">
            <ShieldAlert size={16} className="shrink-0" /> 
            <span>{globalError}</span>
          </div>
        )}

        {/* Global Success Display */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2 text-emerald-650 text-xs font-bold shadow-sm animate-fade-in">
            <CheckCircle size={16} className="shrink-0 text-emerald-600" /> 
            <span>{successMessage}</span>
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
              <p className="text-xs font-bold text-gray-400 mb-1">إجمالي خطوط السير المسعرة</p>
              <h3 className="text-4xl font-black text-gray-900 tabular-nums leading-none mt-1">
                {fares.status === 'loading' ? '...' : totalFares}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Navigation size={22} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">الحد الأقصى للتسعيرة</p>
              <h3 className="text-4xl font-black text-orange-650 tabular-nums leading-none mt-1">
                {fares.status === 'loading' ? '...' : `${maxPrice.toLocaleString()} ر.ي`}
              </h3>
            </div>
            <div className="h-12 w-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
              <DollarSign size={22} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">الحد الأدنى للتسعيرة</p>
              <h3 className="text-4xl font-black text-emerald-600 tabular-nums leading-none mt-1">
                {fares.status === 'loading' ? '...' : `${minPrice.toLocaleString()} ر.ي`}
              </h3>
            </div>
            <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <DollarSign size={22} />
            </div>
          </motion.div>
        </div>

        {/* Stations Alert Banner if empty */}
        {stations.data?.length === 0 && (
          <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5 md:mt-0" />
              <div>
                <h5 className="font-extrabold text-sm text-amber-850">يجب إضافة محطات أولاً!</h5>
                <p className="text-xs text-amber-700 font-bold mt-0.5">تسجيل تسعيرات الرحلات يتطلب وجود محطة معرفة واحدة على الأقل تابعة لشركتكم.</p>
              </div>
            </div>
            <a href="/company/stations" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-all text-center inline-block">
              الذهاب لإضافة المحطات
            </a>
          </div>
        )}

        {/* Toolbar (Search and Filters) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="البحث باسم محافظة الانطلاق، محافظة الوصول، أو المدينة..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-805 placeholder-gray-400 focus:ring-2 focus:ring-orange-550 transition-all outline-none"
              />
            </div>

            {/* Custom Filters Grid */}
            <div className="flex flex-wrap gap-4 items-center shrink-0">
              
              {/* Filter From Governorate */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-400 shrink-0">من:</span>
                <select 
                  value={selectedFromGovId}
                  onChange={(e) => setSelectedFromGovId(parseInt(e.target.value) || 0)}
                  className="bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-750 outline-none transition-all cursor-pointer focus:ring-2 focus:ring-orange-550 min-w-[140px]"
                >
                  <option value={0}>كل المحافظات (الكل)</option>
                  {(governorates.data || []).map(gov => (
                    <option key={gov.id} value={gov.id}>{gov.name}</option>
                  ))}
                </select>
              </div>

              {/* Filter To Governorate */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-400 shrink-0">إلى:</span>
                <select 
                  value={selectedToGovId}
                  onChange={(e) => setSelectedToGovId(parseInt(e.target.value) || 0)}
                  className="bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-750 outline-none transition-all cursor-pointer focus:ring-2 focus:ring-orange-550 min-w-[140px]"
                >
                  <option value={0}>كل المحافظات (الكل)</option>
                  {(governorates.data || []).map(gov => (
                    <option key={gov.id} value={gov.id}>{gov.name}</option>
                  ))}
                </select>
              </div>

              {/* Reset Filters button if any is active */}
              {(selectedFromGovId !== 0 || selectedToGovId !== 0 || searchTerm !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFromGovId(0);
                    setSelectedToGovId(0);
                    setSearchTerm('');
                  }}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <X size={14} />
                  إعادة ضبط الفلاتر
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Fares Table */}
        {fares.status === 'loading' ? (
          <div id="fares-skeleton-loader" className="bg-white rounded-[2rem] p-8 shadow-sm space-y-4 animate-pulse">
            <div className="h-6 bg-gray-100 rounded-lg w-1/4 mb-6"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl w-full"></div>
            ))}
          </div>
        ) : filteredFares.length > 0 ? (
          <div id="fares-table-container" className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 font-bold text-xs select-none">
                    <th id="th-fr-id" className="p-5 font-black">رمز التسعيرة</th>
                    <th id="th-fr-line" className="p-5 font-black">مسار الرحلة (من ➔ إلى)</th>
                    <th id="th-fr-station" className="p-5 font-black">المحطة / المدينة</th>
                    <th id="th-fr-type" className="p-5 font-black">نوع المحطة في هذا المسار</th>
                    <th id="th-fr-price" className="p-5 font-black">السعر الافتراضي بالتذكرة</th>
                    <th id="th-fr-actions" className="p-5 font-black text-left">خيارات التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredFares.map((fare, i) => (
                    <motion.tr 
                      key={fare.tripFareId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50/50 transition-colors text-xs text-gray-700"
                    >
                      {/* Trip Fare ID */}
                      <td className="p-5 font-black text-gray-900"># FAR-{fare.tripFareId}</td>
                      
                      {/* From - To */}
                      <td className="p-5 font-black text-gray-900">
                        <span className="inline-flex items-center gap-2">
                          <span className="font-extrabold text-gray-800">{fare.fromGovernorateName}</span>
                          <ArrowLeftRight size={13} className="text-gray-400 shrink-0" />
                          <span className="font-semibold text-gray-500">{fare.toGovernorateName}</span>
                        </span>
                      </td>
                      
                      {/* Station - City */}
                      <td className="p-5 font-bold text-gray-800">
                        <span className="bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-bold border border-gray-100">
                          <MapPin size={13} className="text-orange-550" />
                          {fare.cityName || 'غير مسمى'}
                        </span>
                      </td>

                      {/* Station Type */}
                      <td className="p-5">
                        {fare.isMainStation ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wide border border-emerald-100">
                            محطة رئيسية
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-650 px-2.5 py-1 rounded-lg font-bold text-[10px] border border-gray-150">
                            محطة فرعية / توقف
                          </span>
                        )}
                      </td>
                      
                      {/* Fare Price */}
                      <td className="p-5">
                        <span className="font-black text-orange-655 text-sm bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 inline-block font-mono">
                          {fare.price.toLocaleString()} ر.ي
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-5 text-left flex items-center justify-end gap-2">
                        {/* Edit button */}
                        <button 
                          onClick={() => handleOpenEdit(fare)}
                          title="تعديل التسعيرة"
                          className="p-2.5 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Delete button */}
                        <button 
                          onClick={() => handleOpenDelete(fare)}
                          title="حذف التسعيرة"
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
          <div id="fares-empty-state" className="py-24 text-center border-2 border-dashed border-gray-150 rounded-[2rem] bg-white">
            <Building2 size={40} className="mx-auto text-gray-300 mb-4 animate-bounce" />
            <h4 className="text-base font-bold text-gray-500">ماتزال قائمة التسعيرات فارغة</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">ابدأ بتهيئة تسعيرات التذاكر لخطوط السير لتتمكن من نشر رحلاتكم لطلب حجز تذاكر المسافرين</p>
          </div>
        )}

        {/* ======================================= */}
        {/* MODAL 1: ADD NEW FARE BLOCK */}
        {/* ======================================= */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="تسجيل تسعيرة رحلة جديدة"
          subtitle="برمجة تعرفة النقل والمسارات المعتمدة بالكمية والتعمية"
          icon={<DollarSign size={24} />}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreate} className="space-y-6">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold animate-pulse">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* From Governorate Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
                موقع الانطلاق (من محافظة) *
              </label>
              {governorates.data && governorates.data.length > 0 ? (
                <select 
                  value={addForm.fromGovId}
                  onChange={(e) => {
                    const nextGovId = parseInt(e.target.value) || 0;
                    const matchingStations = (stations.data || []).filter(st => st.governorateId === nextGovId);
                    const defaultStationId = matchingStations.length > 0 ? matchingStations[0].stationId : 0;
                    setAddForm(prev => ({ 
                      ...prev, 
                      fromGovId: nextGovId, 
                      stationId: defaultStationId 
                    }));
                  }}
                  className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800"
                >
                  <option value={0} disabled>-- اختر محافظة الانطلاق --</option>
                  {governorates.data.map(gov => (
                    <option key={gov.id} value={gov.id}>
                      {gov.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold font-sans">
                  لاتوجد محافظات مدخلة مسبقاً بالنظام.
                </div>
              )}
            </div>

            {/* To Governorate Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
                محطة الوصول النهائية (إلى محافظة) *
              </label>
              {governorates.data && governorates.data.length > 0 ? (
                <select 
                  value={addForm.toGovId}
                  onChange={(e) => setAddForm(prev => ({ ...prev, toGovId: parseInt(e.target.value) || 0 }))}
                  className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800"
                >
                  <option value={0} disabled>-- اختر محافظة الوصول --</option>
                  {governorates.data.map(gov => (
                    <option key={gov.id} value={gov.id}>
                      {gov.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold font-sans">
                  لاتوجد محافظات مدخلة مسبقاً بالنظام.
                </div>
              )}
            </div>

            {/* Company Station Association Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
                المحطة التابعة للشركة على خط السير *
              </label>
              {stations.data && stations.data.length > 0 ? (
                (() => {
                  const filteredStationsForAdd = stations.data.filter(st => st.governorateId === addForm.fromGovId);
                  if (filteredStationsForAdd.length > 0) {
                    return (
                      <select 
                        value={addForm.stationId}
                        onChange={(e) => setAddForm(prev => ({ ...prev, stationId: parseInt(e.target.value) || 0 }))}
                        className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800"
                      >
                        <option value={0} disabled>-- اختر محطة --</option>
                        {filteredStationsForAdd.map(st => (
                          <option key={st.stationId} value={st.stationId}>
                            {st.cityName} ({st.address}) - {st.governorateName}
                          </option>
                        ))}
                      </select>
                    );
                  } else {
                    return (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-xs font-bold leading-relaxed">
                        عذراً، لاتوجد محطات تابعة لشركتكم مسجلة في محافظة الانطلاق المحددة. 
                        يرجى اختيار محافظة انطلاق أخرى لتسعير تذاكرها، أو تسجيل محطة جديدة لهذه المحافظة أولاً.
                      </div>
                    );
                  }
                })()
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold font-sans">
                  لاتوجد محطات مضافة لشركتكم بعد. يرجى تهيئتها أولاً في تبويب "المحطات".
                </div>
              )}
            </div>

            {/* Price input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block font-sans">
                سعر التذكرة (بالريال اليمني) *
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={addForm.price}
                  onChange={(e) => setAddForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  placeholder="مثال: 15400"
                  className="w-full px-6 py-4 bg-gray-50/30 border border-gray-100 rounded-2xl text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800"
                  min="1"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 font-sans">
                  ر.ي
                </span>
              </div>
            </div>

            {/* IsMainStation Radio Buttons */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
                هل المحطة رئيسية في هذا المسار؟
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAddForm(prev => ({ ...prev, isMainStation: true }))}
                  className={`p-4 rounded-2xl border text-xs font-black text-center transition-all ${addForm.isMainStation ? 'border-orange-400 bg-orange-50/40 text-orange-700 shadow-sm' : 'border-gray-100 bg-gray-50/20 text-gray-500 hover:bg-gray-50/55'}`}
                >
                  نعم، محطة رئيسية
                </button>
                <button
                  type="button"
                  onClick={() => setAddForm(prev => ({ ...prev, isMainStation: false }))}
                  className={`p-4 rounded-2xl border text-xs font-black text-center transition-all ${!addForm.isMainStation ? 'border-orange-400 bg-orange-50/40 text-orange-700 shadow-sm' : 'border-gray-100 bg-gray-50/20 text-gray-500 hover:bg-gray-50/55'}`}
                >
                  لا، نقطة توقف فرعية
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSubmitting}
                className="flex-1"
                disabled={stations.data?.length === 0 || governorates.data?.length === 0}
              >
                تأكيد وإضافة التسعيرة
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
        {/* MODAL 2: EDIT EXISTING FARE BLOCK */}
        {/* ======================================= */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="تحديث تسعيرة الرحلة"
          subtitle="تعديل الأسعار والقيمة الافتراضية للتعرفة بمسارات الركاب"
          icon={<Edit3 size={24} />}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdate} className="space-y-6">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold animate-pulse">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-2xl space-y-1 my-2 border border-gray-100">
              <p className="text-[10px] text-gray-450 font-bold">مسار خط السير المعدل</p>
              <h5 className="text-xs font-black text-gray-900 flex items-center gap-2">
                <span>{selectedFare?.fromGovernorateName}</span>
                <span className="text-gray-400 shrink-0">➔</span>
                <span>{selectedFare?.toGovernorateName}</span>
              </h5>
              <p className="text-[10px] text-gray-500 font-semibold mt-1">المحطة: {selectedFare?.cityName}</p>
            </div>

            {/* Price update input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block font-sans">
                سعر التذكرة الجديد (بالريال اليمني) *
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={editForm.price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  placeholder="مثال: 15400"
                  className="w-full px-6 py-4 bg-gray-50/30 border border-gray-100 rounded-2xl text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800"
                  min="1"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 font-sans">
                  ر.ي
                </span>
              </div>
            </div>

            {/* IsMainStation update radio buttons */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
                طبيعة المحطة بالمسار
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditForm(prev => ({ ...prev, isMainStation: true }))}
                  className={`p-4 rounded-2xl border text-xs font-black text-center transition-all ${editForm.isMainStation ? 'border-orange-400 bg-orange-50/40 text-orange-700 shadow-sm' : 'border-gray-100 bg-gray-50/20 text-gray-500 hover:bg-gray-50/55'}`}
                >
                  نعم، محطة رئيسية
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm(prev => ({ ...prev, isMainStation: false }))}
                  className={`p-4 rounded-2xl border text-xs font-black text-center transition-all ${!editForm.isMainStation ? 'border-orange-400 bg-orange-50/40 text-orange-700 shadow-sm' : 'border-gray-100 bg-gray-50/20 text-gray-500 hover:bg-gray-50/55'}`}
                >
                  لا، نقطة توقف فرعية
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSubmitting}
                className="flex-1"
              >
                حفظ تعديلات التسعيرة
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsEditOpen(false)}
                className="px-6"
              >
                إلغاء التراجع
              </Button>
            </div>
          </form>
        </Modal>

        {/* ======================================= */}
        {/* MODAL 3: CONFIRM DELETE FARE BLOCK */}
        {/* ======================================= */}
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="حذف تسعيرة خط السير"
          subtitle="سحب السعر والمسار بشكل نهائي"
          icon={<Trash2 size={24} />}
          maxWidth="max-w-md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-650 text-xs font-bold leading-relaxed">
              <ShieldAlert size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold mb-1">تحذير أمان وحذف!</p>
                <p className="font-medium text-gray-655">
                  هل أنت متأكد من رغبتك بالقيام بجلب تعرفة خط السير وحذف التسعيرة رقم <strong className="text-red-750 font-black">#FAR-{selectedFare?.tripFareId}</strong> لخط السير <strong>({selectedFare?.fromGovernorateName} ➔ {selectedFare?.toGovernorateName})</strong> بقيمة <strong>({selectedFare?.price.toLocaleString()} ر.ي)</strong>؟ لن تظهر هذه الأسعار للمسافرين بعد الآن.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                onClick={handleDelete} 
                variant="danger" 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black"
              >
                تاكيد وإتمام الحذف نهائياً
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsDeleteOpen(false)}
                className="px-6"
              >
                تراجع وإلغاء
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </CompanyLayout>
  );
}
