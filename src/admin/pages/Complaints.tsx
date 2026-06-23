import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, AlertCircle, ShieldAlert, Search, RefreshCw, 
  CheckCircle2, Clock, Calendar, User, Building2, 
  Check, Send, Inbox, MessageCircle, Info, Filter, ArrowUpDown, X, ChevronDown
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { AdminService } from '../../shared/api/services/admin.service';
import { Complaint } from '../../types/models';
import { Button, Input } from '../../shared/components/FormElements';
import { Modal } from '../../shared/components/Modal';

export default function Complaints() {
  const [activeTab, setActiveTab] = useState<'company' | 'technical'>('company');
  const [companyComplaints, setCompanyComplaints] = useState<Complaint[]>([]);
  const [technicalComplaints, setTechnicalComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced filters & sorting
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Action states
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Form states for company complaint response
  const [companyNotificationTitle, setCompanyNotificationTitle] = useState('');
  const [companyNotificationBody, setCompanyNotificationBody] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all complaints cleanly from correct segregated endpoints
  const fetchData = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const [companyRes, technicalRes] = await Promise.all([
        AdminService.getCompanyComplaints().catch(() => ({ 
          data: { success: false, data: [] as Complaint[], message: 'خطأ في جلب شكاوى الشركات' } 
        })),
        AdminService.getTechnicalComplaints().catch(() => ({ 
          data: { success: false, data: [] as Complaint[], message: 'خطأ في جلب شكاوى الدعم الفني' } 
        }))
      ]);

      if (companyRes.data && companyRes.data.success) {
        setCompanyComplaints(companyRes.data.data || []);
      } else if (companyRes.data?.message) {
        setGlobalError(`فشل جلب شكاوى الشركات: ${companyRes.data.message}`);
      }

      if (technicalRes.data && technicalRes.data.success) {
        setTechnicalComplaints(technicalRes.data.data || []);
      } else if (technicalRes.data?.message && !globalError) {
        setGlobalError(`فشل جلب شكاوى الدعم الفني: ${technicalRes.data.message}`);
      }
    } catch (err: any) {
      console.error(err);
      setGlobalError('فشل في استرجاع تذاكر الشكاوى من الخادم بشكل صحيح.');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch tabs & reset filters
  const handleTabChange = (tab: 'company' | 'technical') => {
    setActiveTab(tab);
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedComplaint(null);
    setIsDetailOpen(false);
  };

  // Resolve Technical Complaint (One-click)
  const handleResolveTechnical = async (id: number) => {
    setIsSubmitLoading(true);
    setSuccessMessage(null);
    setGlobalError(null);
    try {
      const res = await AdminService.respondToTechnicalComplaint(id);
      if (res.data && res.data.success) {
        setSuccessMessage('تمت الاستجابة المباشرة وإغلاق تذكرة الدعم التقني بنجاح!');
        // Update local state to show resolved status
        setTechnicalComplaints(prev => prev.map(c => c.complaintId === id ? { ...c, status: 'Resolved' } : c));
        if (selectedComplaint && selectedComplaint.complaintId === id) {
          setSelectedComplaint(prev => prev ? { ...prev, status: 'Resolved' } : null);
        }
        setIsDetailOpen(false);
      } else {
        setGlobalError(res.data?.message || 'فشل النظام في معالجة طلب حل الشكوى التقنية.');
      }
    } catch (err: any) {
      console.error(err);
      const backendMessage = err.response?.data?.message || err.message || '';
      setGlobalError(`حدث خطأ أثناء إجراء إغلاق الشكوى التقنية: ${backendMessage}`);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Respond to Company Complaint (Message form)
  const handleRespondToCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!companyNotificationTitle.trim() || !companyNotificationBody.trim()) {
      setGlobalError('يرجى كتابة عنوان الإشعار وتفاصيل القرار لإرسال البرقية.');
      return;
    }

    setIsSubmitLoading(true);
    setSuccessMessage(null);
    setGlobalError(null);

    try {
      const res = await AdminService.respondToCompanyComplaint(
        selectedComplaint.complaintId,
        companyNotificationTitle,
        companyNotificationBody
      );

      if (res.data && res.data.success) {
        setSuccessMessage('تم إرسال برقية القرار وتعميم الإشعار على الشركة الناقلة مع تحديث حالة الشكوى بنجاح!');
        setCompanyComplaints(prev => prev.map(c => c.complaintId === selectedComplaint.complaintId ? { ...c, status: 'Resolved' } : c));
        setIsDetailOpen(false);
        setCompanyNotificationTitle('');
        setCompanyNotificationBody('');
        setSelectedComplaint(null);
      } else {
        setGlobalError(res.data?.message || 'فشل في إرسال التوجيه إلى الشركة.');
      }
    } catch (err: any) {
      console.error(err);
      const backendMessage = err.response?.data?.message || err.message || '';
      setGlobalError(`حدث خطأ أثناء إجراء الاستجابة للشكوى وإرسالها: ${backendMessage}`);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Open Details Modal
  const openDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    if (complaint.complaintType === 'Company' || activeTab === 'company') {
      setCompanyNotificationTitle(`إشعار عاجل بشأن شكوى المسافر: ${complaint.customerName || 'مستخدم درب'}`);
      setCompanyNotificationBody(`السادة إدارة النقل،\n\nوردنا بلاغ بخصوص: "${complaint.title}".\nالوصف الفني: ${complaint.description}\n\nنلزمكم باتخاذ الإجراء التصحيحي فوراً وتحديث الحالة لتفادي الغرامات.`);
    }
    setIsDetailOpen(true);
  };

  // Standard Arabic Terminology mappings
  const getArabicStatus = (status: string) => {
    const stat = (status || '').toLowerCase();
    if (stat === 'pending' || stat === 'معاد' || stat === 'جديد') {
      return {
        text: 'قيد المراجعة والانتظار',
        classes: 'bg-amber-50 text-amber-700 border-amber-200/50'
      };
    }
    return {
      text: 'تمت المعالجة والإغلاق',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
    };
  };

  // Process and Filter/Sort complaints
  const activeComplaints = activeTab === 'company' ? companyComplaints : technicalComplaints;
  const processedComplaints = activeComplaints
    .filter(complaint => {
      const searchLower = searchTerm.toLowerCase();
      const customerMatch = complaint.customerName?.toLowerCase().includes(searchLower) || false;
      const titleMatch = complaint.title?.toLowerCase().includes(searchLower) || false;
      const descMatch = complaint.description?.toLowerCase().includes(searchLower) || false;
      const companyMatch = complaint.companyName?.toLowerCase().includes(searchLower) || false;
      const idMatch = String(complaint.complaintId).includes(searchLower);

      const matchesSearch = customerMatch || titleMatch || descMatch || companyMatch || idMatch;

      const stat = (complaint.status || '').toLowerCase();
      const isPending = stat === 'pending' || stat === 'معاد' || stat === 'جديد';
      
      let matchesStatus = true;
      if (statusFilter === 'pending') {
        matchesStatus = isPending;
      } else if (statusFilter === 'resolved') {
        matchesStatus = !isPending;
      }

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl" dir="rtl">
        
        {/* Polished Header to match Customer/Ad Management pages exactly */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">إدارة ومعالجة الشكاوى</h1>
            <p className="text-gray-500 font-medium">سجلات البلاغات والشكاوى وتذاكر الدعم الفني المستلمة من تطبيق درب</p>
          </div>
          <button
            onClick={fetchData}
            className="self-start md:self-center px-5 py-3 bg-white hover:bg-slate-50 text-gray-700 text-xs font-black rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer shadow-3xs border border-gray-150"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-orange-600' : 'text-gray-400'} />
            تحديث البلاغات
          </button>
        </div>

        {/* Success / Error Banners */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-between border border-emerald-200/60 text-xs font-bold shadow-3xs"
            >
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600" />
                <span>{successMessage}</span>
              </div>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold"
              >
                موافق
              </button>
            </motion.div>
          )}

          {globalError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-rose-50 text-rose-800 rounded-2xl flex items-center justify-between border border-rose-200/60 text-xs font-bold shadow-3xs"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-600" />
                <span>{globalError}</span>
              </div>
              <button 
                onClick={() => setGlobalError(null)}
                className="text-[10px] text-rose-600 hover:text-rose-800 font-bold"
              >
                تجاهل
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Selection Section matches other layouts */}
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-fit mb-6">
          <button
            onClick={() => handleTabChange('company')}
            className={`flex-1 md:flex-initial px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'company'
                ? 'bg-white text-orange-650 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building2 size={14} className={activeTab === 'company' ? 'text-orange-600' : ''} />
            شكاوى عن شركات النقل ({companyComplaints.length})
          </button>
          <button
            onClick={() => handleTabChange('technical')}
            className={`flex-1 md:flex-initial px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'technical'
                ? 'bg-white text-orange-650 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <AlertCircle size={14} className={activeTab === 'technical' ? 'text-orange-600' : ''} />
            شكاوى الدعم التقني للنظام ({technicalComplaints.length})
          </button>
        </div>

        {/* Advanced Filters Panel - matching styling of Advertisements.tsx & CustomerManagement.tsx */}
        <div className="bg-white p-5 rounded-3xl shadow-3xs border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-450" size={16} />
            <input
              type="text"
              placeholder={
                activeTab === 'company' 
                  ? "البحث باسم المسافر، الشركة، عنوان أو كود البلاغ..." 
                  : "البحث بموضوع وعنوان تذكرة الدعم..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pr-11 pl-4 bg-gray-50/80 hover:bg-gray-50 rounded-xl border border-transparent focus:border-orange-200 focus:bg-white text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative md:w-56 flex items-center">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="w-full h-11 pr-4 pl-8 bg-gray-50/80 hover:bg-gray-50 border border-transparent hover:border-gray-150 rounded-xl focus:border-orange-200 focus:outline-none focus:bg-white text-xs font-bold text-gray-700 cursor-pointer appearance-none"
            >
              <option value="all">كل حالات الشكاوى</option>
              <option value="pending">البلاغات الجديدة والمعلقة</option>
              <option value="resolved">البلاغات المعالجة والمحلولة</option>
            </select>
            <div className="absolute left-3 pointer-events-none text-gray-450">
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Sorting Dropdown */}
          <div className="relative md:w-56 flex items-center">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full h-11 pr-4 pl-8 bg-gray-50/80 hover:bg-gray-50 border border-transparent hover:border-gray-150 rounded-xl focus:border-orange-200 focus:outline-none focus:bg-white text-xs font-bold text-gray-700 cursor-pointer appearance-none"
            >
              <option value="newest">الأحدث وروداً أولاً</option>
              <option value="oldest">الأقدم وروداً أولاً</option>
            </select>
            <div className="absolute left-3 pointer-events-none text-gray-450">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Complaints List Rendered in Beautiful Card/Sijill Layout - matching rest of the app */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-3xs border border-gray-100 animate-pulse h-36" />
            ))}
          </div>
        ) : processedComplaints.length > 0 ? (
          <div className="space-y-4">
            {processedComplaints.map((comp) => {
              const badge = getArabicStatus(comp.status);
              const isPending = (comp.status || '').toLowerCase() === 'pending' || (comp.status || '').toLowerCase() === 'معاد';
              
              return (
                <div 
                  key={comp.complaintId}
                  className="bg-white border border-gray-100 hover:border-gray-200 rounded-3xl p-5 shadow-3xs transition-all relative flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left block: Icon, ID, Details, customer */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Visual icon representation */}
                    <div className={`h-11 w-11 rounded-2xl shrink-0 flex items-center justify-center ${isPending ? 'bg-amber-100/60 text-amber-600' : 'bg-emerald-100/60 text-emerald-600'}`}>
                      {activeTab === 'company' ? <Building2 size={20} /> : <AlertCircle size={20} />}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                          سجل #{comp.complaintId}
                        </span>
                        
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badge.classes}`}>
                          {badge.text}
                        </span>

                        {comp.companyName && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Building2 size={10} />
                            {comp.companyName}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-gray-900 leading-snug">
                        {comp.title}
                      </h4>

                      <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-4xl">
                        {comp.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-1.5 text-[11px] text-gray-400 font-semibold">
                        <span className="flex items-center gap-1 text-gray-700 font-black">
                          <User size={12} className="text-orange-650" />
                          المسافر: {comp.customerName || 'مقدم البلاغ'} (مُعرّف #{comp.userId || comp.customerId})
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          تاريخ البلاغ: {comp.createdAt ? new Date(comp.createdAt).toLocaleDateString('ar-YE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'غير معروف'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right block: Context action button */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => openDetails(comp)}
                      className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-black rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {activeTab === 'company' ? (
                        <>
                          <MessageCircle size={14} />
                          استعراض ومعالجة الشكوى
                        </>
                      ) : (
                        <>
                          <Info size={14} />
                          تفاصيل وحل العطل التقني
                        </>
                      )}
                    </button>

                    {activeTab === 'technical' && isPending && (
                      <button
                        onClick={() => handleResolveTechnical(comp.complaintId)}
                        disabled={isSubmitLoading}
                        className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer shadow-sm"
                        title="إغلاق وحل الشكوى"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-3xs">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Inbox size={32} />
            </div>
            <h3 className="text-sm font-black text-gray-800 mb-1">لا توجد سجلات شكاوى</h3>
            <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
              {activeTab === 'company' 
                ? 'لم يتم العثور على أي كروت شكاوى في النظام موجهة ضد شركات النقل البري حالياً.'
                : 'لقد تمت معالجة جميع تذاكر الدعم والتقنية بنجاح.'}
            </p>
          </div>
        )}

      </div>

      {/* Modern custom Modal for details input and actions */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={activeTab === 'company' ? "معالجة شكوى شركة النقل" : "تفاصيل بطاقة الدعم الفني"}
        subtitle={activeTab === 'company' ? "توجيه خطي يرسل فوراً كإشعار إلكتروني للشركة المختصة لتعديل الوضع" : "استعراض وحل الخلل البرمجي للنظام وإغلاق التذكرة الفنية"}
        icon={activeTab === 'company' ? <Building2 size={24} className="text-orange-650" /> : <AlertCircle size={24} className="text-orange-650" />}
        maxWidth="max-w-2xl"
      >
        {selectedComplaint && (
          <div className="space-y-6 text-right" dir="rtl">
            
            {/* Header info card */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-600/10 text-orange-650 rounded-xl flex items-center justify-center font-black">
                  {String(selectedComplaint.customerName || 'ع').charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-black block">مرسل الشكوى</span>
                  <h4 className="text-xs font-black text-gray-950">{selectedComplaint.customerName || 'مسافر درب'}</h4>
                  <p className="text-[10px] text-gray-500 font-bold mb-0">المعرف: #{selectedComplaint.userId || selectedComplaint.customerId}</p>
                </div>
              </div>
              <div className="flex self-start sm:self-center gap-2">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${getArabicStatus(selectedComplaint.status).classes}`}>
                  {getArabicStatus(selectedComplaint.status).text}
                </span>
              </div>
            </div>

            {/* Complaint details */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">عنوان بلاغ المسافر</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h5 className="text-xs font-black text-gray-900 leading-snug">{selectedComplaint.title}</h5>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">الوصف التفصيلي للبلاغ</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-gray-700 leading-relaxed font-bold whitespace-pre-wrap">
                  {selectedComplaint.description}
                </div>
              </div>

              {selectedComplaint.companyName && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">الجهة المشكو ضدها</label>
                  <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/50 flex items-center gap-2">
                    <Building2 size={13} className="text-indigo-600 animate-pulse" />
                    <span className="text-xs text-indigo-850 font-black">{selectedComplaint.companyName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* If tab is COMPANY: show response form */}
            {activeTab === 'company' ? (
              <form onSubmit={handleRespondToCompany} className="space-y-4 pt-4 border-t border-slate-150">
                <div className="flex items-center gap-2 text-orange-655 mb-2">
                  <Send size={14} className="text-orange-600" />
                  <h4 className="text-xs font-black">
                    بروتوكول اتخاذ القرار والإشعار المباشر للشركة الناقلة
                  </h4>
                </div>
                
                <div className="space-y-1">
                  <Input
                    label="عنوان القرار والبرقية الصادرة"
                    value={companyNotificationTitle}
                    onChange={(e) => setCompanyNotificationTitle(e.target.value)}
                    placeholder="اكتب عنوان الإشعار التوجيهي المرسل لشركة النقل"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 block px-1">
                    نص الإشعار ملخص القرار والتوجيه الإداري الملزم
                  </label>
                  <textarea
                    rows={4}
                    value={companyNotificationBody}
                    onChange={(e) => setCompanyNotificationBody(e.target.value)}
                    placeholder="اكتب محتوى وصياغة التوجيه لفرض اتخاذ اللازم بالسرعة القسوى..."
                    className="block w-full rounded-2xl border border-gray-200 bg-slate-50/20 px-4 py-3 text-xs focus:border-orange-400 focus:bg-white transition-all outline-none font-bold text-gray-900 shadow-sm placeholder:text-gray-300"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsDetailOpen(false)}
                    className="h-11 text-xs"
                  >
                    إلغاء التراجع
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitLoading}
                    className="h-11 text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-none font-black"
                    icon={<Send size={12} />}
                  >
                    إرسال الستجابة والقرار فوراً
                  </Button>
                </div>
              </form>
            ) : (
              /* If tab is TECHNICAL: show single button direct response */
              <div className="pt-4 border-t border-slate-150 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsDetailOpen(false)}
                  className="h-11 text-xs"
                >
                  الرجوع
                </Button>
                {(selectedComplaint.status || '').toLowerCase() !== 'resolved' && (
                  <Button
                    type="button"
                    variant="primary"
                    isLoading={isSubmitLoading}
                    onClick={() => handleResolveTechnical(selectedComplaint.complaintId)}
                    className="h-11 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-none font-black animate-shimmer"
                    icon={<Check size={14} />}
                  >
                    إغلاق وحل الشكوى التقنية بنقرة واحدة
                  </Button>
                )}
              </div>
            )}

          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
