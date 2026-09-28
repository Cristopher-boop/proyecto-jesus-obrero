/**
 * AsistenciaHeatmap — Matriz visual de asistencia pastoral inspirada en el commit graph de GitHub.
 * Visualiza el ciclo catequético dominical por semanas y meses con estados de puntualidad y faltas.
 */

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type {
  AsistenciaHeatmapResponse,
  AsistenciaDiaHeatmap,
  AsistenciaMesResumen
} from '../types';

interface Props {
  data: AsistenciaHeatmapResponse;
  selectedFecha: string | null;
  onSelectFecha: (fecha: string) => void;
  loading?: boolean;
}

export const AsistenciaHeatmap: React.FC<Props> = ({
  data,
  selectedFecha,
  onSelectFecha,
}) => {
  const [hoveredDay, setHoveredDay] = useState<AsistenciaDiaHeatmap | null>(null);
  const [activeView, setActiveView] = useState<'matriz' | 'meses'>('matriz');
  const [filtroMes, setFiltroMes] = useState<number | null>(null);

  // Paleta de actividad estilo GitHub con tokens temáticos
  const getCellColor = (dia: AsistenciaDiaHeatmap, isSelected: boolean) => {
    if (dia.es_futuro || dia.numero_sesion === null) {
      return isSelected
        ? 'bg-app-card border-2 border-lit-primary text-app-muted ring-2 ring-lit-primary/30'
        : 'bg-app-bg border border-app-border/70 text-app-muted/50 hover:border-lit-primary/60';
    }

    if (dia.nivel_actividad === 4) {
      return isSelected
        ? 'bg-emerald-600 text-white ring-2 ring-lit-primary ring-offset-2 scale-110 shadow-sm'
        : 'bg-emerald-600 dark:bg-emerald-500 text-white hover:brightness-110 hover:scale-105';
    }
    if (dia.nivel_actividad === 3) {
      return isSelected
        ? 'bg-emerald-500 text-white ring-2 ring-lit-primary ring-offset-2 scale-110 shadow-sm'
        : 'bg-emerald-500/80 dark:bg-emerald-600 text-white hover:brightness-110 hover:scale-105';
    }
    if (dia.nivel_actividad === 2) {
      return isSelected
        ? 'bg-amber-500 text-white ring-2 ring-lit-primary ring-offset-2 scale-110 shadow-sm'
        : 'bg-amber-500 dark:bg-amber-600 text-white hover:brightness-110 hover:scale-105';
    }
    // Nivel 1: Faltas predominantes o bajo quorum
    return isSelected
      ? 'bg-rose-500 text-white ring-2 ring-lit-primary ring-offset-2 scale-110 shadow-sm'
      : 'bg-rose-500/90 dark:bg-rose-600 text-white hover:brightness-110 hover:scale-105';
  };

  // Agrupar domingos por meses para el layout horizontal
  const domingosPorMes: { mes: AsistenciaMesResumen; domingos: AsistenciaDiaHeatmap[] }[] = data.meses.map(mes => {
    const domingos = data.domingos.filter(d => d.mes === mes.mes);
    return { mes, domingos };
  });

  return (
    <div className="rounded-2xl border border-app-border bg-app-card shadow-xs overflow-hidden transition-all">
      {/* ── Encabezado y Métricas Anuales ────────────────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-app-border bg-app-bg/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-lit-surface text-lit-primary text-base">
              📅
            </span>
            <h3 className="text-base font-bold text-app-text font-serif">
              Matriz Anual de Asistencia Dominical — Gestión {data.gestion}
            </h3>
            <Badge variant="neutral" size="sm">
              {data.capilla_nombre}
            </Badge>
          </div>
          <p className="text-xs text-app-muted mt-1">
            Registro visual continuo de sesiones dominicales para la catequesis de Jesús Obrero. Haz clic en cualquier domingo para auditar el detalle de marcaciones.
          </p>
        </div>

        {/* Resumen numérico */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-app-card border border-app-border text-center shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-app-muted block tracking-wider">
              Tasa Anual
            </span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {data.tasa_anual}%
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-app-card border border-app-border text-center shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-app-muted block tracking-wider">
              Sesiones
            </span>
            <span className="text-sm font-black text-lit-primary">
              {data.total_sesiones} domingos
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-app-card border border-app-border text-center shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-app-muted block tracking-wider">
              Catecúmenos
            </span>
            <span className="text-sm font-black text-app-text">
              {data.total_catecumenos} activos
            </span>
          </div>

          {/* Toggle de Vistas */}
          <div className="flex items-center bg-app-bg border border-app-border p-0.5 rounded-xl">
            <button
              onClick={() => setActiveView('matriz')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'matriz'
                  ? 'bg-app-card text-lit-primary shadow-xs font-bold'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              Matriz (GitHub)
            </button>
            <button
              onClick={() => setActiveView('meses')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'meses'
                  ? 'bg-app-card text-lit-primary shadow-xs font-bold'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              Por Meses
            </button>
          </div>
        </div>
      </div>

      {/* ── Vista 1: Matriz Continua estilo GitHub Commits ─────────────────── */}
      {activeView === 'matriz' ? (
        <div className="p-4 sm:p-6 space-y-5">
          {/* Cinta horizontal con scroll suave si es pantalla angosta */}
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="min-w-[780px] space-y-2">
              {/* Encabezado de Meses */}
              <div className="flex items-center text-[11px] font-bold text-app-muted select-none">
                {domingosPorMes.map(({ mes, domingos }) => (
                  <div
                    key={mes.mes}
                    style={{ flex: domingos.length }}
                    className="px-1 text-left truncate"
                  >
                    <button
                      onClick={() => setFiltroMes(filtroMes === mes.mes ? null : mes.mes)}
                      className={`hover:text-lit-primary transition-colors ${
                        filtroMes === mes.mes ? 'text-lit-primary font-black underline' : ''
                      }`}
                      title={`Filtrar por ${mes.mes_nombre}`}
                    >
                      {mes.mes_nombre.slice(0, 3)}
                    </button>
                  </div>
                ))}
              </div>

              {/* Grid de Domingos */}
              <div className="flex items-center gap-1.5">
                {data.domingos.map((dia) => {
                  const isSelected = selectedFecha === dia.fecha;
                  const isFiltered = filtroMes ? dia.mes === filtroMes : true;

                  return (
                    <button
                      key={dia.fecha}
                      onClick={() => onSelectFecha(dia.fecha)}
                      onMouseEnter={() => setHoveredDay(dia)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex flex-col items-center justify-center transition-all duration-150 relative cursor-pointer ${
                        getCellColor(dia, isSelected)
                      } ${!isFiltered ? 'opacity-25 scale-90' : 'opacity-100'}`}
                      aria-label={`Domingo ${dia.dia_numero} de mes ${dia.mes}: ${dia.porcentaje}%`}
                    >
                      <span className="text-[10px] font-bold leading-none">
                        {dia.dia_numero}
                      </span>
                      {dia.es_hoy && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-lit-accent animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Banner de Info del Domingo en Hover o Seleccionado */}
          <div className="p-3.5 rounded-xl bg-app-bg/80 border border-app-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {hoveredDay || (selectedFecha && data.domingos.find(d => d.fecha === selectedFecha)) ? (
              (() => {
                const target = hoveredDay || data.domingos.find(d => d.fecha === selectedFecha)!;
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-lit-surface text-lit-primary flex items-center justify-center font-bold">
                        {target.dia_numero}
                      </div>
                      <div>
                        <p className="font-bold text-app-text flex items-center gap-2">
                          <span>
                            {target.es_domingo ? 'Domingo' : 'Día'} {target.dia_numero} de {data.meses.find(m => m.mes === target.mes)?.mes_nombre}, {data.gestion}
                          </span>
                          {target.numero_sesion && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lit-surface text-lit-primary font-bold">
                              Sesión #{target.numero_sesion}
                            </span>
                          )}
                          {target.es_hoy && (
                            <span className="text-[10px] font-bold text-lit-accent bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                              Hoy en curso
                            </span>
                          )}
                        </p>
                        <p className="text-app-muted text-[11px] mt-0.5">
                          {target.es_futuro
                            ? 'Sesión futura programada'
                            : `Quorum del ${target.porcentaje}% (${target.total_presentes + target.total_atrasos} de ${target.total_esperados} asistentes)`}
                        </p>
                      </div>
                    </div>

                    {!target.es_futuro && target.numero_sesion && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {target.total_presentes} puntuales
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          {target.total_atrasos} atrasos
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {target.total_faltas} faltas
                        </span>
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              <div className="text-app-muted italic text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-lit-accent" />
                <span>Pasa el cursor o pulsa en cualquier domingo del calendario para ver el balance de asistencia.</span>
              </div>
            )}
          </div>

          {/* Leyenda GitHub */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] text-app-muted border-t border-app-border/40">
            <div className="flex items-center gap-2">
              <span>Menor asistencia</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block" title="Faltas / Quorum bajo (<50%)" />
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" title="Quorum medio (50-69%)" />
                <span className="w-3 h-3 rounded bg-emerald-500/80 inline-block" title="Buen quorum (70-84%)" />
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block" title="Asistencia óptima (>=85%)" />
              </div>
              <span>Mayor asistencia</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-app-bg border border-app-border inline-block" />
                <span>Domingo futuro</span>
              </span>
              {filtroMes && (
                <button
                  onClick={() => setFiltroMes(null)}
                  className="text-lit-primary font-bold hover:underline"
                >
                  Quitar filtro de mes
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── Vista 2: Desglose por Meses ───────────────────────────────────── */
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {data.meses.map((mes) => {
            const domingosMes = data.domingos.filter(d => d.mes === mes.mes);
            return (
              <div
                key={mes.mes}
                className="p-4 rounded-xl border border-app-border bg-app-bg/50 hover:bg-lit-surface/30 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-app-text font-serif">
                      {mes.mes_nombre}
                    </h4>
                    <p className="text-[10px] text-app-muted mt-0.5">
                      {mes.total_sesiones > 0 ? `${mes.total_sesiones} sesiones formativas` : 'Sin sesiones regulares'}
                    </p>
                  </div>
                  {mes.total_sesiones > 0 && (
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      mes.porcentaje_promedio >= 85
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : mes.porcentaje_promedio >= 70
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {mes.porcentaje_promedio}% prom.
                    </span>
                  )}
                </div>

                {/* Domingos del mes */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {domingosMes.map(d => {
                    const isSelected = selectedFecha === d.fecha;
                    return (
                      <button
                        key={d.fecha}
                        onClick={() => onSelectFecha(d.fecha)}
                        className={`w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                          getCellColor(d, isSelected)
                        }`}
                        title={`${d.dia_numero} de ${mes.mes_nombre}: ${d.porcentaje}%`}
                      >
                        {d.dia_numero}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-app-border/40 flex items-center justify-between text-[11px] text-app-muted">
                  <span>{mes.total_presentes} presentes</span>
                  <span>{mes.total_faltas} faltas</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AsistenciaHeatmap;
