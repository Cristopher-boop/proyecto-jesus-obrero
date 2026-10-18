import React, { useState } from 'react';
import { TRADICIONES_PARROQUIALES } from '../data/landingData';
import type { TradicionParroquial } from '../types';
import { Calendar, Check, Sparkles, X } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export const TradicionesEventosSection: React.FC = () => {
  const [modalTradicion, setModalTradicion] = useState<TradicionParroquial | null>(null);

  return (
    <section id="tradiciones" className="py-20 bg-lit-surface/20 border-t border-app-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lit-surface border border-lit-border text-lit-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-lit-accent" />
            <span>Fiestas, Arte & Solidaridad Parroquial</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-app-text tracking-tight">
            Grandes Tradiciones que Marcan Nuestro Año Litúrgico
          </h2>

          <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
            De la solidaridad de las históricas <strong>Colonias de Verano</strong> desde el 25 de diciembre,
            al esplendor artístico de <strong>Jesucristo SuperStar</strong>, la emoción de las <strong>Kermeses</strong>,
            la mística de las <strong>Oraciones Hakuna</strong> y la magna <strong>Vigilia Pascual de 3 horas</strong>.
          </p>
        </div>

        {/* Tarjetas de Tradiciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TRADICIONES_PARROQUIALES.map((trad) => (
            <div
              key={trad.id}
              className="bg-app-card rounded-3xl border border-app-border shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Marco de Imagen */}
                <div className="relative h-56 w-full overflow-hidden bg-lit-surface border-b border-app-border">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${trad.imagenUrl}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20">
                      {trad.etiqueta}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white/90 border border-white/20 flex items-center gap-1">
                    <span>📸</span>
                    <span>Espacio Foto</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[11px] text-lit-accent font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {trad.fecha}
                    </span>
                  </div>
                </div>

                {/* Contenido Editorial */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{trad.icono}</span>
                    <h3 className="font-serif text-xl font-bold text-app-text group-hover:text-lit-primary transition-colors leading-snug">
                      {trad.nombre}
                    </h3>
                  </div>

                  <p className="text-xs text-app-muted leading-relaxed line-clamp-3">
                    {trad.descripcion}
                  </p>

                  {/* Puntos Destacados */}
                  <div className="pt-2 space-y-1.5 border-t border-app-border/60">
                    {trad.destacados.slice(0, 2).map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-app-text/90">
                        <Check className="w-3.5 h-3.5 text-semantic-success flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón */}
              <div className="p-6 pt-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => setModalTradicion(trad)}
                >
                  Conocer más y ver fotos
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Extendido para Tradiciones */}
      {modalTradicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative bg-app-card rounded-3xl border border-app-border shadow-2xl max-w-xl w-full p-6 sm:p-8 z-10 animate-scaleUp overflow-y-auto max-h-[90vh] space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-app-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-lit-surface border border-lit-border text-2xl flex items-center justify-center">
                  {modalTradicion.icono}
                </div>
                <div>
                  <Badge variant="gold" size="sm">{modalTradicion.etiqueta}</Badge>
                  <h3 className="font-serif text-xl font-bold text-app-text mt-0.5">
                    {modalTradicion.nombre}
                  </h3>
                  <p className="text-xs text-lit-primary font-medium">{modalTradicion.fecha}</p>
                </div>
              </div>

              <button
                onClick={() => setModalTradicion(null)}
                className="p-1.5 rounded-xl text-app-muted hover:text-app-text hover:bg-lit-surface transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-52 w-full rounded-2xl overflow-hidden bg-lit-surface border border-lit-border">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${modalTradicion.imagenUrl}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white text-xs font-semibold">
                  Destinatarios: {modalTradicion.destinatarios}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-app-text uppercase tracking-wider">
                Reseña de la Tradición Parroquial:
              </h4>
              <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                {modalTradicion.descripcion}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-lit-surface/40 border border-lit-border space-y-2">
              <h5 className="text-xs font-bold text-app-text">Lo que la hace única:</h5>
              <div className="space-y-1.5">
                {modalTradicion.destacados.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-app-text/90">
                    <Check className="w-3.5 h-3.5 text-semantic-success flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-app-border">
              <Button variant="primary" size="sm" onClick={() => setModalTradicion(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TradicionesEventosSection;
