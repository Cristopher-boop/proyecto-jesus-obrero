import { useState } from 'react';
import { AuthProvider, useAuth } from './core/context/AuthContext';
import { LiturgicalThemeProvider } from './core/context/ThemeContext';
import LoginPage from './features/auth/pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage     from './features/dashboard/pages/DashboardPage';
import CatecumenosPage   from './features/catecumenos/pages/CatecumenosPage';
import FeligresesPage    from './features/feligreses/pages/FeligresesPage';
import FeligresPortalPage from './features/feligreses/pages/FeligresPortalPage';
import AsistenciaPage     from './features/asistencia/pages/AsistenciaPage';
import CalendarioPage     from './features/calendario/pages/CalendarioPage';
import CapillasPage       from './features/capillas/pages/CapillasPage';

function MainContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lit-primary mx-auto"></div>
          <p className="mt-4 text-app-muted font-semibold text-sm">Cargando Parroquia Jesús Obrero...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Si el usuario tiene rol TUTOR (feligrés), mostrar su portal exclusivo de padre de familia
  if (user?.rol === 'TUTOR') {
    return <FeligresPortalPage />;
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard'   && <DashboardPage />}
      {activeTab === 'asistencia'  && <AsistenciaPage />}
      {activeTab === 'catecumenos' && <CatecumenosPage />}
      {activeTab === 'feligreses'  && <FeligresesPage />}
      {activeTab === 'calendario'  && <CalendarioPage />}
      {activeTab === 'capillas'    && <CapillasPage />}
      {!['dashboard', 'asistencia', 'catecumenos', 'feligreses', 'calendario', 'capillas'].includes(activeTab) && (
        <div className="bg-app-card p-12 rounded-2xl border border-app-border text-center shadow-xs">
          <span className="text-4xl">🚧</span>
          <h3 className="text-lg font-bold text-app-text mt-3">Módulo en Desarrollo</h3>
          <p className="text-xs text-app-muted mt-1">Esta sección se conectará en los próximos pasos.</p>
        </div>
      )}
    </AdminLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <LiturgicalThemeProvider>
        <MainContent />
      </LiturgicalThemeProvider>
    </AuthProvider>
  );
}

export default App;
