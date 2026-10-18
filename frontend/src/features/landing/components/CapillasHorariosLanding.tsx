import React, { useState } from 'react';
import { CAPILLAS_LANDING } from '../data/landingData';
import { Church, Clock, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const CapillasHorariosLanding: React.FC = () => {
  const [capillaActivaId, setCapillaActivaId] = useState<number>(1);

  const capillaActiva = CAPILLAS_LANDING.find((c) => c.id === capillaActivaId) || CAPILLAS_LANDING[0];

  return (
    <section id="capillas" className="py-20 bg-lit-surface/30 border-y border-app-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Encabezado Principal */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lit-surface border border-lit-border text-lit-primary text-xs font-semibold">
            <Church className="w-3.5 h-3.5 text-lit-accent" />
            <span>Nuestra Red de Templos Parroquiales</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-app-text tracking-tight">
            Nuestras 6 Capillas & Horarios de Misa
          </h2>

          <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
            Una sola Iglesia que abraza a nuestra comunidad en seis templos vivos. Conoce a los santos patronos,
            el carisma de cada capilla y los horarios oficiales dominicales de Santa Misa y Formación Catequética.
          </p>
        </div>

        {/* Selector Dinámico de Capillas (Pills con scroll horizontal suave en móvil) */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 gap-2 no-scrollbar">
          {CAPILLAS_LANDING.map((cap) => (
            <button
              key={cap.id}
              onClick={() => setCapillaActivaId(cap.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                capillaActivaId === cap.id
                  ? 'bg-lit-primary text-white shadow-md scale-[1.02]'
                  : 'bg-app-card text-app-text/80 hover:bg-lit-surface border border-app-border'
              }`}
            >
              <span>{cap.esCentral ? '🏛️' : '⛪'}</span>
              <span>{cap.nombre}</span>
              {cap.esCentral && (
                <span className="text-[10px] bg-white/25 text-white px-1.5 py-0.5 rounded-md font-mono">
                  Sede Central
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Showcase de la Capilla Seleccionada */}
        <div className="bg-app-card rounded-3xl border border-app-border shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
          {/* Lado Izquierdo: Marco de Fotografía de la Capilla */}
          <div className="lg:col-span-5 relative h-72 sm:h-80 lg:h-auto min-h-[300px] bg-lit-surface border-b lg:border-b-0 lg:border-r border-app-border overflow-hidden group">
            {/* Foto de fondo real / estilizada */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('${capillaActiva.imagenUrl}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
            </div>

            {/* Badges y Textos flotantes en la fotografía */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                {capillaActiva.esCentral ? '⭐ Sede Central Parroquial' : '⛪ Capilla Filial'}
              </span>

              <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white/95 border border-white/20 flex items-center gap-1">
                <span>📸</span>
                <span>Foto del Templo</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
              <span className="text-[11px] font-medium text-lit-accent block">
                Patrono: {capillaActiva.patrono}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                {capillaActiva.nombre}
              </h3>
              <p className="text-[11px] text-white/80 line-clamp-2 italic">
                "{capillaActiva.carisma}"
              </p>
            </div>
          </div>

          {/* Lado Derecho: Carisma, Ubicación y Horarios Exactos */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-2xl font-bold text-app-text">
                  {capillaActiva.nombre}
                </h3>
                {capillaActiva.esCentral ? (
                  <Badge variant="gold" size="sm">Sede Central Parroquial</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">{capillaActiva.zona}</Badge>
                )}
              </div>

              <p className="text-xs text-app-muted mt-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-lit-primary flex-shrink-0" />
                <span>{capillaActiva.direccion}</span>
                <span className="text-app-muted">({capillaActiva.zona})</span>
              </p>

              <p className="text-xs text-app-text/90 mt-3 leading-relaxed">
                {capillaActiva.descripcion}
              </p>
            </div>

            {/* Bloques de Horarios: Primera Comunión y Confirmación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tarjeta de Primera Comunión */}
              <div className="p-4 rounded-2xl border border-lit-border bg-lit-surface/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-app-text font-serif flex items-center gap-1.5">
                    <span>🍞</span> Primera Comunión (1° y 2° año)
                  </span>
                  <Badge variant="neutral" size="sm">Domingos</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Horario Puntual */}
                  <div className="flex items-start gap-2 bg-app-card p-2 rounded-xl border border-app-border">
                    <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-app-muted uppercase font-bold block">
                        Llegada Puntual:
                      </span>
                      <strong className="text-app-text text-[11px]">
                        {capillaActiva.horarioPuntualComunion}
                      </strong>
                    </div>
                  </div>

                  {/* Santa Misa */}
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-lit-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-app-muted text-[11px] block">Santa Misa:</span>
                      <strong className="text-app-text">{capillaActiva.misaComunion}</strong>
                    </div>
                  </div>

                  {/* Encuentro Formativo */}
                  <div className="flex items-start gap-2 pt-1 border-t border-app-border/40">
                    <Sparkles className="w-3.5 h-3.5 text-lit-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-app-muted text-[11px] block">Encuentro de Niños:</span>
                      <strong className="text-app-text">{capillaActiva.encuentroComunion}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Confirmación */}
              <div className="p-4 rounded-2xl border border-lit-border bg-lit-surface/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-app-text font-serif flex items-center gap-1.5">
                    <span>🕊️</span> Confirmación (1° y 2° año)
                  </span>
                  <Badge variant="neutral" size="sm">Domingos</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Horario Puntual */}
                  <div className="flex items-start gap-2 bg-app-card p-2 rounded-xl border border-app-border">
                    <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-app-muted uppercase font-bold block">
                        Llegada Puntual:
                      </span>
                      <strong className="text-app-text text-[11px]">
                        {capillaActiva.horarioPuntualConfirmacion}
                      </strong>
                    </div>
                  </div>

                  {/* Santa Misa */}
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-lit-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-app-muted text-[11px] block">Santa Misa:</span>
                      <strong className="text-app-text">{capillaActiva.misaConfirmacion}</strong>
                    </div>
                  </div>

                  {/* Encuentro Formativo Juvenil */}
                  <div className="flex items-start gap-2 pt-1 border-t border-app-border/40">
                    <Sparkles className="w-3.5 h-3.5 text-lit-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-app-muted text-[11px] block">Encuentro de Jóvenes:</span>
                      <strong className="text-app-text">{capillaActiva.encuentroConfirmacion}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner de Criterio de Orden & Asistencia */}
            <div className="p-3.5 rounded-2xl bg-app-bg border border-app-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lit-primary flex-shrink-0" />
                <span className="text-app-muted text-[11px]">
                  <strong>Criterio de Asistencia:</strong> Puntual antes del inicio; estar presente durante todo el encuentro/misa.
                </span>
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-lg bg-lit-surface text-lit-primary font-bold text-[11px] border border-lit-border whitespace-nowrap self-start sm:self-auto">
                {capillaActiva.ordenEncuentro === 'encuentro_primero'
                  ? 'Encuentro antes que Misa'
                  : 'Misa antes que el Encuentro'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CapillasHorariosLanding;
