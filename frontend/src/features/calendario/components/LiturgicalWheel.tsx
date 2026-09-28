/**
 * LiturgicalWheel.tsx — Rueda Sagrada e Interactiva del Año Litúrgico.
 * 
 * Renderiza un disco celestial astronómico-litúrgico en SVG dividido en sectores
 * proporcionales con animaciones de halo, rotación suave y selección táctil/ratón.
 */

import React, { useMemo } from 'react';
import { LITURGICAL_STATIONS, LiturgicalStation } from '../data/liturgicalData';
import { Compass } from 'lucide-react';

interface Props {
  selectedStation: LiturgicalStation;
  onSelectStation: (station: LiturgicalStation) => void;
}

export const LiturgicalWheel: React.FC<Props> = ({ selectedStation, onSelectStation }) => {
  const total = LITURGICAL_STATIONS.length;
  const radius = 170;
  const innerRadius = 90;
  const center = 210;

  // Generar arcos SVG para cada estación litúrgica
  const segments = useMemo(() => {
    return LITURGICAL_STATIONS.map((station, index) => {
      const anglePerSegment = (2 * Math.PI) / total;
      const startAngle = index * anglePerSegment - Math.PI / 2;
      const endAngle = (index + 1) * anglePerSegment - Math.PI / 2;
      const midAngle = (startAngle + endAngle) / 2;

      // Coordenadas del arco exterior
      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      // Coordenadas del arco interior
      const ix1 = center + innerRadius * Math.cos(endAngle);
      const iy1 = center + innerRadius * Math.sin(endAngle);
      const ix2 = center + innerRadius * Math.cos(startAngle);
      const iy2 = center + innerRadius * Math.sin(startAngle);

      // Posición del icono / texto central del sector
      const iconRadius = (radius + innerRadius) / 2;
      const iconX = center + iconRadius * Math.cos(midAngle);
      const iconY = center + iconRadius * Math.sin(midAngle);

      const pathData = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 0 1 ${x2} ${y2}
        L ${ix1} ${iy1}
        A ${innerRadius} ${innerRadius} 0 0 0 ${ix2} ${iy2}
        Z
      `;

      const isSelected = selectedStation.id === station.id;

      return {
        station,
        pathData,
        iconX,
        iconY,
        midAngle,
        isSelected,
      };
    });
  }, [total, selectedStation.id]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Halo celestial animado de fondo */}
      <div 
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700 animate-pulse"
        style={{ backgroundColor: selectedStation.colorHex }}
      />

      <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px]">
        <svg 
          viewBox="0 0 420 420" 
          className="w-full h-full drop-shadow-2xl select-none"
        >
          <defs>
            {/* Gradiente radial de fondo sagrado */}
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="currentColor" className="text-app-card" stopOpacity="0.95" />
              <stop offset="100%" stopColor="currentColor" className="text-app-bg" stopOpacity="1" />
            </radialGradient>

            {/* Filtro de sombra dorada */}
            <filter id="goldShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#C5A059" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Anillo exterior decorativo eclesiástico */}
          <circle
            cx={center}
            cy={center}
            r={radius + 8}
            fill="none"
            stroke="#C5A059"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="animate-spin-slow opacity-60"
            style={{ animationDuration: '60s' }}
          />

          <circle
            cx={center}
            cy={center}
            r={radius + 3}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-app-border opacity-75"
          />

          {/* Sectores de las Estaciones Litúrgicas */}
          {segments.map(({ station, pathData, iconX, iconY, isSelected }) => {
            return (
              <g 
                key={station.id}
                onClick={() => onSelectStation(station)}
                className="cursor-pointer group transition-all duration-300"
              >
                <path
                  d={pathData}
                  fill={station.colorHex}
                  stroke={isSelected ? '#C5A059' : '#FFFFFF'}
                  strokeWidth={isSelected ? '3.5' : '1.5'}
                  className={`transition-all duration-300 ${
                    isSelected 
                      ? 'filter drop-shadow-lg opacity-100 scale-[1.02] origin-center' 
                      : 'opacity-85 hover:opacity-100 hover:brightness-110'
                  }`}
                  style={{
                    transformOrigin: `${center}px ${center}px`,
                  }}
                />

                {/* Marcador del icono litúrgico en el sector */}
                <g 
                  transform={`translate(${iconX}, ${iconY})`} 
                  className={`pointer-events-none transition-transform duration-300 ${isSelected ? 'scale-125' : 'group-hover:scale-110'}`}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? "14" : "12"}
                    className="fill-app-card shadow-sm"
                    stroke={isSelected ? '#C5A059' : 'transparent'}
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fontSize={isSelected ? "13" : "11"}
                    className="select-none"
                  >
                    {station.icon}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Círculo Central Sagrado (Cristo, Alfa y Omega, Corazón de la Liturgia) */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 4}
            fill="url(#centerGlow)"
            stroke="#C5A059"
            strokeWidth="3"
            className="shadow-inner"
          />

          <circle
            cx={center}
            cy={center}
            r={innerRadius - 10}
            fill="none"
            stroke="#C5A059"
            strokeWidth="0.8"
            strokeDasharray="2 3"
            className="opacity-60"
          />

          {/* Contenido Central: Misterio Litúrgico Seleccionado */}
          <g 
            transform={`translate(${center}, ${center})`}
            className="pointer-events-none"
          >
            <text
              x="0"
              y="-32"
              textAnchor="middle"
              className="text-[10px] font-bold tracking-widest uppercase fill-[#C5A059]"
            >
              AÑO LITÚRGICO
            </text>

            <text
              x="0"
              y="-10"
              textAnchor="middle"
              fontSize="24"
              className="animate-pulse"
            >
              {selectedStation.icon}
            </text>

            <text
              x="0"
              y="14"
              textAnchor="middle"
              className="text-xs font-extrabold fill-app-text font-serif"
            >
              {selectedStation.name.length > 16 
                ? selectedStation.name.slice(0, 15) + '…' 
                : selectedStation.name}
            </text>

            <text
              x="0"
              y="30"
              textAnchor="middle"
              className="text-[9px] font-medium fill-app-muted max-w-[120px]"
            >
              {selectedStation.colorName.split(' ')[0]}
            </text>

            <text
              x="0"
              y="44"
              textAnchor="middle"
              className="text-[8px] font-mono font-bold fill-[#916B1E] tracking-tighter"
            >
              Α · ✝ · Ω
            </text>
          </g>
        </svg>
      </div>

      {/* Indicador inferior de interacción */}
      <div className="mt-3 flex items-center gap-2 text-xs text-app-muted">
        <Compass className="w-3.5 h-3.5 text-lit-accent animate-spin-slow" />
        <span>Haz clic en cualquier estación para contemplar su misterio</span>
      </div>
    </div>
  );
};

export default LiturgicalWheel;
