import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { motion } from 'motion/react';
import { 
  Bus, RefreshCw, Megaphone, ClipboardList, ArrowLeft, Loader2, Users 
} from 'lucide-react';
import { Button, Alert } from '../../shared/components';
import { useAdminDashboard } from '../hooks';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, isLoading, error, refresh } = useAdminDashboard();

  const statConfig = [
    { 
      label: 'المستخدمين الإجمالي', 
      value: stats.totalCustomersCount, 
      subText: 'عملاء ومسافرين مسجلين في تطبيق درب',
      icon: Users, 
      badge: 'إجمالي العملاء',
      badgeColor: 'bg-emerald-50 text-emerald-700',
      color: '',
      iconBg: 'bg-emerald-50 text-emerald-600',
      action: () => navigate('/admin/companies') // Redirects to management
    },
    { 
      label: 'طلبات الانضمام والتسجيل', 
      value: stats.newRegistrationsCount, 
      subText: 'شركات برية جديدة بانتظار الاعتماد والمراجعة',
      icon: ClipboardList, 
      badge: stats.newRegistrationsCount > 0 ? `${stats.newRegistrationsCount} معلق` : 'مكتمل ومعين',
      badgeColor: stats.newRegistrationsCount > 0 ? 'bg-orange-50 text-orange-700 animate-pulse' : 'bg-gray-100 text-gray-500',
      color: '',
      iconBg: 'bg-orange-50 text-orange-600',
      action: () => navigate('/admin/pending-companies')
    },
    { 
      label: 'طلبات تجديد الاشتراكات', 
      value: stats.renewalRequestsCount, 
      subText: 'بانتظار مراجعة الدفعات والحوالات المرسلة',
      icon: RefreshCw, 
      badge: stats.renewalRequestsCount > 0 ? `${stats.renewalRequestsCount} طلب جديد` : 'مكتمل كلياً',
      badgeColor: stats.renewalRequestsCount > 0 ? 'bg-blue-50 text-blue-700 animate-pulse' : 'bg-gray-100 text-gray-500',
      color: '',
      iconBg: 'bg-blue-50 text-blue-600',
      action: () => navigate('/admin/pending-subscriptions')
    },
    { 
      label: 'الإعلانات الترويجية النشطة', 
      value: stats.activeAdsCount, 
      subText: 'حملات إعلانية معروضة ومفعلة حالياً في الهاتف',
      icon: Megaphone, 
      badge: stats.activeAdsCount > 0 ? 'لافتات نشطة' : 'لا إعلانات نشطة',
      badgeColor: stats.activeAdsCount > 0 ? 'bg-pink-50 text-pink-700' : 'bg-gray-100 text-gray-500',
      color: '',
      iconBg: 'bg-pink-50 text-pink-600',
      action: () => navigate('/admin/advertisements')
    },
  ];

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl space-y-12 animate-fade-in" dir="rtl">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150">
           <div className="space-y-1">
             <h1 className="text-3xl font-black text-gray-900 leading-tight">مركز النظرة الشاملة</h1>
             <p className="text-sm font-semibold text-gray-400">مؤشرات الأداء الفورية المسترجعة من الخادم المركزي لمشرف تطبيق درب</p>
           </div>
           <div className="flex items-center gap-3 shrink-0">
             {isLoading && <Loader2 className="animate-spin text-orange-600" size={20} />}
             <button
               onClick={refresh}
               disabled={isLoading}
               className="p-3 bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-200 text-gray-500 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-100 transition-all font-bold text-xs gap-1.5 cursor-pointer disabled:opacity-50"
             >
               <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
               تحديث الإحصائيات الحية
             </button>
           </div>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        {/* Polished Statistics Cards Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statConfig.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={stat.action}
              className="p-6 bg-white rounded-[2rem] shadow-sm group transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[190px]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${stat.iconBg} group-hover:scale-110 duration-300`}>
                  <stat.icon size={22} />
                </div>
                <span className={`inline-flex px-2.5 py-1 text-[9px] font-black rounded-full ${stat.badgeColor}`}>
                  {stat.badge}
                </span>
              </div>

              <div className="space-y-1.5 pb-2">
                <p className="text-[10px] font-black text-gray-400 tracking-wide uppercase">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-gray-900 tabular-nums leading-none tracking-tight">
                    {stat.value}
                  </h3>
                </div>
                <p className="text-[11px] font-semibold text-gray-400">
                  {stat.subText}
                </p>
              </div>

              <div className="absolute left-4 bottom-4 text-gray-300 group-hover:text-orange-600 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-0.5 text-[10px] font-black">
                بوابة الإدارة <ArrowLeft size={10} className="mr-0.5" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Short Dashboard Info Banner */}
        <div className="bg-orange-50/25 border border-orange-100/50 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-right">
            <p className="text-xs font-black text-orange-700 flex items-center justify-center sm:justify-start gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              أحدث التنبيهات والطلبات المعلقة
            </p>
            <p className="text-[11px] font-semibold text-gray-500 mt-1">
              يوجد حالياً {stats.newRegistrationsCount} طلبات تسجيل برية جديدة وَ {stats.renewalRequestsCount} طلبات تجديد اشتراك بانتظار إجراء المشرف.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => navigate('/admin/pending-companies')}
              variant="primary" 
              className="rounded-2xl h-11 text-xs font-black px-4 flex-1 sm:flex-none"
            >
              مراجعة طلبات التسجيل
            </Button>
            <Button 
              onClick={() => navigate('/admin/pending-subscriptions')}
              variant="secondary" 
              className="rounded-2xl h-11 text-xs font-black px-4 bg-white hover:bg-orange-50/10 border-gray-200 flex-1 sm:flex-none"
            >
              مراجعة طلبات السداد
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
