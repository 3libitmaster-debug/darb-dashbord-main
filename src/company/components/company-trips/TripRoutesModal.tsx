import React from 'react';
import { Compass, ArrowLeftRight, AlertCircle, CheckCircle, Plus, RefreshCw, Edit3, Trash2 } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/FormElements';
import { TripFare, Station } from '../../../types/models';

interface TripRoutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  createdTripForRoutes: {
    tripId: number;
    startGoveId: number;
    endGoveId: number;
    startGoveName: string;
    endGoveName: string;
  } | null;
  isNewTripRoutes: boolean;
  routeError: string | null;
  routeSuccess: string | null;
  routeForm: {
    stationId: number;
    departureTime: string;
  };
  setRouteForm: React.Dispatch<React.SetStateAction<{
    stationId: number;
    departureTime: string;
  }>>;
  matchingFares: TripFare[];
  stations: Station[];
  tripRoutes: any[];
  isLoadingRoutes: boolean;
  editingRouteId: number | null;
  setEditingRouteId: (id: number | null) => void;
  editRouteForm: {
    departureTime: string;
  };
  setEditRouteForm: React.Dispatch<React.SetStateAction<{
    departureTime: string;
  }>>;
  handleAddRouteSubmit: (e: React.FormEvent) => void;
  handleUpdateRouteSubmit: (routeId: number) => void;
  handleEditRouteClick: (route: any) => void;
  handleRemoveRoute: (routeId: number) => void;
  isSubmitting: boolean;
}

