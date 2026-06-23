import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, Mail, Lock, Building2, MapPin, Upload, CreditCard, 
  ChevronLeft, Loader2, AlertCircle, CheckCircle2, Trash2, 
  Landmark, ShieldAlert, Award, Sparkles, Check
} from 'lucide-react';
import { AuthService } from '../api/services/auth.service';

type Step = 'EMAIL' | 'OTP' | 'DETAILS' | 'PASSWORD' | 'SUCCESS';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('EMAIL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [planType, setPlanType] = useState(0);

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
            setPlanType(response.data.data[0].id);
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
  
  // Files
  const [logo, setLogo] = useState<File | null>(null);
  const [license, setLicense] = useState<File | null>(null);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);

  // Previews
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Drag and drop states
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingLicense, setIsDraggingLicense] = useState(false);
  const [isDraggingPayment, setIsDraggingPayment] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthService.sendOtp(email);
      if (res.data.success) {
        setStep('OTP');
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل إرسال رمز التحقق. يرجى مراجعة بريدك الإلكتروني والتحقق من صحته.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthService.verifyOtp(email, otpCode);
      if (res.data.success) {
        setStep('DETAILS');
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم الشركة التجاري');
      return;
    }
    if (!address.trim()) {
      setError('يرجى تحديد عنوان المقر بدقة');
      return;
    }
    if (!logo || !license || !paymentSlip) {
      setError('يرجى إرفاق جميع الملفات التفعيلية المطلوبة (شعار الشركة، وثيقة السجل التجاري، وسند الاشتراك)');
      return;
    }
    setError(null);
    setStep('PASSWORD');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة، يرجى إعادة الكتابة بدقة');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون مكونة من 6 خانات أو أكثر لحماية حسابك');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthService.registerCompany({
        email,
        password,
        name,
        address,
        logo: logo!,
        license: license!,
        planType,
        paymentSlip: paymentSlip!
      });
      if (res.data.success) {
        setStep('SUCCESS');
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'عذراً، حدث خطأ أثناء إتمام عملية طلب التسجيل.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'license' | 'payment') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'logo') {
        setLogo(file);
        setLogoPreview(URL.createObjectURL(file));
      } else if (type === 'license') {
        setLicense(file);
      } else if (type === 'payment') {
        setPaymentSlip(file);
      }
    }
  };

  const removeFile = (type: 'logo' | 'license' | 'payment') => {
    if (type === 'logo') {
      setLogo(null);
      setLogoPreview(null);
    } else if (type === 'license') {
      setLicense(null);
    } else if (type === 'payment') {
      setPaymentSlip(null);
    }
  };

  // Drag over handler
  const handleDragOver = (e: React.DragEvent, type: 'logo' | 'license' | 'payment') => {
    e.preventDefault();
    if (type === 'logo') setIsDraggingLogo(true);
    if (type === 'license') setIsDraggingLicense(true);
    if (type === 'payment') setIsDraggingPayment(true);
  };

  // Drag leave handler
  const handleDragLeave = (type: 'logo' | 'license' | 'payment') => {
    if (type === 'logo') setIsDraggingLogo(false);
    if (type === 'license') setIsDraggingLicense(false);
    if (type === 'payment') setIsDraggingPayment(false);
  };

  // File drop handler
  const handleDrop = (e: React.DragEvent, type: 'logo' | 'license' | 'payment') => {
    e.preventDefault();
    if (type === 'logo') setIsDraggingLogo(false);
    if (type === 'license') setIsDraggingLicense(false);
    if (type === 'payment') setIsDraggingPayment(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (type === 'logo') {
        setLogo(file);
        setLogoPreview(URL.createObjectURL(file));
      } else if (type === 'license') {
        setLicense(file);
      } else if (type === 'payment') {
        setPaymentSlip(file);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center p-4 md:p-8 font-sans rtl tabular-nums selection:bg-orange-100 selection:text-orange-950" dir="rtl">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_24px_70px_rgba(0,0,0,0.03)] border border-gray-100/80 overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        
        {/* Navigation Sidebar (Desktop only) */}
        <div className="w-full md:w-[340px] bg-gradient-to-b from-slate-900 to-slate-950 p-10 text-white flex flex-col justify-between hidden md:flex relative overflow-hidden">
          {/* Subtle Background Ambient Dots */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

          <div className="space-y-12 relative z-10">
            {/* Header / Logo */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20 active:scale-95 transition-all">
                <Bus size={26} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white leading-none">درب</span>
                <span className="text-[9px] font-bold text-gray-500 tracking-widest mt-1 uppercase">منصة النقل الذكي</span>
              </div>
            </div>

            {/* Stepper Progress Block */}
            <div className="space-y-6">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">مراحل التسجيل الذكي</span>
              <div className="space-y-5">
                {[
                  { id: 'EMAIL', label: 'البريد والاتصال', desc: 'تأكيد امتلاك البريد للتواصل' },
                  { id: 'OTP', label: 'تأكيد الرمز المستلم', desc: 'التحقق من الهوية الرقمية' },
                  { id: 'DETAILS', label: 'بيانات وتوثيق الشركة', desc: 'تحميل التراخيص والهوية' },
                  { id: 'PASSWORD', label: 'أمان وتأمين الحساب', desc: 'تعيين كلمة المرور للمشرف' },
                  { id: 'SUCCESS', label: 'تفعيل الطلب ومراجعته', desc: 'ساعات التفعيل والمطابقة' }
                ].map((s, idx) => {
                  const stepOrder = ['EMAIL', 'OTP', 'DETAILS', 'PASSWORD', 'SUCCESS'];
                  const currentIdx = stepOrder.indexOf(step);
                  const isCompleted = idx < currentIdx;
                  const isActive = idx === currentIdx;

                  return (
                    <div key={s.id} className="flex items-start gap-4 transition-colors duration-300">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 border shrink-0 ${
                        isCompleted 
                          ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/10 scale-100' 
                          : isActive 
                            ? 'bg-white text-slate-950 border-white ring-4 ring-white/10 scale-105 shadow-lg' 
                            : 'border-slate-800 text-slate-500 bg-slate-900/30'
                      }`}>
                        {isCompleted ? <Check size={14} className="stroke-[3]" /> : idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-black tracking-normal transition-all duration-300 ${
                          isActive 
                            ? 'text-white font-extrabold' 
                            : isCompleted 
                              ? 'text-slate-300' 
                              : 'text-slate-500'
                        }`}>
                          {s.label}
                        </span>
                        <span className={`text-[10px] mt-0.5 transition-all duration-300 ${
                          isActive 
                            ? 'text-orange-400 font-medium' 
                            : 'text-slate-600'
                        }`}>
                          {s.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Footer of Sidebar */}
          <div className="space-y-4 pt-8 border-t border-slate-900 relative z-10">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 tracking-widest">
              <span>نسبة الإكتمال</span>
              <span className="text-orange-500">{Math.round((['EMAIL', 'OTP', 'DETAILS', 'PASSWORD', 'SUCCESS'].indexOf(step) + 1) / 5 * 100)}%</span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden flex gap-0.5 p-0.5">
              <div 
                className="bg-orange-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.round((['EMAIL', 'OTP', 'DETAILS', 'PASSWORD', 'SUCCESS'].indexOf(step) + 1) / 5 * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600 font-bold leading-normal">
              لأي استفسار بخصوص التوثيق تواصل مع الدعم الفني المباشر لـ درب.
            </p>
          </div>
        </div>

        {/* Content Section (Form) */}
        <div className="flex-1 p-6 md:p-12 lg:p-14 bg-white flex flex-col justify-between">
          
          {/* Mobile Progress Indicator */}
          <div className="md:hidden flex flex-col gap-3 pb-6 mb-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-600/10">
                  <Bus size={18} />
                </div>
                <span className="text-lg font-black tracking-tight text-slate-950">درب</span>
              </div>
              <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                {step === 'EMAIL' && '1/5: بريد الشركة'}
                {step === 'OTP' && '2/5: الرمز المستلم'}
                {step === 'DETAILS' && '3/5: بيانات وهوية الشركة'}
                {step === 'PASSWORD' && '4/5: كلمة المرور'}
                {step === 'SUCCESS' && '5/5: مكتمل ومؤكد'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="bg-orange-600 h-full transition-all duration-500" 
                style={{ width: `${Math.round((['EMAIL', 'OTP', 'DETAILS', 'PASSWORD', 'SUCCESS'].indexOf(step) + 1) / 5 * 100)}%` }}
              />
            </div>
          </div>

          <div className="my-auto">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: EMAIL */}
              {step === 'EMAIL' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full inline-block">تأسيس حساب شريك</span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-none mt-2">تسجيل شركة نقل جديدة</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 leading-relaxed">يرجى إدخال البريد الإلكتروني الرسمي لشركتكم لنتمكن من إرسال رمز الأمان والتواصل.</p>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">البريد الإلكتروني للشركة</label>
                      <div className="relative group">
                        <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-600 transition-colors" size={20} />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-16 bg-gray-50/50 border border-gray-200/80 rounded-2xl pr-14 pl-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all outline-none"
                          placeholder="example@company.com"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="p-5 bg-red-50/60 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-black shadow-sm"
                      >
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-15 bg-orange-600 text-white rounded-2xl font-black text-sm uppercase shadow-lg shadow-orange-650/10 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>إرسال الرمز للبريد الإلكتروني <ChevronLeft size={20} /></>}
                    </button>
                  </form>

                  <p className="text-center text-xs font-bold text-slate-400">
                    هل شركتك مسجلة وتملك حساباً؟ <Link to="/login" className="text-orange-600 hover:underline hover:text-orange-700 font-black">أدخل من هنا</Link>
                  </p>
                </motion.div>
              )}

              {/* STEP 2: OTP */}
              {step === 'OTP' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full inline-block">التحقق الهيكلي من الهوية</span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-none mt-2">تأكيد البريد والرمز</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 leading-relaxed">أدخل رمز الأمان المكون من 6 أرقام والذي تم إرساله للتّو إلى صندوق وارد البريد الإلكتروني.</p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 block text-center">أدخل الرمز هنا كأرقام متصلة</label>
                      <input 
                        type="text" 
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full h-18 bg-gray-50 border border-gray-200 rounded-2xl text-center text-3xl font-black text-slate-900 tracking-[0.3em] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all outline-none"
                        placeholder="••••••"
                      />
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="p-5 bg-red-50/60 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-black shadow-sm"
                      >
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        type="button"
                        onClick={() => setStep('EMAIL')}
                        className="h-15 px-6 border border-gray-200 hover:border-gray-300 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-gray-50 transition-all text-center"
                      >
                        تعديل البريد الإلكتروني
                      </button>
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-15 bg-orange-600 text-white rounded-2xl font-black text-sm uppercase shadow-lg shadow-orange-600/10 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>التحقق من الرمز والمتابعة <ChevronLeft size={20} /></>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 3: DETAILS */}
              {step === 'DETAILS' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full inline-block">الهوية الثبوتية للشركة</span>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight leading-none">معلومات الشركة وتوثيق الهوية</h1>
                    <p className="text-xs font-bold text-gray-400 leading-normal">يرجى تسجيل بيانات الإدارة القانونية وإرفاق مستندات الترخيص المطلوبة وإثبات سداد الاشتراك الفعلي.</p>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="p-4 bg-red-50/60 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-black shadow-sm"
                    >
                      <AlertCircle size={18} className="shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleGoToPassword} className="space-y-6 max-h-[50vh] overflow-y-auto pl-2 pr-1 custom-scrollbar">
                    
                    {/* Basic Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم الشركة التجاري</label>
                        <div className="relative group">
                          <Building2 className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-600 transition-colors" size={18} />
                          <input 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            required 
                            type="text" 
                            className="w-full h-14 bg-gray-50/50 border border-gray-200 rounded-xl pr-12 pl-6 text-xs font-bold text-slate-900 focus:bg-white focus:border-orange-500 transition-all outline-none" 
                            placeholder="مثال: شركة درب للنقل والمواصلات" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">عنوان المقر الإقليمي الرئيسي</label>
                        <div className="relative group">
                          <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-600 transition-colors" size={18} />
                          <input 
                            value={address} 
                            onChange={e => setAddress(e.target.value)} 
                            required 
                            type="text" 
                            className="w-full h-14 bg-gray-50/50 border border-gray-200 rounded-xl pr-12 pl-6 text-xs font-bold text-slate-900 focus:bg-white focus:border-orange-500 transition-all outline-none" 
                            placeholder="المحافظة، المدينة، الشارع الرئيسي" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subscription Pack selector */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-1.5 leading-none">
                        <Award size={14} className="text-orange-500" /> باقة الاشتراك المفضلة للحساب
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isLoadingPlans ? (
                          <div className="col-span-2 py-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold border border-gray-100 rounded-2xl bg-gray-50/10">
                            <Loader2 className="animate-spin text-orange-500" size={18} />
                            جاري تحميل باقات الاشتراك المعتمدة...
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
                                onClick={() => setPlanType(p.id)}
                                className={`p-5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 relative overflow-hidden group hover:shadow-md ${
                                  planType === p.id 
                                    ? 'border-orange-500 bg-orange-50/40 text-orange-950 ring-2 ring-orange-100' 
                                    : 'border-gray-100 text-slate-400 bg-gray-50/50 hover:border-gray-200'
                                }`}
                              >
                                {planType === p.id && (
                                  <div className="absolute top-3 left-3 h-5 w-5 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md">
                                    <Check size={12} className="stroke-[3]" />
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${planType === p.id ? 'bg-orange-150 text-orange-700 font-extrabold' : 'bg-gray-100 text-gray-500'}`}>
                                    {p.id === 1 ? 'الخيار السنوي الموفر' : 'تفعيل قياسي مرن'}
                                  </span>
                                  <h3 className="text-xs font-black text-slate-900 mt-1">{title}</h3>
                                </div>
                                <div className="flex justify-between items-end border-t border-dashed border-gray-100/80 pt-3">
                                  <div className="text-[10px] space-y-0.5 font-bold text-slate-500">
                                    <p className="flex items-center gap-1">✓ {p.id === 1 ? 'خطوط وحافلات غير محدودة' : 'لإدارة حافلات حتى 5 حافلات'}</p>
                                    <p className="flex items-center gap-1">✓ {p.id === 1 ? 'دعم فني فوري مخصص 24/7' : 'دعم فني قياسي متاح'}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className={`text-xl font-bold font-mono tracking-tight ${planType === p.id ? 'text-orange-600' : 'text-slate-800'}`}>
                                      {price || p.name}
                                    </span>
                                    <span className="text-[8px] block opacity-60">تفعيل فوري</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="col-span-2 py-6 text-center text-xs text-gray-400 font-bold border border-gray-150 rounded-2xl">
                            لا تتوفر باقات تجديد اشتراك حالياً بالخادم.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bank Transfer Instructions */}
                    <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                      <p className="font-extrabold flex items-center gap-1.5 text-amber-950">
                        <Landmark size={15} className="text-amber-600 shrink-0" /> تفاصيل تفعيل الاشتراك والدفع:
                      </p>
                      <p className="font-bold opacity-90 leading-relaxed text-[11px]">
                        لتفعيل حسابكم على درب، يرجى أولاً إيداع أو تحويل قيمة اشتراك الباقة المختارة إلى حسابنا في <span className="font-extrabold text-amber-950">بنك الكريمي الإسلامي</span> للخدمات المالية (حساب مالي معتمد برقم: <span className="font-mono text-xs bg-amber-100/60 px-1.5 py-0.5 rounded border border-amber-200 font-bold text-slate-900">12345678</span> باسم <span className="font-extrabold text-slate-950">منصة درب الذكية</span>)، ثم إرفاق صورة السند في نموذج حقل السداد أدناه.
                      </p>
                    </div>

                    {/* Highly interactive Drag and Drop file outputs */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">الوثائق الرسمية المطلوبة (اسحب وأسقط أو انقر للاختيار)</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* 1. LOGO UPLOAD COMPONENT */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">شعار وهوية الشركة</label>
                          <div 
                            onDragOver={(e) => handleDragOver(e, 'logo')}
                            onDragLeave={() => handleDragLeave('logo')}
                            onDrop={(e) => handleDrop(e, 'logo')}
                            className={`relative h-36 rounded-2xl bg-gray-50 border-2 border-dashed flex flex-col items-center justify-center gap-2 p-2 overflow-hidden group transition-all duration-300 ${
                              isDraggingLogo 
                                ? 'border-orange-500 bg-orange-50/50 scale-[1.02]' 
                                : logo 
                                  ? 'border-green-300 bg-green-50/10' 
                                  : 'border-slate-200 hover:border-orange-400 hover:bg-orange-50/5'
                            }`}
                          >
                            {logoPreview ? (
                              <div className="relative w-full h-full group/preview rounded-lg overflow-hidden flex items-center justify-center bg-gray-50/30">
                                <img src={logoPreview} className="max-w-full max-h-full object-contain" alt="Preview logo" />
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                  <button 
                                    type="button" 
                                    onClick={() => removeFile('logo')} 
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                                    title="حذف المرفق"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload size={24} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                                <span className="text-[10px] font-black text-slate-700">شعار رسمي</span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center">PNG / JPG (أقصى 2MB)</span>
                                <input 
                                  type="file" 
                                  required 
                                  accept="image/*" 
                                  className="absolute inset-0 opacity-0 cursor-pointer" 
                                  onChange={e => handleFileChange(e, 'logo')} 
                                />
                              </>
                            )}
                          </div>
                          {logo && !logoPreview && (
                            <div className="flex items-center justify-between text-[10px] bg-green-50/50 border border-green-100 p-2 rounded-xl text-green-700 font-bold">
                              <span className="truncate max-w-[120px]" title={logo.name}>{logo.name}</span>
                              <span className="font-mono text-[9px] text-green-600/80">({formatFileSize(logo.size)})</span>
                              <button type="button" onClick={() => removeFile('logo')} className="text-red-500 hover:text-red-700 md:mr-2">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                          {logo && logoPreview && (
                            <p className="text-[9px] font-bold text-green-600 text-center flex items-center justify-center gap-1">
                              <CheckCircle2 size={10} /> تم إرفاق الشعار ({formatFileSize(logo.size)})
                            </p>
                          )}
                        </div>

                        {/* 2. LICENSE COMMERCIAL SILL COMPONENT */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">السجل التجاري أو الترخيص</label>
                          <div 
                            onDragOver={(e) => handleDragOver(e, 'license')}
                            onDragLeave={() => handleDragLeave('license')}
                            onDrop={(e) => handleDrop(e, 'license')}
                            className={`relative h-36 rounded-2xl bg-gray-50 border-2 border-dashed flex flex-col items-center justify-center gap-2 p-2 overflow-hidden group transition-all duration-300 ${
                              isDraggingLicense 
                                ? 'border-orange-500 bg-orange-50/50 scale-[1.02]' 
                                : license 
                                  ? 'border-green-300 bg-green-50/10' 
                                  : 'border-slate-200 hover:border-orange-400 hover:bg-orange-50/5'
                            }`}
                          >
                            {license ? (
                              <div className="flex flex-col items-center justify-center text-center gap-2">
                                <CheckCircle2 size={30} className="text-green-500" />
                                <span className="text-[10px] font-black text-green-700">تراخيص الشركة وسجلها</span>
                                <span className="text-[8px] max-w-[120px] font-bold text-gray-400 truncate-wide block" title={license.name}>{license.name}</span>
                                <button 
                                  type="button" 
                                  onClick={() => removeFile('license')} 
                                  className="mt-1 px-3 py-1 bg-red-50 text-red-600 text-[8px] font-black rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                >
                                  استبدال الملف
                                </button>
                              </div>
                            ) : (
                              <>
                                <Upload size={24} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                                <span className="text-[10px] font-black text-slate-700">صورة وثيقة السجل</span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">بي دي إف / صور التراخيص</span>
                                <input 
                                  type="file" 
                                  required 
                                  accept="image/*,application/pdf" 
                                  className="absolute inset-0 opacity-0 cursor-pointer" 
                                  onChange={e => handleFileChange(e, 'license')} 
                                />
                              </>
                            )}
                          </div>
                          {license && (
                            <p className="text-[9px] font-bold text-green-600 text-center flex items-center justify-center gap-1">
                              <CheckCircle2 size={10} /> تم التوثيق ({formatFileSize(license.size)})
                            </p>
                          )}
                        </div>

                        {/* 3. PAYMENT SLIP UPLOAD COMPONENT */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">سند دفع الباقة والتحويل</label>
                          <div 
                            onDragOver={(e) => handleDragOver(e, 'payment')}
                            onDragLeave={() => handleDragLeave('payment')}
                            onDrop={(e) => handleDrop(e, 'payment')}
                            className={`relative h-36 rounded-2xl bg-gray-50 border-2 border-dashed flex flex-col items-center justify-center gap-2 p-2 overflow-hidden group transition-all duration-300 ${
                              isDraggingPayment 
                                ? 'border-orange-500 bg-orange-50/50 scale-[1.02]' 
                                : paymentSlip 
                                  ? 'border-green-300 bg-green-50/10' 
                                  : 'border-slate-200 hover:border-orange-400 hover:bg-orange-50/5'
                            }`}
                          >
                            {paymentSlip ? (
                              <div className="flex flex-col items-center justify-center text-center gap-2">
                                <CreditCard size={30} className="text-green-500" />
                                <span className="text-[10px] font-black text-green-700">تم إرفاق السند المصرفي</span>
                                <span className="text-[8px] max-w-[120px] font-bold text-gray-400 truncate-wide block" title={paymentSlip.name}>{paymentSlip.name}</span>
                                <button 
                                  type="button" 
                                  onClick={() => removeFile('payment')} 
                                  className="mt-1 px-3 py-1 bg-red-50 text-red-600 text-[8px] font-black rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                >
                                  استبدال الإثبات
                                </button>
                              </div>
                            ) : (
                              <>
                                <Upload size={24} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                                <span className="text-[10px] font-black text-slate-700">سند تحويل الكريمي</span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center">وصل الإرسال المباشر</span>
                                <input 
                                  type="file" 
                                  required 
                                  accept="image/*,application/pdf" 
                                  className="absolute inset-0 opacity-0 cursor-pointer" 
                                  onChange={e => handleFileChange(e, 'payment')} 
                                />
                              </>
                            )}
                          </div>
                          {paymentSlip && (
                            <p className="text-[9px] font-bold text-green-600 text-center flex items-center justify-center gap-1">
                              <CheckCircle2 size={10} /> تم الإرفاق بنجاح ({formatFileSize(paymentSlip.size)})
                            </p>
                          )}
                        </div>

                      </div>
                    </div>

                    <div className="flex gap-4 py-3 border-t border-gray-150">
                      <button 
                        type="button" 
                        onClick={() => setStep('OTP')} 
                        className="h-14 px-8 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-black text-xs text-slate-500 transition-all uppercase"
                      >
                        العودة للسابق
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 h-14 bg-orange-600 text-white rounded-xl font-black text-xs shadow-md shadow-orange-650/10 hover:bg-orange-700 active:scale-[0.98] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                      >
                        تأمين الحساب وحفظ المعطيات <ChevronLeft size={18} />
                      </button>
                    </div>

                  </form>
                </motion.div>
              )}

              {/* STEP 4: PASSWORD */}
              {step === 'PASSWORD' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full inline-block">حماية الإدارة</span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-none mt-2">تأمين لوحة الشركاء</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 leading-relaxed">يرجى تعيين كلمة مرور قوية للمشرف الخاص باللوحة للمحافظة على أمان وموثوقية حجوزات وعمليات الشركة.</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">كلمة المرور الجديدة المشفرة</label>
                        <div className="relative group">
                          <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-600 transition-colors" size={18} />
                          <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-15 bg-gray-50/50 border border-gray-200 rounded-xl pr-12 pl-6 text-xs font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                            placeholder="كلمة مرور مكونة من 6 أرقام/أحرف"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">تكرار كلمة المرور للتأكيد</label>
                        <div className="relative group">
                          <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-600 transition-colors" size={18} />
                          <input 
                            type="password" 
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-15 bg-gray-50/50 border border-gray-200 rounded-xl pr-12 pl-6 text-xs font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                            placeholder="أعد كتابة كلمة المرور مجدداً"
                          />
                        </div>
                      </div>

                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="p-5 bg-red-50/60 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-black shadow-sm"
                      >
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      <button 
                        type="button" 
                        onClick={() => setStep('DETAILS')} 
                        className="h-15 px-8 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-black text-xs text-slate-500 transition-all uppercase"
                      >
                        السابق
                      </button>
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-15 bg-orange-600 text-white rounded-xl font-black text-xs shadow-md shadow-orange-650/10 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>إرسال طلب التسجيل للمطابقة والتدقيق <ChevronLeft size={18} /></>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 5: SUCCESS */}
              {step === 'SUCCESS' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-8 py-8 md:py-12"
                >
                  <div className="relative inline-flex">
                    <div className="h-28 w-28 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-green-500 mx-auto animate-pulse relative z-10 border border-green-100">
                      <CheckCircle2 size={54} className="stroke-[1.5]" />
                    </div>
                    <div className="absolute inset-0 bg-green-400/20 blur-[20px] rounded-full scale-100 animate-ping opacity-30" />
                  </div>

                  <div className="space-y-3 max-w-lg mx-auto">
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-full inline-block">طلب الشراكة مكتمل</span>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight leading-none">مرحباً بك في درب!</h1>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed">
                      تم استلام وقيد طلب شركتكم بنجاح تام. يقوم مشرفو النظام وعلاقات العملاء في درب بمطابقة وثائق الترخيص وسند دفع باقتكم وتدقيق المعطيات حالياً.
                    </p>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-[11px] text-slate-500 space-y-1.5 mt-4 text-right">
                      <p className="font-extrabold text-slate-800 flex items-center gap-1.5"><Sparkles size={14} className="text-orange-500" /> ماذا سيحدث الآن؟</p>
                      <p className="leading-relaxed opacity-90"><span className="text-orange-600 font-extrabold">•</span> سيتم تفعيل وموافقة حسابكم خلال <span className="font-extrabold text-slate-800">12 إلى 24 ساعة عمل</span> كحد أقصى.</p>
                      <p className="leading-relaxed opacity-90"><span className="text-orange-600 font-extrabold">•</span> ستستلمون إشعار تأكيد التفعيل ومباشرة العمل عبر البريد الإلكتروني الموثق.</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate('/login')}
                    className="inline-flex px-14 py-4.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-md hover:bg-orange-600 active:scale-[0.98] transition-all"
                  >
                    الانتقال لشاشة الدخول الرئيسية
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Copyright signature matching login */}
          <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none pt-4 border-t border-gray-50">
            درب لخدمات قطاع النقل البري الذكي © {new Date().getFullYear()}
          </p>

        </div>
      </div>
    </div>
  );
}
