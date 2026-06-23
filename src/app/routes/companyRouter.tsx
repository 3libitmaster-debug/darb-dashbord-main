import CompanyDashboard from '../../company/pages/CompanyDashboard';
import CompanyBuses from '../../company/pages/CompanyBuses';
import CompanyTrips from '../../company/pages/CompanyTrips';
import CompanyPendingBookings from '../../company/pages/CompanyPendingBookings';
import CompanyCancellations from '../../company/pages/CompanyCancellations';
import CompanyBankAccounts from '../../company/pages/CompanyBankAccounts';
import CompanyStations from '../../company/pages/CompanyStations';
import CompanyTripFares from '../../company/pages/CompanyTripFares';
import CompanyNotifications from '../../company/pages/CompanyNotifications';
import CompanyScanTicket from '../../company/pages/CompanyScanTicket';

/**
 * Company Role Routes Configuration
 * Cleanly isolates all routes that are dedicated to transportation providers/companies.
 */
export const companyRoutes = [
  { path: '/company', element: <CompanyDashboard /> },
  { path: '/company/buses', element: <CompanyBuses /> },
  { path: '/company/trips', element: <CompanyTrips /> },
  { path: '/company/pending-bookings', element: <CompanyPendingBookings /> },
  { path: '/company/cancellations', element: <CompanyCancellations /> },
  { path: '/company/bank-accounts', element: <CompanyBankAccounts /> },
  { path: '/company/stations', element: <CompanyStations /> },
  { path: '/company/trip-fares', element: <CompanyTripFares /> },
  { path: '/company/notifications', element: <CompanyNotifications /> },
  { path: '/company/scan-ticket', element: <CompanyScanTicket /> },
];

