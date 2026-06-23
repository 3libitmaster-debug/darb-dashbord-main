import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Edit3, Trash2, Search, RefreshCw, Compass, Clock, MapPin, 
  Calendar, CheckCircle, AlertCircle, ShieldAlert, Tag, Bus as BusIcon, 
  ArrowLeftRight, Info, Eye, X, HelpCircle, Server, ArrowUpDown, Ticket, Receipt
} from 'lucide-react';
import CompanyLayout from '../components/CompanyLayout';
import { UserRole } from '../../types/auth';
import { useTrips } from '../hooks/useTrips';
import { useBuses } from '../hooks/useBuses';
import { useMaintenance } from '../../admin/hooks/useMaintenance';
import { useTripFares } from '../hooks/useTripFares';
import { useStations } from '../hooks/useStations';
import { Trip, Periods, TripStatus } from '../../types/models';
import { Button } from '../../shared/components/FormElements';
import { Modal } from '../../shared/components/Modal';
import { AddTripModal } from '../components/company-trips/AddTripModal';
import { EditTripModal } from '../components/company-trips/EditTripModal';
import { DeleteTripModal } from '../components/company-trips/DeleteTripModal';
import { TripRoutesModal } from '../components/company-trips/TripRoutesModal';
import { TripBookingsModal } from '../components/company-trips/TripBookingsModal';

// Status labels and styling
const TRIP_STATUS_MAP: Record<string | number, { text: string; bg: string; textClass: string; border: string }> = {
  0: { text: 'مجدولة', bg: 'bg-blue-50', textClass: 'text-blue-700', border: 'border-blue-100' },
  1: { text: 'ملغاة', bg: 'bg-red-50', textClass: 'text-red-700', border: 'border-red-100' },
  2: { text: 'مكتملة', bg: 'bg-emerald-50', textClass: 'text-emerald-700', border: 'border-emerald-100' },
  3: { text: 'ممتلئة', bg: 'bg-amber-50', textClass: 'text-amber-700', border: 'border-amber-150' },
  
  // Also handle string responses (case-insensitive and display name)
  'scheduled': { text: 'مجدولة', bg: 'bg-blue-50', textClass: 'text-blue-700', border: 'border-blue-100' },
  'cancelled': { text: 'ملغاة', bg: 'bg-red-50', textClass: 'text-red-700', border: 'border-red-100' },
  'completed': { text: 'مكتملة', bg: 'bg-emerald-50', textClass: 'text-emerald-700', border: 'border-emerald-100' },
  'fulled': { text: 'ممتلئة', bg: 'bg-amber-50', textClass: 'text-amber-700', border: 'border-amber-150' },
  'Fulled': { text: 'ممتلئة', bg: 'bg-amber-50', textClass: 'text-amber-700', border: 'border-amber-150' },
  
  'مجدولة': { text: 'مجدولة', bg: 'bg-blue-50', textClass: 'text-blue-700', border: 'border-blue-100' },
  'ملغاة': { text: 'ملغاة', bg: 'bg-red-50', textClass: 'text-red-700', border: 'border-red-100' },
  'مكتملة': { text: 'مكتملة', bg: 'bg-emerald-50', textClass: 'text-emerald-700', border: 'border-emerald-100' },
  'ممتلئة': { text: 'ممتلئة', bg: 'bg-amber-50', textClass: 'text-amber-700', border: 'border-amber-150' }
};

