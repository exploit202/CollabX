import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { ToastContainer } from '../components/common/ToastContainer';
import { useAuth } from '../context/AuthContext';
import { isGuestAllowedPath } from '../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isGuest, enterGuestMode } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-enter guest mode for discover routes when not logged in
  useEffect(() => {
    if (!isAuthenticated && isGuestAllowedPath(location.pathname)) {
      enterGuestMode();
    }
  }, [isAuthenticated, location.pathname, enterGuestMode]);

  // Auto-close mobile sidebar when navigating
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated && !isGuestAllowedPath(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isGuest && !isGuestAllowedPath(location.pathname)) {
    return <Navigate to="/brand/discover" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900 font-sans">
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
