import { useState, useCallback, useEffect } from 'react';
import { AdminService } from '../../shared/api/services/admin.service';

export interface DashboardStats {
  newRegistrationsCount: number;
  renewalRequestsCount: number;
  totalCustomersCount: number;
  activeAdsCount: number;
}

export function useAdminDashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    newRegistrationsCount: 0,
    renewalRequestsCount: 0,
    totalCustomersCount: 0,
    activeAdsCount: 0
  });

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AdminService.getDashboardStats();
      if (response.data.success && response.data.data) {
        setStats({
          newRegistrationsCount: response.data.data.newRegistrationsCount || 0,
          renewalRequestsCount: response.data.data.renewalRequestsCount || 0,
          totalCustomersCount: response.data.data.totalCustomersCount || 0,
          activeAdsCount: response.data.data.activeAdsCount || 0
        });
      } else {
        setError(response.data.message || 'فشل جلب إحصائيات لوحة التحكم');
      }
    } catch (err: any) {
      console.error(err);
      setError('تفاجأ النظام بخطأ أثناء جلب مؤشرات النظام الحية');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats
  };
}

