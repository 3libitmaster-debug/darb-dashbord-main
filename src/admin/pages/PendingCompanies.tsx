import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Loader2, CheckCircle2, XCircle, Search, 
  MapPin, Mail, Calendar, ExternalLink, ShieldAlert,
  Clock, ShieldCheck, Download
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { AdminCompanyService } from '../../shared/api/services/admin-company.service';
import { CompanyRegistrationRequest } from '../../types/models';
import { Button } from '../../shared/components/FormElements';
import { UserRole } from '../../types/auth';
import { Modal } from '../../shared/components/Modal';

export default function PendingCompanies() {
  const [requests, setRequests] = useState<CompanyRegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View Detail Modal State
  const [selectedRequest, setSelectedRequest] = useState<CompanyRegistrationRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const fetchPendingCompanies = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const res = await AdminCompanyService.getPendingCompanies();
      if (res.data.success) {
        setRequests(res.data.data || []);
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError('فشل الاتصال بالخادم لجلب طلبات التسجيل المعلقة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptCompany = async (request: CompanyRegistrationRequest) => {
    // Note: The AdminCompanyService endpoint is acceptSubscription which receives subscriptionId
    const subscriptionId = request.subscriptionId;
    if (!subscriptionId) {
      setGlobalError('معرف الاشتراك الخاص بهذا الطلب غير متوفر');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من قبول اعتماد وترخيص شركة "${request.name}"؟`)) {
      return;
    }

    setIsActionSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      const res = await AdminCompanyService.acceptSubscription(subscriptionId);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم قبول واعتماد الشركة وحسابها بنجاح!');
        setIsViewOpen(false);
        fetchPendingCompanies();
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم لمعالجة الطلب');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleRejectCompany = async (request: CompanyRegistrationRequest) => {
    const subscriptionId = request.subscriptionId;
    if (!subscriptionId) {
      setGlobalError('معرف الاشتراك الخاص بهذا الطلب غير متوفر');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من رفض طلب تسجيل شركة "${request.name}" وإلغاء المعاملة؟`)) {
      return;
    }

    setIsActionSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      const res = await AdminCompanyService.rejectSubscription(subscriptionId);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم رفض طلب التسجيل المعلق وإيقاف الاشتراك');
        setIsViewOpen(false);
        fetchPendingCompanies();
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم لمعالجة الطلب');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl animate-fade-in" dir="rtl">
        {/* Header Title Section */}
        <div className="space-y-1 mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-orange-600" size={32} />
            طلبات انضمام الشركات المعلقة
          </h1>
          <p className="text-gray-500 text-sm font-semibold">مراجعة والبت في ملفات وعقود تراخيص شركات النقل البري الجديدة الراغبة في الانضمام لمنصة درب</p>
        </div>

        {/* Action Call Feedbacks */}
        {globalError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold shadow-sm"
          >
            <ShieldAlert size={16} /> <span>{globalError}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2 text-emerald-600 text-xs font-bold shadow-sm"
          >
            <CheckCircle2 size={16} /> <span>{successMessage}</span>
          </motion.div>
        )}

        {/* Filters utility bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl shadow-sm mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث باسم الشركة أو البريد الإلكتروني المعلق..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-550 transition-all outline-none"
            />
          </div>
          <button 
            onClick={fetchPendingCompanies}
            className="p-3 bg-gray-150 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors text-xs font-bold shadow-none border-none cursor-pointer"
          >
            تحديث الطلبات
          </button>
        </div>

        {/* Record Results Area */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200">صورة وشعار الشركة</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200">الاسم ومعلومات الهوية</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-center">الخطة المطلوبة</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-center">تاريخ تقديم الطلب</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-center">حالة التدقيق</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-left">التدقيق والعمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-orange-600 mb-3" size={28} />
                    <p className="text-xs font-bold text-gray-400">جاري تفقد وفلترة الطلبات بانتظار الترخيص...</p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <CheckCircle2 size={40} className="text-emerald-500 animate-bounce" />
                      <div>
                        <p className="text-sm font-black text-gray-500">لا يوجد أي طلبات تسجيل معلقة حالياً!</p>
                        <p className="text-xs font-semibold text-gray-400 mt-1">تم البت وفسح كافة تعاملات تراخيص شركات النقل البري</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.companyId} className="group hover:bg-orange-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-150 flex items-center justify-center overflow-hidden">
                        {req.logo ? (
                          <img src={req.logo} alt={req.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 size={20} className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs space-y-0.5">
                        <span className="text-xs font-black text-gray-900 block">{req.name}</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-450">
                          <MapPin size={10} />
                          <span>{req.address}</span>
                          <span className="text-gray-300">|</span>
                          <Mail size={10} />
                          <span className="line-clamp-1 truncate">{req.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black rounded-full">
                        {req.planType || 'خطة أولية'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-gray-500 tabular-nums">
                      {req.requestDate ? new Date(req.requestDate).toLocaleDateString('ar-YE') : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg text-[10px] font-bold">
                        <Clock size={10} className="animate-spin" />
                        بانتظار التحقق
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => { setSelectedRequest(req); setIsViewOpen(true); }}
                          className="p-2 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                        >
                          دخول التدقيق <ExternalLink size={10} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* View Document details modal */}
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="معالجة طلب الترخيص والتحقق"
          subtitle="تفقد سلامة أوراق ودفعة الانتساب لشركة النقل"
          icon={<ShieldCheck size={22} className="text-emerald-500" />}
          maxWidth="max-w-3xl"
        >
          {selectedRequest && (
            <div className="space-y-6">
              {/* Image double-grid for logo & payment slip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 block uppercase tracking-widest text-center">ترخيص العضوية والسجل التجاري الرسمى</span>
                  <div className="border border-gray-100 rounded-2xl bg-gray-50 p-4 flex flex-col items-center justify-center">
                    {selectedRequest.license ? (
                      <>
                        <img 
                          src={selectedRequest.license} 
                          alt="ترخيص السجل" 
                          className="max-h-48 object-contain rounded-xl border border-gray-200 shadow-xs"
                        />
                        <a 
                          href={selectedRequest.license} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-2 text-[11px] font-black text-orange-600 hover:underline flex items-center gap-0.5"
                        >
                          عرض المستند المسحي <ExternalLink size={10} />
                        </a>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 py-12">لا يتوفر وثيقة سجل تجاري مرفقة</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 block uppercase tracking-widest text-center">إشعار الحوالة وسند الدفع المرفق</span>
                  <div className="border border-gray-100 rounded-2xl bg-gray-50 p-4 flex flex-col items-center justify-center">
                    {selectedRequest.paymentSlipUrl ? (
                      <>
                        <img 
                          src={selectedRequest.paymentSlipUrl} 
                          alt="حوالة الكفالة" 
                          className="max-h-48 object-contain rounded-xl border border-gray-200 shadow-xs"
                        />
                        <a 
                          href={selectedRequest.paymentSlipUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-2 text-[11px] font-black text-orange-600 hover:underline flex items-center gap-0.5"
                        >
                          عرض تفاصيل السند بالتفصيل <ExternalLink size={10} />
                        </a>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 py-12">لا توجد صورة لسند الدفع المالي</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Text Fields details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">الاسم القانوني للشركة</span>
                  <span className="text-sm font-bold text-gray-800">{selectedRequest.name}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">البريد الإلكتروني للانتساب</span>
                  <span className="text-sm font-bold text-gray-800 break-all">{selectedRequest.email}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">المقر والعنوان</span>
                  <span className="text-sm font-bold text-gray-800">{selectedRequest.address}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">الخطة التمويلية المقترحة</span>
                  <span className="text-xs font-black text-orange-600 block">{selectedRequest.planType || 'غير محدد'}</span>
                </div>
              </div>

              {/* Action Decision buttons */}
              <div className="pt-6 border-t border-gray-150 flex flex-col sm:flex-row gap-3 justify-end">
                <Button 
                  onClick={() => handleAcceptCompany(selectedRequest)}
                  isLoading={isActionSubmitting}
                  variant="primary" 
                  className="px-8 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black sm:order-first"
                >
                  اعتماد وفسح ترخيص الشركة
                </Button>
                <Button 
                  onClick={() => handleRejectCompany(selectedRequest)}
                  isLoading={isActionSubmitting}
                  variant="danger" 
                  className="px-8 h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black"
                >
                  رفض المعاملة مع بيان السبب
                </Button>
                <Button 
                  onClick={() => setIsViewOpen(false)}
                  disabled={isActionSubmitting}
                  variant="secondary" 
                  className="px-6 h-12 rounded-2xl text-xs font-bold"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