export const TripRoutesModal: React.FC<TripRoutesModalProps> = ({
  isOpen,
  onClose,
  createdTripForRoutes,
  isNewTripRoutes,
  routeError,
  routeSuccess,
  routeForm,
  setRouteForm,
  matchingFares,
  stations,
  tripRoutes,
  isLoadingRoutes,
  editingRouteId,
  setEditingRouteId,
  editRouteForm,
  setEditRouteForm,
  handleAddRouteSubmit,
  handleUpdateRouteSubmit,
  handleEditRouteClick,
  handleRemoveRoute,
  isSubmitting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="برمجة مسارات ومحطات هذه الرحلة"
      subtitle={`إدارة نقاط التوقف المعتمدة لخط سير الرحلة رقم #TRP-${createdTripForRoutes?.tripId}`}
      icon={<Compass size={24} className="text-orange-555" />}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        
        {/* Header pathway status */}
        <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-5 rounded-2xl border border-orange-550/10 text-right" dir="rtl">
          <span className="text-[10px] font-black text-orange-600 block mb-1 uppercase tracking-wider">الرحلة التشغيلية المحددة</span>
          <div className="flex items-center gap-3 justify-start">
            <span className="text-sm font-black text-gray-950">{createdTripForRoutes?.startGoveName}</span>
            <ArrowLeftRight size={14} className="text-orange-550 shrink-0" />
            <span className="text-sm font-black text-gray-950">{createdTripForRoutes?.endGoveName}</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg font-bold font-sans">#TRP-{createdTripForRoutes?.tripId}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-semibold mt-2 leading-relaxed font-sans">
            {isNewTripRoutes 
              ? 'يجب إضافة محطة وقوف واحدة على الأقل قبل تأكيد وتفعيل الرحلة الجديدة لتمكين حجز الركاب.' 
              : 'تكوين وضبط نقاط ومحطات التوقف لخط سير الرحلة.'}
          </p>
        </div>

        {/* Notification messages */}
        {routeError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-start gap-2 text-red-655 text-xs font-bold leading-relaxed text-right" dir="rtl">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span className="font-semibold">{routeError}</span>
          </div>
        )}
        {routeSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-start gap-2 text-emerald-655 text-xs font-bold leading-relaxed text-right" dir="rtl">
            <CheckCircle size={16} className="shrink-0 text-emerald-600" />
            <span className="font-semibold">{routeSuccess}</span>
          </div>
        )}

        {/* FORM: Add new route */}
        <form onSubmit={handleAddRouteSubmit} className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-right" dir="rtl">
          <h5 className="text-[11px] font-black text-gray-655 uppercase tracking-wider flex items-center gap-1.5 mb-2 justify-start">
            <Plus size={14} className="text-orange-550" />
            برمجة محطة توقف تابعة للمسار
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Station Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 block px-1">المحطة المراد إضافتها *</label>
              {matchingFares.length > 0 ? (
                <select
                  value={routeForm.stationId}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, stationId: parseInt(e.target.value) || 0 }))}
                  className="block w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs font-bold text-gray-805 focus:border-orange-400 focus:ring-4 focus:ring-orange-550/30 transition-all outline-none cursor-pointer"
                >
                  <option value={0}>-- اختر المحطّة المتاحة بالتسعيرات --</option>
                  {matchingFares.map(fare => {
                    const fullStation = stations.find(st => st.stationId === fare.stationId);
                    const displayName = fullStation 
                      ? `${fare.cityName} - ${fullStation.address}` 
                      : `${fare.cityName} (محطة #${fare.stationId})`;
                    return (
                      <option key={fare.tripFareId} value={fare.stationId}>
                        {displayName} {fare.isMainStation ? ' - [رئيسية]' : ''} ({fare.price.toLocaleString()} ر.ي)
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="p-3 bg-red-50 text-red-700 text-[10px] rounded-xl font-bold leading-relaxed border border-red-100">
                  تنبيه: لا يوجد تسعيرات مسجلة من ({createdTripForRoutes?.startGoveName}) إلى ({createdTripForRoutes?.endGoveName}). يرجى إضافة تسعيرات الرحلة أولاً لكي تتمكن من تحديد مسارات هنا.
                </div>
              )}
            </div>

            {/* Departure Time Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 block px-1">توقيت مغادرة المحطة (ساعة:دقيقة:ثانية) *</label>
              <input
                type="time"
                step="1"
                value={routeForm.departureTime}
                onChange={(e) => setRouteForm(prev => ({ ...prev, departureTime: e.target.value }))}
                className="block w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-xs font-bold text-gray-855 focus:border-orange-400 focus:ring-4 focus:ring-orange-550/30 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={matchingFares.length === 0 || isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus size={14} /> إضافة محطة التوقف للمسار
            </Button>
          </div>
        </form>

        {/* List of current routes of this trip */}
        <div className="space-y-3 text-right" dir="rtl">
          <h5 className="text-[11px] font-black text-gray-655 uppercase tracking-wider flex items-center justify-start gap-1.5">
            <Compass size={14} className="text-orange-550" />
            المحطات المضافة للرحلة حالياً ({tripRoutes.length})
          </h5>

          {isLoadingRoutes ? (
            <div className="text-center py-6 text-xs text-gray-400 font-bold flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-orange-550" size={14} />
              جاري تحميل المحطات من الخدمة...
            </div>
          ) : tripRoutes.length > 0 ? (
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white max-h-[220px] overflow-y-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400">
                    <th className="p-3">اسم المحطة وعنوانها</th>
                    <th className="p-3">توقيت مغادرة المحطة المجدول</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[11px]">
                  {tripRoutes.map((route, i) => {
                    const matchedSt = stations.find(st => st.stationId === route.stationId);
                    const routeIdToDelete = route.tripRouteId || route.id || route.stationId;
                    
                    let displayTime = route.departureTime || '';
                    if (displayTime.includes('T')) {
                      try {
                        displayTime = displayTime.split('T')[1].slice(0, 8);
                      } catch (_) {}
                    } else if (displayTime.includes('.')) {
                      try {
                        displayTime = displayTime.split('.')[0];
                      } catch (_) {}
                    }
                    
                    return (
                      <tr key={routeIdToDelete + '-' + i} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-gray-900">
                          {route.stationName ? (
                            <div>
                              <span className="font-extrabold block text-gray-950">{route.cityName} - {route.stationName}</span>
                              {route.seatFare !== undefined && (
                                <span className="text-[10px] text-orange-600 font-extrabold block mt-0.5">سعر المقعد: {route.seatFare.toLocaleString()} ر.ي</span>
                              )}
                            </div>
                          ) : matchedSt ? (
                            <div>
                              <span className="font-extrabold block text-gray-950">{matchedSt.cityName}</span>
                              <span className="text-[9px] text-gray-400 font-semibold">{matchedSt.address}</span>
                            </div>
                          ) : (
                            <span>محطة رقم #{route.stationId}</span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-gray-700 font-sans">
                          {editingRouteId === routeIdToDelete ? (
                            <input
                              type="time"
                              step="1"
                              value={editRouteForm.departureTime}
                              onChange={(e) => setEditRouteForm({ departureTime: e.target.value })}
                              className="w-[110px] block px-2.5 py-1.5 text-xs font-bold border border-orange-400 bg-white rounded-lg outline-none text-gray-900 font-sans focus:ring-2 focus:ring-orange-550/30"
                            />
                          ) : (
                            displayTime
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {editingRouteId === routeIdToDelete ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateRouteSubmit(routeIdToDelete)}
                                title="حفظ التعديل"
                                className="px-2 py-1 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                              >
                                حفظ
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingRouteId(null)}
                                title="إلغاء التعديل"
                                className="px-2 py-1 text-[10px] font-black bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditRouteClick(route)}
                                title="تعديل توقيت المحطة"
                                className="p-1.5 text-blue-605 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all cursor-pointer"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveRoute(routeIdToDelete)}
                                title="إلغاء المحطة من مسار الرحلة"
                                className="p-1.5 text-red-655 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-gray-150 rounded-2xl bg-white text-xs font-bold text-gray-400 flex flex-col items-center justify-center gap-1.5">
              <AlertCircle size={22} className="text-amber-500 animate-pulse" />
              <span>لم يتم ربط أي محطة وقوف برحلتكم الحالية بعد.</span>
              {isNewTripRoutes && (
                <span className="text-[10px] text-red-500 font-black">إجراء إجباري لإنشاء الرحلة: يجب ربط محطة مغادرة واحدة كحد أدنى لحفظ خط سير الرحلة!</span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons confirm */}
        <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
          <Button 
            type="button" 
            onClick={onClose}
            variant="primary" 
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl py-4"
          >
            تأكيد وإنهاء برمجة مسارات الرحلة وتفعيلها بالخادم
          </Button>
        </div>

      </div>
    </Modal>
  );
};
