import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Plus, Loader2, Edit2, Trash2, AlertCircle, 
  Search, CheckCircle, XCircle, MapPin, Mail, Calendar, Star,
  ShieldCheck, Upload, ExternalLink
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { AdminCompanyService } from '../../shared/api/services/admin-company.service';
import { TransportCompany } from '../../types/models';
import { Button, Input } from '../../shared/components/FormElements';
import { UserRole } from '../../types/auth';
import { Modal } from '../../shared/components/Modal';

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<TransportCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<TransportCompany | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewCompany, setViewCompany] = useState<TransportCompany | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    address: '',
    license: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const res = await AdminCompanyService.getCompanies();
      if (res.data.success) {
        setCompanies(res.data.data);
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err) {
      setGlobalError('فشل الاتصال بالخادم لجلب قائمة الشركات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (company: TransportCompany | null = null) => {
    if (company) {
      setCurrentCompany(company);
      setFormData({
        email: company.email,
        password: '', // Password not returned from server
        name: company.name,
        address: company.address,
        license: company.license || '',
      });
      setLogoPreview(company.logoUrl || null);
    } else {
      setCurrentCompany(null);
      setFormData({
        email: '',
        password: '',
        name: '',
        address: '',
        license: '',
      });
      setLogoPreview(null);
    }
    setLogoFile(null);
    setLicenseFile(null);
    setIsFormOpen(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);

    if (!currentCompany) {
      if (!logoFile) {
        setGlobalError('يرجى تحميل شعار الشركة أولاً');
        setIsSubmitting(false);
        return;
      }
      if (!licenseFile) {
        setGlobalError('يرجى تحميل ملف الترخيص الرسمي أولاً');
        setIsSubmitting(false);
        return;
      }
    }

    const payload: TransportCompany = {
      ...formData,
      logoFile: logoFile || undefined,
      licenseFile: licenseFile || undefined,
    };

    try {
      let res;
      if (currentCompany) {
        res = await AdminCompanyService.updateCompany(currentCompany.companyId!, payload);
      } else {
        res = await AdminCompanyService.createCompany(payload);
      }

      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم حفظ بيانات الشركة بنجاح');
        fetchCompanies();
        setIsFormOpen(false);
      } else {
        setGlobalError(res.data.message || 'فشل عملية الحفظ');
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الشركة نهائياً؟')) return;
    
    setGlobalError(null);
    setSuccessMessage(null);
    try {
      const res = await AdminCompanyService.deleteCompany(id);
      if (res.data.success || res.status === 204) {
        setSuccessMessage(res.data.message || 'تم حذف الشركة بنجاح');
        fetchCompanies();
      } else {
        setGlobalError(res.data.message || 'فشل عملية الحذف');
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم');
    }
  };

  const handleToggleStatus = async (company: TransportCompany) => {
    const userId = company.userId;
    if (!userId) {
      setGlobalError('معرف المستخدم غير متوفر لعملية التنشيط/التعطيل');
      return;
    }
    
    setGlobalError(null);
    setSuccessMessage(null);
    try {
      const isActivating = !company.isActive;
      const res = await AdminCompanyService.toggleCompanyActivation(userId);

      if (res.data.success) {
        setSuccessMessage(res.data.message || (isActivating ? 'تم تنشيط الشركة بنجاح' : 'تم تعطيل الشركة بنجاح'));
        fetchCompanies();
      } else {
        setGlobalError(res.data.message || 'فشل تغيير حالة الشركة');
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم');
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">شركات النقل</h1>
            <p className="text-gray-500 font-medium">إدارة وتوثيق شركات النقل البري المسجلة في النظام</p>
          </div>
          <Button 
            onClick={() => handleOpenForm()} 
            className="rounded-2xl bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200"
          >
            <Plus size={20} className="ml-2" />
            إضافة شركة جديدة
          </Button>
        </div>

        {/* Messages */}
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between text-emerald-700">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} />
              <p className="font-bold">{successMessage}</p>
            </div>
            <button onClick={() => setSuccessMessage(null)}><XCircle size={20} /></button>
          </motion.div>
        )}

        {globalError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between text-red-600">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="font-bold">{globalError}</p>
            </div>
            <button onClick={() => setGlobalError(null)}><XCircle size={20} /></button>
          </motion.div>
        )}

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-3xl shadow-sm mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="البحث باسم الشركة أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-bold"
            />
          </div>
        </div>

        {/* Data List */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div>
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-sm font-black text-gray-400">الشركة</th>
                  <th className="px-6 py-5 text-sm font-black text-gray-400">معلومات الاتصال</th>
                  <th className="px-6 py-5 text-sm font-black text-gray-400 text-center">التقييم</th>
                  <th className="px-6 py-5 text-sm font-black text-gray-400 text-center">تاريخ الانضمام</th>
                  <th className="px-6 py-5 text-sm font-black text-gray-400 text-center">الحالة</th>
                  <th className="px-6 py-5 text-sm font-black text-gray-400 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8"><div className="h-8 bg-gray-100 rounded-full w-full"></div></td>
                    </tr>
                  ))
                ) : filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <tr key={company.companyId} className="group hover:bg-orange-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:bg-white transition-colors shadow-sm">
                            {company.logoUrl ? (
                              <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 size={24} className="text-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{company.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <MapPin size={12} className="text-gray-400" />
                              <span className="text-[11px] font-bold text-gray-500">{company.address}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Mail size={12} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-600">{company.email}</span>
                          </div>
                          <div className="flex items-center gap-2" onClick={() => { setViewCompany(company); setIsViewOpen(true); }}>
                            <ShieldCheck size={12} className="text-gray-400 cursor-pointer" />
                            <span className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer">عرض الترخيص</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-orange-500 bg-orange-50 px-2 py-1 rounded-lg w-fit mx-auto border border-orange-100">
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-black">{company.averageRating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-500 font-bold text-xs tabular-nums">
                          <Calendar size={12} />
                          {company.joinDate ? new Date(company.joinDate).toLocaleDateString('ar-YE') : '---'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${
                          company.isActive 
                             ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                             : "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {company.isActive ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          {company.isActive ? (
                            <button onClick={() => handleToggleStatus(company)} title="تعطيل" className="p-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                              <XCircle size={16} />
                            </button>
                          ) : (
                            <button onClick={() => handleToggleStatus(company)} title="تنشيط" className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button onClick={() => handleOpenForm(company)} className="p-2 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => { setViewCompany(company); setIsViewOpen(true); }} 
                            title="عرض التفاصيل" 
                            className="p-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button onClick={() => handleDelete(company.companyId!)} className="p-2 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-red-600 hover:border-red-200 transition-all shadow-sm text-red-400">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-bold">لا توجد شركات مطابقة للبحث</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={currentCompany ? 'تحديث بيانات الشركة' : 'إضافة شركة نقل جديدة'}
        subtitle="أكمل البيانات أدناه لحفظ التغييرات"
        icon={currentCompany ? <Edit2 size={24}/> : <Building2 size={24}/>}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Upload */}
            <div className="md:col-span-2 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <div className="relative group cursor-pointer">
                <div className="w-28 h-28 rounded-[2rem] bg-white border border-gray-100 shadow-xl flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={40} className="text-gray-200" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity cursor-pointer">
                  <Upload size={24} className="text-white" />
                  <input type="file" onChange={handleLogoChange} className="hidden" accept="image/*" />
                </label>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">شعار الشركة (PNG/WebP)</p>
            </div>

            <div className="md:col-span-2">
              <Input label="اسم الشركة" placeholder="مثلاً: شركة النور للنقل" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            
            <Input label="البريد الإلكتروني" type="email" placeholder="example@company.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            {!currentCompany && (
              <Input label="كلمة المرور" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            )}
            
            <div className="md:col-span-2">
              <Input label="العنوان / المقر الرئيسي" placeholder="المدينة - الشارع" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-3 block">ملف الترخيص (نسخة ضوئية)</label>
              <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <Upload size={20} className="text-orange-500" />
                  </div>
                  <span className="text-sm font-black text-gray-500">
                    {licenseFile ? licenseFile.name : 'اختر ملف الترخيص...'}
                  </span>
                </div>
                <input type="file" onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-8 border-t border-gray-50">
            <Button type="submit" isLoading={isSubmitting} className="flex-1 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-100">
              {currentCompany ? 'حفظ التحديثات' : 'إضافة الشركة'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} className="px-12">إلغاء</Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="تفاصيل شركة النقل"
        subtitle="عرض كافة البيانات والوثائق الخاصة بالشركة"
        icon={<Building2 size={22} />}
        maxWidth="max-w-2xl"
      >
        {viewCompany && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-100">
              <div className="w-24 h-24 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                {viewCompany.logoUrl ? (
                  <img src={viewCompany.logoUrl} alt={viewCompany.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={40} className="text-gray-300" />
                )}
              </div>
              <div className="text-center">
                <h4 className="text-xl font-black text-gray-900">{viewCompany.name}</h4>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${
                    viewCompany.isActive 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-red-50 text-red-600 border border-red-100"
                  }`}>
                    {viewCompany.isActive ? 'نشط' : 'معطل'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 block mb-1">البريد الإلكتروني</span>
                <span className="text-sm font-bold text-gray-800 break-all">{viewCompany.email}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 block mb-1">العنوان والمقر</span>
                <span className="text-sm font-bold text-gray-800">{viewCompany.address}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 block mb-1">متوسط التقييم</span>
                <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm mt-0.5">
                  <Star size={14} fill="currentColor" />
                  <span>{viewCompany.averageRating?.toFixed(1) || '0.0'} / 5.0</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 block mb-1">تاريخ الانضمام</span>
                <span className="text-sm font-bold text-gray-800">{viewCompany.joinDate ? new Date(viewCompany.joinDate).toLocaleDateString('ar-YE') : '---'}</span>
              </div>
            </div>

            {viewCompany.license && (
              <div className="pt-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">وثيقة الترخيص الرسمية</span>
                <div className="relative border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/50 flex flex-col items-center p-4">
                  <img 
                    src={viewCompany.license} 
                    alt="وثيقة الترخيص" 
                    className="max-h-64 object-contain rounded-2xl border border-gray-100 shadow-sm"
                  />
                  <a 
                    href={viewCompany.license} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 text-xs font-black text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
                  >
                    فتح الترخيص في نافذة جديدة <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-50 flex justify-end">
              <Button type="button" variant="secondary" onClick={() => setIsViewOpen(false)} className="px-10 h-12 rounded-2xl text-xs font-bold">
                إغلاق النافذة
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
