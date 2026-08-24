import React from 'react';
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
  return (
    <div className="min-h-screen bg-app-bg flex flex-row">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
