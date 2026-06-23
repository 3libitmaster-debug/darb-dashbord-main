import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, Search, RefreshCw, AlertCircle, CheckCircle, 
  Plus, Edit3, Trash2, ShieldAlert, X, Landmark, Compass, Map, Building2
} from 'lucide-react';
import CompanyLayout from '../components/CompanyLayout';
import { UserRole } from '../../types/auth';
import { useStations } from '../hooks/useStations';
import { useMaintenance } from '../../admin/hooks/useMaintenance';
import { Station } from '../../types/models';
import { Button, Input } from '../../shared/components/FormElements';
import { Modal } from '../../shared/components/Modal';

export default function CompanyStations() {
  const { 
    stations, 
    globalError, 
    isSubmitting,
    setGlobalError, 
    fetchStations,
    addStation,
    editStation,
    removeStation
  } = useStations();

  const {
    governorates,
    cities,
    fetchGovernorates,
    fetchCities
  } = useMaintenance();

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Modals visibility states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected station for edit or delete
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Form states and field errors
  const [addForm, setAddForm] = useState({ address: '', governorateId: 0, cityId: 0 });
  const [editForm, setEditForm] = useState({ address: '', governorateId: 0, cityId: 0 });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStations();
    fetchGovernorates();
  }, [fetchStations, fetchGovernorates]);

  // Handle cascading fetches of cities when selected governorate changes in ADD form
  useEffect(() => {
    if (addForm.governorateId > 0) {
      fetchCities(addForm.governorateId);
    }
  }, [addForm.governorateId, fetchCities]);

  // Handle cascading fetches of cities when selected governorate changes in EDIT form
  useEffect(() => {
    if (editForm.governorateId > 0) {
      fetchCities(editForm.governorateId);
    }
  }, [editForm.governorateId, fetchCities]);

  // Statistics calculation
  const totalStations = stations.data?.length || 0;
  const distinctGovs = new Set(stations.data?.map(st => st.governorateId)).size;
  const distinctCities = new Set(stations.data?.map(st => st.cityId)).size;

  // Filtered List
  const filteredStations = (stations.data || []).filter(st => {
    const matchesSearch = 
      (st.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.cityName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.governorateName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Action handlers
  const handleOpenAdd = () => {
    const defaultGovId = governorates.data?.[0]?.id || 0;
    setAddForm({ address: '', governorateId: defaultGovId, cityId: 0 });
    setFormError(null);
    setSuccessMessage(null);
    setIsAddOpen(true);
    if (defaultGovId > 0) {
      fetchCities(defaultGovId);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.address.trim()) {
      setFormError('يرجى تحديد تفاصيل العنوان أو الحي');
      return;
    }
    if (addForm.governorateId === 0) {
      setFormError('يرجى اختيار المحافظة السكنية أولاً');
      return;
    }
    if (addForm.cityId === 0) {
      setFormError('يرجى تحديد المدينة السكنية المرافقة للمحافظة لربطها بالمحطة');
      return;
    }

    setFormError(null);
    setSuccessMessage(null);
    const result = await addStation({
      address: addForm.address.trim(),
      governorateId: Number(addForm.governorateId),
      cityId: Number(addForm.cityId)
    });
    
    if (result.success) {
      setSuccessMessage(result.message || 'تم تسجيل المحطة بنجاح');
      setIsAddOpen(false);
    } else {
      setFormError(result.message || 'فشل تسجيل المحطة الجديدة بقاعدة البيانات');
    }
  };

  const handleOpenEdit = async (st: Station) => {
    setSelectedStation(st);
    setEditForm({
      address: st.address || '',
      governorateId: st.governorateId || 0,
      cityId: st.cityId || 0
    });
    setFormError(null);
    setIsEditOpen(true);
    // Trigger pre-fetching cities for the selected governorate to populate the edited dropdown
    if (st.governorateId > 0) {
      await fetchCities(st.governorateId);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation) return;

    if (!editForm.address.trim()) {
      setFormError('يرجى كتابة تفاصيل العنوان المعدلة');
      return;
    }
    if (editForm.governorateId === 0) {
      setFormError('يرجى تحديد المحافظة');
      return;
    }
    if (editForm.cityId === 0) {
      setFormError('يرجى تحديد المدينة');
      return;
    }

    setFormError(null);
    setSuccessMessage(null);
    const result = await editStation(selectedStation.stationId, {
      address: editForm.address.trim(),
      governorateId: Number(editForm.governorateId),
      cityId: Number(editForm.cityId)
    });

    if (result.success) {
      setSuccessMessage(result.message || 'تم تعديل بيانات المحطة بنجاح');
      setIsEditOpen(false);
    } else {
      setFormError(result.message || 'فشل تحديث بيانات المحطة الحالية');
    }
  };

  const handleOpenDelete = (st: Station) => {
    setSelectedStation(st);
    setGlobalError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedStation) return;
    setSuccessMessage(null);
    const result = await removeStation(selectedStation.stationId);
    if (result.success) {
      setSuccessMessage(result.message || 'تم حذف المحطة بنجاح');
      setIsDeleteOpen(false);
    }
  };

  const forceRefresh = () => {
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
              <MapPin className="text-orange-600 animate-bounce" size={32} />
              إدارة محطات الحافلات
            </h1>
            <p className="text-gray-500 text-sm font-semibold">تحديد نقاط الانطلاق والوصول وحصر مكاتب الشركة الموزعة في عموم المحافظات اليمنية</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={forceRefresh} 
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 rounded-2xl transition-all shadow-none flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <RefreshCw size={14} className={stations.status === 'loading' ? 'animate-spin' : ''} />
              تحديث البيانات
            </button>
            <Button 
              onClick={handleOpenAdd}
              icon={<Plus size={16} />} 
              variant="primary"
              className="px-6 h-12 rounded-2xl text-xs font-black"
            >
              إضافة محطة جديدة
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

        {/* Global Success Display */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2 text-emerald-650 text-xs font-bold shadow-sm">
            <CheckCircle size={16} className="shrink-0 text-emerald-600" /> 
            <span>{successMessage}</span>
          </div>
        )}

        {/* Bento Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">إجمالي المحطات المضافة</p>
              <h3 className="text-4xl font-black text-gray-900 tabular-nums leading-none mt-1">
                {stations.status === 'loading' ? '...' : totalStations}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <MapPin size={22} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">المحافظات المغطاة</p>
              <h3 className="text-4xl font-black text-emerald-600 tabular-nums leading-none mt-1">
                {stations.status === 'loading' ? '...' : distinctGovs}
              </h3>
            </div>
            <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <Map size={22} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">عدد المدن الفرعية</p>
              <h3 className="text-4xl font-black text-orange-600 tabular-nums leading-none mt-1">
                {stations.status === 'loading' ? '...' : distinctCities}
              </h3>
            </div>
            <div className="h-12 w-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
              <Compass size={22} />
            </div>
          </motion.div>
        </div>

        {/* Toolbar (Search) */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-3xl shadow-sm mb-8">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث باسم المحطة، المدينة، أو المحافظة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-550 transition-all outline-none"
            />
          </div>
        </div>

        {/* Stations Directory List Layout */}
        {stations.status === 'loading' ? (
          <div id="stations-skeleton-loader" className="bg-white rounded-[2rem] p-8 shadow-sm space-y-4 animate-pulse">
            <div className="h-6 bg-gray-100 rounded-lg w-1/4 mb-6"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl w-full"></div>
            ))}
          </div>
        ) : filteredStations.length > 0 ? (
          <div id="stations-table-container" className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 font-bold text-xs select-none">
                    <th id="th-st-id" className="p-5 font-black">رمز المحطة</th>
                    <th id="th-st-gov" className="p-5 font-black">المحافظة</th>
                    <th id="th-st-city" className="p-5 font-black">المدينة</th>
                    <th id="th-st-address" className="p-5 font-black">العنوان التفصيلي وموقع المكتب</th>
                    <th id="th-st-actions" className="p-5 font-black text-left">خيارات التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStations.map((st, i) => (
                    <motion.tr 
                      key={st.stationId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50/50 transition-colors text-xs text-gray-700"
                    >
                      {/* Code */}
                      <td className="p-5 font-black text-gray-900"># STN-{st.stationId}</td>
                      
                      {/* Governorate name */}
                      <td className="p-5 font-extrabold text-orange-655">
                        <span className="bg-orange-50/80 text-orange-700 px-3 py-1.5 rounded-lg border border-orange-100/40 inline-flex items-center gap-1.5">
                          <Map size={13} />
                          {st.governorateName}
                        </span>
                      </td>
                      
                      {/* City Name */}
                      <td className="p-5 font-bold text-gray-800">
                        <span className="bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-bold border border-gray-100">
                          <Compass size={13} className="text-gray-400" />
                          {st.cityName}
                        </span>
                      </td>
                      
                      {/* Detailed Address (Highlighted) */}
                      <td className="p-5 font-black text-gray-900 select-all tracking-tight text-sm">
                        {st.address}
                      </td>

                      {/* Action buttons (Modifying/Deleting) */}
                      <td className="p-5 text-left flex items-center justify-end gap-2">
                        {/* Edit button */}
                        <button 
                          onClick={() => handleOpenEdit(st)}
                          title="تعديل تفاصيل المحطة"
                          className="p-2.5 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Delete button */}
                        <button 
                          onClick={() => handleOpenDelete(st)}
                          title="حذف المحطة"
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
          <div id="stations-empty-state" className="py-24 text-center border-2 border-dashed border-gray-150 rounded-[2rem] bg-white">
            <Building2 size={40} className="mx-auto text-gray-300 mb-4 animate-bounce" />
            <h4 className="text-base font-bold text-gray-500">لا توجد محطات مسجلة للشركة</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">ابدأ بإدخال أول مكتب ومحطة لتتمكن من جدولة الرحلات والمغادرة منها</p>
          </div>
        )}

        {/* ======================================= */}
        {/* MODAL 1: ADD NEW STATION */}
        {/* ======================================= */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="إضافة محطة انطلاق ووصول"
          subtitle="تسجيل نقاط ومكاتب الشركة لتسهيل حجز العملاء للرحلات"
          icon={<MapPin size={24} />}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreate} className="space-y-6">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold animate-pulse">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Governorate Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
                المحافظة المغذية *
              </label>
              {governorates.status === 'loading' ? (
                <div className="h-12 bg-gray-100 rounded-2xl animate-pulse"></div>
              ) : governorates.data && governorates.data.length > 0 ? (
                <select 
                  value={addForm.governorateId}
                  onChange={(e) => {
                    const nextGovId = parseInt(e.target.value) || 0;
                    setAddForm(prev => ({ ...prev, governorateId: nextGovId, cityId: 0 }));
                  }}
                  className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800"
                >
                  <option value={0} disabled>-- اختر المحافظة --</option>
                  {governorates.data.map(gov => (
                    <option key={gov.id} value={gov.id}>
                      {gov.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold">
                  لا توجد محافظات مسجلة مسبقاً في النظام.
                </div>
              )}
            </div>

            {/* City Selection (Cascading options loaded dynamically from selected Governorate) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
                المدينة الفرعية *
              </label>
              
              {addForm.governorateId === 0 ? (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-450 text-xs font-bold text-center">
                  يرجى اختيار المحافظة أولاً لعرض مدنها الفرعية
                </div>
              ) : cities.status === 'loading' ? (
                <div className="h-12 bg-gray-100 rounded-2xl animate-pulse"></div>
              ) : cities.data && cities.data.length > 0 ? (
                <select 
                  value={addForm.cityId}
                  onChange={(e) => setAddForm(prev => ({ ...prev, cityId: parseInt(e.target.value) || 0 }))}
                  className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800 animate-fade-in"
                >
                  <option value={0}>-- اختر المدينة --</option>
                  {cities.data.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold animate-fade-in">
                  لا توجد مدن مسجلة تتبع لهذه المحافظة في النظام في الوقت الحالي.
                </div>
              )}
            </div>

            <Input 
              label="العنوان التفصيلي وموقع المكتب (مثال: شارع الأربعين - أمام فندق السفير) *"
              placeholder="مثال: المكلا - جوار بنك اليمن الدولي..."
              value={addForm.address}
              onChange={(e) => setAddForm(prev => ({ ...prev, address: e.target.value }))}
            />

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSubmitting}
                className="flex-1"
                disabled={governorates.data?.length === 0 || addForm.cityId === 0}
              >
                تأكيد وإضافة المحطة
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
        {/* MODAL 2: EDIT STATION */}
        {/* ======================================= */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="تعديل تفاصيل المحطة"
          subtitle="تعديل العنوان، المدينة، والمحافظة المرتبطة بالمكتب"
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

            {/* Governorate Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
                المحافظة
              </label>
              <select 
                value={editForm.governorateId}
                onChange={(e) => {
                  const nextGovId = parseInt(e.target.value) || 0;
                  setEditForm(prev => ({ ...prev, governorateId: nextGovId, cityId: 0 }));
                }}
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800"
              >
                {governorates.data?.map(gov => (
                  <option key={gov.id} value={gov.id}>
                    {gov.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
                المدينة
              </label>
              {cities.status === 'loading' ? (
                <div className="h-12 bg-gray-100 rounded-2xl animate-pulse"></div>
              ) : cities.data && cities.data.length > 0 ? (
                <select 
                  value={editForm.cityId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, cityId: parseInt(e.target.value) || 0 }))}
                  className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800"
                >
                  <option value={0}>-- اختيار من القائمة الجديدة --</option>
                  {cities.data.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold">
                  لم يتم جلب أي مدن لهذه المحافظة بعد.
                </div>
              )}
            </div>

            <Input 
              label="العنوان التفصيلي وموقع المكتب المعدل *"
              placeholder="مثال: المكلا - جوار بنك اليمن الدولي..."
              value={editForm.address}
              onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
            />

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSubmitting}
                className="flex-1"
              >
                سيف وتحديث المحطة
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
        {/* MODAL 3: CONFIRM DELETE STATION */}
        {/* ======================================= */}
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="حذف محطة الشركة"
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
                  هل أنت متأكد من رغبتك بالقيام بحذف المحطة المسجلة بعنوان <strong className="text-red-755 font-black">({selectedStation?.address})</strong> بمحافظة <strong>({selectedStation?.governorateName})</strong> بشكل نهائي من سجلات مكاتب الشركة المعتمدة؟
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                onClick={handleDelete} 
                variant="danger" 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black"
              >
                تاكيد وإتمام الحذف
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
