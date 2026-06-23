import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Plus, Loader2, Edit2, Trash2, AlertCircle, 
  Search, CheckCircle, XCircle, MapPin, Mail, Calendar, Phone,
  UserCheck, RefreshCw, Eye
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useCustomers } from '../hooks/useCustomers';
import { Button, Input, Modal, Badge, Alert, EmptyState } from '../../shared/components';
import { CustomerService } from '../../shared/api/services/customer.service';
import { Customer } from '../../types/models';
import { UserRole } from '../../types/auth';

export default function CustomerManagement() {
  const { customers, globalError, setGlobalError, fetchCustomers } = useCustomers();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetailsCustomer, setSelectedDetailsCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    nationalId: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenForm = (customer: Customer | null = null) => {
    if (customer) {
      setCurrentCustomer(customer);
      setFormData({
        email: customer.email,
        password: '', // Do not prefill password length
        fullName: customer.fullName,
        dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '',
        phone: customer.phone,
        address: customer.address,
        nationalId: customer.nationalId,
      });
    } else {
      setCurrentCustomer(null);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        dateOfBirth: '',
        phone: '',
        address: '',
        nationalId: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      let res;
      if (currentCustomer) {
        // ID field is either customerId or id
        const targetId = currentCustomer.id || currentCustomer.customerId;
        res = await CustomerService.updateCustomer(targetId, formData);
      } else {
        res = await CustomerService.createCustomer(formData);
      }

      if (res.data.success) {
        setSuccessMessage(res.data.message || 'تم حفظ بيانات العميل بنجاح');
        fetchCustomers();
        setIsFormOpen(false);
      } else {
        setGlobalError(res.data.message || 'فشل عملية الحفظ');
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم لحفظ العميل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل نهائياً من النظام؟')) return;
    
    setGlobalError(null);
    setSuccessMessage(null);
    const targetId = customer.id || customer.customerId;
    try {
      const res = await CustomerService.deleteCustomer(targetId);
      if (res.data.success || res.status === 204) {
        setSuccessMessage(res.data.message || 'تم حذف العميل بنجاح');
        fetchCustomers();
      } else {
        setGlobalError(res.data.message || 'فشل عملية الحذف');
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم');
    }
  };

  const handleToggleStatus = async (customer: Customer) => {
    const userId = customer.userId;
    if (!userId) {
      setGlobalError('معرف العميل غير متوفر لعملية التنشيط/التعطيل');
      return;
    }
    
    setGlobalError(null);
    setSuccessMessage(null);
    try {
      const isActivating = !customer.isActive;
      const res = await CustomerService.toggleCustomerActivation(userId);

      if (res.data.success) {
        setSuccessMessage(res.data.message || (isActivating ? 'تم تنشيط حساب العميل بنجاح' : 'تم تعطيل حساب العميل بنجاح'));
        fetchCustomers();
      } else {
        setGlobalError(res.data.message || 'فشل تعديل حالة حساب العميل');
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'فشل الاتصال بالخادم');
    }
  };

  const filteredCustomers = (customers.data || []).filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.nationalId.includes(searchTerm)
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">إدارة العملاء والمسافرين</h1>
            <p className="text-gray-500 font-medium">سجلات وحسابات المسافرين المسجلين في تطبيق درب</p>
          </div>
          <Button 
            onClick={() => handleOpenForm()} 
            className="rounded-2xl bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200"
          >
            <Plus size={20} className="ml-2" />
            إضافة عميل جديد
          </Button>
        </div>

        {/* Action Feedbacks */}
        {successMessage && (
          <div className="mb-6 relative">
            <Alert type="success" message={successMessage} />
            <button onClick={() => setSuccessMessage(null)} className="absolute left-4 top-4 text-emerald-700 hover:text-emerald-950 transition-all cursor-pointer"><XCircle size={18} /></button>
          </div>
        )}

        {globalError && (
          <div className="mb-6 relative">
            <Alert type="error" message={globalError} />
            <button onClick={() => setGlobalError(null)} className="absolute left-4 top-4 text-orange-700 hover:text-orange-950 transition-all cursor-pointer"><XCircle size={18} /></button>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-sm mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="البحث بالاسم، بريد العميل، الهاتف أو الرقم الوطني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-bold"
            />
          </div>
          <button onClick={fetchCustomers} className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl transition-all shadow-none shrink-0 flex items-center gap-2 text-xs font-bold cursor-pointer">
            <RefreshCw size={14} className={customers.status === 'loading' ? 'animate-spin' : ''} />
            تحديث القائمة
          </button>
        </div>

        {/* Table Records */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-sm font-black text-gray-400">الاسم والبيانات الشخصية</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400">بيانات الاتصال</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 text-center">الرقم الوطني</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 text-center">تاريخ الميلاد</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 text-center">الحالة</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 text-left">التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.status === 'loading' ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-8 bg-gray-100 rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => {
                  const resolvedIsActive = customer.isActive ?? customer.isAcive ?? true;
                  return (
                    <tr key={customer.id || customer.customerId} className="group hover:bg-orange-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
                            {customer.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{customer.fullName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <MapPin size={12} className="text-gray-400" />
                              <span className="text-[11px] font-bold text-gray-500">{customer.address || 'لا يوجد عنوان مضاف'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Mail size={12} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-600">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="text-gray-400" />
                            <span className="text-[11px] font-bold text-gray-500">{customer.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-gray-700 tabular-nums">
                        {customer.nationalId}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-500 font-bold text-xs tabular-nums">
                          <Calendar size={12} />
                          {customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '---'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={resolvedIsActive ? 'success' : 'danger'}>
                          {resolvedIsActive ? 'نشط' : 'معطل'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedDetailsCustomer(customer);
                              setIsDetailsOpen(true);
                            }} 
                            title="عرض كامل بيانات العميل" 
                            className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                          {resolvedIsActive ? (
                            <button onClick={() => handleToggleStatus(customer)} title="تعطيل الحساب" className="p-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm cursor-pointer">
                              <XCircle size={16} />
                            </button>
                          ) : (
                            <button onClick={() => handleToggleStatus(customer)} title="تنشيط الحساب" className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm cursor-pointer">
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button onClick={() => handleOpenForm(customer)} className="p-2 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm cursor-pointer">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(customer)} className="p-2 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-red-600 hover:border-red-200 transition-all shadow-sm text-red-400 cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <EmptyState 
                      icon={<Users size={32} />}
                      title="لا توجد سجلات حالياً"
                      description="لم يتم العثور على أي عملاء أو مسافرين مسجلين يطابقون خيارات البحث."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={currentCustomer ? 'تحديث الملف الشخصي للعميل' : 'إضافة حساب عميل جديد'}
        subtitle="املأ النموذج بالوثائق والبيانات الدقيقة"
        icon={currentCustomer ? <Edit2 size={24}/> : <Plus size={24}/>}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="الاسم الكامل للمسافر" placeholder="الاسم الرباعي بالتفصيل" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
            <Input label="الرقم الوطني للهوية" placeholder="نظام الرقم الوطني 11 رقم" value={formData.nationalId} onChange={(e) => setFormData({...formData, nationalId: e.target.value})} required />
            
            <Input label="البريد الإلكتروني" type="email" placeholder="customer@mail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            {!currentCustomer && (
              <Input label="كلمة المرور المؤقتة" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            )}
            
            <Input label="رقم الهاتف الخلوي" placeholder="+9677........" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
            <Input label="تاريخ الميلاد" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} required />

            <div className="md:col-span-2">
              <Input label="العنوان السكني الحالي" placeholder="المحافظة - المديرية - المنطقة السكنية" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-100">
            <Button type="submit" isLoading={isSubmitting} className="flex-1 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-100">
              {currentCustomer ? 'حفظ التحديثات' : 'تأكيد الإضافة والإنشاء'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} className="px-12">إلغاء</Button>
          </div>
        </form>
      </Modal>

      {/* Customer Details Display Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="ملف بيانات المسافر المتكامل"
        subtitle="جميع البيانات الشخصية والتعريفية المسجلة في النظام"
        icon={<UserCheck size={24} className="text-orange-600" />}
        maxWidth="max-w-2xl"
      >
        {selectedDetailsCustomer && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 bg-orange-50/20 rounded-3xl">
              <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
                {selectedDetailsCustomer.fullName.charAt(0)}
              </div>
              <div className="text-center sm:text-right space-y-1">
                <h4 className="text-lg font-black text-gray-900">{selectedDetailsCustomer.fullName}</h4>
                <p className="text-xs font-bold text-gray-400">فئة المستخدم: مسافر / عميل تطبيق درب</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${
                    (selectedDetailsCustomer.isActive ?? selectedDetailsCustomer.isAcive ?? true)
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-red-50 text-red-600 border border-red-100"
                  }`}>
                    {(selectedDetailsCustomer.isActive ?? selectedDetailsCustomer.isAcive ?? true) ? 'نشط في النظام' : 'معطل مؤقتاً'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50/50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 mb-1">البريد الإلكتروني للعميل</p>
                <p className="text-xs font-black text-gray-800 break-all">{selectedDetailsCustomer.email}</p>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 mb-1">رقم الهاتف الخلوي</p>
                <p className="text-xs font-black text-gray-800 tabular-nums">{selectedDetailsCustomer.phone || 'غير مسجل'}</p>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 mb-1">الرقم الوطني للهوية</p>
                <p className="text-xs font-black text-gray-800 tabular-nums">{selectedDetailsCustomer.nationalId || 'غير مسجل'}</p>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 mb-1">تاريخ الميلاد</p>
                <p className="text-xs font-black text-gray-800 tabular-nums">
                  {selectedDetailsCustomer.dateOfBirth ? selectedDetailsCustomer.dateOfBirth.split('T')[0] : 'غير مدخل'}
                </p>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-2xl md:col-span-2">
                <p className="text-[10px] font-bold text-gray-400 mb-1">العنوان السكني بالتفصيل</p>
                <p className="text-xs font-black text-gray-800">{selectedDetailsCustomer.address || 'لم يتم تحديد عنوان'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between text-[11px] font-bold text-gray-500">
                <span>معرف المستخدم (User ID):</span>
                <span className="font-mono text-gray-700 tabular-nums">{selectedDetailsCustomer.userId || 'N/A'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between text-[11px] font-bold text-gray-500">
                <span>معرف العميل (Customer ID):</span>
                <span className="font-mono text-gray-700 tabular-nums">{selectedDetailsCustomer.customerId || selectedDetailsCustomer.id || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button type="button" variant="secondary" onClick={() => setIsDetailsOpen(false)} className="px-8 font-black">
                إغلاق النافذة
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
