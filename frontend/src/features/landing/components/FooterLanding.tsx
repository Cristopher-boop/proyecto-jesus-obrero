import React from 'react';
import { MapPin, Phone, Mail, Clock, LogIn, Heart } from 'lucide-react';

interface FooterLandingProps {
  onGoToLogin: () => void;
}

export const FooterLanding: React.FC<FooterLandingProps> = ({ onGoToLogin }) => {
  return (
    <footer id="contacto" className="bg-app-card border-t border-app-border text-app-text transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Columna 1: Identidad Parroquial */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lit-surface border border-lit-border text-lit-primary flex items-center justify-center text-xl shadow-xs">
                ⛪
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-app-text">
                  Parroquia Jesús Obrero
                </h4>
                <p className="text-xs text-lit-primary font-medium">Una Iglesia viva y cercana</p>
              </div>
            </div>

            <p className="text-xs text-app-muted leading-relaxed">
              Comunidad de comunidades comprometida con el Evangelio, la iniciación sacramental de niños y jóvenes,
              la pastoral familiar y el servicio solidario con los más necesitados.
            </p>

            <div className="pt-2">
              <button
                onClick={onGoToLogin}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-lit-primary bg-lit-surface hover:bg-lit-surface/80 border border-lit-border transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Acceso al Portal Parroquial
              </button>
            </div>
          </div>

          {/* Columna 2: Nuestras 6 Capillas */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="font-serif text-sm font-bold text-app-text">
              Nuestras 6 Capillas
            </h5>
            <ul className="space-y-1.5 text-xs text-app-muted">
              <li>
                <strong className="text-app-text">1. Parroquia Jesús Obrero</strong> (Sede Central)
              </li>
              <li>2. Capilla Santa Teresa</li>
              <li>3. Capilla Señor de la Santa Cruz</li>
              <li>4. Capilla San Pablo</li>
              <li>5. Capilla Santa María Magdalena</li>
              <li>6. Capilla San Martín de Porres</li>
            </ul>
          </div>

          {/* Columna 3: Vida Pastoral & Comunidades */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="font-serif text-sm font-bold text-app-text">
              Vida Pastoral
            </h5>
            <ul className="space-y-1.5 text-xs text-app-muted">
              <li><a href="#ninez" className="hover:text-lit-primary transition-colors">FestiParábolas & Kairos</a></li>
              <li><a href="#juventud" className="hover:text-lit-primary transition-colors">E.J.E. & SICAR</a></li>
              <li><a href="#juventud" className="hover:text-lit-primary transition-colors">Comunidad Juvenil</a></li>
              <li><a href="#tradiciones" className="hover:text-lit-primary transition-colors">Colonias de Verano (25 Dic)</a></li>
              <li><a href="#tradiciones" className="hover:text-lit-primary transition-colors">Jesucristo SuperStar</a></li>
              <li><a href="#vocaciones" className="hover:text-lit-primary transition-colors">Vocaciones Consagradas</a></li>
            </ul>
          </div>

          {/* Columna 4: Secretaría y Contacto */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="font-serif text-sm font-bold text-app-text">
              Secretaría Parroquial
            </h5>
            <div className="space-y-2 text-xs text-app-muted">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-lit-primary flex-shrink-0 mt-0.5" />
                <span>Plaza Principal Jesús Obrero, Av. 16 de Julio</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-lit-primary flex-shrink-0" />
                <span>Atención: Martes a Sábado (09:00 - 12:30 / 15:00 - 18:30)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-lit-primary flex-shrink-0" />
                <span>Consultas e Intenciones: Despacho Parroquial</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-lit-primary flex-shrink-0" />
                <span>secretaria@jesusobrero.org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior de Derechos */}
        <div className="pt-8 border-t border-app-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-app-muted">
          <p>© {new Date().getFullYear()} Parroquia Jesús Obrero. Una sola familia en el amor de Dios.</p>
          <p className="flex items-center gap-1">
            <span>Servir al prójimo con amor y entrega</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterLanding;
