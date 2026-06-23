import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, AlertCircle, X, Upload, CheckCircle2, 
  Trash2, Landmark, Award, Check, Loader2 
} from 'lucide-react';
import { useAuth } from '../../app/store/AuthContext';
import { AuthService } from '../api/services/auth.service';
import { UserRole } from '../../types/auth';
import { Input, Button } from '../components/FormElements';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Subscription Renewal States
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [renewEmail, setRenewEmail] = useState('');
  const [renewPlanType, setRenewPlanType] = useState<number>(0);
  const [renewPaymentSlip, setRenewPaymentSlip] = useState<File | null>(null);
  const [isDraggingSlip, setIsDraggingSlip] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);
  const [renewSuccess, setRenewSuccess] = useState<boolean>(false);
  const [isRenewSubmitting, setIsRenewSubmitting] = useState(false);

  // Dynamic Plans State
  const [plans, setPlans] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoadingPlans(true);
      try {
        const response = await AuthService.getSubscriptionPlans();
        if (response.data.success && response.data.data) {
          setPlans(response.data.data);
          if (response.data.data.length > 0) {
            setRenewPlanType(response.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load subscription plans:', err);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await AuthService.login(email, password);
      
      if (response.data.success) {
        const token = response.data.data.token;
        login(token);
        
        const decoded = AuthService.decodeToken(token);
        const role = decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        
        if (role === UserRole.Admin) navigate('/admin');
        else if (role === UserRole.Company) navigate('/company');
        else setError('ليس لديك صلاحية للدخول.');
      } else {
        setError(response.data.message || 'حدث خطأ أثناء تسجيل الدخول.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل الاتصال بالخادم. يرجى التأكد من اسم المستخدم وكلمة المرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRenewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRenewPaymentSlip(file);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRenewError(null);
    setRenewSuccess(false);

    if (!renewEmail.trim()) {
      setRenewError('يرجى إدخال البريد الإلكتروني للشركة.');
      return;
    }
    if (!renewPaymentSlip) {
      setRenewError('يرجى إرفاق صورة أو مستند سند السداد المصرفي الخاص بالباقة.');
      return;
    }

    setIsRenewSubmitting(true);
    try {
      const response = await AuthService.renewSubscription({
        email: renewEmail,
        planType: renewPlanType,
        paymentSlip: renewPaymentSlip
      });

      if (response.data.success) {
        setRenewSuccess(true);
        // Clear inputs after success
        setRenewEmail('');
        setRenewPaymentSlip(null);
      } else {
        setRenewError(response.data.message || 'فشل تكوين طلب التجديد. تأكد من أن البريد الإلكتروني مسجل كشركة حالية.');
      }
    } catch (err: any) {
      setRenewError(err.response?.data?.message || 'عذراً، حدث خطأ أثناء إرسال سند تجديد الاشتراك.');
    } finally {
      setIsRenewSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc] px-4 font-sans rtl tabular-nums selection:bg-orange-100 selection:text-orange-950" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden">
          <div className="mb-10 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 mb-6 text-white shadow-lg shadow-orange-100">
              <Bus size={28} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">دخول النظام</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">إدارة شبكة النقل البري</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@darb.com"
              required
            />

            <Input 
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 text-xs text-orange-600 border border-orange-100"
              >
                <AlertCircle size={18} className="shrink-0" />
                <p className="font-bold">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full h-16 mt-4"
            >
              دخول النظام
            </Button>

            <div className="text-center pt-6 space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                هل أنت شركة نقل؟ <Link to="/register" className="text-orange-500 hover:underline">سجل شركتك الآن</Link>
              </p>
              <div className="border-t border-gray-100/85 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRenewOpen(true)}
                  className="text-xs font-black text-orange-600 hover:text-orange-700 transition-all bg-orange-50/50 hover:bg-orange-50 px-5 py-2.5 rounded-2xl border border-orange-100/40 inline-block hover:scale-[1.02] active:scale-95"
                >
                  طلب تجديد اشتراك الشركة
                </button>
              </div>
            </div>
          </form>
        </div>
        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          درب لخدمات النقل الذكي © {new Date().getFullYear()}
        </p>
      </motion.div>

      {/* Renewal Modal Overlay */}
      <AnimatePresence>
        {isRenewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isRenewSubmitting) {
                  setIsRenewOpen(false);
                  setRenewError(null);
                  setRenewSuccess(false);
                }
              }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-lg bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-gray-100/50 p-6 sm:p-10 z-10 max-h-[92vh] overflow-y-auto flex flex-col"
              dir="rtl"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsRenewOpen(false);
                  setRenewError(null);
                  setRenewSuccess(false);
                }}
                disabled={isRenewSubmitting}
                className="absolute left-6 top-6 p-2 text-gray-400 hover:text-gray-650 hover:bg-gray-50 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 mb-2">
                    <Award size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">تجديد اشتراك شريك ناقل</h2>
                  <p className="text-xs font-bold text-gray-400 leading-normal">
                    قم بإرفاق بيانات الاشتراك وتأكيد التحويل المالي ليتم تجديد وتنشيط لوحة تحكم شركتكم فوراً.
                  </p>
                </div>

                {renewSuccess ? (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="p-8 bg-green-50/50 border border-green-100 rounded-[2rem] text-center space-y-4"
                  >
                    <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-green-100">
                      <CheckCircle2 size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-green-950">تم إرسال طلب تجديد الاشتراك!</h3>
                      <p className="text-xs text-green-700 font-bold leading-relaxed px-4">
                        سيوضع طلبكم قيد المراجعة الفورية من قبل فريق الدعم الفني والمالي لـ درب، وسيتم إعادة تفعيل تنشيط حسابكم في أسرع وقت.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRenewOpen(false);
                        setRenewSuccess(false);
                      }}
                      className="mt-2 px-6 py-3 bg-green-600 text-white font-extrabold text-xs rounded-xl hover:bg-green-700 shadow-md shadow-green-100/20 active:scale-95 transition-all text-center inline-block"
                    >
                      حسناً، فهمت
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleRenewSubmit} className="space-y-5">
                    
                    {/* Email Input */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">البريد الإلكتروني للشركة</label>
                      <input 
                        type="email"
                        required
                        value={renewEmail}
                        onChange={(e) => setRenewEmail(e.target.value)}
                        placeholder="example@company.com"
                        className="w-full h-14 bg-gray-50/50 border border-gray-150 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all outline-none"
                      />
                    </div>

                    {/* Plan Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">اختر باقة التجديد</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {isLoadingPlans ? (
                          <div className="col-span-2 py-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold">
                            <Loader2 className="animate-spin text-orange-500" size={16} />
                            جاري تحميل باقات الاشتراك...
                          </div>
                        ) : plans.length > 0 ? (
                          plans.map((p) => {
                            const parts = p.name.includes(' - ') ? p.name.split(' - ') : [p.name, ''];
                            const title = parts[0];
                            const price = parts[1];

                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setRenewPlanType(p.id)}
                                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between relative overflow-hidden group ${
                                  renewPlanType === p.id 
                                    ? 'border-orange-500 bg-orange-50/20 text-orange-950 shadow-sm ring-1 ring-orange-100' 
                                    : 'border-gray-100 bg-gray-50/30 text-slate-500 hover:border-gray-200'
                                }`}
                              >
                                {renewPlanType === p.id && (
                                  <div className="absolute top-2 left-2 h-4 w-4 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-sm">
                                    <Check size={10} className="stroke-[3]" />
                                  </div>
                                )}
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full self-start ${renewPlanType === p.id ? 'bg-orange-100/50 text-orange-700 font-extrabold' : 'bg-gray-100 text-gray-400'}`}>
                                  {p.id === 1 ? 'باقة الأولوية' : 'الباقة القياسية'}
                                </span>
                                <div className="mt-2 text-right">
                                  <h3 className="text-xs font-black text-slate-900 leading-none">{title}</h3>
                                  {price && (
                                    <span className="text-sm font-bold font-mono text-orange-600 tracking-tight mt-1 inline-block">{price}</span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="col-span-2 py-6 text-center text-xs text-gray-400 font-bold">
                            لا تتوفر باقات اشتراك حالياً.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bank instructions block */}
                    <div className="bg-amber-50/30 border border-amber-100/70 rounded-2xl p-4 text-[10px] text-amber-900 space-y-1">
                      <p className="font-extrabold flex items-center gap-1.5 text-amber-950">
                        <Landmark size={14} className="text-amber-600 shrink-0" /> تذكير السداد المصرفي:
                      </p>
                      <p className="font-bold opacity-90 leading-relaxed text-[10px]">
                        حول قيمة الاشتراك لبنك الكريمي الإسلامي حساب مالي معتمد برقم: <span className="font-mono text-xs bg-amber-100/60 px-1 py-0.5 rounded border border-amber-200 font-bold text-slate-900">12345678</span> باسم <span className="font-extrabold text-slate-950">منصة درب الذكية</span>، ثم قم بإرفاق الإيصال.
                      </p>
                    </div>

                    {/* File Upload Zone */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">مستند أو صورة إثبات الحوالة (سند السداد)</label>
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingSlip(true);
                        }}
                        onDragLeave={() => setIsDraggingSlip(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingSlip(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) setRenewPaymentSlip(file);
                        }}
                        className={`relative h-28 rounded-2xl bg-gray-50 border-2 border-dashed flex flex-col items-center justify-center gap-1.5 p-4 overflow-hidden group transition-all duration-300 ${
                          isDraggingSlip 
                            ? 'border-orange-500 bg-orange-50/50 scale-[1.01]' 
                            : renewPaymentSlip 
                              ? 'border-green-300 bg-green-50/10' 
                              : 'border-slate-200 hover:border-orange-400 hover:bg-orange-50/5'
                        }`}
                      >
                        {renewPaymentSlip ? (
                          <div className="flex flex-col items-center justify-center text-center gap-1 w-full h-full relative z-10">
                            <CheckCircle2 size={24} className="text-green-500 animate-bounce" />
                            <span className="text-[10px] font-black text-green-700 max-w-[200px] truncate" title={renewPaymentSlip.name}>
                              {renewPaymentSlip.name}
                            </span>
                            <span className="text-[8px] font-mono text-gray-400">({formatFileSize(renewPaymentSlip.size)})</span>
                            <button
                              type="button"
                              onClick={() => setRenewPaymentSlip(null)}
                              className="absolute top-2 left-2 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                              title="حذف الملف"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload size={20} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                            <span className="text-[10px] font-black text-slate-700">اسحب وأسقط الإيصال هنا</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">أو انقر لتصفح ملفات جهازك</span>
                            <input 
                              type="file" 
                              required 
                              accept="image/*,application/pdf" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={handleRenewFileChange} 
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Error Alerts */}
                    {renewError && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="p-4 bg-red-50/60 border border-red-100 rounded-xl flex items-center gap-3 text-red-650 text-xs font-black shadow-sm"
                      >
                        <AlertCircle size={16} className="shrink-0 text-red-600" />
                        <span>{renewError}</span>
                      </motion.div>
                    )}

                    {/* Submit & Cancel Actions */}
                    <div className="flex gap-3 pt-2">
                      <button 
                        type="button" 
                        disabled={isRenewSubmitting}
                        onClick={() => {
                          setIsRenewOpen(false);
                          setRenewError(null);
                        }} 
                        className="h-13 px-5 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-xs text-slate-500 transition-all uppercase"
                      >
                        تراجع
                      </button>
                      <button 
                        type="submit"
                        disabled={isRenewSubmitting}
                        className="flex-1 h-13 bg-orange-600 text-white rounded-xl font-black text-xs shadow-md shadow-orange-650/10 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        {isRenewSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'تسجيل وإرسال طلب التجديد'}
                      </button>
                    </div>

                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
