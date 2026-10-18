import { ArrowRight, Calendar, Church, Heart, Sparkles, Users, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';

interface HeroLandingProps {
  onGoToLogin: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ onGoToLogin }) => {
  return (
    <section id="inicio" className="relative pt-32 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-app-bg transition-colors">
      {/* Resplandor ambiental litúrgico difuso */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-lit-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-lit-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ─── Columna Izquierda: Mensaje Editorial y Propósito ─── */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Badge de Identidad Parroquial */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lit-surface border border-lit-border text-lit-primary text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-lit-accent flex-shrink-0" />
              <span>Nuestra Familia Parroquial</span>
              <span className="w-1.5 h-1.5 rounded-full bg-lit-primary" />
              <span className="text-app-muted">6 Capillas Hermanas en Comunión</span>
            </div>

            {/* Título Principal de Impacto */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-app-text tracking-tight leading-[1.15]">
              Una Iglesia viva, fraterna y misionera al servicio del{' '}
              <span className="text-lit-primary italic underline decoration-lit-accent/40 decoration-wavy decoration-2">
                Pueblo de Dios
              </span>
            </h1>

            {/* Subtítulo Descriptivo y Pastoral */}
            <p className="text-sm sm:text-base text-app-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Bienvenido a la <strong>Parroquia Jesús Obrero</strong>. Somos una comunidad de comunidades
              donde celebramos la fe con alegría, acompañamos a los niños en su <em>Primera Comunión</em>,
              impulsamos a los jóvenes con <em>E.J.E., SICAR y la Comunidad Juvenil</em>,
              y abrimos los brazos con nuestras emblemáticas <em>Colonias de Verano</em>, obras de teatro y fiestas comunitarias.
            </p>

            {/* Botones de Acción / CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <a href="#capillas" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Nuestras 6 Capillas
                </Button>
              </a>

              <a href="#ninez" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  Vida & Actividades
                </Button>
              </a>

              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto text-lit-primary hover:bg-lit-surface"
                onClick={onGoToLogin}
              >
                Ingreso al Portal →
              </Button>
            </div>

            {/* Sellos de Identidad Pastoral */}
            <div className="pt-6 border-t border-app-border/80 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2">
                <Church className="w-4 h-4 text-lit-primary flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-app-text block">6 Capillas</span>
                  <span className="text-[10px] text-app-muted block">Una sola fe</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-lit-primary flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-app-text block">+1000 Fieles</span>
                  <span className="text-[10px] text-app-muted block">Comunidad activa</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-lit-primary flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-app-text block">50+ Años</span>
                  <span className="text-[10px] text-app-muted block">Amor y servicio</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Columna Derecha: Mosaico Fotográfico Parroquial ─── */}
          <div className="lg:col-span-5 relative">
            {/* Marco de Imagen Principal */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-lit-border shadow-2xl bg-app-card group">
              {/* Fotografía del Templo Central */}
              <div
                className="h-96 sm:h-[450px] w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('/fondo_login_5.webp')` }}
              >
                {/* Overlay Litúrgico Degradado */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              </div>

              {/* Contenido flotante inferior dentro de la foto */}
              <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-lit-primary text-white text-[11px] font-bold tracking-wider uppercase shadow-xs">
                  Sede Central · Jesús Obrero
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                  Templo Parroquial Jesús Obrero
                </h3>
                <p className="text-xs text-white/85 line-clamp-2">
                  Punto de encuentro, oración y caridad evangélica que irradia vida a nuestras 6 capillas filiales.
                </p>
              </div>

              {/* Indicador de Espacio para Foto Oficial */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] text-white/95 border border-white/20 flex items-center gap-1.5 shadow-sm">
                <span>📸</span>
                <span>Foto Oficial del Templo</span>
              </div>
            </div>

            {/* Tarjeta Flotante 1: Colonias de Verano (Inferior Izquierda) */}
            <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-app-card/95 backdrop-blur-md p-4 rounded-2xl border border-app-border shadow-xl items-center gap-3 max-w-xs animate-fadeIn">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-center text-2xl flex-shrink-0">
                ☀️
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-app-text block font-serif">
                  Colonias de Verano
                </span>
                <p className="text-[11px] text-app-muted leading-tight">
                  Desde el 25 de diciembre: 4 a 5 días de amor, talleres y juegos con jóvenes monitores.
                </p>
              </div>
            </div>

            {/* Tarjeta Flotante 2: Acreditación QR (Superior Derecha) */}
            <div className="hidden sm:flex absolute -top-5 -right-5 bg-app-card/95 backdrop-blur-md p-3.5 rounded-2xl border border-app-border shadow-xl items-center gap-2.5 max-w-[210px] animate-fadeIn">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-center justify-center text-lg flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-app-text block">
                  Asistencia con QR
                </span>
                <span className="text-[10px] text-app-muted block">
                  Seguimiento dominical digital
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroLanding;
