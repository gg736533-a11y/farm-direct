import React, { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import FarmerSidebar from './FarmerSidebar';
import FarmerHeader from './FarmerHeader';
import Toast from './Toast';

// Context to allow pages to trigger toasts easily
export const FarmerToastContext = createContext({
  showToast: () => {}
});

export const useFarmerToast = () => useContext(FarmerToastContext);

export default function FarmerDashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (toastData) => {
    setToast(toastData);
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToast((curr) => (curr === toastData ? null : curr));
    }, 4000);
  };

  const handleLogoutClick = (toastData) => {
    showToast(toastData);
  };

  return (
    <FarmerToastContext.Provider value={{ showToast }}>
      <div className="min-h-screen bg-slate-50/70 font-sans text-slate-900 antialiased selection:bg-emerald-200 selection:text-forest-950">
        {/* Sidebar */}
        <FarmerSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onLogoutClick={handleLogoutClick}
        />

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Header */}
          <FarmerHeader
            onMobileMenuToggle={() => setMobileSidebarOpen(true)}
            onShowToast={showToast}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>

        {/* Global Action Toast */}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </FarmerToastContext.Provider>
  );
}
