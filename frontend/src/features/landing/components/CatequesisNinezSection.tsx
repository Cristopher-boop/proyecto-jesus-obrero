import React, { useState } from 'react';
import { ACTIVIDADES_NINEZ } from '../data/landingData';
import type { ActividadNinez } from '../types';
import { Sparkles, Calendar, Check, X } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export const CatequesisNinezSection: React.FC = () => {
  const [modalActividad, setModalActividad] = useState<ActividadNinez | null>(null);

  return (
    <section id="ninez" className="py-20 bg-app-bg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Cabecera de la Sección */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lit-surface border border-lit-border text-lit-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-lit-accent" />
            <span>Semillero de Fe · Primera Comunión & Kairos</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-app-text tracking-tight">
            El Camino de la Niñez y la Alegría del Evangelio
          </h2>

          <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
            Acompañamos a los más pequeños en su preparación para recibir a Jesús en la Eucaristía, fomentando
            la vivencia comunitaria a través del arte bíblico, campamentos vivenciales y el perseverante Grupo Kairos.
          </p>
        </div>

        {/* Cuadrícula de Actividades de Niñez */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACTIVIDADES_NINEZ.map((act) => (
            <div
              key={act.id}
              className="bg-app-card rounded-3xl border border-app-border shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Marco de Imagen */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-lit-surface border-b border-app-border">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${act.imagenUrl}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>

                  {/* Badge de Etiqueta Flotante */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20">
                      {act.etiqueta}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white/90 border border-white/20 flex items-center gap-1">
                    <span>📸</span>
                    <span>Foto Oficial</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1 text-[11px] text-lit-accent font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{act.temporada}</span>
                    </div>
                  </div>
                </div>

                {/* Contenido Editorial */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label="Icono">{act.icono}</span>
                    <h3 className="font-serif text-lg font-bold text-app-text group-hover:text-lit-primary transition-colors leading-tight">
                      {act.titulo}
                    </h3>
                  </div>

                  <p className="text-xs text-lit-primary font-medium italic">
                    {act.subtitulo}
                  </p>

                  <p className="text-xs text-app-muted leading-relaxed line-clamp-3">
                    {act.descripcion}
                  </p>

                  {/* Puntos destacados */}
                  <div className="pt-2 space-y-1.5 border-t border-app-border/60">
                    {act.detalles.slice(0, 2).map((det, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-app-text/90">
                        <Check className="w-3.5 h-3.5 text-semantic-success flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{det}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón de Expansión */}
              <div className="p-5 pt-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => setModalActividad(act)}
                >
                  Conocer más detalles
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Destacado Especial: Kairos & Campamento Urbano en Sinopsis */}
        <div className="rounded-3xl bg-lit-surface/50 border border-lit-border p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <span className="text-xs font-bold text-lit-primary uppercase tracking-wider block">
                La Gran Alianza de las Edades
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-app-text">
                Jóvenes que guían a los niños con amor
              </h3>
              <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                Tanto en el <strong>Campamento Urbano</strong> como en las <strong>Colonias de Verano</strong>,
                son los jóvenes de 1er y 2do año de Confirmación junto a la <strong>Comunidad Juvenil</strong> quienes
                preparan las dinámicas, cuidan a los niños y les transmiten la alegría de pertenecer a la Iglesia.
              </p>
            </div>

            <div className="bg-app-card p-5 rounded-2xl border border-app-border space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏳</span>
                <div>
                  <h4 className="text-sm font-bold text-app-text">¿Qué es el Grupo Kairos?</h4>
                  <span className="text-[11px] text-lit-primary">El tiempo de Dios para crecer</span>
                </div>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Kairos reúne a niños y adolescentes tras su Primera Comunión. No se desvinculan de la iglesia:
                participan en misas, encuentros de amistad y dinámicas mientras cumplen la edad para ingresar a Confirmación.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Extendido para Niñez */}
      {modalActividad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative bg-app-card rounded-3xl border border-app-border shadow-2xl max-w-xl w-full p-6 sm:p-8 z-10 animate-scaleUp overflow-y-auto max-h-[90vh] space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-app-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-lit-surface border border-lit-border text-2xl flex items-center justify-center">
                  {modalActividad.icono}
                </div>
                <div>
                  <Badge variant="gold" size="sm">{modalActividad.etiqueta}</Badge>
                  <h3 className="font-serif text-xl font-bold text-app-text mt-0.5">
                    {modalActividad.titulo}
                  </h3>
                  <p className="text-xs text-lit-primary italic">{modalActividad.subtitulo}</p>
                </div>
              </div>

              <button
                onClick={() => setModalActividad(null)}
                className="p-1.5 rounded-xl text-app-muted hover:text-app-text hover:bg-lit-surface transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Foto de Cabecera en Modal */}
            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-lit-surface border border-lit-border">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${modalActividad.imagenUrl}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white text-xs font-semibold">
                  {modalActividad.participantes}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-app-text uppercase tracking-wider">
                Descripción de la Actividad:
              </h4>
              <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                {modalActividad.descripcion}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-lit-surface/40 border border-lit-border space-y-2">
              <h5 className="text-xs font-bold text-app-text">Aspectos Destacados:</h5>
              <div className="space-y-1.5">
                {modalActividad.detalles.map((det, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-app-text/90">
                    <Check className="w-3.5 h-3.5 text-semantic-success flex-shrink-0 mt-0.5" />
                    <span>{det}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-app-border">
              <Button variant="primary" size="sm" onClick={() => setModalActividad(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CatequesisNinezSection;
