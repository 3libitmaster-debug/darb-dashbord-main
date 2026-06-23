import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, 
  LayoutDashboard, 
  Ticket, 
  LogOut, 
  MapPin,
  Banknote,
  Compass,
  DollarSign,
  Menu,
  X,
  ShieldAlert,
  Bell,
  Check,
  Inbox,
  Calendar,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock,
  QrCode
} from 'lucide-react';
import { useAuth } from '../../app/store/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../types/auth';
import { NotificationService } from '../../shared/api/services/notification.service';
import { AppNotification } from '../../types/models';

interface CompanyLayoutProps {
  children: ReactNode;
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Real-time notifications and panel states
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotiWindowOpen, setIsNotiWindowOpen] = useState(false);
  const [isNotiLoading, setIsNotiLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsNotiLoading(true);
    try {
      const res = await NotificationService.getNotifications();
      if (res.data && res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications from core API:', err);
    } finally {
      setIsNotiLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds for real-time vibe
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: number) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await NotificationService.markAsRead(id);
    } catch (err) {
      console.error(`Failed to mark notification #${id} as read:`, err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    // Optimistic state
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await Promise.all(unread.map(n => NotificationService.markAsRead(n.id).catch(e => console.error(e))));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { name: 'الرئيسية', icon: LayoutDashboard, path: '/company' },
    { name: 'الرحلات', icon: Compass, path: '/company/trips' },
    { name: 'الحجوزات المعلقة', icon: Ticket, path: '/company/pending-bookings' },
    { name: 'طلبات الإلغاء', icon: ShieldAlert, path: '/company/cancellations' },
    { name: 'الحافلات', icon: Bus, path: '/company/buses' },
    { name: 'الحسابات البنكية', icon: Banknote, path: '/company/bank-accounts' },
    { name: 'المحطات', icon: MapPin, path: '/company/stations' },
    { name: 'أسعار الرحلات', icon: DollarSign, path: '/company/trip-fares' },
    { name: 'مسح تذاكر الصعود', icon: QrCode, path: '/company/scan-ticket' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen h-screen bg-[#fcfcfc] font-sans rtl overflow-hidden" dir="rtl">
      
      {/* Mobile Top Header */}
      <header className="flex lg:hidden items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Bus size={18} />
          </div>
          <span className="text-xl font-extrabold text-gray-950 tracking-tight">درب - الشريك</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification Quick Bell on Mobile Header - opens special drawer window */}
          <button
            onClick={() => setIsNotiWindowOpen(true)}
            className="p-2 text-gray-550 hover:text-orange-650 hover:bg-gray-50 rounded-xl transition-all relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-[16px] bg-red-600 text-white rounded-full text-[8px] font-black flex items-center justify-center px-1 border border-white">
                {unreadNotificationsCount === 1 ? '1' : unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-655 hover:text-orange-650 hover:bg-gray-50 rounded-xl transition-all"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer (Slide down/over) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900 z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden shadow-2xl flex flex-col h-full"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                    <Bus size={18} />
                  </div>
                  <span className="text-lg font-bold text-gray-900">درب - الشريك</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = item.path && location.pathname === item.path;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-orange-50 text-orange-700 font-bold' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className={isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-900'} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-gray-400 font-bold text-xs border border-gray-200">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.email}</p>
                    <p className="text-[10px] text-gray-500 font-medium">شريك ناقل</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 bg-white text-gray-600 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={14} />
                  تسجيل الخروج
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop only) */}
      <aside className="w-80 h-full bg-white border-l border-gray-200 flex flex-col hidden lg:flex shadow-sm shrink-0">
        <div className="p-10 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Bus size={20} />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">درب - الشريك</span>
        </div>

        <nav className="flex-1 px-6 space-y-1.5 mt-6 overflow-y-auto min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menuItems.map((item) => {
            const isActive = item.path && location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-orange-50 text-orange-700' 
                    : 'text-gray-550 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon size={18} className={isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-900'} />
                  <span className={`text-sm font-semibold ${isActive ? 'text-orange-700' : ''}`}>{item.name}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100 mt-auto bg-white shrink-0">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-gray-400 font-bold text-xs border border-gray-200 shadow-sm">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">شريك ناقل</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-3 bg-white text-gray-600 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Desktop Top Bar Custom Header */}
        <header className="hidden lg:flex items-center justify-between px-12 py-5 bg-white border-b border-gray-100 shrink-0 z-10 shadow-3xs">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">لوحة شركة النقل</span>
            <h2 className="text-sm font-black text-gray-900 mt-1">تتبع الحجوزات والرحلات المباشرة</h2>
          </div>

          <div className="flex items-center gap-5">
            {/* Prominent Notification Bell counter with subtle hover glow */}
            <button
              onClick={() => setIsNotiWindowOpen(true)}
              className="p-3 bg-orange-600/5 hover:bg-orange-600/10 text-orange-655 rounded-xl transition-all relative cursor-pointer border border-orange-100/40 group shadow-3xs"
              title="مركز الإشعارات الفورية"
            >
              <Bell size={18} className="group-hover:scale-110 duration-200" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 h-5 min-w-[20px] bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5 border-2 border-white shadow-xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 xl:p-16">
           <motion.div
             initial={{ opacity: 0, y: 5 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
           >
             {children}
           </motion.div>
         </div>
      </main>

      {/* Side-Drawer Modal for Notifications (نافذة خاصة) */}
      <AnimatePresence>
        {isNotiWindowOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotiWindowOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50"
            />

            {/* Slide-over Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
              dir="rtl"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100/80 flex items-center justify-between shrink-0 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-600/10 text-orange-650 rounded-xl flex items-center justify-center border border-orange-100/30">
                    <Bell size={20} className="text-orange-655" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">مركز الإشعارات والتنبيهات</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                      لديك {unreadNotificationsCount} رسائل غير مقروءة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="px-2.5 py-1.5 hover:bg-orange-50 text-orange-700 rounded-lg text-[10px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                      title="تحديد الكل كمقروء"
                    >
                      <Check size={14} />
                      تحديد الكل كمقروء
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotiWindowOpen(false)}
                    className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-lg transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Notification Body Content / Scroll Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5 min-h-0 [scrollbar-width:thin] focus:outline-none">
                {isNotiLoading ? (
                  <div className="space-y-3.5 py-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-2xl animate-pulse flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-200/70 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2 mt-1">
                          <div className="h-3 bg-gray-200/70 rounded w-1/3" />
                          <div className="h-2.5 bg-gray-200/70 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <AnimatePresence initial={false}>
                    {notifications.map((noti) => {
                      // Icon logic
                      let iconBg = "bg-orange-50 text-orange-650 border-orange-100/50";
                      let typeIcon = <Bell size={18} />;

                      if (noti.notificationType === 1) {
                        iconBg = "bg-red-50 text-red-650 border-red-100";
                        typeIcon = <ShieldAlert size={18} />;
                      } else if (noti.notificationType === 2) {
                        iconBg = "bg-emerald-50 text-emerald-650 border-emerald-100";
                        typeIcon = <CheckCircle2 size={18} />;
                      }

                      return (
                        <motion.div
                          key={noti.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-4 rounded-xl border transition-all relative overflow-hidden group ${
                            noti.isRead 
                              ? 'border-gray-100 bg-white hover:bg-slate-50/55' 
                              : 'border-orange-100 bg-orange-50/5 shadow-3xs'
                          }`}
                        >
                          {!noti.isRead && (
                            <div className="absolute top-0 bottom-0 right-0 w-1 bg-orange-600 rounded-r-full" />
                          )}

                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-lg border flex items-center justify-center shrink-0 ${iconBg}`}>
                              {typeIcon}
                            </div>
                            
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className={`text-xs font-black leading-snug ${noti.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                  {noti.title}
                                </h4>
                                {!noti.isRead && (
                                  <span className="bg-orange-600 text-white rounded-full px-1.5 py-0.5 text-[8px] font-black leading-none">
                                    جديد
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-gray-500 leading-relaxed whitespace-pre-wrap">
                                {noti.body}
                              </p>

                              <div className="flex items-center gap-2 pt-1.5 text-[9px] text-gray-400 font-bold">
                                <Clock size={10} />
                                <span>
                                  {noti.createdAt ? new Date(noti.createdAt).toLocaleString('ar-YE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'غير معروف'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Hover action bar */}
                          <div className="mt-3 flex items-center justify-end gap-1.5 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {!noti.isRead && (
                              <button
                                onClick={() => markAsRead(noti.id)}
                                className="px-2.5 py-1.5 text-[10px] font-black text-orange-655 hover:bg-orange-50 rounded-lg flex items-center gap-1 cursor-pointer border border-transparent"
                              >
                                <Check size={12} className="text-orange-600" />
                                تمييز كمقروء
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(noti.id)}
                              className="px-2.5 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={12} className="text-red-500" />
                              حذف الإشعار
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 border border-gray-100">
                      <Inbox size={32} />
                    </div>
                    <h4 className="text-xs font-black text-gray-800">صندوق الإشعارات فارغ</h4>
                    <p className="text-[11px] text-gray-400 font-medium max-w-[200px] mt-1 leading-relaxed">
                      لا يوجد لديك تنبيهات أو إشعارات جديدة في الوقت الحالي. سنقوم بإبلاغك حال ورودها!
                    </p>
                  </div>
                )}
              </div>

              {/* Footer action */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between text-xs font-bold text-gray-500">
                <button
                  onClick={fetchNotifications}
                  className="flex items-center gap-1.5 text-orange-655 hover:text-orange-700 bg-none border-none cursor-pointer"
                >
                  <RefreshCw size={12} className={isNotiLoading ? 'animate-spin text-orange-600' : 'text-gray-400'} />
                  تحديث فوري
                </button>
                <span>إجمالي الرسائل: {notifications.length}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
