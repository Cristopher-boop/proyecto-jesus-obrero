/**
 * CalendarioPage.tsx — Experiencia Central del Año Litúrgico Católico.
 * 
 * Integra la Rueda Litúrgica Interactiva, la Línea Cronológica Sagrada,
 * el Inspector de Solemnidades y el Sistema de Ambientación Viva del Templo.
 */

import React, { useState, useMemo } from 'react';
import {
  LITURGICAL_STATIONS, LiturgicalStation,
  calculateCurrentStation
} from '../data/liturgicalData';
import { LiturgicalWheel } from '../components/LiturgicalWheel';
import { LiturgicalDetailCard } from '../components/LiturgicalDetailCard';
import { LiturgicalTimeline } from '../components/LiturgicalTimeline';
import { MonthlyCalendarGrid } from '../components/MonthlyCalendarGrid';
import { useLiturgicalTheme } from '@/core/context/ThemeContext';
import {
  Sparkles, Compass, Flame,
  CalendarDays, Church, Calendar
} from 'lucide-react';

type ViewMode = 'mes' | 'rueda' | 'cuadricula';

export const CalendarioPage: React.FC = () => {
  const currentActualStation = useMemo(() => calculateCurrentStation(new Date()), []);
  const [selectedStation, setSelectedStation] = useState<LiturgicalStation>(currentActualStation);
  const [viewMode, setViewMode] = useState<ViewMode>('mes');

  const { seasonInfo } = useLiturgicalTheme();

  const handleNextStation = () => {
    const currentIndex = LITURGICAL_STATIONS.findIndex(s => s.id === selectedStation.id);
    const nextIndex = (currentIndex + 1) % LITURGICAL_STATIONS.length;
    setSelectedStation(LITURGICAL_STATIONS[nextIndex]);
  };

  const handlePrevStation = () => {
    const currentIndex = LITURGICAL_STATIONS.findIndex(s => s.id === selectedStation.id);
    const prevIndex = (currentIndex - 1 + LITURGICAL_STATIONS.length) % LITURGICAL_STATIONS.length;
    setSelectedStation(LITURGICAL_STATIONS[prevIndex]);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-12">
      
      {/* ── Banner Superior Hero: El Año Litúrgico en Jesús Obrero ───────── */}
      <div 
        className="rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at top right, ${selectedStation.colorHex} 0%, #171513 100%)`
        }}
      >
        {/* Marca de agua eclesiástica en filigrana */}
        <div className="absolute right-[-4%] top-[-30%] text-[18rem] opacity-5 font-serif select-none pointer-events-none">
          ✝
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-200">
                <Church className="w-3.5 h-3.5" /> Parroquia Jesús Obrero
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lit-accent/20 border border-lit-accent/40 text-xs font-bold text-lit-accent">
                <Sparkles className="w-3 h-3" /> Tiempo Actual: {currentActualStation.name}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-white leading-tight">
              El Año Litúrgico de la Iglesia
            </h1>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              El Año Litúrgico no es un mero recuerdo histórico, sino la actualización viva del Misterio de Cristo en el tiempo: desde la espera anhelante del <strong>Adviento</strong> hasta la soberanía eterna de <strong>Cristo Rey del Universo</strong>.
            </p>
          </div>

          {/* Tarjeta rápida del Tiempo Activo */}
          <div className="bg-white/15 backdrop-blur-md p-5 rounded-2xl border border-white/20 flex flex-col items-center text-center gap-2 min-w-[200px]">
            <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-2xl shadow-inner animate-pulse">
              {seasonInfo.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                Tema Vivo Aplicado
              </p>
              <p className="text-sm font-bold text-white mt-0.5">{seasonInfo.name}</p>
              <p className="text-[10px] text-white/70">{seasonInfo.colorName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Selector de Modos de Visualización ────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center bg-app-card border border-app-border p-1 rounded-2xl gap-1">
          <button
            onClick={() => setViewMode('mes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === 'mes'
                ? 'bg-lit-surface shadow-xs text-lit-primary'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Calendar className="w-4 h-4 text-lit-accent" />
            <span>Calendario Mensual con Fechas</span>
          </button>

          <button
            onClick={() => setViewMode('rueda')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === 'rueda'
                ? 'bg-lit-surface shadow-xs text-lit-primary'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Compass className="w-4 h-4 text-lit-accent" />
            <span>Rueda Sagrada (Interactivo)</span>
          </button>

          <button
            onClick={() => setViewMode('cuadricula')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === 'cuadricula'
                ? 'bg-lit-surface shadow-xs text-lit-primary'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-lit-accent" />
            <span>Solemnidades y Fiestas</span>
          </button>
        </div>

        <div className="text-xs text-app-muted font-medium flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-lit-accent" />
          <span>Gestión de Fechas y Liturgia 2026</span>
        </div>
      </div>

      {/* ── Modo 1: Calendario Mensual con Fechas ─────────────────────── */}
      {viewMode === 'mes' && (
        <MonthlyCalendarGrid />
      )}

      {/* ── Modo 2: Rueda Mística e Inspector Detallado ────────────────── */}
      {viewMode === 'rueda' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Lado Izquierdo: Rueda Litúrgica Interactiva */}
          <div className="lg:col-span-5 bg-app-card rounded-3xl border border-app-border p-6 shadow-sm flex flex-col items-center justify-center sticky top-24">
            <div className="text-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-lit-primary bg-lit-surface px-3 py-1 rounded-full border border-lit-border">
                Ciclo Perenne de Salvación
              </span>
              <h3 className="text-base font-bold text-app-text mt-2 font-serif">
                Disco del Año Litúrgico
              </h3>
            </div>

            <LiturgicalWheel 
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
            />
          </div>

          {/* Lado Derecho: Retablo e Inspector Teológico */}
          <div className="lg:col-span-7">
            <LiturgicalDetailCard 
              station={selectedStation}
              onNext={handleNextStation}
              onPrev={handlePrevStation}
            />
          </div>
        </div>
      )}

      {/* ── Modo 2: Cuadrícula Completa de Solemnidades ────────────────── */}
      {viewMode === 'cuadricula' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LITURGICAL_STATIONS.map((st) => {
            const isSelected = selectedStation.id === st.id;
            return (
              <div
                key={st.id}
                onClick={() => {
                  setSelectedStation(st);
                  setViewMode('rueda');
                }}
                className={`bg-app-card rounded-3xl border p-6 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 group ${
                  isSelected ? 'border-lit-primary ring-2 ring-lit-primary/20' : 'border-app-border hover:border-lit-primary/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-app-bg border border-app-border flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition-transform">
                      {st.icon}
                    </div>
                    <span 
                      className="text-[10px] font-bold px-2.5 py-0.8 rounded-full text-white shadow-xs"
                      style={{ backgroundColor: st.colorHex }}
                    >
                      {st.colorName.split(' ')[0]}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-app-text group-hover:text-lit-primary transition-colors font-serif">
                      {st.name}
                    </h3>
                    <p className="text-[11px] text-app-muted font-medium mt-0.5">
                      {st.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-app-muted line-clamp-3 leading-relaxed">
                    {st.theologicalSummary}
                  </p>
                </div>

                <div className="pt-3 border-t border-app-border flex items-center justify-between text-xs text-lit-primary font-bold">
                  <span>Explorar misterio →</span>
                  <span className="text-[10px] font-mono text-app-muted">{st.approxDates}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Línea Cronológica Sagrada Continua ────────────────────────── */}
      <LiturgicalTimeline 
        selectedStation={selectedStation}
        onSelectStation={setSelectedStation}
      />

      {/* ── Guía Didáctica de los Colores Litúrgicos ───────────────────── */}
      <div className="bg-app-card rounded-3xl border border-app-border p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-app-bg border border-app-border flex items-center justify-center text-xl shadow-xs">
            🎨
          </div>
          <div>
            <h3 className="text-base font-bold text-app-text font-serif">
              El Lenguaje Sacro de los Colores Litúrgicos
            </h3>
            <p className="text-xs text-app-muted">
              Instrucción General del Misal Romano sobre las vestiduras y ornamentos del altar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: 'Blanco y Dorado',
              meaning: 'Pureza, Gozo Pascual y Máxima Solemnidad',
              usages: 'Navidad, Pascua, Corpus Christi, Santísima Trinidad y Cristo Rey.',
              badgeColor: '#C5A059',
              bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            },
            {
              name: 'Verde Sacro',
              meaning: 'Esperanza, Vida y Crecimiento en el Discipulado',
              usages: 'Tiempo Ordinario durante las semanas cotidianas del año.',
              badgeColor: '#1E4D38',
              bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
            },
            {
              name: 'Morado Penitencial',
              meaning: 'Conversión, Ayuno, Espera y Purificación',
              usages: 'Adviento, Cuaresma y Celebraciones de Reconciliación.',
              badgeColor: '#4A2040',
              bgClass: 'bg-purple-500/10 border-purple-500/30 text-purple-900 dark:text-purple-200'
            },
            {
              name: 'Rojo Carmesí',
              meaning: 'Fuego del Espíritu Santo, Pasión de Cristo y Mártires',
              usages: 'Domingo de Ramos, Viernes Santo, Pentecostés y apóstoles.',
              badgeColor: '#721C24',
              bgClass: 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
            },
          ].map((col, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${col.bgClass} space-y-2`}>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: col.badgeColor }} />
                <h4 className="text-xs font-bold font-serif">{col.name}</h4>
              </div>
              <p className="text-[11px] font-semibold opacity-90 leading-tight">
                {col.meaning}
              </p>
              <p className="text-[10px] opacity-75 pt-1 border-t border-current/20">
                <strong>Uso:</strong> {col.usages}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CalendarioPage;