export default function CompanyTrips() {
  const {
    trips,
    globalError,
    isSubmitting,
    setGlobalError,
    fetchTrips,
    addTrip,
    editTrip,
    removeTrip,
    addRoute,
    getRoutes,
    getBookings,
    removeRoute,
    updateRoute
  } = useTrips();

  const {
    buses,
    fetchBuses
  } = useBuses();

  const {
    governorates,
    fetchGovernorates
  } = useMaintenance();

  const {
    fares,
    fetchFares
  } = useTripFares();

  const {
    stations,
    fetchStations
  } = useStations();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedFromGovId, setSelectedFromGovId] = useState<number>(0);
  const [selectedToGovId, setSelectedToGovId] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('date-asc');

  // Modals visibility states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Trips route compulsory modal states
  const [isRoutesModalOpen, setIsRoutesModalOpen] = useState(false);
  const [isNewTripRoutes, setIsNewTripRoutes] = useState(false);
  const [createdTripForRoutes, setCreatedTripForRoutes] = useState<{
    tripId: number;
    startGoveId: number;
    endGoveId: number;
    startGoveName: string;
    endGoveName: string;
  } | null>(null);

  const [tripRoutes, setTripRoutes] = useState<any[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routeForm, setRouteForm] = useState({
    stationId: 0,
    departureTime: '08:00:00'
  });
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeSuccess, setRouteSuccess] = useState<string | null>(null);

  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
  const [editRouteForm, setEditRouteForm] = useState({
    departureTime: '08:00:00'
  });

  // Trip bookings modal states
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [selectedTripIdForBookings, setSelectedTripIdForBookings] = useState<number | null>(null);
  const [selectedTripDetails, setSelectedTripDetails] = useState<Trip | null>(null);
  const [tripBookings, setTripBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [selectedReceiptForPreview, setSelectedReceiptForPreview] = useState<string | null>(null);

  // Selected trip for editing/deleting
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Success message state (from the server)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    startGoveId: 0,
    endGoveId: 0,
    departureDate: '',
    period: 0, // 0: Morning, 1: Evening
    busId: 0
  });

  const [editForm, setEditForm] = useState({
    departureDate: '',
    busId: 0
  });

  useEffect(() => {
    fetchTrips();
    fetchBuses();
    fetchGovernorates();
    fetchFares();
    fetchStations();
  }, [fetchTrips, fetchBuses, fetchGovernorates, fetchFares, fetchStations]);

  // Helper helper to resolve status display
  const getStatusMeta = (statusVal: string | number) => {
    const key = String(statusVal).trim();
    return TRIP_STATUS_MAP[key] || { text: String(statusVal), bg: 'bg-gray-50', textClass: 'text-gray-700', border: 'border-gray-100' };
  };

  // Get matching fares for currently active trip's route selection
  const matchingFares = (fares.data || []).filter(
    f => f.fromGovId === createdTripForRoutes?.startGoveId && f.toGovId === createdTripForRoutes?.endGoveId
  );

  // Stats calculate
  const totalTripsCount = trips.data?.length || 0;
  
  const scheduledCount = (trips.data || []).filter(t => {
    const meta = getStatusMeta(t.status);
    return meta.text === 'مجدولة';
  }).length;
  
  const completedCount = (trips.data || []).filter(t => {
    const meta = getStatusMeta(t.status);
    return meta.text === 'مكتملة';
  }).length;
  
  const cancelledCount = (trips.data || []).filter(t => {
    const meta = getStatusMeta(t.status);
    return meta.text === 'ملغاة';
  }).length;

  // Filtered List
  const filteredTrips = (trips.data || [])
    .filter(trip => {
      // 1. Filter by Status
      if (filterStatus !== 'all') {
        const meta = getStatusMeta(trip.status);
        if (filterStatus === 'scheduled' && meta.text !== 'مجدولة') return false;
        if (filterStatus === 'cancelled' && meta.text !== 'ملغاة') return false;
        if (filterStatus === 'completed' && meta.text !== 'مكتملة') return false;
        if (filterStatus === 'fulled' && meta.text !== 'ممتلئة') return false;
      }

      // 2. Filter by Departure Governorate
      if (selectedFromGovId !== 0) {
        // Find start governorate name
        const govObj = (governorates.data || []).find(g => g.id === selectedFromGovId);
        if (govObj && !trip.startGoveName.includes(govObj.name)) {
          return false;
        }
      }

      // 3. Filter by Arrival Governorate
      if (selectedToGovId !== 0) {
        // Find end governorate name
        const govObj = (governorates.data || []).find(g => g.id === selectedToGovId);
        if (govObj && !trip.endGoveName.includes(govObj.name)) {
          return false;
        }
      }

      // 4. Filter by text search
      const text = searchTerm.toLowerCase();
      const startGov = (trip.startGoveName || '').toLowerCase();
      const endGov = (trip.endGoveName || '').toLowerCase();
      const priceStr = String(trip.price);
      const busNum = String(trip.busId);

      return startGov.includes(text) || 
             endGov.includes(text) || 
             priceStr.includes(text) || 
             busNum.includes(text);
    })
    .sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
      }
      if (sortBy === 'date-desc') {
        return new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime();
      }
      if (sortBy === 'id-desc') {
        return b.tripId - a.tripId;
      }
      if (sortBy === 'id-asc') {
        return a.tripId - b.tripId;
      }
      if (sortBy === 'price-asc') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'price-desc') {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });

  // Action handlers
  const handleOpenAdd = () => {
    // Set default values helper
    const defaultGovId = governorates.data?.[0]?.id || 0;
    const defaultEndGovId = governorates.data?.[1]?.id || governorates.data?.[0]?.id || 0;
    const defaultBusId = buses.data?.[0]?.busId || 0;
    
    // Get tomorrow's default date format standard YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().slice(0, 10);

    setAddForm({
      startGoveId: defaultGovId,
      endGoveId: defaultEndGovId,
      departureDate: formattedDate,
      period: 0,
      busId: defaultBusId
    });
    setFormError(null);
    setSuccessMessage(null);
    setIsAddOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.startGoveId === 0) {
      setFormError('يرجى تحديد محافظة الانطلاق');
      return;
    }
    if (addForm.endGoveId === 0) {
      setFormError('يرجى تحديد محافظة الوصول');
      return;
    }
    if (addForm.startGoveId === addForm.endGoveId) {
      setFormError('لا يمكن أن تكون محافظة الانطلاق والوصول متطابقتين');
      return;
    }
    if (!addForm.departureDate) {
      setFormError('يرجى تحديد تاريخ انطلاق الرحلة بشكل صحيح');
      return;
    }
    if (addForm.busId === 0) {
      setFormError('يرجى تعيين حافلة تابعة لشركتكم لتنفيذ رحلة النقل');
      return;
    }

    setFormError(null);
    setSuccessMessage(null);

    const result = await addTrip({
      startGoveId: Number(addForm.startGoveId),
      endGoveId: Number(addForm.endGoveId),
      departureDate: new Date(addForm.departureDate).toISOString(),
      period: Number(addForm.period),
      busId: Number(addForm.busId)
    });

    if (result.success) {
      setSuccessMessage(result.message || 'تم حجز وتسجيل الرحلة بنجاح بالخادم. يرجى إضافة مسارات التوقف الآن.');
      setIsAddOpen(false);

      // Extract new tripId from response
      const newTripId = result.data?.tripId || result.data || 0;

      const startGoveObj = (governorates.data || []).find(g => g.id === Number(addForm.startGoveId));
      const endGoveObj = (governorates.data || []).find(g => g.id === Number(addForm.endGoveId));
      const startGoveName = startGoveObj ? startGoveObj.name : '';
      const endGoveName = endGoveObj ? endGoveObj.name : '';

      // Set the newly created trip references to configure routes
      setCreatedTripForRoutes({
        tripId: Number(newTripId),
        startGoveId: Number(addForm.startGoveId),
        endGoveId: Number(addForm.endGoveId),
        startGoveName,
        endGoveName
      });

      // Clear/Reset Routes modal state
      setTripRoutes([]);
      setRouteForm({
        stationId: 0,
        departureTime: '08:00:00'
      });
      setRouteError(null);
      setRouteSuccess(null);
      setIsNewTripRoutes(true);
      setIsRoutesModalOpen(true);
    } else {
      setFormError(result.message || 'فشل في إنشاء الرحلة');
    }
  };

  const handleAddRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdTripForRoutes) return;
    if (routeForm.stationId === 0) {
      setRouteError('يرجى تحديد المحطة من قائمة التسعيرات');
      return;
    }
    if (!routeForm.departureTime) {
      setRouteError('يرجى تحديد وقت المغادرة');
      return;
    }

    setRouteError(null);
    setRouteSuccess(null);

    // Format time: HH:MM:ss.000Z
    let formattedTime = routeForm.departureTime;
    if (formattedTime.split(':').length === 2) {
      formattedTime += ':00';
    }
    if (!formattedTime.includes('.')) {
      formattedTime += '.000Z';
    }

    const res = await addRoute(createdTripForRoutes.tripId, {
      stationId: Number(routeForm.stationId),
      departureTime: formattedTime
    });

    if (res.success) {
      setRouteSuccess(res.message || 'تمت إضافة محطة التوقف ومسار الرحلة بنجاح بالخادم');
      // Refresh routes list
      const fetchRes = await getRoutes(createdTripForRoutes.tripId);
      if (fetchRes.success) {
        setTripRoutes(fetchRes.data);
      }
      setRouteForm(prev => ({ ...prev, stationId: 0 }));
    } else {
      setRouteError(res.message || 'فشل في إضافة محطة مسار الرحلة بالخادم');
    }
  };

  const handleRemoveRoute = async (routeId: number) => {
    if (!createdTripForRoutes) return;
    setRouteError(null);
    setRouteSuccess(null);

    const res = await removeRoute(routeId);
    if (res.success) {
      setRouteSuccess(res.message || 'تم حذف محطة هذا المسار بنجاح');
      const fetchRes = await getRoutes(createdTripForRoutes.tripId);
      if (fetchRes.success) {
        setTripRoutes(fetchRes.data);
      }
    } else {
      setRouteError(res.message || 'فشل حذف مسار المحطة بالخادم');
    }
  };

  const handleEditRouteClick = (route: any) => {
    setEditingRouteId(route.tripRouteId || route.id || route.stationId);
    let originalTime = route.departureTime || '08:00:00';
    // Format if full datetime string or keep if HH:MM
    if (originalTime.includes('T')) {
      try {
        originalTime = originalTime.split('T')[1].slice(0, 8);
      } catch (_) {}
    } else if (originalTime.includes('.')) {
      try {
        originalTime = originalTime.split('.')[0];
      } catch (_) {}
    }
    // ensure hh:mm:ss format
    const parts = originalTime.split(':');
    if (parts.length === 2) {
      originalTime = `${parts[0]}:${parts[1]}:00`;
    }
    setEditRouteForm({ departureTime: originalTime });
  };

  const handleUpdateRouteSubmit = async (routeId: number) => {
    if (!createdTripForRoutes) return;
    if (!editRouteForm.departureTime) {
      setRouteError('يرجى تحديد وقت المغادرة الجديد');
      return;
    }

    setRouteError(null);
    setRouteSuccess(null);

    // Format time: HH:MM:ss.000Z
    let formattedTime = editRouteForm.departureTime;
    if (formattedTime.split(':').length === 2) {
      formattedTime += ':00';
    }
    if (!formattedTime.includes('.')) {
      formattedTime += '.000Z';
    }

    const res = await updateRoute(routeId, {
      departureTime: formattedTime
    });

    if (res.success) {
      setRouteSuccess(res.message || 'تم تحديث توقيت محطة مسار الرحلة بنجاح بالخادم');
      setEditingRouteId(null);
      // Refresh routes list
      const fetchRes = await getRoutes(createdTripForRoutes.tripId);
      if (fetchRes.success) {
        setTripRoutes(fetchRes.data);
      }
    } else {
      setRouteError(res.message || 'فشل تحديث توقيت المسار بالخادم');
    }
  };

  const handleCloseRoutesModal = () => {
    if (isNewTripRoutes && tripRoutes.length === 0) {
      setRouteError('إجراء إجباري للرحلة الجديدة: يجب إضافة مسار أو محطة توقف واحدة على الأقل لضمان تسجيل مسار المسافرين المبرمج.');
      return;
    }
    setIsRoutesModalOpen(false);
    setCreatedTripForRoutes(null);
    fetchTrips();
  };

  const handleViewBookings = async (trip: Trip) => {
    setSelectedTripDetails(trip);
    setSelectedTripIdForBookings(trip.tripId);
    setTripBookings([]);
    setBookingsError(null);
    setIsBookingsModalOpen(true);
    setIsLoadingBookings(true);

    const res = await getBookings(trip.tripId);
    if (res.success) {
      setTripBookings(res.data || []);
    } else {
      setBookingsError(res.message || 'فشل في استرداد حجوزات هذه الرحلة المحددة.');
    }
    setIsLoadingBookings(false);
  };

  const handleCloseBookingsModal = () => {
    setIsBookingsModalOpen(false);
    setSelectedTripDetails(null);
    setSelectedTripIdForBookings(null);
    setTripBookings([]);
    setBookingsError(null);
    setSelectedReceiptForPreview(null);
  };

  const handleOpenEdit = (trip: Trip) => {
    setSelectedTrip(trip);
    
    // Convert trip date to date standard YYYY-MM-DD
    let formattedDate = '';
    if (trip.departureDate) {
      try {
        const dateObj = new Date(trip.departureDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      } catch (err) {
        formattedDate = '';
      }
    }

    setEditForm({
      departureDate: formattedDate,
      busId: trip.busId || 0
    });
    setFormError(null);
    setSuccessMessage(null);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    if (!editForm.departureDate) {
      setFormError('يرجى إدخال تاريخ الانطلاق الجديد');
      return;
    }
    if (editForm.busId === 0) {
      setFormError('يرجى اختيار الحافلة المطلوبة لتغيير التشغيل');
      return;
    }

    setFormError(null);
    setSuccessMessage(null);

    const result = await editTrip(selectedTrip.tripId, {
      departureDate: new Date(editForm.departureDate).toISOString(),
      busId: Number(editForm.busId)
    });

    if (result.success) {
      setSuccessMessage(result.message || 'تم تحديث بيانات الرحلة بنجاح بالخادم');
      setIsEditOpen(false);
    } else {
      setFormError(result.message || 'فشل تعديل الرحلة بالخادم');
    }
  };

  const handleOpenDelete = (trip: Trip) => {
    setSelectedTrip(trip);
    setGlobalError(null);
    setSuccessMessage(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTrip) return;
    setSuccessMessage(null);
    const result = await removeTrip(selectedTrip.tripId);
    if (result.success) {
      setSuccessMessage(result.message || 'تم إلغاء وحذف الرحلة نهائياً بنجاح بالخادم');
      setIsDeleteOpen(false);
    }
  };

  const handleRefresh = () => {
    fetchTrips();
    fetchBuses();
    fetchGovernorates();
  };

  return (
    <CompanyLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl animate-fade-in" dir="rtl">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-100 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Compass className="text-orange-600 animate-spin-slow" size={32} />
              إدارة رحلات النقل
            </h1>
            <p className="text-gray-500 text-sm font-semibold">تحديد مواعيد الرحلات، تخصيص أسطول الحافلات المتاحة وفترات العمل اليومية</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={handleRefresh} 
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 rounded-2xl transition-all shadow-none flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <RefreshCw size={14} className={trips.status === 'loading' ? 'animate-spin' : ''} />
              تحديث الرحلات
            </button>
            <Button 
              onClick={handleOpenAdd}
              icon={<Plus size={16} />} 
              variant="primary"
              className="px-6 h-12 rounded-2xl text-xs font-black"
              disabled={buses.data?.length === 0}
            >
              برمجة رحلة جديدة
            </Button>
          </div>
        </div>

        {/* Global Success / Error Display */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold shadow-sm animate-fade-in">
            <ShieldAlert size={16} className="shrink-0" /> 
            <span>{globalError}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2 text-emerald-650 text-xs font-bold shadow-sm animate-fade-in">
            <CheckCircle size={16} className="shrink-0 text-emerald-600" /> 
            <span>{successMessage}</span>
          </div>
        )}

        {/* Fleet KPI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">إجمالي الرحلات</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">
                {trips.status === 'loading' ? '...' : totalTripsCount}
              </h3>
            </div>
            <div className="h-10 w-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-orange-600">
              <Compass size={18} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-6 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1 font-sans">الرحلات المجدولة جارية</p>
              <h3 className="text-3xl font-black text-blue-600 mt-1">
                {trips.status === 'loading' ? '...' : scheduledCount}
              </h3>
            </div>
            <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Clock size={18} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">الرحلات المكتملة</p>
              <h3 className="text-3xl font-black text-emerald-605 mt-1">
                {trips.status === 'loading' ? '...' : completedCount}
              </h3>
            </div>
            <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle size={18} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">الرحلات الملغية</p>
              <h3 className="text-3xl font-black text-red-550 mt-1 font-sans">
                {trips.status === 'loading' ? '...' : cancelledCount}
              </h3>
            </div>
            <div className="h-10 w-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-650">
              <AlertCircle size={18} />
            </div>
          </motion.div>
        </div>

        {/* Warning Alert if no buses registered */}
        {buses.data?.length === 0 && (
          <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5 md:mt-0" />
              <div>
                <h5 className="font-extrabold text-sm text-amber-850">يجب إضافة حافلة أولاً!</h5>
                <p className="text-xs text-amber-700 font-bold mt-0.5">تسجيل الرحلات يتطلب تعيين حافلة تابعة لشركتكم لتقوم برحلة السير.</p>
              </div>
            </div>
            <a href="/company/buses" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-all text-center inline-block">
              الذهاب لإضافة حافلات الأسطول
            </a>
          </div>
        )}

        {/* Toolbar (Search and Filter Actions) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Search input (6 grid cols) */}
            <div className="relative lg:col-span-4">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="البحث باسم محافظة الانطلاق، الوصول، سعر الرحلة..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-805 placeholder-gray-400 focus:ring-2 focus:ring-orange-550 transition-all outline-none"
              />
            </div>

            {/* Custom filters (8 grid cols) */}
            <div className="lg:col-span-8 flex flex-wrap gap-3 items-center justify-start lg:justify-end">
              
              {/* Departure filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-400">من:</span>
                <select 
                  value={selectedFromGovId}
                  onChange={(e) => setSelectedFromGovId(parseInt(e.target.value) || 0)}
                  className="bg-gray-50 hover:bg-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-750 outline-none transition-all cursor-pointer border border-transparent hover:border-gray-200 focus:ring-2 focus:ring-orange-550"
                >
                  <option value={0}>كل المحافظات</option>
                  {(governorates.data || []).map(gov => (
                    <option key={gov.id} value={gov.id}>{gov.name}</option>
                  ))}
                </select>
              </div>

              {/* Arrival filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-400">إلى:</span>
                <select 
                  value={selectedToGovId}
                  onChange={(e) => setSelectedToGovId(parseInt(e.target.value) || 0)}
                  className="bg-gray-50 hover:bg-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-750 outline-none transition-all cursor-pointer border border-transparent hover:border-gray-200 focus:ring-2 focus:ring-orange-550"
                >
                  <option value={0}>كل المحافظات</option>
                  {(governorates.data || []).map(gov => (
                    <option key={gov.id} value={gov.id}>{gov.name}</option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-400">الحالة:</span>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-50 hover:bg-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-750 outline-none transition-all cursor-pointer border border-transparent hover:border-gray-200 focus:ring-2 focus:ring-orange-550 capitalize"
                >
                  <option value="all">كل حالات العمل</option>
                  <option value="scheduled">مجدولة</option>
                  <option value="completed">مكتملة</option>
                  <option value="cancelled">ملغاة</option>
                  <option value="fulled">ممتلئة</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                  <ArrowUpDown size={12} className="text-orange-550" />
                  الترتيب حسب:
                </span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 hover:bg-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-750 outline-none transition-all cursor-pointer border border-transparent hover:border-gray-200 focus:ring-2 focus:ring-orange-550"
                >
                  <option value="date-asc">تاريخ المغادرة (الأقرب أولاً)</option>
                  <option value="date-desc">تاريخ المغادرة (الأبعد أولاً)</option>
                  <option value="id-desc">رقم الرحلة (الأحدث أولاً)</option>
                  <option value="id-asc">رقم الرحلة (الأقدم أولاً)</option>
                  <option value="price-asc">سعر التذكرة (الأقل للأعلى)</option>
                  <option value="price-desc">سعر التذكرة (الأعلى للأقل)</option>
                </select>
              </div>

              {/* Reset filter */}
              {(selectedFromGovId !== 0 || selectedToGovId !== 0 || filterStatus !== 'all' || searchTerm !== '' || sortBy !== 'date-asc') && (
                <button
                  onClick={() => {
                    setSelectedFromGovId(0);
                    setSelectedToGovId(0);
                    setFilterStatus('all');
                    setSearchTerm('');
                    setSortBy('date-asc');
                  }}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <X size={14} />
                  تهيئة الفلاتر
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Trips Table display */}
        {trips.status === 'loading' ? (
          <div id="trips-loader-skeleton" className="bg-white rounded-[2rem] p-8 shadow-sm space-y-4 animate-pulse">
            <div className="h-6 bg-gray-100 rounded-lg w-1/4 mb-6"></div>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-12 bg-gray-50 rounded-xl w-full"></div>
            ))}
          </div>
        ) : filteredTrips.length > 0 ? (
          <div id="trips-table-card" className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 font-bold text-xs select-none">
                    <th className="p-5 font-black">رمز الرحلة</th>
                    <th className="p-5 font-black">مسار خط السير (من ➔ إلى)</th>
                    <th className="p-5 font-black">المركبة الحافلة المعينة</th>
                    <th className="p-5 font-black">تاريخ المغادرة</th>
                    <th className="p-5 font-black font-sans">المقاعد الشاغرة</th>
                    <th className="p-5 font-black">سعر التذكرة</th>
                    <th className="p-5 font-black">حالة الرحلة</th>
                    <th className="p-5 font-black text-left">الخيارات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTrips.map((trip, idx) => {
                    const statusMeta = getStatusMeta(trip.status);
                    
                    // Format date nicely to Arabic layout
                    let humanDateStr = trip.departureDate;
                    if (trip.departureDate) {
                      try {
                        const dateObj = new Date(trip.departureDate);
                        humanDateStr = dateObj.toLocaleDateString('ar-YE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      } catch (e) {
                        humanDateStr = trip.departureDate;
                      }
                    }

                    // Find bus description if possible
                    const assignedBus = (buses.data || []).find(b => b.busId === trip.busId);

                    return (
                      <motion.tr
                        key={trip.tripId}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-gray-50/50 transition-colors text-xs text-gray-700"
                      >
                        {/* Trip ID */}
                        <td className="p-5 font-black text-gray-950 font-sans"># TRP-{trip.tripId}</td>

                        {/* From ➔ To */}
                        <td className="p-5 font-black text-gray-900">
                          <span className="inline-flex items-center gap-2">
                            <span className="font-black text-gray-900">{trip.startGoveName}</span>
                            <ArrowLeftRight size={13} className="text-gray-400 shrink-0" />
                            <span className="font-semibold text-gray-550">{trip.endGoveName}</span>
                          </span>
                        </td>

                        {/* Bus Plate / Plate details */}
                        <td className="p-5 text-gray-800">
                          <span className="bg-gray-50 border border-gray-100 text-gray-700 px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-2">
                            <BusIcon size={13} className="text-orange-600" />
                            {assignedBus ? (
                              <span>حافلة رقم #{assignedBus.plateNumber} ({assignedBus.model})</span>
                            ) : (
                              <span className="font-sans">رمز حافلة {trip.busId}</span>
                            )}
                          </span>
                        </td>

                        {/* Departure date */}
                        <td className="p-5 text-gray-900 font-semibold">{humanDateStr}</td>

                        {/* Available seats */}
                        <td className="p-5 font-bold font-sans">
                          <span className="bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
                            {trip.availableSeats !== undefined ? `${trip.availableSeats} مقعد` : '---'}
                          </span>
                        </td>

                        {/* Trip Default Price */}
                        <td className="p-5 font-black text-orange-600 font-mono text-[13px]">
                          {trip.price ? `${trip.price.toLocaleString()} ر.ي` : '---'}
                        </td>

                        {/* Status badge */}
                        <td className="p-5">
                          <span className={`inline-flex px-2.5 py-1 border rounded-lg font-bold text-[10px] items-center gap-1 ${statusMeta.bg} ${statusMeta.textClass} ${statusMeta.border}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                            {statusMeta.text}
                          </span>
                        </td>

                        {/* Control options */}
                        <td className="p-5 text-left flex items-center justify-end gap-2">
                          {/* Routes Management */}
                          <button 
                            onClick={async () => {
                              const startG = (governorates.data || []).find(g => trip.startGoveName.includes(g.name));
                              const endG = (governorates.data || []).find(g => trip.endGoveName.includes(g.name));
                              const startGId = startG ? startG.id : 0;
                              const endGId = endG ? endG.id : 0;
                              
                              setCreatedTripForRoutes({
                                tripId: trip.tripId,
                                startGoveId: startGId,
                                endGoveId: endGId,
                                startGoveName: trip.startGoveName,
                                endGoveName: trip.endGoveName
                              });
                              
                              setIsLoadingRoutes(true);
                              setTripRoutes([]);
                              const res = await getRoutes(trip.tripId);
                              if (res.success) {
                                setTripRoutes(res.data);
                              }
                              setIsLoadingRoutes(false);
                              setRouteForm({
                                stationId: 0,
                                departureTime: '08:00:00'
                              });
                              setRouteError(null);
                              setRouteSuccess(null);
                              setIsNewTripRoutes(false);
                              setIsRoutesModalOpen(true);
                            }}
                            title="إدارة مسارات ومحطات التوقف"
                            className="p-2.5 rounded-xl border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <Compass size={14} />
                          </button>

                          {/* Trip Bookings Viewer */}
                          <button 
                            onClick={() => handleViewBookings(trip)}
                            title="عرض وحساب حجوزات الركاب المؤكدة"
                            className="p-2.5 rounded-xl border border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <Ticket size={14} />
                          </button>

                          {/* Edit Trip Details */}
                          <button 
                            onClick={() => handleOpenEdit(trip)}
                            title="تعديل تفاصيل الحافلة والموعد"
                            className="p-2.5 rounded-xl border border-gray-200 text-gray-650 bg-white hover:bg-gray-950 hover:text-white hover:border-gray-950 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Delete Trip Details */}
                          <button 
                            onClick={() => handleOpenDelete(trip)}
                            title="إلغاء وحذف الرحلة"
                            className="p-2.5 rounded-xl border border-red-150 text-red-650 bg-red-50/50 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div id="trips-empty-state-banner" className="py-24 text-center border-2 border-dashed border-gray-150 rounded-[2rem] bg-white">
            <Server size={40} className="mx-auto text-gray-300 mb-4 animate-bounce" />
            <h4 className="text-base font-bold text-gray-500">لاتوجد رحلات مجدولة حالياً لشركتكم</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">ابدأ ببرمجة وجدولة أولى رحلاتكم ليتمكن الركاب من الاطلاع على توقيت المغادرة والحجز مباشرة</p>
          </div>
        )}

        {/* ======================================= */}
        {/* MODAL 1: SCHEDULE / ADD RECORD BLOCK */}
        {/* ======================================= */}
        <AddTripModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          addForm={addForm}
          setAddForm={setAddForm}
          governorates={governorates.data || []}
          buses={buses.data || []}
          formError={formError}
          isSubmitting={isSubmitting}
          onSubmit={handleCreate}
        />

        {/* ======================================= */}
        {/* MODAL 2: EDIT EXISTING RECORD BLOCK */}
        {/* ======================================= */}
        <EditTripModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          selectedTrip={selectedTrip}
          editForm={editForm}
          setEditForm={setEditForm}
          buses={buses.data || []}
          formError={formError}
          isSubmitting={isSubmitting}
          onSubmit={handleUpdate}
        />

        {/* ======================================= */}
        {/* MODAL 3: DELETE CONFIRMATION BLOCK */}
        {/* ======================================= */}
        <DeleteTripModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          selectedTrip={selectedTrip}
          onDelete={handleDelete}
        />

        {/* ======================================= */}
        {/* MODAL 4: TRIP ROUTES MANDATORY / MANAGEMENT BLOCK */}
        {/* ======================================= */}
        <TripRoutesModal
          isOpen={isRoutesModalOpen}
          onClose={handleCloseRoutesModal}
          createdTripForRoutes={createdTripForRoutes}
          isNewTripRoutes={isNewTripRoutes}
          routeError={routeError}
          routeSuccess={routeSuccess}
          routeForm={routeForm}
          setRouteForm={setRouteForm}
          matchingFares={matchingFares}
          stations={stations.data || []}
          tripRoutes={tripRoutes}
          isLoadingRoutes={isLoadingRoutes}
          editingRouteId={editingRouteId}
          setEditingRouteId={setEditingRouteId}
          editRouteForm={editRouteForm}
          setEditRouteForm={setEditRouteForm}
          handleAddRouteSubmit={handleAddRouteSubmit}
          handleUpdateRouteSubmit={handleUpdateRouteSubmit}
          handleEditRouteClick={handleEditRouteClick}
          handleRemoveRoute={handleRemoveRoute}
          isSubmitting={isSubmitting}
        />

        {/* ======================================= */}
        {/* MODAL 5: TRIP BOOKINGS VIEWER BLOCK */}
        {/* ======================================= */}
        <TripBookingsModal
          isOpen={isBookingsModalOpen}
          onClose={handleCloseBookingsModal}
          selectedTripDetails={selectedTripDetails}
          bookingsError={bookingsError}
          isLoadingBookings={isLoadingBookings}
          tripBookings={tripBookings}
          selectedReceiptForPreview={selectedReceiptForPreview}
          setSelectedReceiptForPreview={setSelectedReceiptForPreview}
        />

      </div>
    </CompanyLayout>
  );
}
