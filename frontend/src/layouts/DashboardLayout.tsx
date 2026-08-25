import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { ToastContainer } from '../components/common/ToastContainer';
import { useAuth } from '../context/AuthContext';
import { isGuestAllowedPath } from '../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isGuest, enterGuestMode } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  // Auto-enter guest mode for discover routes when not logged in
  useEffect(() => {
    if (!isAuthenticated && isGuestAllowedPath(location.pathname)) {
      enterGuestMode();
    }
  }, [isAuthenticated, location.pathname, enterGuestMode]);

  // Auto-close mobile sidebar and scroll main container to top on route navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
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
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
