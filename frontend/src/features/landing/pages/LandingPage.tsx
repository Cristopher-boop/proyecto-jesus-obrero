import React from 'react';
import NavbarLanding from '../components/NavbarLanding';
import HeroLanding from '../components/HeroLanding';
import StatsBar from '../components/StatsBar';
import CapillasHorariosLanding from '../components/CapillasHorariosLanding';
import CatequesisNinezSection from '../components/CatequesisNinezSection';
import ConfirmacionJuventudSection from '../components/ConfirmacionJuventudSection';
import ComunidadesVidaSection from '../components/ComunidadesVidaSection';
import TradicionesEventosSection from '../components/TradicionesEventosSection';
import SacramentosCoroSection from '../components/SacramentosCoroSection';
import VocacionesMayorSection from '../components/VocacionesMayorSection';
import HistoriaSection from '../components/HistoriaSection';
import FooterLanding from '../components/FooterLanding';

interface LandingPageProps {
  onGoToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  return (
    <div className="min-h-screen bg-app-bg text-app-text transition-colors scroll-smooth selection:bg-lit-primary selection:text-white">
      {/* 1. Barra de Navegación con Notificador Litúrgico */}
      <NavbarLanding onGoToLogin={onGoToLogin} />

      {/* 2. Hero Principal con Mosaico Visual e Identidad Parroquial */}
      <main>
        <HeroLanding onGoToLogin={onGoToLogin} />

        {/* 3. Cifras Reales de Impacto y Vida de Fe */}
        <StatsBar />

        {/* 4. Red de las 6 Capillas y Horarios Reales Dominicales */}
        <CapillasHorariosLanding />

        {/* 5. Primera Comunión: FestiParábolas, Campamento Urbano, Bailes y Grupo Kairos */}
        <CatequesisNinezSection />

        {/* 6. Confirmación & Juventud: E.J.E., SICAR y Comunidad Juvenil (Campamento, San Juan, Disfraces) */}
        <ConfirmacionJuventudSection />

        {/* 7. Comunidades de Vida: Jóvenes Adultos (+25) y Adultos Mayores */}
        <ComunidadesVidaSection />

        {/* 8. Grandes Tradiciones: Colonias de Verano (25 Dic), Jesucristo SuperStar, Kermeses, Hakuna, Copacabana, Pascua 3h */}
        <TradicionesEventosSection />

        {/* 9. Sacramentos (Bautismos, Comuniones, Confirmaciones, Matrimonios, Confesión) + Ministerio de Coro + Asistencia QR */}
        <SacramentosCoroSection />

        {/* 10. Formaciones a un Nivel Mayor: Misioneros de Cristo Pastor (Chile) y Salesianas Misioneras (Cochabamba) */}
        <VocacionesMayorSection />

        {/* 11. Raíces Históricas, Padre Pepe Fuentes y Carisma Obrero */}
        <HistoriaSection />
      </main>

      {/* 12. Pie de Página Completo con Mapa de Capillas y Contacto */}
      <FooterLanding onGoToLogin={onGoToLogin} />
    </div>
  );
};

export default LandingPage;
