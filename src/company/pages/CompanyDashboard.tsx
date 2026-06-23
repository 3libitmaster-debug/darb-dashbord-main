import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyLayout from '../components/CompanyLayout';
import { motion } from 'motion/react';
import { 
  Bus, Ticket, ChevronLeft, Loader2, RefreshCw, 
  ShieldAlert, Compass, MapPin, BarChart3 
} from 'lucide-react';
import { useCompanyDashboard } from '../hooks/useCompanyDashboard';
import { useCancellations } from '../hooks/useCancellations';
import { usePendingBookings } from '../hooks/usePendingBookings';
import { useBuses } from '../hooks/useBuses';
import { useStations } from '../hooks/useStations';
import { Button } from '../../shared/components/FormElements';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { trips, stats, isLoading: isDashboardLoading, error, refresh } = useCompanyDashboard();

  // Load complementary statistics from specialized hooks
  const { cancellations, fetchCancellations, isLoading: isCancellationsLoading } = useCancellations();
  const { pendingBookings, fetchPendingBookings, isLoading: isPendingLoading } = usePendingBookings();
  const { buses, fetchBuses } = useBuses();
  const { stations, fetchStations } = useStations();

  const isBusesLoading = buses.status === 'loading';
  const isStationsLoading = stations.status === 'loading';

  // Fetch all complementary statistics on mount
  useEffect(() => {
    fetchCancellations();
    fetchPendingBookings();
    fetchBuses();
    fetchStations();
  }, [fetchCancellations, fetchPendingBookings, fetchBuses, fetchStations]);

  // Combined refresh handler
  const handleRefreshAll = useCallback(async () => {
    await Promise.all([
      refresh(),
      fetchCancellations(),
      fetchPendingBookings(),
      fetchBuses(),
      fetchStations()
    ]);
  }, [refresh, fetchCancellations, fetchPendingBookings, fetchBuses, fetchStations]);

  // Unified loading and stats setup
  const isAnyLoading = isDashboardLoading || isCancellationsLoading || isPendingLoading || isBusesLoading || isStationsLoading;

  const statConfig = [
    { 
      label: 'الرحلات المجدولة', 
      value: stats?.upcomingTrips ?? trips.length, 
      icon: Compass, 
      path: '/company/trips',
      bgColor: 'bg-blue-50/80 hover:bg-blue-100/40 text-blue-600',
      badge: 'المركبة',
      isLoading: isDashboardLoading
    },
    { 
      label: 'الحجوزات المعلقة', 
      value: pendingBookings.length, 
      icon: Ticket, 
      path: '/company/pending-bookings',
      bgColor: 'bg-amber-50/80 hover:bg-amber-100/40 text-amber-600',
      badge: pendingBookings.length > 0 ? 'معلق' : 'مكتمل',
      isLoading: isPendingLoading
    },
    { 
      label: 'طلبات إلغاء الحجز', 
      value: cancellations.length, 
      icon: ShieldAlert, 
      path: '/company/cancellations',
      bgColor: cancellations.length > 0 
        ? 'bg-red-50 text-red-600 animate-pulse' 
        : 'bg-gray-50/80 text-gray-500',
      badge: cancellations.length > 0 ? 'مستعجل' : 'مستقر',
      isLoading: isCancellationsLoading
    },
    { 
      label: 'أسطول الحافلات', 
      value: buses.data?.length ?? 0, 
      icon: Bus, 
      path: '/company/buses',
      bgColor: 'bg-purple-50/80 hover:bg-purple-100/40 text-purple-600',
      badge: 'عربات',
      isLoading: isBusesLoading
    },
    { 
      label: 'المحطات المتاحة', 
      value: stations.data?.length ?? 0, 
      icon: MapPin, 
      path: '/company/stations',
      bgColor: 'bg-sky-50/80 hover:bg-sky-100/40 text-sky-600',
      badge: 'مواقع',
      isLoading: isStationsLoading
    }
  ];

  return (
    <CompanyLayout>
      <div className="space-y-12 max-w-7xl mx-auto w-full p-6" dir="rtl">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-gray-100">
           <div className="space-y-1">
             <h3 className="text-3xl font-black text-gray-900 leading-none tracking-tight flex items-center gap-2">
               لوحة العمليات والشركاء
               <span className="p-1 px-2.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black border border-orange-100/50">درب ذكي</span>
             </h3>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
               المؤشرات والبيانات التشغيلية الفورية للحافلات، والمحطات، والحجوزات الإلكترونية
             </p>
           </div>
           
           <div className="flex items-center gap-3">
             <button
               onClick={handleRefreshAll}
               title="مزامنة وتحديث البيانات"
               disabled={isAnyLoading}
               className="p-3 bg-white hover:bg-slate-50 text-gray-500 rounded-xl border border-gray-150 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
             >
               <RefreshCw className={`h-4 w-4 ${isAnyLoading ? 'animate-spin text-orange-600' : ''}`} />
             </button>
           </div>
        </div>

        {error ? (
          <div className="text-center py-24 bg-red-50 border border-red-100 rounded-3xl">
            <p className="text-red-500 font-bold mb-6 uppercase tracking-widest">{error}</p>
            <Button onClick={handleRefreshAll} icon={<RefreshCw size={16} />} className="mx-auto px-10 h-14">إعادة محاولة الاتصال</Button>
          </div>
        ) : (
          <>
            {/* NEW STATISTICS SECTION BENTO GRID - 5 COLUMN RESPONSIVE */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gray-800 font-extrabold text-sm border-r-4 border-orange-500 pr-3.5">
                <BarChart3 size={18} className="text-orange-650" />
                <span>إحصائيات الأداء والمؤشرات العامة لشركتكم</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
                {statConfig.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    onClick={() => navigate(stat.path)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="cursor-pointer p-6 bg-white rounded-[2.25rem] shadow-sm hover:shadow-md transition-all active:scale-[0.98] duration-200 group relative flex flex-col justify-between min-h-[170px]"
                  >
                    {/* Badge and Icon */}
                    <div className="flex items-center justify-between gap-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                        stat.label === 'طلبات إلغاء الحجز' && stat.value > 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {stat.badge}
                      </span>
                      <div className={`p-2.5 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${stat.bgColor}`}>
                        {stat.isLoading ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <stat.icon size={16} />
                        )}
                      </div>
                    </div>

                    {/* Meta Value & Text */}
                    <div className="mt-4">
                      <p className="text-[10px] font-extrabold text-gray-400 mb-1 leading-none">{stat.label}</p>
                      <h3 className="text-3xl font-black text-gray-900 tabular-nums tracking-tight leading-none min-h-[32px] flex items-end">
                        {stat.isLoading ? (
                          <span className="h-6 w-12 bg-slate-100 animate-pulse rounded-md inline-block" />
                        ) : (
                          stat.value
                        )}
                      </h3>
                    </div>

                    {/* Touch Prompt Chevron */}
                    <div className="absolute left-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ChevronLeft size={14} className="text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </CompanyLayout>
  );
}
