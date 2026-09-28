/**
 * CapillasPage — Gestión y CRUD completo de Capillas y Horarios de Asistencia Parroquial.
 *
 * Funcionalidades:
 *  - Crear, editar y eliminar Capillas (con protección de Sede Central).
 *  - Crear, editar y eliminar Horarios de Asistencia (con validación de solapamientos).
 *  - Línea de tiempo visual interactiva de rangos horarios.
 */

import React, { useState } from 'react';
import {
  MapPin, RefreshCw, Sparkles, ShieldCheck, Plus,
  Edit2, Trash2, Calendar, Shuffle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useCapillas, useGruposCapilla } from '../hooks/useCapillas';
import { CapillaModal } from '../components/CapillaModal';
import { HorarioModal } from '../components/HorarioModal';
import type {
  CapillaListItem, HorarioAsistencia, CapillaCreate,
  CapillaUpdate, HorarioAsistenciaCreate, HorarioAsistenciaUpdate
} from '@/types';

function formatTime(t?: string): string {
  if (!t) return '--:--';
  return t.slice(0, 5);
}

export const CapillasPage: React.FC = () => {
  const {
    data, loading, error, refetch,
    crearCapilla, editarCapilla, eliminarCapilla,
    crearHorario, editarHorario, eliminarHorario
  } = useCapillas();

  // Estados de Modales
  const [isCapillaModalOpen, setIsCapillaModalOpen] = useState(false);
  const [capillaToEdit, setCapillaToEdit] = useState<CapillaListItem | null>(null);

  const [isHorarioModalOpen, setIsHorarioModalOpen] = useState(false);
  const [horarioCapillaTarget, setHorarioCapillaTarget] = useState<{ id: number; nombre: string } | null>(null);
  const [horarioToEdit, setHorarioToEdit] = useState<HorarioAsistencia | null>(null);

  // Estados de Confirmación de Eliminación
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    type: 'capilla' | 'horario';
    id: number;
    capillaId?: number;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'capilla',
    id: 0,
    title: '',
    message: '',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Subgrupos de la Sede Central (Jesús Obrero, id=1)
  const {
    data: gruposJO,
    asignarSanto,
    autoAgruparPorEdad,
  } = useGruposCapilla(1, 2026, 'SEGUNDO_ANO');

  const [asignarSantoModal, setAsignarSantoModal] = useState<{
    isOpen: boolean;
    grupoId: number;
    nombreActual: string;
  }>({ isOpen: false, grupoId: 0, nombreActual: '' });

  const [nuevoNombreSanto, setNuevoNombreSanto] = useState('');
  const [isAutoAgrupando, setIsAutoAgrupando] = useState(false);

  const handleOpenAsignarSanto = (grupoId: number, nombreActual: string) => {
    setAsignarSantoModal({ isOpen: true, grupoId, nombreActual });
    setNuevoNombreSanto(nombreActual || '');
  };

  const handleConfirmAsignarSanto = async () => {
    if (!asignarSantoModal.grupoId || !nuevoNombreSanto.trim()) return;
    const res = await asignarSanto(asignarSantoModal.grupoId, nuevoNombreSanto.trim());
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Nombre patronal "${nuevoNombreSanto.trim()}" asignado al subgrupo.`,
      });
      setAsignarSantoModal({ isOpen: false, grupoId: 0, nombreActual: '' });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Error al asignar nombre patronal.' });
    }
  };

  const handleAutoAgrupar = async () => {
    setIsAutoAgrupando(true);
    const res = await autoAgruparPorEdad({
      gestion: 2026,
      etapa: 'SEGUNDO_ANO',
      cantidad_grupos: 4,
      nombres_santos: [
        'Juan Don Bosco',
        'San Nicolás',
        'San Pablo',
        'San Francisco de Asís',
      ],
    });
    setIsAutoAgrupando(false);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'Catecúmenos organizados y balanceados por edad en los 4 grupos patronales.',
      });
      setTimeout(() => setFeedback(null), 4500);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Error al conformar subgrupos.' });
    }
  };

  // ─── Handlers de Capilla ──────────────────────────────────────────────────

  const handleOpenNuevaCapilla = () => {
    setCapillaToEdit(null);
    setIsCapillaModalOpen(true);
  };

  const handleOpenEditarCapilla = (capilla: CapillaListItem) => {
    setCapillaToEdit(capilla);
    setIsCapillaModalOpen(true);
  };

  const handleSubmitCapilla = async (payload: CapillaCreate | CapillaUpdate, isEdit: boolean) => {
    let res;
    if (isEdit && capillaToEdit) {
      res = await editarCapilla(capillaToEdit.id, payload as CapillaUpdate);
    } else {
      res = await crearCapilla(payload as CapillaCreate);
    }

    if (res.success) {
      setFeedback({
        type: 'success',
        message: isEdit ? 'Capilla actualizada con éxito.' : 'Nueva capilla creada exitosamente.',
      });
      setTimeout(() => setFeedback(null), 4000);
    }
    return res;
  };

  const handleOpenEliminarCapilla = (capilla: CapillaListItem) => {
    if (capilla.es_sede_principal) {
      setFeedback({
        type: 'error',
        message: 'No se puede eliminar la Sede Central activa. Primero asigna otra capilla como sede principal.',
      });
      setTimeout(() => setFeedback(null), 5000);
      return;
    }
    setConfirmDelete({
      isOpen: true,
      type: 'capilla',
      id: capilla.id,
      title: `Eliminar ${capilla.nombre}`,
      message: `¿Estás seguro de que deseas eliminar esta capilla? Esta acción eliminará también todos sus horarios asociados.`,
    });
  };

  // ─── Handlers de Horario ──────────────────────────────────────────────────

  const handleOpenNuevoHorario = (capilla: CapillaListItem) => {
    setHorarioCapillaTarget({ id: capilla.id, nombre: capilla.nombre });
    setHorarioToEdit(null);
    setIsHorarioModalOpen(true);
  };

  const handleOpenEditarHorario = (capilla: CapillaListItem, horario: HorarioAsistencia) => {
    setHorarioCapillaTarget({ id: capilla.id, nombre: capilla.nombre });
    setHorarioToEdit(horario);
    setIsHorarioModalOpen(true);
  };

  const handleSubmitHorario = async (payload: HorarioAsistenciaCreate | HorarioAsistenciaUpdate, isEdit: boolean) => {
    if (!horarioCapillaTarget) return { success: false, error: 'Capilla no identificada.' };

    let res;
    if (isEdit && horarioToEdit) {
      res = await editarHorario(horarioCapillaTarget.id, horarioToEdit.id, payload as HorarioAsistenciaUpdate);
    } else {
      res = await crearHorario(horarioCapillaTarget.id, payload as HorarioAsistenciaCreate);
    }

    if (res.success) {
      setFeedback({
        type: 'success',
        message: isEdit ? 'Horario actualizado con éxito.' : 'Nuevo horario añadido con éxito.',
      });
      setTimeout(() => setFeedback(null), 4000);
    }
    return res;
  };

  const handleOpenEliminarHorario = (capillaId: number, horario: HorarioAsistencia) => {
    setConfirmDelete({
      isOpen: true,
      type: 'horario',
      id: horario.id,
      capillaId,
      title: `Eliminar Horario (${horario.dia_semana})`,
      message: `¿Estás seguro de que deseas eliminar este horario de asistencia?`,
    });
  };

  // ─── Confirmar Eliminación ────────────────────────────────────────────────

  const handleConfirmDelete = async () => {
    if (confirmDelete.type === 'capilla') {
      const res = await eliminarCapilla(confirmDelete.id);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Capilla eliminada correctamente.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Error al eliminar la capilla.' });
      }
    } else if (confirmDelete.type === 'horario' && confirmDelete.capillaId) {
      const res = await eliminarHorario(confirmDelete.capillaId, confirmDelete.id);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Horario eliminado correctamente.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Error al eliminar el horario.' });
      }
    }
    setConfirmDelete(prev => ({ ...prev, isOpen: false }));
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-12">
      {/* Cabecera Principal */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-lit-surface border border-lit-border text-lit-primary text-xl">
              ⛪
            </span>
            <div>
              <h2 className="text-lg font-bold text-app-text font-serif">
                Gestión de Capillas y Horarios
              </h2>
              <p className="text-xs text-app-muted mt-0.5">
                Administra los templos, capillas filiales y sus franjas horarias de asistencia.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={refetch}
          >
            Actualizar
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenNuevaCapilla}
          >
            ➕ Nueva Capilla
          </Button>
        </div>
      </div>

      {feedback && (
        <Alert variant={feedback.type === 'success' ? 'success' : 'error'} title={feedback.type === 'success' ? 'Éxito' : 'Atención'}>
          {feedback.message}
        </Alert>
      )}

      {error && <Alert variant="error" title="Error">{error}</Alert>}

      {/* Banner Informativo */}
      <div className="p-4 rounded-2xl bg-lit-surface text-app-text border border-lit-border shadow-xs relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lit-accent/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-lit-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-lit-accent" /> Protocolo de Evaluación Automática
            </span>
            <h3 className="text-sm font-bold text-lit-primary font-serif">
              Criterio Unificado de Asistencia Parroquial
            </h3>
            <p className="text-xs text-app-muted max-w-2xl leading-relaxed">
              Cada capilla define sus franjas cronológicas:
              <strong className="text-semantic-success-text"> Puntual</strong> (antes de la misa),
              <strong className="text-semantic-warning-text"> Durante la Misa</strong> (presente en celebración),
              <strong className="text-semantic-error-text"> Durante Catequesis</strong> (atraso registrado) o
              <strong className="text-app-muted"> Fuera de Horario</strong> (falta).
            </p>
          </div>

          <div className="flex-shrink-0 bg-app-card px-4 py-2 rounded-xl border border-app-border text-center shadow-2xs">
            <span className="text-xs font-mono font-bold text-lit-primary block">
              {data?.total ?? 0} Capillas
            </span>
            <span className="text-[10px] text-app-muted">Registradas</span>
          </div>
        </div>
      </div>

      {/* Grid de Capillas */}
      {loading && !data ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lit-primary" />
        </div>
      ) : data?.items.length === 0 ? (
        <div className="bg-app-card rounded-2xl border border-app-border p-12 text-center space-y-3 shadow-xs">
          <span className="text-4xl block">⛪</span>
          <h3 className="text-base font-bold text-app-text">No hay capillas registradas</h3>
          <p className="text-xs text-app-muted max-w-sm mx-auto">
            Comienza registrando la sede central o una capilla filial con sus respectivos horarios.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenNuevaCapilla} leftIcon={<Plus className="w-4 h-4" />}>
            Registrar Primera Capilla
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {data?.items.map((capilla) => (
            <div
              key={capilla.id}
              className={`rounded-2xl border transition-all duration-200 bg-app-card overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                capilla.es_sede_principal
                  ? 'border-lit-primary/40 ring-1 ring-lit-primary/20'
                  : 'border-app-border'
              }`}
            >
              {/* Cabecera de la Tarjeta */}
              <div className="p-5 border-b border-app-border/60 bg-lit-surface/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-xs ${
                      capilla.es_sede_principal ? 'bg-lit-primary text-white' : 'bg-app-bg text-app-text border border-app-border'
                    }`}>
                      {capilla.es_sede_principal ? '🏛️' : '⛪'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-app-text font-serif">
                          {capilla.nombre}
                        </h3>
                        {capilla.es_sede_principal ? (
                          <Badge variant="gold" size="sm">
                            Sede Central
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Capilla Filial
                          </Badge>
                        )}
                        {!capilla.activo && (
                          <Badge variant="error" size="sm">Inactiva</Badge>
                        )}
                      </div>
                      <p className="text-xs text-app-muted mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-app-muted flex-shrink-0" />
                        <span className="truncate">{capilla.direccion || 'Sin dirección registrada'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Acciones de la Capilla */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditarCapilla(capilla)}
                      className="p-1.5 rounded-lg text-app-muted hover:text-lit-primary hover:bg-lit-surface transition-colors"
                      title="Editar Capilla"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!capilla.es_sede_principal && (
                      <button
                        onClick={() => handleOpenEliminarCapilla(capilla)}
                        className="p-1.5 rounded-lg text-app-muted hover:text-semantic-error hover:bg-semantic-error-bg transition-colors"
                        title="Eliminar Capilla"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cuerpo: Lista de Horarios */}
              <div className="p-5 space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-app-text flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-lit-primary" /> Horarios de Asistencia ({capilla.horarios.length})
                  </span>
                  <button
                    onClick={() => handleOpenNuevoHorario(capilla)}
                    className="text-[11px] font-bold text-lit-primary hover:text-lit-primary/80 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-lit-surface transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Agregar Horario
                  </button>
                </div>

                {capilla.horarios.length === 0 ? (
                  <div className="py-6 text-center text-xs text-app-muted bg-app-bg rounded-xl border border-dashed border-app-border">
                    <p>No hay horarios registrados para esta capilla.</p>
                    <button
                      onClick={() => handleOpenNuevoHorario(capilla)}
                      className="text-xs font-bold text-lit-primary mt-1 hover:underline inline-block"
                    >
                      + Configurar primer horario
                    </button>
                  </div>
                ) : (
                  capilla.horarios.map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-xl border border-app-border bg-app-bg/70 space-y-3 hover:bg-app-bg transition-colors relative group"
                    >
                      {/* Cabecera del Horario */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-lit-primary bg-lit-surface px-2.5 py-0.5 rounded-full border border-lit-border">
                            {h.dia_semana}
                          </span>
                          <span className="text-[11px] text-app-muted font-medium">
                            {formatTime(h.hora_inicio_puntual)} – {formatTime(h.hora_fin_catequesis)}
                          </span>
                        </div>

                        {/* Botones de acción del Horario */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditarHorario(capilla, h)}
                            className="p-1 text-app-muted hover:text-lit-primary hover:bg-lit-surface rounded transition-colors"
                            title="Editar Horario"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEliminarHorario(capilla.id, h)}
                            className="p-1 text-app-muted hover:text-semantic-error hover:bg-semantic-error-bg rounded transition-colors"
                            title="Eliminar Horario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Timeline Visual de 3 Fases */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* 1. Puntual */}
                        <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex flex-col justify-between gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-emerald-950 dark:text-emerald-200 uppercase">1. Puntual</span>
                            <Badge variant="success" size="sm">PRESENTE</Badge>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-950 dark:text-emerald-100">
                            {formatTime(h.hora_inicio_puntual)} - {formatTime(h.hora_fin_puntual)}
                          </span>
                          <span className="text-[9px] text-emerald-700 dark:text-emerald-300 leading-tight">
                            Antes del inicio
                          </span>
                        </div>

                        {/* 2. Durante Misa */}
                        <div className="p-2 rounded-lg border border-amber-500/30 bg-amber-500/10 flex flex-col justify-between gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-amber-950 dark:text-amber-200 uppercase">2. En Misa</span>
                            <Badge variant="warning" size="sm">PRESENTE</Badge>
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-950 dark:text-amber-100">
                            {formatTime(h.hora_inicio_misa)} - {formatTime(h.hora_fin_misa)}
                          </span>
                          <span className="text-[9px] text-amber-700 dark:text-amber-300 leading-tight truncate">
                            {h.descripcion_misa || 'Celebración'}
                          </span>
                        </div>

                        {/* 3. Catequesis */}
                        <div className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 flex flex-col justify-between gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-rose-950 dark:text-rose-200 uppercase">3. Catequesis</span>
                            <Badge variant="error" size="sm">ATRASO</Badge>
                          </div>
                          <span className="text-xs font-mono font-bold text-rose-950 dark:text-rose-100">
                            {formatTime(h.hora_inicio_catequesis)} - {formatTime(h.hora_fin_catequesis)}
                          </span>
                          <span className="text-[9px] text-rose-700 dark:text-rose-300 leading-tight truncate">
                            {h.descripcion_catequesis || 'Encuentro'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Subgrupos de Catequesis (Exclusivo Sede Central Jesús Obrero) */}
                {capilla.es_sede_principal && (
                  <div className="mt-4 pt-4 border-t border-app-border/80 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-xs font-bold text-app-text flex items-center gap-1.5 font-serif">
                          <Sparkles className="w-3.5 h-3.5 text-lit-accent" />
                          Subgrupos de Catequesis · Gestión 2026 (2do Año)
                        </span>
                        <p className="text-[10px] text-app-muted mt-0.5 leading-tight">
                          Nivelados por edad/fecha de nacimiento con nombres patronales de Santos.
                        </p>
                      </div>

                      <button
                        onClick={handleAutoAgrupar}
                        disabled={isAutoAgrupando}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-900 dark:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-colors shadow-2xs disabled:opacity-50"
                        title="Re-balancear catecúmenos por fecha de nacimiento"
                      >
                        <Shuffle className={`w-3 h-3 ${isAutoAgrupando ? 'animate-spin' : ''}`} />
                        {isAutoAgrupando ? 'Agrupando...' : '⚡ Balancear por Edad'}
                      </button>
                    </div>

                    {/* Lista de los 4 Santos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {gruposJO?.items.map((g) => (
                        <div
                          key={g.id}
                          className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 transition-colors flex items-center justify-between"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-amber-950 dark:text-amber-200 font-serif">
                                {g.nombre_santo || g.nombre}
                              </span>
                              <span className="text-[9px] font-mono text-app-muted bg-app-card px-1 rounded border border-amber-500/30">
                                {g.codigo}
                              </span>
                            </div>
                            <p className="text-[10px] text-app-muted">
                              <strong className="text-amber-900 dark:text-amber-300">{g.total_catecumenos}</strong> catecúmenos
                              {g.edad_minima !== undefined && g.edad_maxima !== undefined && (
                                <span> · {g.edad_minima === g.edad_maxima ? `${g.edad_minima} años` : `${g.edad_minima}-${g.edad_maxima} años`}</span>
                              )}
                            </p>
                          </div>

                          <button
                            onClick={() => handleOpenAsignarSanto(g.id, g.nombre_santo || g.nombre)}
                            className="p-1.5 rounded-lg text-amber-800 dark:text-amber-200 hover:bg-lit-surface border border-transparent hover:border-lit-border transition-all text-[10px] font-semibold"
                            title="Renombrar o asignar Santo"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pie de la Tarjeta */}
              <div className="p-3.5 px-5 bg-lit-surface/20 border-t border-app-border/70 flex items-center justify-between">
                <span className="text-[11px] text-app-muted flex items-center gap-1 font-mono">
                  Código: <strong>{capilla.codigo}</strong>
                </span>
                <span className="text-xs font-bold text-lit-primary flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
                  {capilla.activo ? 'Operativa' : 'Inactiva'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modales ─────────────────────────────────────────────────────────── */}

      {/* Modal de Capilla (Crear / Editar) */}
      <CapillaModal
        isOpen={isCapillaModalOpen}
        capillaToEdit={capillaToEdit}
        onClose={() => setIsCapillaModalOpen(false)}
        onSubmit={handleSubmitCapilla}
      />

      {/* Modal de Horario (Crear / Editar) */}
      {horarioCapillaTarget && (
        <HorarioModal
          isOpen={isHorarioModalOpen}
          capillaId={horarioCapillaTarget.id}
          capillaNombre={horarioCapillaTarget.nombre}
          horarioToEdit={horarioToEdit}
          onClose={() => setIsHorarioModalOpen(false)}
          onSubmit={handleSubmitHorario}
        />
      )}

      {/* Diálogo de Confirmación para Eliminar */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.title}
        message={confirmDelete.message}
        variant="danger"
        confirmText="Sí, eliminar"
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Modal para Asignar Nombre Patronal de Santo */}
      {asignarSantoModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-app-card rounded-2xl shadow-xl border border-app-border p-6 max-w-sm w-full space-y-4 animate-scale-in">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-lit-surface text-lit-primary text-lg border border-lit-border">✨</span>
              <div>
                <h3 className="text-sm font-bold text-app-text font-serif">Asignar Nombre de Santo</h3>
                <p className="text-xs text-app-muted">Subgrupo Parroquia Jesús Obrero</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-app-text mb-1.5">
                Nombre Patronal de Santo:
              </label>
              <input
                type="text"
                value={nuevoNombreSanto}
                onChange={e => setNuevoNombreSanto(e.target.value)}
                placeholder="Ej: Juan Don Bosco, San Nicolás..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-app-border bg-app-card text-app-text focus:outline-none focus:ring-2 focus:ring-lit-primary"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAsignarSantoModal(prev => ({ ...prev, isOpen: false }))}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAsignarSanto}
                disabled={!nuevoNombreSanto.trim()}
              >
                Guardar Nombre
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapillasPage;
