import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Banknote, Search, RefreshCw, AlertCircle, CheckCircle, 
  Plus, Edit3, Trash2, ShieldAlert, X, CreditCard, User, Landmark
} from 'lucide-react';
import CompanyLayout from '../components/CompanyLayout';
import { UserRole } from '../../types/auth';
import { useBankAccounts } from '../hooks/useBankAccounts';
import { BankAccount } from '../../types/models';
import { Button, Input } from '../../shared/components/FormElements';
import { Modal } from '../../shared/components/Modal';

export default function CompanyBankAccounts() {
  const { 
    accounts, 
    banks, 
    globalError, 
    isSubmitting,
    setGlobalError, 
    fetchAccounts,
    fetchBanks,
    addAccount,
    editAccount,
    removeAccount
  } = useBankAccounts();

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Modals visibility states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected account for edit or delete
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  // Form states and field errors
  const [addForm, setAddForm] = useState({ accountNumber: '', accountHolderName: '', bankId: 0 });
  const [editForm, setEditForm] = useState({ accountNumber: '', accountHolderName: '', bankId: 0 });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
    fetchBanks();
  }, [fetchAccounts, fetchBanks]);

  // Statistics calculation
  const totalAccounts = accounts.data?.length || 0;
  const distinctBanks = new Set(accounts.data?.map(acc => acc.bankId)).size;

  // Filtered List
  const filteredAccounts = (accounts.data || []).filter(acc => {
    const matchesSearch = 
      (acc.accountNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.accountHolderName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.bankName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Action handlers
  const handleOpenAdd = () => {
    setAddForm({ accountNumber: '', accountHolderName: '', bankId: banks.data?.[0]?.bankId || 0 });
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.accountNumber.trim()) {
      setFormError('يرجى إدخال رقم الحساب البنكي');
      return;
    }
    if (!addForm.accountHolderName.trim()) {
      setFormError('يرجى إدخال اسم صاحب الحساب البنكي');
      return;
    }
    if (addForm.bankId === 0) {
      setFormError('يرجى اختيار البنك المعني من قائمة البنوك المرخصة');
      return;
    }

    setFormError(null);
    const result = await addAccount({
      accountNumber: addForm.accountNumber.trim(),
      accountHolderName: addForm.accountHolderName.trim(),
      bankId: Number(addForm.bankId)
    });
    
    if (result.success) {
      setIsAddOpen(false);
    } else {
      setFormError(result.message || 'فشل تسجيل الحساب البنكي');
    }
  };

  const handleOpenEdit = (acc: BankAccount) => {
    setSelectedAccount(acc);
    setEditForm({
      accountNumber: acc.accountNumber || '',
      accountHolderName: acc.accountHolderName || '',
      bankId: acc.bankId || 0
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    if (!editForm.accountNumber.trim()) {
      setFormError('يرجى إدخال رقم الحساب البنكي الجديد');
      return;
    }
    if (!editForm.accountHolderName.trim()) {
      setFormError('يرجى إدخال اسم صاحب الحساب');
      return;
    }
    if (editForm.bankId === 0) {
      setFormError('يرجى اختيار البنك');
      return;
    }

    setFormError(null);
    const result = await editAccount(selectedAccount.bankAccountId, {
      accountNumber: editForm.accountNumber.trim(),
      accountHolderName: editForm.accountHolderName.trim(),
      bankId: Number(editForm.bankId)
    });

    if (result.success) {
      setIsEditOpen(false);
    } else {
      setFormError(result.message || 'فشل تحديث الحساب البنكي');
    }
  };

  const handleOpenDelete = (acc: BankAccount) => {
    setSelectedAccount(acc);
    setGlobalError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;
    const result = await removeAccount(selectedAccount.bankAccountId);
    if (result.success) {
      setIsDeleteOpen(false);
    }
  };

  const forceRefresh = () => {
    fetchAccounts();
    fetchBanks();
  };

  return (
    <CompanyLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full rtl animate-fade-in" dir="rtl">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-100 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Banknote className="text-orange-600 animate-pulse" size={32} />
              إدارة الحسابات البنكية
            </h1>
            <p className="text-gray-500 text-sm font-semibold">إدارة حسابات الشركة البنكية وتحصيل الإيرادات وجلب البنوك المرخصة</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={forceRefresh} 
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 rounded-2xl transition-all shadow-none flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <RefreshCw size={14} className={accounts.status === 'loading' ? 'animate-spin' : ''} />
              تحديث البيانات
            </button>
            <Button 
              onClick={handleOpenAdd}
              icon={<Plus size={16} />} 
              variant="primary"
              className="px-6 h-12 rounded-2xl text-xs font-black"
            >
              إضافة حساب بنكي جديد
            </Button>
          </div>
        </div>

        {/* Global Error Display */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold shadow-sm">
            <ShieldAlert size={16} className="shrink-0" /> 
            <span>{globalError}</span>
          </div>
        )}

        {/* Fleet KPI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">إجمالي الحسابات البنكية</p>
              <h3 className="text-4xl font-black text-gray-900 tabular-nums leading-none mt-1">
                {accounts.status === 'loading' ? '...' : totalAccounts}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <CreditCard size={22} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">عدد البنوك المرتبطة</p>
              <h3 className="text-4xl font-black text-emerald-600 tabular-nums leading-none mt-1">
                {accounts.status === 'loading' ? '...' : distinctBanks}
              </h3>
            </div>
            <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <Landmark size={22} />
            </div>
          </motion.div>
        </div>

        {/* Toolbar (Search) */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-3xl shadow-sm mb-8">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث برقم الحساب، اسم صاحب الحساب، أو البنك..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-550 transition-all outline-none"
            />
          </div>
        </div>

        {/* Banks Directory Table View */}
        {accounts.status === 'loading' ? (
          <div id="accounts-skeleton-loader" className="bg-white rounded-[2rem] p-8 shadow-sm space-y-4 animate-pulse">
            <div className="h-6 bg-gray-100 rounded-lg w-1/4 mb-6"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl w-full"></div>
            ))}
          </div>
        ) : filteredAccounts.length > 0 ? (
          <div id="accounts-table-container" className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 font-bold text-xs select-none">
                    <th id="th-acc-id" className="p-5 font-black">رمز الحساب</th>
                    <th id="th-bank" className="p-5 font-black">البنك</th>
                    <th id="th-holder" className="p-5 font-black">اسم صاحب الحساب</th>
                    <th id="th-number" className="p-5 font-black">رقم الحساب البنكي</th>
                    <th id="th-actions" className="p-5 font-black text-left">خيارات التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAccounts.map((acc, i) => (
                    <motion.tr 
                      key={acc.bankAccountId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50/50 transition-colors text-xs text-gray-700"
                    >
                      {/* Code */}
                      <td className="p-5 font-black text-gray-900"># ACC-{acc.bankAccountId}</td>
                      
                      {/* Bank Identification */}
                      <td className="p-5 font-bold text-gray-900 flex items-center gap-2">
                        <div className="h-7 w-7 bg-orange-100 text-orange-605 rounded-lg flex items-center justify-center font-bold">
                          <Landmark size={14} />
                        </div>
                        {acc.bankName || '---'}
                      </td>
                      
                      {/* Holder Name */}
                      <td className="p-5 font-bold text-gray-650">{acc.accountHolderName}</td>
                      
                      {/* Account Number */}
                      <td className="p-5">
                        <span className="font-extrabold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-mono tracking-wider select-all leading-none inline-block">
                          {acc.accountNumber}
                        </span>
                      </td>

                      {/* Action buttons (Modifying/Deleting) */}
                      <td className="p-5 text-left flex items-center justify-end gap-2">
                        {/* Edit button */}
                        <button 
                          onClick={() => handleOpenEdit(acc)}
                          title="تعديل تفاصيل الحساب"
                          className="p-2.5 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Delete button */}
                        <button 
                          onClick={() => handleOpenDelete(acc)}
                          title="حذف الحساب"
                          className="p-2.5 rounded-xl border border-red-150 text-red-600 bg-red-50/50 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center cursor-pointer-none hover:scale-105 active:scale-95"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div id="accounts-empty-state" className="py-24 text-center border-2 border-dashed border-gray-150 rounded-[2rem] bg-white">
            <ShieldAlert size={40} className="mx-auto text-gray-300 mb-4 animate-bounce" />
            <h4 className="text-base font-bold text-gray-500">لا توجد حسابات بنكية مسجلة</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">ابدأ بتهيئة أول حساب بنكي لتحصيل مدفوعات الركاب</p>
          </div>
        )}

        {/* ======================================= */}
        {/* MODAL 1: ADD BANK ACCOUNT */}
        {/* ======================================= */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="ربط حساب بنكي جديد"
          subtitle="تسجيل الحساب البنكي لاستقبال الحوالات المالية وإثبات الإيرادات"
          icon={<CreditCard size={24} />}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreate} className="space-y-6">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Bank Select List (وعند الاضافة يجب جدب البنوك من نقطة المسؤول) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
                البنك الشريك المستضيف للحساب
              </label>
              {banks.status === 'loading' ? (
                <div className="h-12 bg-gray-100 rounded-2xl animate-pulse"></div>
              ) : banks.data && banks.data.length > 0 ? (
                <select 
                  value={addForm.bankId}
                  onChange={(e) => setAddForm(prev => ({ ...prev, bankId: parseInt(e.target.value) || 0 }))}
                  className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800"
                >
                  <option value={0} disabled>-- اختر من قائمة البنوك المرخصة --</option>
                  {banks.data.map(b => (
                    <option key={b.bankId} value={b.bankId}>
                      {b.bankName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold">
                  لا توجد بنوك مسجلة مسبقاً في النظام من قبل المسؤول.
                </div>
              )}
            </div>

            <Input 
              label="رقم حساب الآيبان / الحساب المصرفي"
              placeholder="مثال: YA8273648174..."
              value={addForm.accountNumber}
              onChange={(e) => setAddForm(prev => ({ ...prev, accountNumber: e.target.value }))}
              maxLength={50}
            />

            <Input 
              label="اسم صاحب الحساب بالكامل"
              placeholder="مثال: شركة درب لخدمات النقل المحدودة..."
              value={addForm.accountHolderName}
              onChange={(e) => setAddForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
              maxLength={150}
            />

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSubmitting}
                className="flex-1"
                disabled={banks.data?.length === 0}
              >
                تأكيد وإضافة الحساب
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsAddOpen(false)}
                className="px-6"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Modal>

        {/* ======================================= */}
        {/* MODAL 2: EDIT BANK ACCOUNT */}
        {/* ======================================= */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="تعديل الحساب البنكي"
          subtitle="تغيير معلومات وجلب تفاصيل الحساب الجديد"
          icon={<Edit3 size={24} />}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdate} className="space-y-6">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-650 text-xs font-bold">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Bank Select List */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">
                البنك المستضيف
              </label>
              <select 
                value={editForm.bankId}
                onChange={(e) => setEditForm(prev => ({ ...prev, bankId: parseInt(e.target.value) || 0 }))}
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-550 transition-all outline-none font-bold text-gray-800"
              >
                {banks.data?.map(b => (
                  <option key={b.bankId} value={b.bankId}>
                    {b.bankName}
                  </option>
                ))}
              </select>
            </div>

            <Input 
              label="رقم حساب المصرفي"
              placeholder="مثال: YA8273648174..."
              value={editForm.accountNumber}
              onChange={(e) => setEditForm(prev => ({ ...prev, accountNumber: e.target.value }))}
              maxLength={50}
            />

            <Input 
              label="اسم صاحب الحساب الجديد"
              placeholder="مثال: شركة درب لخدمات النقل المحدودة..."
              value={editForm.accountHolderName}
              onChange={(e) => setEditForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
              maxLength={150}
            />

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSubmitting}
                className="flex-1"
              >
                تحديث الحساب
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsEditOpen(false)}
                className="px-6"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Modal>

        {/* ======================================= */}
        {/* MODAL 3: CONFIRM DELETE BANK ACCOUNT */}
        {/* ======================================= */}
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="حذف الحساب البنكي"
          subtitle="طلب تأكيد الحذف النهائي"
          icon={<Trash2 size={24} />}
          maxWidth="max-w-md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-650 text-xs font-bold leading-relaxed">
              <ShieldAlert size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold mb-1">تنبيه أمان وحذف!</p>
                <p className="font-medium text-gray-650">
                  هل أنت متأكد من رغبتك بالقيام بحذف الحساب البنكي رقم <strong className="text-red-750 font-extrabold select-all">({selectedAccount?.accountNumber})</strong> التابع لبنك <strong>({selectedAccount?.bankName})</strong> بشكل نهائي من سجلات الشركة؟ لن يتمكن العملاء من سداد المستحقات على هذا الرقم بعد الآن.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-8">
              <Button 
                onClick={handleDelete} 
                variant="danger" 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black"
              >
                تأكيد حذف الحساب
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsDeleteOpen(false)}
                className="px-6"
              >
                إلغاء التراجع
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </CompanyLayout>
  );
}
