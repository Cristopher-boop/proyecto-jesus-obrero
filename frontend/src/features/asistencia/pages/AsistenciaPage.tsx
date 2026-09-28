/**
 * AsistenciaPage — Página principal de Control de Asistencia Pastoral.
 * Integra:
 *  1. Matriz visual anual estilo GitHub commits (por días y por meses para Jesús Obrero).
 *  2. Escáner óptico 100% Cámara Web en vivo (sin simuladores).
 *  3. Detalle nominal exacto por domingo con hora registrada (HH:MM:SS) y cómputo automático de faltas.
 *  4. Paginación y filtros reactivos según buenas prácticas y tokens de tema.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  RefreshCw, CheckCircle2, AlertTriangle, Clock, Calendar,
  Camera, Search, AlertCircle, Sparkles
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import { QRScannerWidget } from '../components/QRScannerWidget';
import { AsistenciaHeatmap } from '../components/AsistenciaHeatmap';
import {
  useAsistenciaHeatmap,
  useAsistenciaDetalleFecha,
  useRegistrarAsistenciaQR
} from '../hooks/useAsistencias';
import type { AsistenciaScanResponse } from '../types';

type FiltroEstado = 'TODOS' | 'PRESENTE' | 'ATRASO' | 'FALTA';

export const AsistenciaPage: React.FC = () => {
  // Capilla activa (Por defecto: 1 = Sede Central Jesús Obrero)
  const [selectedCapillaId, setSelectedCapillaId] = useState<number>(1);
  const [showCamera, setShowCamera] = useState(false);

  // Fecha seleccionada para el detalle (por defecto el domingo más reciente o fecha actual)
  const [selectedFecha, setSelectedFecha] = useState<string>('2026-09-27');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODOS');

  // Paginación de la tabla de detalle
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Alerta de escaneo reciente
  const [lastScanResult, setLastScanResult] = useState<AsistenciaScanResponse | null>(null);

  // Hooks de datos
  const {
    data: heatmapData,
    loading: loadingHeatmap,
    error: errorHeatmap,
    refetch: refetchHeatmap
  } = useAsistenciaHeatmap(2026, selectedCapillaId);

  const {
    data: detalleFecha,
    loading: loadingDetalle,
    error: errorDetalle,
    refetch: refetchDetalle
  } = useAsistenciaDetalleFecha(selectedFecha, selectedCapillaId);

  const {
    escanear,
    loading: scanning,
    error: scanError,
    clearError
  } = useRegistrarAsistenciaQR();

  // Si el heatmap se carga y no hay fecha seleccionada, elegir el domingo más reciente con evaluación
  useEffect(() => {
    if (heatmapData && heatmapData.domingos.length > 0) {
      const pasados = heatmapData.domingos.filter(d => d.es_pasado || d.es_hoy);
      if (pasados.length > 0 && !selectedFecha) {
        setSelectedFecha(pasados[pasados.length - 1].fecha);
      }
    }
  }, [heatmapData, selectedFecha]);

  // Manejador de escaneo por cámara web
  const handleScan = useCallback(async (token: string) => {
    clearError();
    const result = await escanear(token, undefined, undefined, selectedCapillaId);
    if (result) {
      setLastScanResult(result);
      // Actualizar inmediatamente matriz y detalle
      refetchHeatmap();
      refetchDetalle();
    }
  }, [clearError, escanear, selectedCapillaId, refetchHeatmap, refetchDetalle]);

  // Selección de fecha desde la matriz
  const handleSelectFecha = useCallback((fecha: string) => {
    setSelectedFecha(fecha);
    setPage(1);
    setSearchTerm('');
    setFiltroEstado('TODOS');
  }, []);

  // Filtrado de catecúmenos en la fecha seleccionada
  const itemsFiltrados = useMemo(() => {
    if (!detalleFecha?.items) return [];

    return detalleFecha.items.filter((item) => {
      // Filtro de estado
      if (filtroEstado !== 'TODOS' && item.estado !== filtroEstado) {
        return false;
      }
      // Filtro de búsqueda textual
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesNombre = item.nombre_completo.toLowerCase().includes(term);
        const matchesGrupo = item.grupo_nombre?.toLowerCase().includes(term) ?? false;
        const matchesSacramento = item.tipo_sacramento.toLowerCase().includes(term);
        if (!matchesNombre && !matchesGrupo && !matchesSacramento) return false;
      }
      return true;
    });
  }, [detalleFecha?.items, filtroEstado, searchTerm]);

  // Paginación en cliente sobre el conjunto filtrado del día
  const totalItems = itemsFiltrados.length;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return itemsFiltrados.slice(start, start + pageSize);
  }, [itemsFiltrados, page, pageSize]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-12 animate-fadeIn">
      {/* ── Cabecera Principal ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-lit-surface text-lit-primary text-xl">
              🕊️
            </span>
            <div>
              <h2 className="text-xl font-bold text-app-text font-serif">
                Control de Asistencia Pastoral
              </h2>
              <p className="text-xs text-app-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                <Calendar className="w-3.5 h-3.5" />
                <span>Gestión 2026 · Parroquia Jesús Obrero</span>
                <span>·</span>
                <span>Hoy: {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${(loadingHeatmap || loadingDetalle) ? 'animate-spin' : ''}`} />}
            onClick={() => {
              refetchHeatmap();
              refetchDetalle();
            }}
          >
            Actualizar
          </Button>

          <Button
            variant={showCamera ? 'secondary' : 'primary'}
            size="sm"
            leftIcon={<Camera className="w-4 h-4" />}
            onClick={() => setShowCamera(!showCamera)}
          >
            {showCamera ? 'Ocultar Cámara' : 'Escanear con Cámara Web'}
          </Button>
        </div>
      </div>

      {/* ── Notificación de Marcación Reciente ─────────────────────────────── */}
      {lastScanResult && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-all duration-300 animate-fadeIn ${
            lastScanResult.ya_registrado
              ? 'bg-semantic-warning-bg border-semantic-warning-border text-semantic-warning-text'
              : 'bg-semantic-success-bg border-semantic-success-border text-semantic-success-text'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-2xs ${
                  lastScanResult.ya_registrado ? 'bg-semantic-warning text-white' : 'bg-semantic-success text-white'
                }`}
              >
                {lastScanResult.ya_registrado ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-app-card/80 border border-current">
                  {lastScanResult.ya_registrado ? 'Aviso de Marcación Duplicada' : 'Asistencia Registrada con Éxito'}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold mt-0.5">{lastScanResult.nombre_completo}</h3>
                <p className="text-xs opacity-90 flex items-center gap-2 mt-0.5 flex-wrap">
                  <span>{lastScanResult.tipo_sacramento}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono font-bold">
                    <Clock className="w-3.5 h-3.5" /> Marcado a las {lastScanResult.hora}
                  </span>
                </p>
              </div>
            </div>

            <Badge variant={lastScanResult.estado === 'PRESENTE' ? 'success' : 'warning'} size="sm">
              {lastScanResult.estado}
            </Badge>
          </div>
        </div>
      )}

      {scanError && (
        <Alert variant="error" title="Aviso de Escáner" onClose={clearError}>
          {scanError}
        </Alert>
      )}

      {/* ── Escáner Óptico 100% Cámara Web (Colapsable / Toggle) ────────────── */}
      {showCamera && (
        <QRScannerWidget
          onScan={handleScan}
          loading={scanning}
          selectedCapillaId={selectedCapillaId}
          onCapillaChange={(id) => {
            setSelectedCapillaId(id);
            setPage(1);
          }}
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* ── Matriz Visual Heatmap (GitHub Commits Style) ────────────────────── */}
      {errorHeatmap ? (
        <Alert variant="error" title="Error en Matriz de Asistencia">
          {errorHeatmap}
        </Alert>
      ) : heatmapData ? (
        <AsistenciaHeatmap
          data={heatmapData}
          selectedFecha={selectedFecha}
          onSelectFecha={handleSelectFecha}
          loading={loadingHeatmap}
        />
      ) : (
        <div className="flex items-center justify-center p-12 bg-app-card rounded-2xl border border-app-border">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lit-primary" />
        </div>
      )}

      {/* ── Detalle del Domingo / Día Seleccionado ─────────────────────────── */}
      <div className="rounded-2xl border border-app-border bg-app-card shadow-xs overflow-hidden space-y-4">
        {/* Cabecera del detalle */}
        <div className="p-4 sm:p-5 border-b border-app-border bg-app-bg/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-lit-surface text-lit-primary text-base">
                📋
              </span>
              <h3 className="text-base font-bold text-app-text font-serif">
                {detalleFecha ? detalleFecha.fecha_formateada : `Sesión ${selectedFecha}`}
              </h3>
              {detalleFecha?.es_domingo && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lit-surface text-lit-primary font-bold">
                  Domingo Pastoral
                </span>
              )}
            </div>
            <p className="text-xs text-app-muted mt-1">
              Registro nominal con hora exacta de llegada y asignación automática de falta para inasistencias en Jesús Obrero.
            </p>
          </div>

          {/* Métricas del día */}
          {detalleFecha && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {detalleFecha.presentes} Presentes
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Clock className="w-3.5 h-3.5" />
                {detalleFecha.atrasos} Atrasos
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-3.5 h-3.5" />
                {detalleFecha.faltas} Faltas
              </span>

              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-app-card border border-app-border text-lit-primary">
                {detalleFecha.porcentaje}% Asistencia
              </span>
            </div>
          )}
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="px-4 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          {/* Buscador */}
          <div className="w-full sm:w-72">
            <Input
              placeholder="Buscar catecúmeno o subgrupo..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="w-3.5 h-3.5 text-app-muted" />}
            />
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] font-bold text-app-muted uppercase tracking-wider hidden sm:inline">
              Estado:
            </span>
            <div className="flex items-center gap-1 bg-app-bg border border-app-border p-0.5 rounded-lg text-xs">
              {([
                { val: 'TODOS', label: 'Todos' },
                { val: 'PRESENTE', label: 'Presentes' },
                { val: 'ATRASO', label: 'Atrasos' },
                { val: 'FALTA', label: 'Faltas' },
              ] as Array<{ val: FiltroEstado; label: string }>).map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => {
                    setFiltroEstado(val);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    filtroEstado === val
                      ? 'bg-lit-surface shadow-2xs text-lit-primary font-bold'
                      : 'text-app-muted hover:text-app-text'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla Nominal de Asistencia con Hora Exacta */}
        <div className="px-4 sm:px-5 pb-5 space-y-4">
          {loadingDetalle && !detalleFecha ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lit-primary" />
            </div>
          ) : errorDetalle ? (
            <Alert variant="error" title="Error">{errorDetalle}</Alert>
          ) : itemsFiltrados.length === 0 ? (
            <div className="bg-app-bg/50 rounded-xl border border-app-border p-10 text-center space-y-2">
              <div className="text-4xl">🕊️</div>
              <h4 className="text-sm font-bold text-app-text">Sin registros para el filtro seleccionado</h4>
              <p className="text-xs text-app-muted max-w-sm mx-auto">
                No hay catecúmenos en este domingo que coincidan con &quot;{searchTerm || filtroEstado}&quot;.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-app-border shadow-2xs">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-app-bg border-b border-app-border">
                    <tr>
                      {['Catecúmeno & Subgrupo', 'Sacramento', 'Hora Exacta', 'Estado', 'Tipo de Marcación / Observación'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-app-muted uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-border/50 bg-app-card">
                    {paginatedItems.map((item) => {
                      const isFalta = item.estado === 'FALTA';
                      const isAtraso = item.estado === 'ATRASO';
                      const isPresente = item.estado === 'PRESENTE';

                      return (
                        <tr
                          key={item.inscripcion_id}
                          className={`hover:bg-lit-surface/40 transition-colors ${
                            isFalta ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                          }`}
                        >
                          {/* Catecúmeno & Grupo */}
                          <td className="px-4 py-3">
                            <p className="text-xs font-bold text-app-text">
                              {item.nombre_completo}
                            </p>
                            <p className="text-[10px] text-app-muted flex items-center gap-1 mt-0.5">
                              <Sparkles className="w-3 h-3 text-lit-accent" />
                              <span>{item.grupo_nombre || 'Sin subgrupo asignado'}</span>
                            </p>
                          </td>

                          {/* Sacramento */}
                          <td className="px-4 py-3">
                            <span className="text-xs text-app-text font-medium">
                              {item.tipo_sacramento}
                            </span>
                          </td>

                          {/* Hora Exacta de Llegada */}
                          <td className="px-4 py-3">
                            {item.hora_str && item.hora_str !== '—' ? (
                              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-lit-primary bg-lit-surface px-2 py-0.5 rounded border border-lit-border/60">
                                <Clock className="w-3 h-3" />
                                {item.hora_str}
                              </span>
                            ) : (
                              <span className="text-xs text-app-muted/60 font-mono italic">
                                — (Sin marcación)
                              </span>
                            )}
                          </td>

                          {/* Estado */}
                          <td className="px-4 py-3">
                            <Badge
                              variant={isPresente ? 'success' : isAtraso ? 'warning' : isFalta ? 'error' : 'neutral'}
                              size="sm"
                            >
                              <span className="flex items-center gap-1 font-bold">
                                {isPresente && <CheckCircle2 className="w-3 h-3" />}
                                {isAtraso && <Clock className="w-3 h-3" />}
                                {isFalta && <AlertCircle className="w-3 h-3" />}
                                <span>{item.estado}</span>
                              </span>
                            </Badge>
                          </td>

                          {/* Observación / Detalle de Falta */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <span className={`text-xs ${
                                isFalta
                                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                  : isAtraso
                                  ? 'text-amber-600 dark:text-amber-400 font-medium'
                                  : 'text-app-text'
                              }`}>
                                {item.observacion || (isPresente ? 'Puntual (Antes de la Misa)' : 'Registrado')}
                              </span>
                              {item.es_falta_automatica && (
                                <span className="text-[10px] text-app-muted italic">
                                  Inasistencia dominical computada automáticamente
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación de la tabla */}
              {totalItems > 0 && (
                <Pagination
                  currentPage={page}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => {
                    setPageSize(s);
                    setPage(1);
                  }}
                  itemLabel="catecúmenos"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AsistenciaPage;
