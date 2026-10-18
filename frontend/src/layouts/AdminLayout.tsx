/**
 * AdminLayout.tsx — Layout Administrativo Principal.
 * 
 * Gestiona el estado de apertura/cierre del Sidebar y la navegación responsiva.
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab = 'dashboard',
  onTabChange,
}) => {
  // En pantallas grandes (> 1024px) inicia abierto; en tablets y celulares (< 1024px) inicia cerrado
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Ajustar responsivamente al redimensionar la ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-row overflow-x-hidden">
      {/* Sidebar Colapsable / Drawer */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          onOpenFullCalendar={() => {
            if (onTabChange) {
              onTabChange('calendario');
            }
          }}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
