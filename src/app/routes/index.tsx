import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import LoginPage from '../../shared/pages/Login';
import RegisterPage from '../../shared/pages/Register';

import { adminRoutes } from './adminRouter';
import { companyRoutes } from './companyRouter';
import { UserRole } from '../../types/auth';

/**
 * Main Application Routing Index
 * Dynamic clean-routing setup separating routes based on user roles (Admin & Company).
 * Built according to modular best practices to maintain simple single points of control.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* 
        Publicly Accessible Routes
        These routes check for existing active credentials or sessions.
      */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* 
        Protected Admin Routes
        Guarded. Accessible only by accounts with 'Admin' roles.
      */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.Admin]} />}>
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* 
        Protected Company/Vendor Routes
        Guarded. Accessible only by transportation service providers ('Company').
      */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.Company]} />}>
        {companyRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* 
        Fallback / Error Handling Routes
        Handles unauthenticated or unauthorized views and dead URLs gracefully.
      */}
      <Route path="/unauthorized" element={
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col gap-4">
          <h1 className="text-4xl font-bold text-gray-900 leading-none mr-2">403</h1>
          <p className="text-gray-550 font-semibold tracking-tight text-center">ليس لديك صلاحية للوصول إلى هذه الصفحة.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition animate-fade-in"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      } />
      
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

