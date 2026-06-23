import AdminDashboard from '../../admin/pages/AdminDashboard';
import CompanyManagement from '../../admin/pages/CompanyManagement';
import PendingCompanies from '../../admin/pages/PendingCompanies';
import PendingSubscriptions from '../../admin/pages/PendingSubscriptions';
import Advertisements from '../../admin/pages/Advertisements';
import CustomerManagement from '../../admin/pages/CustomerManagement';
import Maintenance from '../../admin/pages/Maintenance';
import Complaints from '../../admin/pages/Complaints';

/**
 * Admin Role Routes Configuration
 * Cleanly isolates all routes that are dedicated to users with Admin privileges.
 */
export const adminRoutes = [
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/companies', element: <CompanyManagement /> },
  { path: '/admin/pending-companies', element: <PendingCompanies /> },
  { path: '/admin/pending-subscriptions', element: <PendingSubscriptions /> },
  { path: '/admin/advertisements', element: <Advertisements /> },
  { path: '/admin/users', element: <CustomerManagement /> },
  { path: '/admin/customers', element: <CustomerManagement /> },
  { path: '/admin/tickets', element: <AdminDashboard /> },
  { path: '/admin/maintenance', element: <Maintenance /> },
  { path: '/admin/complaints', element: <Complaints /> },
];

