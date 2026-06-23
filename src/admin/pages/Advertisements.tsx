import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Megaphone, Loader2, Search, Plus, Trash2, Eye, Calendar, Mail, 
  Clock, FileText, Image as ImageIcon, ExternalLink, RefreshCw, Pencil 
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { AdminService } from '../../shared/api/services/admin.service';
import { Advertisement } from '../../types/models';
import { Button, Input, Modal, Badge, Alert, EmptyState } from '../../shared/components';

export default function Advertisements() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals Visibility
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // Form State for creating a new ad
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdDescription, setNewAdDescription] = useState('');
  const [newAdStartDate, setNewAdStartDate] = useState('');
  const [newAdEndDate, setNewAdEndDate] = useState('');
  const [newAdStatus, setNewAdStatus] = useState<string>('Active'); // Default active
  const [newAdImage, setNewAdImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const res = await AdminService.getAds();
      if (res.data.success) {
        setAds(res.data.data || []);
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError('فشل الاتصال بالخادم لجلب بيانات الإعلانات المعروضة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewAdImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setNewAdTitle('');
    setNewAdDescription('');
    setNewAdStartDate('');
    setNewAdEndDate('');
    setNewAdStatus('Active');
    setNewAdImage(null);
    setImagePreview(null);
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle || !newAdDescription || !newAdStartDate || !newAdEndDate) {
      setGlobalError('يرجى ملاء جميع الحقول المطلوبة لبيانات الإعلان');
      return;
    }

    setIsActionSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('Title', newAdTitle);
      formData.append('Description', newAdDescription);
      formData.append('StartDateAds', newAdStartDate);
      formData.append('EndDateAds', newAdEndDate);
      formData.append('AdsStatus', newAdStatus);
      
      if (newAdImage) {
        formData.append('ImageFile', newAdImage);
      }

      const res = await AdminService.createAd(formData);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تمت إضافة ونشر الإعلان الجديد بنجاح في التطبيق');
        setIsAddOpen(false);
        resetForm();
        fetchAds();
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'تفاجأ النظام بخطأ أثناء إضافة الإعلان الجديد');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleDeleteAd = async (ad: Advertisement) => {
    const adId = ad.advertisementID;
    if (!adId) {
      setGlobalError('معرف الإعلان المطلوب حذفه غير متوفر');
      return;
    }

    if (!window.confirm(`هل أنت متأكد تماماً من حذف إعلان رعاية "${ad.title}"؟`)) {
      return;
    }

    setIsActionSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      const res = await AdminService.deleteAd(adId);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم حذف الإعلان المحدد بنجاح من الخادم');
        fetchAds();
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'تفاجأ النظام بخطأ أثناء حذف الإعلان');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const handleEditClick = (ad: Advertisement) => {
    setSelectedAd(ad);
    setNewAdTitle(ad.title);
    setNewAdDescription(ad.description);
    setNewAdStartDate(formatDateForInput(ad.startDateAds));
    setNewAdEndDate(formatDateForInput(ad.endDateAds));
    setNewAdStatus(typeof ad.adsStatus === 'string' ? ad.adsStatus : (ad.adsStatus === 1 ? 'Active' : 'Inactive'));
    setNewAdImage(null);
    setImagePreview(ad.imageUrl || null);
    setIsEditOpen(true);
  };

  const handleUpdateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAd || !selectedAd.advertisementID) {
      setGlobalError('معرف الإعلان المطلوب تعديله غير متوفر');
      return;
    }
    if (!newAdTitle || !newAdDescription || !newAdStartDate || !newAdEndDate) {
      setGlobalError('يرجى ملاء جميع الحقول المطلوبة لبيانات الإعلان');
      return;
    }

    setIsActionSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('Title', newAdTitle);
      formData.append('Description', newAdDescription);
      formData.append('StartDateAds', newAdStartDate);
      formData.append('EndDateAds', newAdEndDate);
      formData.append('AdsStatus', newAdStatus);
      
      if (newAdImage) {
        formData.append('ImageFile', newAdImage);
      }

      const res = await AdminService.updateAd(selectedAd.advertisementID, formData);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم تحديث الإعلان بنجاح في التطبيق');
        setIsEditOpen(false);
        resetForm();
        fetchAds();
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'تفاجأ النظام بخطأ أثناء تحديث الإعلان');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const filteredAds = ads.filter(ad => 
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ad.account_Email && ad.account_Email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: number | string) => {
    const statusVal = typeof status === 'string' ? status.trim().toLowerCase() : status;
    if (statusVal === 1 || statusVal === '1' || statusVal === 'active' || statusVal === 'نشط' || statusVal === 'نشط ومعروض') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          نشط ومعروض
        </span>
      );
    } else if (statusVal === 'draft' || statusVal === 'مسودة') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          مسودة (تحت المراجعة)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-[10px] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          غير نشط
        </span>
      );
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl animate-fade-in" dir="rtl">
        {/* Top Header Row with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Megaphone className="text-orange-600" size={32} />
              إدارة الإعلانات الترويجية
            </h1>
            <p className="text-gray-500 text-sm font-medium">متابعة ونشر لافتات الرعاية والإعلانات المعروضة على الصفحة الرئيسية للتطبيق</p>
          </div>
          <Button 
            onClick={() => { resetForm(); setIsAddOpen(true); }}
            variant="primary" 
            className="rounded-2xl shadow-md h-12 flex items-center gap-2 px-6"
            icon={<Plus size={16} />}
          >
            إضافة إعلان جديد
          </Button>
        </div>

        {/* Action Feedbacks */}
        {globalError && (
          <Alert type="error" message={globalError} className="mb-8" />
        )}

        {successMessage && (
          <Alert type="success" message={successMessage} className="mb-8" />
        )}

        {/* Filter and search utilities bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث باسم الإعلان، الوصف أو الناشر..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pr-12 pl-4 bg-gray-50/50 rounded-2xl border-none text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 transition-colors"
            />
          </div>
          <button 
            onClick={fetchAds}
            title="تحديث البيانات"
            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl transition-all shadow-none shrink-0 flex items-center gap-2 text-xs font-bold cursor-pointer"
          >
            <RefreshCw size={14} />
            تحديث
          </button>
        </div>

        {/* Main Records Area */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200">الصورة واللافتة</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200">الإعلان وعنوانه</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-center">فترة العرض</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-center">أضيف بواسطة</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-center">تاريخ الإنشاء</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-center">الحالة</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-left">التحكم والعمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-orange-500 mb-4" size={32} />
                    <p className="text-xs font-bold text-gray-400 tracking-wider">جاري جلب إعلانات الرعاية واللافتات النشطة...</p>
                  </td>
                </tr>
              ) : filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-350">
                      <Megaphone size={48} className="text-gray-200" />
                      <div>
                        <p className="text-sm font-black text-gray-500 mb-1">حمداً لله، لم يتم إضافة أي إعلانات حالياً</p>
                        <p className="text-xs font-semibold text-gray-400">انقر على "إضافة إعلان جديد" لتظهر الحملات في لوحة القيادة بنجاح</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAds.map((ad) => (
                  <tr key={ad.advertisementID} className="group hover:bg-orange-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-16 h-10 rounded-lg bg-gray-50 border border-gray-150 overflow-hidden flex items-center justify-center shrink-0">
                        {ad.imageUrl ? (
                          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs space-y-0.5">
                        <span className="text-[12px] font-bold text-gray-900 block truncate">{ad.title}</span>
                        <span className="text-[10px] text-gray-450 line-clamp-1 truncate block">{ad.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-[11px] space-y-0.5 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 font-bold text-gray-750">
                          <span className="text-emerald-600">من:</span>
                          <span>{new Date(ad.startDateAds).toLocaleDateString('ar-YE')}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 font-bold text-gray-750">
                          <span className="text-red-500">إلى:</span>
                          <span>{new Date(ad.endDateAds).toLocaleDateString('ar-YE')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-[11px] font-semibold text-gray-600 max-w-[120px] truncate">
                      {ad.account_Email || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 tabular-nums">
                      {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString('ar-YE') : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(ad.adsStatus)}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => { setSelectedAd(ad); setIsViewOpen(true); }}
                          title="معاينة تفاصيل الإعلان والروابط كاملة"
                          className="p-2 bg-orange-50 text-orange-650 border border-orange-100 rounded-lg hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center"
                        >
                          <Eye size={14} className="text-orange-600 hover:text-inherit" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(ad)}
                          title="تعديل بيانات الإعلان"
                          className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteAd(ad)}
                          title="حذف الإعلان وإيقاف عرضه"
                          disabled={isActionSubmitting}
                          className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Advertisement View Detail Modal */}
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="تفاصيل إعلان الرعاية النشط"
          subtitle="معاينة صورة اللافتة الإعلانية على خوادم درب وتفاصيل البانر"
          icon={<Megaphone size={22} />}
          maxWidth="max-w-2xl"
        >
          {selectedAd && (
            <div className="space-y-6">
              {/* Ad Cover Image Banner Preview */}
              <div className="border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/50 flex flex-col items-center p-4">
                {selectedAd.imageUrl ? (
                  <img 
                    src={selectedAd.imageUrl} 
                    alt="صورة الإعلان" 
                    className="max-h-72 object-contain rounded-2xl border border-gray-150 shadow-sm"
                  />
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-300">
                    <ImageIcon size={48} />
                    <span className="text-xs font-bold text-gray-400">لا تتوفر صورة مخصصة لهذا الإعلان الترويجي</span>
                  </div>
                )}
                {selectedAd.imageUrl && (
                  <a 
                    href={selectedAd.imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 text-xs font-black text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
                  >
                    رابط ملف البانر الأصلي <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Data Grid fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 md:col-span-2">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">عنوان الإعلان الرئيسي</span>
                  <span className="text-md font-bold text-gray-800">{selectedAd.title}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 md:col-span-2">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">وصف المتن والمحتوى</span>
                  <span className="text-xs font-semibold leading-relaxed text-gray-600 whitespace-pre-line">{selectedAd.description}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">بريد حساب المسؤول الناشر</span>
                  <span className="text-xs font-bold text-gray-800 break-all">{selectedAd.account_Email || 'غير متوفر'}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">تاريخ الإنشاء الأولي</span>
                  <span className="text-xs font-bold text-gray-800">
                    {selectedAd.createdAt ? new Date(selectedAd.createdAt).toLocaleString('ar-YE') : 'غير متوفر'}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">تاريخ انطلاق الإعلان</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(selectedAd.startDateAds).toLocaleString('ar-YE')}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">تاريخ انتهاء ورفع الإعلان</span>
                  <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(selectedAd.endDateAds).toLocaleString('ar-YE')}
                  </span>
                </div>
              </div>

              {/* Close controls action */}
              <div className="pt-6 border-t border-gray-100 flex gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsViewOpen(false)} 
                  className="px-6 h-12 rounded-2xl text-xs font-bold"
                >
                  إغلاق الشاشة
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Add Advertisement Modal */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="نشر إعلان رعاية جديد"
          subtitle="يرجى تزويد النظام ببيانات وعقد لافتة الرعاية"
          icon={<Plus size={22} />}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateAd} className="space-y-6">
            <Input 
              label="عنوان الحملة الإعلانية" 
              placeholder="مثال: خصم خاص 20% على تذاكر العيد" 
              value={newAdTitle}
              onChange={(e) => setNewAdTitle(e.target.value)}
              required
            />

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">
                محتوى ووصف الإعلان التفصيلي
              </label>
              <textarea 
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold text-gray-900 shadow-sm min-h-[100px] placeholder:text-gray-300"
                placeholder="تفاصيل التخفيض، الرموز، أو معلومات إضافية للمسافرين..."
                value={newAdDescription}
                onChange={(e) => setNewAdDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="تاريخ تنشيط اللافتة وبدء العرض" 
                type="date"
                value={newAdStartDate}
                onChange={(e) => setNewAdStartDate(e.target.value)}
                required
              />

              <Input 
                label="تاريخ انتهاء الحملة" 
                type="date"
                value={newAdEndDate}
                onChange={(e) => setNewAdEndDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">
                حالة الإعلان الأولية
              </label>
              <select 
                value={newAdStatus} 
                onChange={(e) => setNewAdStatus(e.target.value)}
                className="block w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold text-gray-900 shadow-sm"
              >
                <option value="Active">نشط ومباشر فور النشر (Active)</option>
                <option value="Inactive">توقيف مؤقت / مسودة (Inactive)</option>
              </select>
            </div>

            {/* Custom File Upload Area with preview */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">
                تحميل لافتة الصورة الترويجية (أبعاد Landscape مفضلة)
              </label>
              
              <div className="border-2 border-dashed border-gray-200 hover:border-orange-450 rounded-3xl p-6 flex flex-col items-center justify-center bg-gray-50/30 hover:bg-orange-50/5 transition-all relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                {imagePreview ? (
                  <div className="space-y-4 text-center">
                    <img 
                      src={imagePreview} 
                      alt="معاينة الملف" 
                      className="max-h-40 object-contain rounded-2xl border border-gray-200 shadow-xs mx-auto"
                    />
                    <p className="text-[11px] font-black text-orange-600">انقر لتغيير الصورة المحملة</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-4">
                     <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mx-auto">
                       <ImageIcon size={22} />
                     </div>
                     <div>
                       <span className="text-xs font-bold text-gray-700">اسحب وأسقط الصورة أو تصفح الملفات</span>
                       <p className="text-[10px] font-semibold text-gray-450 mt-1">تنسيقات PNG, JPG, WEBP المدعومة</p>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Create Actions */}
            <div className="pt-6 border-t border-gray-150 flex gap-3 justify-end">
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isActionSubmitting}
                className="px-8 h-12 rounded-2xl text-xs font-black"
              >
                تأكيد النشر والإضافة
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => { setIsAddOpen(false); resetForm(); }}
                disabled={isActionSubmitting}
                className="px-6 h-12 rounded-2xl text-xs font-bold"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Advertisement Modal */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="تعديل بيانات إعلان الرعاية"
          subtitle="تحديث العقود، تواريخ العرض، أو استبدال لافتة الإعلان الحالية"
          icon={<Pencil size={22} />}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleUpdateAd} className="space-y-6">
            <Input 
              label="عنوان الحملة الإعلانية" 
              placeholder="مثال: خصم خاص 20% على تذاكر العيد" 
              value={newAdTitle}
              onChange={(e) => setNewAdTitle(e.target.value)}
              required
            />

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">
                محتوى ووصف الإعلان التفصيلي
              </label>
              <textarea 
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold text-gray-900 shadow-sm min-h-[100px] placeholder:text-gray-300"
                placeholder="تفاصيل التخفيض، الرموز، أو معلومات إضافية للمسافرين..."
                value={newAdDescription}
                onChange={(e) => setNewAdDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="تاريخ تنشيط اللافتة وبدء العرض" 
                type="date"
                value={newAdStartDate}
                onChange={(e) => setNewAdStartDate(e.target.value)}
                required
              />

              <Input 
                label="تاريخ انتهاء الحملة" 
                type="date"
                value={newAdEndDate}
                onChange={(e) => setNewAdEndDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">
                حالة الإعلان
              </label>
              <select 
                value={newAdStatus} 
                onChange={(e) => setNewAdStatus(e.target.value)}
                className="block w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold text-gray-900 shadow-sm"
              >
                <option value="Active">نشط ومباشر فور النشر (Active)</option>
                <option value="Inactive">توقيف مؤقت / مسودة (Inactive)</option>
              </select>
            </div>

            {/* Custom File Upload Area with preview */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">
                تعديل لافتة الصورة الترويجية (اختياري - اتركه بدون تعديل للإبقاء على الصورة الحالية)
              </label>
              
              <div className="border-2 border-dashed border-gray-200 hover:border-orange-450 rounded-3xl p-6 flex flex-col items-center justify-center bg-gray-50/30 hover:bg-orange-50/5 transition-all relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                {imagePreview ? (
                  <div className="space-y-4 text-center">
                    <img 
                      src={imagePreview} 
                      alt="معاينة الملف" 
                      className="max-h-40 object-contain rounded-2xl border border-gray-200 shadow-xs mx-auto"
                    />
                    <p className="text-[11px] font-black text-orange-600">انقر لتغيير الصورة أو استبدالها</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-4">
                     <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mx-auto">
                       <ImageIcon size={22} />
                     </div>
                     <div>
                       <span className="text-xs font-bold text-gray-700">اسحب وأسقط الصورة أو تصفح الملفات</span>
                       <p className="text-[10px] font-semibold text-gray-450 mt-1">تنسيقات PNG, JPG, WEBP المدعومة</p>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Create Actions */}
            <div className="pt-6 border-t border-gray-150 flex gap-3 justify-end">
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isActionSubmitting}
                className="px-8 h-12 rounded-2xl text-xs font-black"
              >
                تحديث وحفظ التغييرات
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => { setIsEditOpen(false); resetForm(); }}
                disabled={isActionSubmitting}
                className="px-6 h-12 rounded-2xl text-xs font-bold"
              >
                إلغاء التعديل
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
