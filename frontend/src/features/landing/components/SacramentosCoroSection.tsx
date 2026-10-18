import React from 'react';
import { SACRAMENTOS_INFO, MINISTERIO_CORO } from '../data/landingData';
import { BookOpen, CheckCircle2, Music, QrCode, ShieldCheck } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const SacramentosCoroSection: React.FC = () => {
  return (
    <section id="sacramentos" className="py-20 bg-app-bg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lit-surface border border-lit-border text-lit-primary text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-lit-accent" />
            <span>Vida Sacramental & Animación Litúrgica</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-app-text tracking-tight">
            Sacramentos y Alabanza a Dios
          </h2>

          <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
            Celebramos la gracia divina a través de los Santos Sacramentos de la Iglesia,
            acompañados por la armonía y las voces vivas de nuestro Ministerio de Coro.
          </p>
        </div>

        {/* Cuadrícula de Sacramentos (5 Sacramentos mencionados por el usuario) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SACRAMENTOS_INFO.map((sac) => (
            <div
              key={sac.id}
              className="bg-app-card rounded-3xl border border-app-border p-6 sm:p-7 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-lit-surface border border-lit-border text-2xl flex items-center justify-center shadow-2xs">
                  {sac.icono}
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-app-text">
                    {sac.nombre}
                  </h3>
                  <span className="text-xs font-semibold text-lit-primary block mt-0.5">
                    {sac.duracion}
                  </span>
                  <span className="text-[11px] text-app-muted block mt-0.5">
                    {sac.destinatarios}
                  </span>
                </div>

                <p className="text-xs text-app-muted leading-relaxed">
                  {sac.descripcion}
                </p>

                {/* Requisitos */}
                <div className="pt-3 border-t border-app-border space-y-2">
                  <span className="text-[11px] font-bold text-app-text block uppercase tracking-wider">
                    Requisitos principales:
                  </span>
                  <div className="space-y-1.5">
                    {sac.requisitos.map((req, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-app-text/90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-app-border text-[11px] text-app-muted flex items-center justify-between">
                <span>Secretaría Parroquial</span>
                <Badge variant="gold" size="sm">Disponible</Badge>
              </div>
            </div>
          ))}

          {/* Tarjeta 6: Módulo Destacado del Ministerio de Coro */}
          <div className="bg-gradient-to-br from-lit-surface via-app-card to-lit-surface/80 rounded-3xl border-2 border-lit-border p-6 sm:p-7 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-lit-primary text-white text-2xl flex items-center justify-center shadow-md">
                <Music className="w-6 h-6 text-white" />
              </div>

              <div>
                <Badge variant="gold" size="sm">Música Litúrgica</Badge>
                <h3 className="font-serif text-xl font-bold text-app-text mt-1">
                  {MINISTERIO_CORO.nombre}
                </h3>
                <span className="text-xs font-serif italic text-lit-primary block mt-0.5">
                  {MINISTERIO_CORO.lema}
                </span>
              </div>

              <p className="text-xs text-app-muted leading-relaxed">
                {MINISTERIO_CORO.descripcion}
              </p>

              <div className="pt-2 border-t border-app-border space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-app-text block">Instrumentos litúrgicos:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {MINISTERIO_CORO.instrumentos.map((inst, i) => (
                      <span key={i} className="text-[10px] bg-app-card px-2 py-0.5 rounded-md border border-app-border text-app-muted">
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-lit-primary font-medium pt-1">
                  Ensayos: {MINISTERIO_CORO.ensayos}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-app-border text-[11px] text-app-muted flex items-center justify-between">
              <span>¿Tocas o cantas?</span>
              <span className="font-bold text-lit-primary">¡Únete al Coro!</span>
            </div>
          </div>
        </div>

        {/* Banner de Asistencia Digital con Código QR */}
        <div className="rounded-3xl bg-lit-surface border border-lit-border p-6 sm:p-8 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-card border border-app-border text-xs font-semibold text-lit-primary">
                <QrCode className="w-3.5 h-3.5 text-lit-accent" />
                <span>Innovación Tecnológica con Sentido Pastoral</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-app-text">
                Control y Seguimiento de Asistencia con Código QR
              </h3>

              <p className="text-xs sm:text-sm text-app-muted leading-relaxed max-w-2xl">
                Cada catecúmeno de Primera Comunión y Confirmación cuenta con su credencial digital provista de un código QR.
                Al ingresar a la Santa Misa o al Encuentro, los catequistas escanean en segundos, permitiendo a los padres
                conocer de manera transparente la puntualidad y perseverancia de sus hijos domingo a domingo.
              </p>
            </div>

            <div className="md:col-span-4 flex items-center justify-center">
              <div className="bg-app-card p-5 rounded-2xl border border-app-border shadow-md text-center space-y-2 max-w-xs w-full">
                <div className="w-14 h-14 mx-auto bg-lit-surface rounded-2xl flex items-center justify-center text-3xl border border-lit-border">
                  📱
                </div>
                <span className="text-xs font-bold text-app-text block font-serif">
                  Acreditación Segura
                </span>
                <p className="text-[11px] text-app-muted leading-tight">
                  Lectura instantánea de asistencia para niños y jóvenes en las 6 capillas.
                </p>
                <div className="pt-1">
                  <Badge variant="success" size="sm">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Marcación Rápida
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SacramentosCoroSection;
