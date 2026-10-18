/**
 * LiturgicalTimeline.tsx — Línea Sagrada Cronológica del Año Litúrgico.
 * 
 * Permite recorrer el año litúrgico de izquierda a derecha en un carril continuo
 * con indicadores de color, solemnidades mayores y selección instantánea.
 */

import React from 'react';
import { LITURGICAL_STATIONS, LiturgicalStation } from '../data/liturgicalData';
import { Calendar, ChevronRight } from 'lucide-react';

interface Props {
  selectedStation: LiturgicalStation;
  onSelectStation: (station: LiturgicalStation) => void;
}

export const LiturgicalTimeline: React.FC<Props> = ({ selectedStation, onSelectStation }) => {
  return (
    <div className="bg-app-card rounded-3xl border border-app-border p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-app-muted uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-lit-primary" /> Secuencia del Año Litúrgico
        </h3>
        <span className="text-[11px] text-app-muted font-medium">
          Adviento a Cristo Rey
        </span>
      </div>

      {/* Carril horizontal con scroll suave */}
      <div className="overflow-x-auto pb-3 pt-2 scrollbar-thin">
        <div className="flex items-center gap-3 min-w-[980px]">
          {LITURGICAL_STATIONS.map((station, index) => {
            const isSelected = selectedStation.id === station.id;
            return (
              <React.Fragment key={station.id}>
                <button
                  onClick={() => onSelectStation(station)}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-300 relative group flex-1 ${
                    isSelected
                      ? 'bg-lit-surface border-lit-primary shadow-md scale-105 z-10'
                      : 'bg-app-bg border-app-border/70 hover:bg-lit-surface/50 hover:border-lit-primary/40 hover:shadow-xs'
                  }`}
                >
                  {/* Barra superior con el color litúrgico oficial */}
                  <div 
                    className="w-full h-1.5 rounded-full mb-2.5 transition-transform duration-300 group-hover:scale-x-105"
                    style={{ backgroundColor: station.colorHex }}
                  />

                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{station.icon}</span>
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-lit-primary font-serif' : 'text-app-text'}`}>
                      {station.name}
                    </span>
                  </div>

                  <p className="text-[10px] text-app-muted font-medium line-clamp-1">
                    {station.colorName.split(' ')[0]}
                  </p>

                  <p className="text-[9px] text-app-muted mt-1 truncate w-full">
                    {station.approxDates}
                  </p>

                  {/* Indicador de seleccionado */}
                  {isSelected && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-lit-primary rotate-45 rounded-xs" />
                  )}
                </button>

                {index < LITURGICAL_STATIONS.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-app-muted/40 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiturgicalTimeline;
