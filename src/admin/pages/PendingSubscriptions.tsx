import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, Loader2, CheckCircle2, XCircle, Search, 
  MapPin, Calendar, ExternalLink, ShieldAlert,
  Clock, ShieldCheck, Download, Award
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { AdminCompanyService } from '../../shared/api/services/admin-company.service';
import { PendingSubscriptionRequest } from '../../types/models';
import { Button } from '../../shared/components/FormElements';
import { UserRole } from '../../types/auth';
import { Modal } from '../../shared/components/Modal';

export default function PendingSubscriptions() {
  const [requests, setRequests] = useState<PendingSubscriptionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View Detail Modal State
  const [selectedRequest, setSelectedRequest] = useState<PendingSubscriptionRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingSubscriptions();
  }, []);

  const fetchPendingSubscriptions = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const res = await AdminCompanyService.getPendingSubscriptions();
      if (res.data.success) {
        setRequests(res.data.data || []);
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError('فشل الاتصال بالخادم لجلب طلبات السداد المعلقة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSubscription = async (request: PendingSubscriptionRequest) => {
    const companySubscriptionId = request.companySubscriptionId;
    if (!companySubscriptionId) {
      setGlobalError('معرف الفاتورة أو الاشتراك غير متوفر');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من تفعيل وتمديد فترة العضوية لشركة "${request.companyName}" بناءً على السند المرفق؟`)) {
      return;
    }

    setIsActionSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      const res = await AdminCompanyService.acceptSubscription(companySubscriptionId);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم تفقد سند السداد وتفعيل باقة الاشتراك البرية المعتمدة!');
        setIsViewOpen(false);
        fetchPendingSubscriptions();
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم لتصديق سند السداد');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleRejectSubscription = async (request: PendingSubscriptionRequest) => {
    const companySubscriptionId = request.companySubscriptionId;
    if (!companySubscriptionId) {
      setGlobalError('معرف الفاتور أو الاشتراك غير متوفر');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من رفض سند تجديد شركة "${request.companyName}"؟`)) {
      return;
    }

    setIsActionSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      const res = await AdminCompanyService.rejectSubscription(companySubscriptionId);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم رفض مستند الحوالة وإعلام الشركة بمراجعة السداد');
        setIsViewOpen(false);
        fetchPendingSubscriptions();
      } else {
        setGlobalError(res.data.message);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل معالجة الطلب على الخادم');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanName = (planType: number) => {
    switch (planType) {
      case 1: return 'الباقة الشهرية العادية';
      case 2: return 'الباقة النصف سنوية المتقدمة';
      case 3: return 'الباقة السنوية الكاملة';
      default: return `الباقة البرونزية (${planType})`;
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl animate-fade-in" dir="rtl">
        {/* Header Title Section */}
        <div className="space-y-1 mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <CreditCard className="text-orange-600" size={32} />
            طلبات تجديد وسداد الاشتراكات
          </h1>
          <p className="text-gray-500 text-sm font-semibold">مراجعة والتدقيق في حوالات تجديد البرايج والاشتراكات لشركات النقل البري المسجلة</p>
        </div>

        {/* Feedback alerts */}
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

        {/* Filter Toolbar bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl shadow-sm mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث باسم شركة النقل..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-550 transition-all outline-none"
            />
          </div>
          <button 
            onClick={fetchPendingSubscriptions}
            className="p-3 bg-gray-150 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors text-xs font-bold shadow-none border-none cursor-pointer"
          >
            تحديث طلبات السداد
          </button>
        </div>

        {/* Records display area */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200">شركة النقل</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-center">نوع الباقة المقررة</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-center">تاريخ المعاملة</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-center">نوع المعاملة</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-center">مؤشر الإجراء</th>
                <th className="px-6 py-5 text-[11px] font-bold text-gray-600 border-b border-gray-200 text-left">التفاصيل والتدقيق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-orange-600 mb-3" size={28} />
                    <p className="text-xs font-bold text-gray-400">جاري مسح معاملات وحوالات الشركات...</p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <CheckCircle2 size={40} className="text-emerald-500 animate-bounce" />
                      <div>
                        <p className="text-sm font-black text-gray-500">لا يوجد أي حوالات تمديد اشتراك معلقة حالياً!</p>
                        <p className="text-xs font-semibold text-gray-400 mt-1">كافة الحوالات والإشعارات معالجة ومدققة</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.companySubscriptionId} className="group hover:bg-orange-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                          <Award size={18} />
                        </div>
                        <span className="text-xs font-black text-gray-900">{req.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black rounded-lg">
                        {getPlanName(req.planType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-gray-500 tabular-nums">
                      {req.subscriptionDate ? new Date(req.subscriptionDate).toLocaleDateString('ar-YE') : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[11px] font-semibold text-gray-650">
                        {req.requestType === 1 ? 'تفعيل اشتراك جديد' : 'تجديد باقة ترويجية'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg text-[10px] font-bold">
                        <Clock size={10} className="animate-spin" />
                        غير مدقق
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <button 
                        onClick={() => { setSelectedRequest(req); setIsViewOpen(true); }}
                        className="p-2 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                      >
                        معاينة الحوالة <ExternalLink size={10} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Subscription document review details modal */}
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="تدقيق دفعة وإشعار تجديد الاشتراك"
          subtitle="تأكيد تحصيل رسوم الاشتراك وتمديد المدة فورياً"
          icon={<ShieldCheck size={22} className="text-emerald-500" />}
          maxWidth="max-w-2xl"
        >
          {selectedRequest && (
            <div className="space-y-6">
              {/* Slip Preview Image */}
              <div className="space-y-1.5 text-center">
                <span className="text-[10px] font-black text-gray-400 block uppercase tracking-widest">مستند وإشعار تسديد رسوم الاشتراك المرفق</span>
                <div className="border border-gray-150 rounded-2xl bg-gray-50 p-4 flex flex-col items-center justify-center">
                  {selectedRequest.paymentSlipUrl ? (
                    <>
                      <img 
                        src={selectedRequest.paymentSlipUrl} 
                        alt="إشعار التسديد المالي" 
                        className="max-h-72 object-contain rounded-xl border border-gray-100 shadow-sm"
                      />
                      <a 
                        href={selectedRequest.paymentSlipUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-3 text-xs font-black text-orange-600 hover:text-orange-750 hover:underline flex items-center gap-0.5"
                      >
                        معاينة المستند في نافذة كاملة <ExternalLink size={10} />
                      </a>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-gray-300 py-12">لم يتم إرفاق إشعار أو حوالة بنكية</span>
                  )}
                </div>
              </div>

              {/* Text Fields details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">اسم شركة النقل الطالبة</span>
                  <span className="text-sm font-bold text-gray-800">{selectedRequest.companyName}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">الباقة والاشتراك المقرر</span>
                  <span className="text-xs font-black text-orange-600 block">{getPlanName(selectedRequest.planType)}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">تاريخ تحويل وتقديم الحوالة</span>
                  <span className="text-sm font-bold text-gray-800">
                    {selectedRequest.subscriptionDate ? new Date(selectedRequest.subscriptionDate).toLocaleString('ar-YE') : 'غير محدد'}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">نوع المعاملة المصنفة</span>
                  <span className="text-sm font-bold text-gray-800">
                    {selectedRequest.requestType === 1 ? 'تفعيل اشتراك جديد' : 'تجديد باقة ترويجية'}
                  </span>
                </div>
              </div>

              {/* Action Decision buttons */}
              <div className="pt-6 border-t border-gray-150 flex flex-col sm:flex-row gap-3 justify-end">
                <Button 
                  onClick={() => handleAcceptSubscription(selectedRequest)}
                  isLoading={isActionSubmitting}
                  variant="primary" 
                  className="px-8 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black sm:order-first"
                >
                  اعتماد الدفع وتفعيل الاشتراك
                </Button>
                <Button 
                  onClick={() => handleRejectSubscription(selectedRequest)}
                  isLoading={isActionSubmitting}
                  variant="danger" 
                  className="px-8 h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black"
                >
                  رفض الحوالة لخطأ في السداد
                </Button>
                <Button 
                  onClick={() => setIsViewOpen(false)}
                  disabled={isActionSubmitting}
                  variant="secondary" 
                  className="px-6 h-12 rounded-2xl text-xs font-bold"
                >
                  إلغاء المعاينة
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
