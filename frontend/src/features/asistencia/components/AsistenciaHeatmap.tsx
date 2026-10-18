/**
 * AsistenciaHeatmap — Matriz visual de asistencia pastoral anual.
 * Visualiza el ciclo catequético dominical por semanas y meses con estados de puntualidad y faltas.
 */

import React, { useState, useRef, useEffect } from 'react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-centrar en el domingo seleccionado o actual al cargar o al cambiar de fecha
  useEffect(() => {
    if (selectedFecha && scrollContainerRef.current) {
      const selectedEl = scrollContainerRef.current.querySelector<HTMLElement>(`[data-fecha="${selectedFecha}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedFecha]);

  // Paleta de actividad con tokens del sistema litúrgico y semántico
  const getCellColor = (dia: AsistenciaDiaHeatmap, isSelected: boolean) => {
    if (dia.es_futuro || dia.numero_sesion === null) {
      return isSelected
        ? 'bg-app-card border-2 border-lit-primary text-app-muted ring-2 ring-lit-primary/20'
        : 'bg-app-bg border border-app-border/70 text-app-muted/40 hover:border-lit-primary/40';
    }

    if (dia.nivel_actividad === 4) {
      // Asistencia óptima (>=85%): color litúrgico primario
      return isSelected
        ? 'bg-lit-primary text-white ring-2 ring-lit-primary ring-offset-2 ring-offset-app-card scale-105 shadow-xs'
        : 'bg-lit-primary text-white hover:brightness-110 hover:scale-105 shadow-2xs';
    }
    if (dia.nivel_actividad === 3) {
      // Asistencia buena (70-84%): matiz suave litúrgico primario
      return isSelected
        ? 'bg-lit-primary/80 text-white ring-2 ring-lit-primary ring-offset-2 ring-offset-app-card scale-105 shadow-xs'
        : 'bg-lit-primary/75 text-white hover:bg-lit-primary/90 hover:scale-105';
    }
    if (dia.nivel_actividad === 2) {
      // Asistencia media (50-69%): superficie litúrgica con borde
      return isSelected
        ? 'bg-lit-surface text-lit-primary border-2 border-lit-primary ring-2 ring-lit-primary/20 scale-105 shadow-xs font-bold'
        : 'bg-lit-surface text-lit-primary border border-lit-border font-semibold hover:border-lit-primary/60 hover:scale-105';
    }
    // Nivel 1: Faltas predominantes (<50%): alerta semántica sutil integrada
    return isSelected
      ? 'bg-semantic-error-bg text-semantic-error-text border-2 border-semantic-error-border ring-2 ring-semantic-error-border scale-105 shadow-xs font-bold'
      : 'bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border font-semibold hover:brightness-95 hover:scale-105';
  };

  // Agrupar domingos por meses para el layout horizontal
  const domingosPorMes: { mes: AsistenciaMesResumen; domingos: AsistenciaDiaHeatmap[] }[] = data.meses.map(mes => {
    const domingos = data.domingos.filter(d => d.mes === mes.mes);
    return { mes, domingos };
  });

  return (
    <div className="rounded-2xl border border-app-border bg-app-card shadow-xs overflow-hidden transition-all">
      {/* ── Encabezado y Métricas ────────────────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-app-border bg-app-bg/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-lit-surface text-lit-primary text-base">
              📅
            </span>
            <h3 className="text-base font-bold text-app-text font-serif">
              Asistencia Dominical {data.gestion}
            </h3>
            <Badge variant="liturgical" size="sm">
              {data.capilla_nombre}
            </Badge>
          </div>
          <p className="text-xs text-app-muted mt-1">
            Sesiones dominicales del ciclo formativo pastoral.
          </p>
        </div>

        {/* Resumen numérico */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-app-card border border-app-border text-center shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-app-muted block tracking-wider">
              Tasa Anual
            </span>
            <span className="text-sm font-black text-lit-primary">
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
              Vista Anual
            </button>
            <button
              onClick={() => setActiveView('meses')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'meses'
                  ? 'bg-app-card text-lit-primary shadow-xs font-bold'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              Vista Mensual
            </button>
          </div>
        </div>
      </div>

      {/* ── Vista 1: Matriz Continua Anual ─────────────────── */}
      {activeView === 'matriz' ? (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Indicador sutil para móviles */}
          <div className="flex items-center justify-between text-[11px] text-app-muted sm:hidden px-0.5">
            <span>← Desliza para explorar los meses →</span>
            {filtroMes && (
              <button
                type="button"
                onClick={() => setFiltroMes(null)}
                className="text-lit-primary font-bold underline"
              >
                Ver todo el año
              </button>
            )}
          </div>

          {/* Cinta horizontal con scroll táctil sin deformación */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-3 pt-1.5 scrollbar-thin touch-pan-x"
          >
            <div className="inline-flex items-start gap-3 sm:gap-4 min-w-max px-1">
              {domingosPorMes.map(({ mes, domingos }) => (
                <div
                  key={mes.mes}
                  className={`flex flex-col gap-2 shrink-0 transition-opacity duration-150 ${
                    filtroMes && filtroMes !== mes.mes ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  {/* Encabezado de mes con filtro */}
                  <div className="flex items-center justify-between px-0.5">
                    <button
                      type="button"
                      onClick={() => setFiltroMes(filtroMes === mes.mes ? null : mes.mes)}
                      className={`text-xs font-bold transition-colors select-none ${
                        filtroMes === mes.mes
                          ? 'text-lit-primary font-black underline'
                          : 'text-app-muted hover:text-lit-primary'
                      }`}
                      title={`Filtrar por ${mes.mes_nombre}`}
                    >
                      {mes.mes_nombre.slice(0, 3)}
                    </button>
                  </div>

                  {/* Fila de domingos agrupados por mes */}
                  <div className="flex items-center gap-1.5">
                    {domingos.map((dia) => {
                      const isSelected = selectedFecha === dia.fecha;

                      return (
                        <button
                          key={dia.fecha}
                          data-fecha={dia.fecha}
                          type="button"
                          onClick={() => onSelectFecha(dia.fecha)}
                          onMouseEnter={() => setHoveredDay(dia)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-8 h-8 sm:w-8 sm:h-8 shrink-0 aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-150 relative cursor-pointer select-none ${
                            getCellColor(dia, isSelected)
                          }`}
                          aria-label={`Domingo ${dia.dia_numero} de ${mes.mes_nombre}: ${dia.porcentaje}%`}
                        >
                          <span className="text-[11px] font-bold leading-none pointer-events-none">
                            {dia.dia_numero}
                          </span>
                          {dia.es_hoy && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-lit-accent animate-ping pointer-events-none" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
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
                      <div className="w-8 h-8 rounded-lg bg-lit-surface text-lit-primary flex items-center justify-center font-bold shrink-0">
                        {target.dia_numero}
                      </div>
                      <div>
                        <p className="font-bold text-app-text flex items-center gap-2 flex-wrap">
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
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-semantic-success-text">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {target.total_presentes} puntuales
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-semantic-warning-text">
                          <Clock className="w-3.5 h-3.5" />
                          {target.total_atrasos} atrasos
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-semantic-error-text">
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
                <span>Selecciona un domingo para ver el balance.</span>
              </div>
            )}
          </div>

          {/* Leyenda del sistema */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] text-app-muted border-t border-app-border/40">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Menor asistencia</span>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded bg-semantic-error-bg border border-semantic-error-border inline-block shrink-0" title="Baja asistencia (<50%)" />
                <span className="w-3.5 h-3.5 rounded bg-lit-surface border border-lit-border inline-block shrink-0" title="Asistencia regular (50-69%)" />
                <span className="w-3.5 h-3.5 rounded bg-lit-primary/75 inline-block shrink-0" title="Buena asistencia (70-84%)" />
                <span className="w-3.5 h-3.5 rounded bg-lit-primary inline-block shrink-0" title="Asistencia óptima (≥85%)" />
              </div>
              <span>Mayor asistencia</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-app-bg border border-app-border inline-block shrink-0" />
                <span>Domingo futuro</span>
              </span>
              {filtroMes && (
                <button
                  type="button"
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
                      {mes.total_sesiones > 0 ? `${mes.total_sesiones} sesiones` : 'Sin sesiones'}
                    </p>
                  </div>
                  {mes.total_sesiones > 0 && (
                    <Badge
                      variant={
                        mes.porcentaje_promedio >= 85
                          ? 'success'
                          : mes.porcentaje_promedio >= 70
                          ? 'warning'
                          : 'error'
                      }
                      size="sm"
                    >
                      {mes.porcentaje_promedio}% prom.
                    </Badge>
                  )}
                </div>

                {/* Domingos del mes */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {domingosMes.map(d => {
                    const isSelected = selectedFecha === d.fecha;
                    return (
                      <button
                        key={d.fecha}
                        type="button"
                        onClick={() => onSelectFecha(d.fecha)}
                        className={`w-8 h-8 shrink-0 aspect-square rounded-lg text-[11px] font-bold flex items-center justify-center transition-all select-none ${
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
