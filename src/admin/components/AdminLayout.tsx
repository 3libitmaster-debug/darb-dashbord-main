import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Wrench,
  ClipboardList,
  RefreshCw,
  Megaphone,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../app/store/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../types/auth';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { name: 'الرئيسية', icon: LayoutDashboard, path: '/admin' },
    { name: 'الشركات', icon: Bus, path: '/admin/companies' },
    { name: 'طلبات التسجيل', icon: ClipboardList, path: '/admin/pending-companies' },
    { name: 'تجديد الاشتراكات', icon: RefreshCw, path: '/admin/pending-subscriptions' },
    { name: 'الإعلانات الترويجية', icon: Megaphone, path: '/admin/advertisements' },
    { name: 'العملاء', icon: Users, path: '/admin/customers' },
    { name: 'الشكاوى والمقترحات', icon: MessageSquare, path: '/admin/complaints' },
    { name: 'الصيانة', icon: Wrench, path: '/admin/maintenance' },
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
          <span className="text-xl font-extrabold text-gray-950 tracking-tight">درب - الإدارة</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-orange-650 hover:bg-gray-50 rounded-xl transition-all"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
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
                  <span className="text-lg font-bold text-gray-900">درب - الإدارة</span>
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-orange-50 text-orange-700 font-bold' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon size={18} className={isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-900'} />
                      <span className="text-sm">{item.name}</span>
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
                    <p className="text-[10px] text-gray-500 font-medium">المدير العام</p>
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
          <span className="text-2xl font-bold text-gray-900 tracking-tight">درب - الإدارة</span>
        </div>

        <nav className="flex-1 px-6 space-y-1.5 mt-6 overflow-y-auto min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menuItems.map((item) => {
            const isActive = item.path && location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-orange-50 text-orange-700' 
                    : 'text-gray-550 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-900'} />
                <span className={`text-sm font-semibold ${isActive ? 'text-orange-700' : ''}`}>{item.name}</span>
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
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">المدير العام</p>
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
    </div>
  );
}
