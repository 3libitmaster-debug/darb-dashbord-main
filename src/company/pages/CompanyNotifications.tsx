import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, CheckCircle2, AlertCircle, Clock, Check,
  MailOpen, RefreshCw, Layers, Inbox, Calendar, Search, ShieldAlert
} from 'lucide-react';
import CompanyLayout from '../components/CompanyLayout';
import { NotificationService } from '../../shared/api/services/notification.service';
import { AppNotification } from '../../types/models';

export default function CompanyNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const res = await NotificationService.getNotifications();
      if (res.data && res.data.success) {
        setNotifications(res.data.data || []);
      } else {
        setGlobalError(res.data?.message || 'فشل استرجاع الإشعارات من الخادم');
      }
    } catch (err: any) {
      console.error(err);
      setGlobalError('فشل الاتصال بالخادم لجلب قائمة الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  // Bind actions to API endpoints and optimistic local state updates
  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    // Optimistic update of local UI state
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await Promise.all(unread.map(n => NotificationService.markAsRead(n.id).catch(e => console.error('Error marking read for', n.id, e))));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const markAsRead = async (id: number) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await NotificationService.markAsRead(id);
    } catch (err) {
      console.error(`Failed to mark notification active read state for ID: ${id}`, err);
    }
  };

  const filteredNotifications = notifications.filter(item => {
    // 1. Read/Unread Filter
    if (filter === 'unread' && item.isRead) return false;
    if (filter === 'read' && !item.isRead) return false;

    // 2. Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const titleMatch = item.title?.toLowerCase().includes(term) || false;
      const bodyMatch = item.body?.toLowerCase().includes(term) || false;
      return titleMatch || bodyMatch;
    }

    return true;
  });

  const getNotificationIcon = (type?: number) => {
    switch (type) {
      case 1: // System Alert / System message
        return (
          <div className="p-3 bg-red-50 text-red-650 rounded-2xl border border-red-100">
            <ShieldAlert size={20} />
          </div>
        );
      case 2: // Succeess
        return (
          <div className="p-3 bg-emerald-50 text-emerald-650 rounded-2xl border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
        );
      default:
        return (
          <div className="p-3 bg-orange-50 text-orange-650 rounded-2xl border border-orange-100">
            <Bell size={20} />
          </div>
        );
    }
  };

  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <CompanyLayout>
      <div className="max-w-5xl mx-auto w-full rtl animate-fade-in" dir="rtl">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <span className="p-2.5 bg-orange-550/10 text-orange-650 rounded-2xl inline-flex">
                <Bell size={24} />
              </span>
              مركز الإشعارات والتنبيهات
            </h1>
            <p className="text-xs font-bold text-gray-400 mt-1.5">
              متابعة الإشعارات الفورية لنظام درب لمواكبة تحديثات وبلاغت الرحلات والحجوزات
            </p>
          </div>

          <div className="flex gap-2.5 self-start md:self-center">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-orange-100"
              >
                <Check size={14} />
                تحديد الكل كمقروء
              </button>
            )}
            
            <button
              onClick={fetchNotifications}
              className="px-4 py-3 bg-white hover:bg-slate-50 text-gray-650 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs border border-gray-100"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-orange-650' : ''} />
              تحديث
            </button>
          </div>
        </div>

        {/* Global Error Display */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 text-red-650 rounded-2xl flex items-center gap-3 border border-red-100 text-xs font-bold">
            <AlertCircle size={18} className="shrink-0" />
            <p>{globalError}</p>
          </div>
        )}

        {/* Quick Filter Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between border border-gray-100/50">
          <div className="flex bg-gray-50/70 p-1 rounded-xl self-stretch sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              الكل ({totalCount})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-white text-orange-650 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              غير المقروءة ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                filter === 'read'
                  ? 'bg-white text-emerald-750 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              المقروءة ({totalCount - unreadCount})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="البحث في الإشعارات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pr-10 pl-4 bg-gray-50/50 rounded-xl border-none text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-550 transition-all"
            />
          </div>
        </div>

        {/* Notifications List Container */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 mt-1">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filteredNotifications.map((noti) => (
                <motion.div
                  key={noti.id}
                  layoutId={`noti-${noti.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl p-5 border transition-all flex items-start justify-between gap-4 shadow-xs relative overflow-hidden group ${
                    noti.isRead ? 'border-gray-100/70' : 'border-orange-100 bg-orange-50/5'
                  }`}
                >
                  {/* Unread Accent Bar */}
                  {!noti.isRead && (
                    <div className="absolute top-0 bottom-0 right-0 w-1 bg-orange-600 rounded-r-full" />
                  )}

                  <div className="flex items-start gap-4 flex-1">
                    {getNotificationIcon(noti.notificationType)}
                    <div className="space-y-1 mt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-xs font-black ${noti.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                          {noti.title}
                        </h3>
                        {!noti.isRead && (
                          <span className="bg-orange-600 text-white rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase">
                            جديد
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-gray-500 leading-relaxed whitespace-pre-line">
                        {noti.body}
                      </p>

                      <div className="flex items-center gap-3.5 text-[10px] text-gray-400 font-bold pt-1.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {noti.createdAt ? new Date(noti.createdAt).toLocaleString('ar-YE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'غير معروف'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-[9px] text-gray-300">
                          ID: #{noti.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Mark Read) */}
                  <div className="flex items-center gap-1.5 self-center">
                    {!noti.isRead && (
                      <button
                        onClick={() => markAsRead(noti.id)}
                        title="تمييز كمقروء"
                        className="p-2 bg-slate-50 hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-xl transition-all cursor-pointer border border-gray-100 bg-transparent flex items-center gap-1 text-xs font-black"
                      >
                        <Check size={14} />
                        <span>تعيين كمقروء</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-xs">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4 border border-gray-100">
              <Inbox size={32} />
            </div>
            <h3 className="text-sm font-black text-gray-800 mb-1">صندوق الإشعارات فارغ</h3>
            <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
              {filter === 'unread' 
                ? 'رائع! لقد قمت بقراءة جميع الإشعارات والتنبيهات الموجهة إليك.' 
                : 'لا توجد إشعارات حالية تطابق التصفية المحددة. سيتم إعلامك بالجديد مباشرة.'}
            </p>
          </div>
        )}

      </div>
    </CompanyLayout>
  );
}
