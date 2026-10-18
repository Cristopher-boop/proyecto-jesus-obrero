import React, { useState } from 'react';
import { ACTIVIDADES_JUVENTUD } from '../data/landingData';
import type { ActividadJuventud } from '../types';
import { Calendar, Check, X, Flame } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export const ConfirmacionJuventudSection: React.FC = () => {
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'confirmacion' | 'comunidad_juvenil' | 'fraternidad'>('todos');
  const [modalActividad, setModalActividad] = useState<ActividadJuventud | null>(null);

  const actividadesFiltradas = filtroTipo === 'todos'
    ? ACTIVIDADES_JUVENTUD
    : ACTIVIDADES_JUVENTUD.filter((a) => a.tipo === filtroTipo);

  const filtros = [
    { id: 'todos', label: 'Todas las Experiencias' },
    { id: 'confirmacion', label: 'Camino de Confirmación (E.J.E. & SICAR)' },
    { id: 'comunidad_juvenil', label: 'Comunidad Juvenil Post-Confirmación' },
    { id: 'fraternidad', label: 'Convivencias & Fiestas (San Juan, etc.)' },
  ];

  return (
    <section id="juventud" className="py-20 bg-lit-surface/20 border-t border-app-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lit-surface border border-lit-border text-lit-primary text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-lit-accent" />
            <span>Pastoral Juvenil & Fuego de Pentecostés</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-app-text tracking-tight">
            Jóvenes Comprometidos, Valientes y Hermanos en Cristo
          </h2>

          <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
            Desde los retiros vivenciales de <strong>E.J.E.</strong> y <strong>SICAR</strong> durante la Confirmación,
            hasta la alegre <strong>Comunidad Juvenil</strong> que persevera con campamentos anuales, apoyo en las capillas
            y encuentros fraternos llenos de diversión sana.
          </p>
        </div>

        {/* Filtros de Categoría Juvenil */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 gap-2 no-scrollbar">
          {filtros.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltroTipo(f.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                filtroTipo === f.id
                  ? 'bg-lit-primary text-white shadow-sm'
                  : 'bg-app-card text-app-text/80 hover:bg-lit-surface border border-app-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tarjetas de Experiencias Juveniles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {actividadesFiltradas.map((act) => (
            <div
              key={act.id}
              className="bg-app-card rounded-3xl border border-app-border shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Marco de Imagen */}
                <div className="relative h-52 w-full overflow-hidden bg-lit-surface border-b border-app-border">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${act.imagenUrl}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  </div>

                  {/* Badges Flotantes */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20">
                      {act.tipo === 'confirmacion' ? '🕊️ Confirmación' : act.tipo === 'comunidad_juvenil' ? '🌟 Post-Confirmación' : '🎉 Fraternidad'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white/90 border border-white/20 flex items-center gap-1">
                    <span>📸</span>
                    <span>Espacio Foto</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[11px] text-lit-accent font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {act.temporada}
                    </span>
                  </div>
                </div>

                {/* Contenido Editorial */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{act.icono}</span>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-app-text group-hover:text-lit-primary transition-colors leading-snug">
                        {act.titulo}
                      </h3>
                      <p className="text-xs text-lit-primary font-medium italic">
                        {act.subtitulo}
                      </p>
                    </div>
                  </div>

                  {act.lema && (
                    <div className="p-2 rounded-xl bg-lit-surface/40 border border-lit-border/60 text-[11px] text-lit-primary font-medium italic text-center">
                      {act.lema}
                    </div>
                  )}

                  <p className="text-xs text-app-muted leading-relaxed line-clamp-3">
                    {act.descripcion}
                  </p>

                  {/* Puntos Destacados */}
                  <div className="pt-2 space-y-1.5 border-t border-app-border/60">
                    {act.caracteristicas.slice(0, 3).map((caract, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-app-text/90">
                        <Check className="w-3.5 h-3.5 text-semantic-success flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{caract}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pie de Tarjeta con Etiquetas y Botón */}
              <div className="p-6 pt-0 space-y-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {act.etiquetas.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-app-muted bg-lit-surface px-2 py-0.5 rounded-md border border-lit-border/50 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

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

        {/* Resumen de Identidad de la Comunidad Juvenil */}
        <div className="rounded-3xl bg-lit-surface/40 border border-lit-border p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="p-4 rounded-2xl bg-app-card border border-app-border space-y-2">
              <span className="text-2xl">⛺</span>
              <h4 className="font-serif text-sm font-bold text-app-text">Campamento Juvenil Anual</h4>
              <p className="text-xs text-app-muted leading-relaxed">
                Cada año nos desconectamos de la ciudad para vivir fogatas, dinámicas de fe y celebrar la constancia de los jóvenes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-app-card border border-app-border space-y-2">
              <span className="text-2xl">🌭</span>
              <h4 className="font-serif text-sm font-bold text-app-text">Convivencias de Tradición</h4>
              <p className="text-xs text-app-muted leading-relaxed">
                Noche de fogata con panchos en San Juan, intercambio de regalos en Navidad y fiestas creativas de disfraces.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-app-card border border-app-border space-y-2">
              <span className="text-2xl">🚶‍♂️</span>
              <h4 className="font-serif text-sm font-bold text-app-text">Romería Juvenil</h4>
              <p className="text-xs text-app-muted leading-relaxed">
                Una marcha festiva donde los jóvenes salen a las calles a cantar, orar y testimoniar su amor por la Iglesia.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Extendido para Juventud */}
      {modalActividad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative bg-app-card rounded-3xl border border-app-border shadow-2xl max-w-xl w-full p-6 sm:p-8 z-10 animate-scaleUp overflow-y-auto max-h-[90vh] space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-app-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-lit-surface border border-lit-border text-2xl flex items-center justify-center">
                  {modalActividad.icono}
                </div>
                <div>
                  <Badge variant="gold" size="sm">
                    {modalActividad.tipo === 'confirmacion' ? 'Confirmación' : 'Comunidad Juvenil'}
                  </Badge>
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

            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-lit-surface border border-lit-border">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${modalActividad.imagenUrl}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white text-xs font-semibold">
                  {modalActividad.temporada}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-app-text uppercase tracking-wider">
                Sobre esta experiencia de fe:
              </h4>
              <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                {modalActividad.descripcion}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-lit-surface/40 border border-lit-border space-y-2">
              <h5 className="text-xs font-bold text-app-text">Pilares del Encuentro:</h5>
              <div className="space-y-1.5">
                {modalActividad.caracteristicas.map((caract, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-app-text/90">
                    <Check className="w-3.5 h-3.5 text-semantic-success flex-shrink-0 mt-0.5" />
                    <span>{caract}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-app-border flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {modalActividad.etiquetas.map((t, idx) => (
                  <span key={idx} className="text-[10px] text-app-muted bg-app-bg px-2 py-0.5 rounded border border-app-border font-mono">
                    {t}
                  </span>
                ))}
              </div>
              <Button variant="primary" size="sm" onClick={() => setModalActividad(null)}>
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ConfirmacionJuventudSection;
