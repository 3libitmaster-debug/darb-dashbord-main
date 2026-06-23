import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wrench, Plus, Trash2, Edit2, ShieldAlert, CheckCircle, 
  Map, Navigation, Landmark, Loader2, Upload, Trash
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { UserRole } from '../../types/auth';
import { AdminService } from '../../shared/api/services/admin.service';
import { Governorate, City, Bank } from '../../types/models';
import { useMaintenance } from '../hooks/useMaintenance';
import { Input, Button, Alert } from '../../shared/components';

type ActiveTab = 'governorates' | 'cities' | 'banks';

export default function Maintenance() {
  const { 
    governorates, cities, banks, globalError, setGlobalError,
    fetchGovernorates, fetchCities, fetchBanks 
  } = useMaintenance();

  const [activeTab, setActiveTab] = useState<ActiveTab>('governorates');
  const [success, setSuccess] = useState<string | null>(null);

  // Forms states
  const [govName, setGovName] = useState('');
  const [editingGov, setEditingGov] = useState<Governorate | null>(null);

  const [cityName, setCityName] = useState('');
  const [selectedGovId, setSelectedGovId] = useState<number>(0);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const [bankName, setBankName] = useState('');
  const [bankLogo, setBankLogo] = useState<File | undefined>(undefined);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'governorates') {
      fetchGovernorates();
    } else if (activeTab === 'cities') {
      fetchGovernorates();
    } else if (activeTab === 'banks') {
      fetchBanks();
    }
  }, [activeTab, fetchGovernorates, fetchCities, fetchBanks]);

  useEffect(() => {
    if (activeTab === 'cities' && governorates.data && governorates.data.length > 0) {
      const firstGovId = governorates.data[0].id;
      setSelectedGovId(firstGovId);
      fetchCities(firstGovId);
    }
  }, [governorates.data, activeTab, fetchCities]);

  const handleGovSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!govName.trim()) return;

    setIsSubmitting(true);
    setGlobalError(null);
    setSuccess(null);

    try {
      if (editingGov) {
        const res = await AdminService.updateGovernorate(editingGov.id, govName);
        if (res.data.success) {
          setSuccess('تم تحديث المحافظة بنجاح');
          setGovName('');
          setEditingGov(null);
          fetchGovernorates();
        } else {
          setGlobalError(res.data.message);
        }
      } else {
        const res = await AdminService.createGovernorate(govName);
        if (res.data.success) {
          setSuccess('تمت إضافة المحافظة الجديدة بنجاح');
          setGovName('');
          fetchGovernorates();
        } else {
          setGlobalError(res.data.message);
        }
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGovDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المحافظة؟ قد تؤثر على المدن والرحلات المرتبطة بها.')) return;
    setGlobalError(null);
    setSuccess(null);
    try {
      const res = await AdminService.deleteGovernorate(id);
      if (res.data.success) {
        setSuccess('تم حذف المحافظة بنجاح');
        fetchGovernorates();
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم');
    }
  };

  const handleGovernorateChangeForCities = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const govId = Number(e.target.value);
    setSelectedGovId(govId);
    setCityName('');
    setEditingCity(null);
    fetchCities(govId);
  };

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim() || !selectedGovId) return;

    setIsSubmitting(true);
    setGlobalError(null);
    setSuccess(null);

    try {
      if (editingCity) {
        const res = await AdminService.updateCity(editingCity.id, cityName, selectedGovId);
        if (res.data.success) {
          setSuccess('تم تحديث بيانات المدينة بنجاح');
          setCityName('');
          setEditingCity(null);
          fetchCities(selectedGovId);
        } else {
          setGlobalError(res.data.message);
        }
      } else {
        const res = await AdminService.createCity(cityName, selectedGovId);
        if (res.data.success) {
          setSuccess('تمت إضافة المدينة بنجاح للمحافظة المحددة');
          setCityName('');
          fetchCities(selectedGovId);
        } else {
          setGlobalError(res.data.message);
        }
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCityDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه المدينة؟')) return;
    setGlobalError(null);
    setSuccess(null);
    try {
      const res = await AdminService.deleteCity(id);
      if (res.data.success) {
        setSuccess('تم حذف المدينة بنجاح');
        fetchCities(selectedGovId);
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBankLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) return;

    setIsSubmitting(true);
    setGlobalError(null);
    setSuccess(null);

    try {
      const bankIdVal = editingBank ? editingBank.bankId : null;
      const res = await AdminService.upsertBank(bankIdVal, bankName, bankLogo);
      if (res.data.success) {
        setSuccess(editingBank ? 'تم تحديث بيانات البنك بنجاح المعتمد' : 'تم تدوين وإضافة الحقل المصرفي بنجاح في التطبيق');
        setBankName('');
        setBankLogo(undefined);
        setLogoPreview(null);
        setEditingBank(null);
        fetchBanks();
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم لحفظ بيانات البنك');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankDelete = async (id: number) => {
    if (!window.confirm('هل تريد حذف هذا البنك نهائياً؟ قد يتسبب ذلك في مشكلة في عرض الحوالات الموجهة له.')) return;
    setGlobalError(null);
    setSuccess(null);
    try {
      const res = await AdminService.deleteBank(id);
      if (res.data.success) {
        setSuccess('تم حذف بيانات البنك المحدد بنجاح');
        fetchBanks();
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'تفاجأ الخادم بخطأ أثناء عملية الحذف');
    }
  };

  const handleBankEditClick = (bank: Bank) => {
    setEditingBank(bank);
    setBankName(bank.bankName);
    setLogoPreview(bank.logoUrl || null);
    setBankLogo(undefined);
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl animate-fade-in" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-905 tracking-tight flex items-center gap-3">
              <Wrench className="text-orange-600" size={32} />
              صيانة ومؤشرات النظام الرئيسي
            </h1>
            <p className="text-gray-500 text-sm font-semibold">إدارة القوائم الرئيسية مثل المحافظات، المدن، وصور البنوك المعتمدة لتسهيل تجربة السداد</p>
          </div>
        </div>

        {globalError && (
          <Alert type="error" message={globalError} className="mb-6" />
        )}

        {success && (
          <Alert type="success" message={success} className="mb-6" />
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-gray-150 gap-2 mb-8 overflow-x-auto pb-1">
          <button 
            onClick={() => setActiveTab('governorates')}
            className={`px-5 py-3 rounded-t-2xl font-black text-xs transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'governorates' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-50 text-gray-550 border border-transparent hover:bg-gray-100'
            }`}
          >
            <Map size={14} /> المحافظات اليمنية
          </button>
          <button 
            onClick={() => setActiveTab('cities')}
            className={`px-5 py-3 rounded-t-2xl font-black text-xs transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cities' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-50 text-gray-550 border border-transparent hover:bg-gray-100'
            }`}
          >
            <Navigation size={14} /> المدن والمديريات الفرعية
          </button>
          <button 
            onClick={() => setActiveTab('banks')}
            className={`px-5 py-3 rounded-t-2xl font-black text-xs transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'banks' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-50 text-gray-550 border border-transparent hover:bg-gray-100'
            }`}
          >
            <Landmark size={14} /> البنوك وشركات الصرافة المعتمدة
          </button>
        </div>

        {/* Tab Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Action Panel */}
          <div className="bg-white p-6 rounded-3xl shadow-sm h-fit">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
              <Plus size={16} className="text-orange-600" />
              {activeTab === 'governorates' ? (editingGov ? 'تعديل محافظة' : 'إضافة محافظة جديدة') :
               activeTab === 'cities' ? (editingCity ? 'تعديل مدينة/مديرية' : 'إضافة مدينة جديدة') :
               (editingBank ? 'تحرير بيانات البنك' : 'إضافة بنك/صرافة لنماذج السداد')}
            </h3>

            {activeTab === 'governorates' && (
              <form onSubmit={handleGovSubmit} className="space-y-4">
                <Input 
                  label="اسم المحافظة" 
                  placeholder="مثال: صنعاء، عدن، تعز" 
                  value={govName}
                  onChange={(e) => setGovName(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1 rounded-2xl text-xs font-black h-12">
                    {editingGov ? 'تحديث وتأكيد' : 'إضافة ونشر'}
                  </Button>
                  {editingGov && (
                    <Button type="button" variant="secondary" onClick={() => { setEditingGov(null); setGovName(''); }} className="rounded-2xl text-xs font-bold h-12">
                      إلغاء المعاينة
                    </Button>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'cities' && (
              <form onSubmit={handleCitySubmit} className="space-y-4">
                <div className="space-y-1.5 mb-2">
                  <label className="text-[10px] font-black text-gray-400 block px-1 uppercase tracking-wider">المحافظة الأم المانحة</label>
                  <select 
                    value={selectedGovId} 
                    onChange={handleGovernorateChangeForCities}
                    className="block w-full h-12 rounded-xl border border-gray-150 bg-gray-50/50 px-4 text-xs font-bold text-gray-800 outline-none focus:border-orange-500"
                  >
                    {governorates.data.map((gov) => (
                      <option key={gov.id} value={gov.id}>{gov.name}</option>
                    ))}
                  </select>
                </div>
                
                <Input 
                  label="اسم المدينة/المديرية" 
                  placeholder="مثال: حارة سيكو، خور مكسر" 
                  value={cityName}
                  disabled={governorates.data.length === 0}
                  onChange={(e) => setCityName(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" disabled={governorates.data.length === 0} isLoading={isSubmitting} className="flex-1 rounded-2xl text-xs font-black h-12">
                    {editingCity ? 'تحديث بيانات المدينة' : 'قرن وإضافة المدينة'}
                  </Button>
                  {editingCity && (
                    <Button type="button" variant="secondary" onClick={() => { setEditingCity(null); setCityName(''); }} className="rounded-2xl text-xs font-bold h-12">
                      إلغاء
                    </Button>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'banks' && (
              <form onSubmit={handleBankSubmit} className="space-y-4">
                <Input 
                  label="اسم الجهة المصرفية / البنك" 
                  placeholder="مثال: بنك الكريمي الإسلامي، الكافي" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 block px-1 uppercase tracking-wider">شعار البنك (Logo)</label>
                  
                  <div className="border border-dashed border-gray-200 hover:border-orange-500 rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50/50 relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {logoPreview ? (
                      <div className="text-center space-y-2">
                        <img src={logoPreview} alt="Preview Logo" className="h-14 w-auto object-contain rounded-lg border border-gray-100" />
                        <p className="text-[10px] font-black text-orange-600">انقر لاستبدال الشعار المحمل</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1 py-1">
                        <Upload size={18} className="text-gray-400 mx-auto" />
                        <span className="text-[11px] font-bold text-gray-500 block">اضغط لتحميل شعار البنك</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1 rounded-2xl text-xs font-black h-12">
                    {editingBank ? 'تطبيق وجدول الحفظ' : 'إدراج البنك'}
                  </Button>
                  {editingBank && (
                    <Button type="button" variant="secondary" onClick={() => { setEditingBank(null); setBankName(''); setLogoPreview(null); }} className="rounded-2xl text-xs font-bold h-12">
                      مسح التعديل
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Records Display Area */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm h-fit">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 mb-6">
              {activeTab === 'governorates' ? 'قائمة المحافظات اليمنية المدخلة' :
               activeTab === 'cities' ? 'المدن والمحطات بالفرع المذكور' :
               'بوابات ومنصات السداد المصرفية المتاحة'}
            </h3>

            {/* List Contents with state loaders */}
            {activeTab === 'governorates' && (
              <div className="divide-y divide-gray-100 max-h-[460px] overflow-y-auto pr-1">
                {governorates.status === 'loading' ? (
                  <div className="py-12 text-center text-gray-400 font-bold text-xs flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-orange-600" size={24} />
                    <span>جاري جلب المحافظات...</span>
                  </div>
                ) : governorates.data.length === 0 ? (
                  <p className="py-12 text-center text-gray-400 font-bold text-xs">لا يوجد محافظات مضافة بعد</p>
                ) : (
                  governorates.data.map((gov) => (
                    <div key={gov.id} className="py-3.5 flex items-center justify-between group">
                      <span className="text-xs font-black text-gray-850 group-hover:text-orange-600 transition-colors">{gov.name}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setGovName(gov.name); setEditingGov(gov); }}
                          className="p-1 px-2.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-orange-50 hover:text-orange-600 border border-gray-200 text-[10px] font-black transition-colors"
                        >
                          تعديل
                        </button>
                        <button 
                          onClick={() => handleGovDelete(gov.id)}
                          className="p-1 px-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white border border-red-100 text-[11px] font-bold transition-all"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'cities' && (
              <div className="space-y-4">
                {selectedGovId === 0 && (
                  <p className="py-12 text-center text-gray-400 font-bold text-xs">يرجى اختيار المحافظة الأم أولاً لعرض المدن التابعة لها</p>
                )}
                
                {selectedGovId > 0 && (
                  <div className="divide-y divide-gray-100 max-h-[460px] overflow-y-auto pr-1">
                    {cities.status === 'loading' ? (
                      <div className="py-12 text-center text-gray-400 font-bold text-xs flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-orange-600" size={24} />
                        <span>جاري تفتيش المدن...</span>
                      </div>
                    ) : cities.data.length === 0 ? (
                      <p className="py-12 text-center text-gray-400 font-bold text-[11px] text-gray-450 border-2 border-dashed border-gray-50 rounded-2xl bg-gray-50/20">لا يوجد مدن مقرونة بهذه المحافظة حالياً، يمكنك إنشاء أول مدينة الآن!</p>
                    ) : (
                      cities.data.map((ct) => (
                        <div key={ct.id} className="py-3.5 flex items-center justify-between group">
                          <span className="text-xs font-black text-gray-850">{ct.name}</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => { setCityName(ct.name); setEditingCity(ct); }}
                              className="p-1 px-2.5 bg-gray-50 text-gray-550 rounded-lg hover:bg-orange-50 hover:text-orange-500 border border-gray-200 text-[10px] font-black transition-colors"
                            >
                              تعديل
                            </button>
                            <button 
                              onClick={() => handleCityDelete(ct.id)}
                              className="p-1 px-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white border border-red-100 text-[11px] font-bold transition-all"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'banks' && (
              <div className="divide-y divide-gray-100 max-h-[460px] overflow-y-auto pr-1">
                {banks.status === 'loading' ? (
                  <div className="py-12 text-center text-gray-400 font-bold text-xs flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-orange-600" size={24} />
                    <span>عملية كشف البنوك جارية...</span>
                  </div>
                ) : banks.data.length === 0 ? (
                  <p className="py-12 text-center text-gray-400 font-bold text-[11px] border border-dashed rounded-xl bg-gray-50 text-gray-400">لا توجد بوابات مضافة للسداد في النظام الإلكتروني</p>
                ) : (
                  banks.data.map((bk) => (
                    <div key={bk.bankId} className="py-3.5 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-gray-100 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                          {bk.logoUrl ? (
                            <img src={bk.logoUrl} alt={bk.bankName} className="h-full w-full object-cover" />
                          ) : (
                            <Landmark size={16} className="text-gray-300" />
                          )}
                        </div>
                        <span className="text-xs font-black text-gray-850">{bk.bankName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleBankEditClick(bk)}
                          className="p-1 px-2.5 bg-gray-50 text-gray-550 rounded-lg hover:bg-orange-50 hover:text-orange-500 border border-gray-200 text-[10px] font-black transition-colors"
                        >
                          تعديل
                        </button>
                        <button 
                          onClick={() => handleBankDelete(bk.bankId)}
                          className="p-1 px-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white border border-red-100 text-[11px] font-bold transition-all"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
