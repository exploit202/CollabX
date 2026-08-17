import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { ToastContainer } from '../components/common/ToastContainer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-pink-100 selection:text-pink-600">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
};
