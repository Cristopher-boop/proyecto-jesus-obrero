/**
 * HorarioModal — Modal para Crear y Editar Horarios de Asistencia por Capilla.
 *
 * Incluye:
 *  - Soporte para sacramentos (Primera Comunión / Confirmación).
 *  - Soporte para flujos (Misa antes del encuentro vs. Encuentro antes de misa).
 *  - Validación cronológica estricta en tiempo real.
 *  - Previsualizador interactivo de línea de tiempo con colores litúrgicos y badges.
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, Church, BookOpen, CheckCircle2, AlertTriangle, Sparkles, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Select from '@/components/ui/Select';
import type { HorarioAsistencia, HorarioAsistenciaCreate, HorarioAsistenciaUpdate, DiaSemana, TipoSacramento } from '@/types';

interface HorarioModalProps {
  isOpen: boolean;
  capillaId: number;
  capillaNombre: string;
  horarioToEdit?: HorarioAsistencia | null;
  onClose: () => void;
  onSubmit: (data: HorarioAsistenciaCreate | HorarioAsistenciaUpdate, isEdit: boolean) => Promise<{ success: boolean; error?: string }>;
}

const DIAS_SEMANA: { value: DiaSemana; label: string }[] = [
  { value: 'DOMINGO',   label: 'Domingo (Celebración Dominical)' },
  { value: 'SABADO',    label: 'Sábado (Celebración Sabatina)' },
  { value: 'VIERNES',   label: 'Viernes' },
  { value: 'JUEVES',    label: 'Jueves' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'MARTES',    label: 'Martes' },
  { value: 'LUNES',     label: 'Lunes' },
];

function timeToMinutes(t?: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export const HorarioModal: React.FC<HorarioModalProps> = ({
  isOpen,
  capillaNombre,
  horarioToEdit,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(horarioToEdit);

  const [diaSemana, setDiaSemana] = useState<DiaSemana>('DOMINGO');
  const [tipoSacramento, setTipoSacramento] = useState<TipoSacramento>('PRIMERA_COMUNION');
  const [encuentroAntesDeMisa, setEncuentroAntesDeMisa] = useState<boolean>(false);

  const [horaInicioPuntual, setHoraInicioPuntual] = useState('09:20');
  const [horaFinPuntual, setHoraFinPuntual] = useState('10:10');
  const [horaInicioMisa, setHoraInicioMisa] = useState('10:11');
  const [horaFinMisa, setHoraFinMisa] = useState('11:10');
  const [horaInicioCatequesis, setHoraInicioCatequesis] = useState('11:11');
  const [horaFinCatequesis, setHoraFinCatequesis] = useState('13:00');
  const [descripcionMisa, setDescripcionMisa] = useState('Eucaristía Comunitaria');
  const [descripcionCatequesis, setDescripcionCatequesis] = useState('Encuentro de Formación');
  const [activo, setActivo] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (horarioToEdit) {
      setDiaSemana(horarioToEdit.dia_semana);
      setTipoSacramento(horarioToEdit.tipo_sacramento || 'PRIMERA_COMUNION');
      setEncuentroAntesDeMisa(Boolean(horarioToEdit.encuentro_antes_de_misa));
      setHoraInicioPuntual(horarioToEdit.hora_inicio_puntual.slice(0, 5));
      setHoraFinPuntual(horarioToEdit.hora_fin_puntual.slice(0, 5));
      setHoraInicioMisa(horarioToEdit.hora_inicio_misa.slice(0, 5));
      setHoraFinMisa(horarioToEdit.hora_fin_misa.slice(0, 5));
      setHoraInicioCatequesis(horarioToEdit.hora_inicio_catequesis.slice(0, 5));
      setHoraFinCatequesis(horarioToEdit.hora_fin_catequesis.slice(0, 5));
      setDescripcionMisa(horarioToEdit.descripcion_misa || 'Eucaristía Comunitaria');
      setDescripcionCatequesis(horarioToEdit.descripcion_catequesis || 'Encuentro de Formación');
      setActivo(horarioToEdit.activo);
    } else {
      setDiaSemana('DOMINGO');
      setTipoSacramento('PRIMERA_COMUNION');
      setEncuentroAntesDeMisa(false);
      setHoraInicioPuntual('09:20');
      setHoraFinPuntual('10:10');
      setHoraInicioMisa('10:11');
      setHoraFinMisa('11:10');
      setHoraInicioCatequesis('11:11');
      setHoraFinCatequesis('13:00');
      setDescripcionMisa('Eucaristía Comunitaria');
      setDescripcionCatequesis('Encuentro de Formación');
      setActivo(true);
    }
    setError(null);
  }, [horarioToEdit, isOpen]);

  if (!isOpen) return null;

  // Validación cronológica en tiempo real
  const mIniP = timeToMinutes(horaInicioPuntual);
  const mFinP = timeToMinutes(horaFinPuntual);
  const mIniM = timeToMinutes(horaInicioMisa);
  const mFinM = timeToMinutes(horaFinMisa);
  const mIniC = timeToMinutes(horaInicioCatequesis);
  const mFinC = timeToMinutes(horaFinCatequesis);

  let validationMsg: string | null = null;
  if (mIniP >= mFinP) {
    validationMsg = 'La hora de inicio puntual debe ser anterior a su finalización.';
  } else if (encuentroAntesDeMisa) {
    // Orden: Puntual -> Encuentro -> Misa
    if (mFinP > mIniC) {
      validationMsg = 'El fin del periodo puntual no puede ser posterior al inicio del encuentro.';
    } else if (mIniC >= mFinC) {
      validationMsg = 'El inicio del encuentro debe ser anterior a su finalización.';
    } else if (mFinC > mIniM) {
      validationMsg = 'El fin del encuentro no puede ser posterior al inicio de la misa.';
    } else if (mIniM >= mFinM) {
      validationMsg = 'El inicio de la misa debe ser anterior a su finalización.';
    }
  } else {
    // Orden: Puntual -> Misa -> Encuentro
    if (mFinP > mIniM) {
      validationMsg = 'El fin del periodo puntual no puede ser posterior al inicio de la misa.';
    } else if (mIniM >= mFinM) {
      validationMsg = 'El inicio de la misa debe ser anterior a su finalización.';
    } else if (mFinM > mIniC) {
      validationMsg = 'El fin de la misa no puede ser posterior al inicio del encuentro de catequesis.';
    } else if (mIniC >= mFinC) {
      validationMsg = 'El inicio del encuentro de catequesis debe ser anterior a su finalización.';
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    setLoading(true);
    setError(null);

    const payload: HorarioAsistenciaCreate = {
      dia_semana: diaSemana,
      tipo_sacramento: tipoSacramento,
      encuentro_antes_de_misa: encuentroAntesDeMisa,
      hora_inicio_puntual: `${horaInicioPuntual}:00`,
      hora_fin_puntual: `${horaFinPuntual}:00`,
      hora_inicio_misa: `${horaInicioMisa}:00`,
      hora_fin_misa: `${horaFinMisa}:00`,
      hora_inicio_catequesis: `${horaInicioCatequesis}:00`,
      hora_fin_catequesis: `${horaFinCatequesis}:00`,
      descripcion_misa: descripcionMisa.trim() || undefined,
      descripcion_catequesis: descripcionCatequesis.trim() || undefined,
      activo,
    };

    const res = await onSubmit(payload, isEdit);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Ocurrió un error al guardar el horario.');
    }
  };

  const horaFinTotal = encuentroAntesDeMisa ? horaFinMisa : horaFinCatequesis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fadeIn" onClick={onClose} />

      <div className="relative bg-app-card rounded-2xl border border-app-border shadow-2xl max-w-2xl w-full p-6 z-10 animate-scaleUp overflow-y-auto max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-4 border-b border-app-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lit-surface border border-lit-border text-lit-primary flex items-center justify-center text-xl shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-app-text font-serif">
                {isEdit ? 'Editar Horario de Asistencia' : 'Nuevo Horario de Asistencia'}
              </h3>
              <p className="text-xs text-app-muted">
                Capilla: <strong className="text-app-text">{capillaNombre}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-app-muted hover:text-app-text hover:bg-lit-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4">
            <Alert variant="error" title="Error">{error}</Alert>
          </div>
        )}

        {validationMsg && (
          <div className="mt-4 p-3 rounded-xl bg-semantic-warning-bg border border-semantic-warning-border text-semantic-warning-text text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-semantic-warning-text flex-shrink-0" />
            <span><strong>Inconsistencia horaria:</strong> {validationMsg}</span>
          </div>
        )}

        {/* Previsualización en Vivo de la Línea de Tiempo */}
        <div className="mt-4 p-4 rounded-xl bg-lit-surface text-app-text border border-lit-border space-y-3 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-lit-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-lit-accent" /> Previsualización en Vivo de Franjas
            </span>
            <span className="font-mono text-app-muted">
              {horaInicioPuntual} → {horaFinTotal}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 1. Puntual */}
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold block uppercase text-emerald-800 dark:text-emerald-300">
                  1. Puntual
                </span>
                <span className="text-xs font-mono font-bold">{horaInicioPuntual} - {horaFinPuntual}</span>
              </div>
              <Badge variant="success" size="sm" className="mt-1 self-start">PRESENTE</Badge>
            </div>

            {/* 2. Primera Actividad */}
            {encuentroAntesDeMisa ? (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold block uppercase text-amber-800 dark:text-amber-300">
                    2. En Encuentro
                  </span>
                  <span className="text-xs font-mono font-bold">{horaInicioCatequesis} - {horaFinCatequesis}</span>
                </div>
                <Badge variant="warning" size="sm" className="mt-1 self-start">PRESENTE</Badge>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold block uppercase text-amber-800 dark:text-amber-300">
                    2. En Misa
                  </span>
                  <span className="text-xs font-mono font-bold">{horaInicioMisa} - {horaFinMisa}</span>
                </div>
                <Badge variant="warning" size="sm" className="mt-1 self-start">PRESENTE</Badge>
              </div>
            )}

            {/* 3. Segunda Actividad (Atraso) */}
            {encuentroAntesDeMisa ? (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-100 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold block uppercase text-rose-800 dark:text-rose-300">
                    3. En Misa (Atraso)
                  </span>
                  <span className="text-xs font-mono font-bold">{horaInicioMisa} - {horaFinMisa}</span>
                </div>
                <Badge variant="error" size="sm" className="mt-1 self-start">ATRASO</Badge>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-100 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold block uppercase text-rose-800 dark:text-rose-300">
                    3. Catequesis (Atraso)
                  </span>
                  <span className="text-xs font-mono font-bold">{horaInicioCatequesis} - {horaFinCatequesis}</span>
                </div>
                <Badge variant="error" size="sm" className="mt-1 self-start">ATRASO</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Sacramentos y Día */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-app-text mb-1">
                Sacramento
              </label>
              <select
                value={tipoSacramento}
                onChange={(e) => setTipoSacramento(e.target.value as TipoSacramento)}
                className="w-full text-xs rounded-xl border border-app-border bg-app-card text-app-text p-2.5 font-medium outline-none focus:ring-2 focus:ring-lit-primary/30"
              >
                <option value="PRIMERA_COMUNION">Niños para la 1ra Comunión</option>
                <option value="CONFIRMACION">Jóvenes de Confirmación</option>
              </select>
            </div>

            <div>
              <Select<DiaSemana>
                label="Día de la Semana"
                leftIcon={<Calendar className="w-3.5 h-3.5 text-lit-primary" />}
                value={diaSemana}
                onChange={(val) => setDiaSemana(val)}
                options={DIAS_SEMANA}
              />
            </div>
          </div>

          {/* Selector de Flujo Operativo */}
          <div className="p-3 rounded-xl bg-app-bg border border-app-border flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-app-text">Orden del Encuentro y Misa</span>
              <p className="text-[10px] text-app-muted">
                {encuentroAntesDeMisa
                  ? 'El encuentro formativo se realiza antes de la Eucaristía.'
                  : 'La Santa Misa se celebra antes del encuentro de catequesis.'}
              </p>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={encuentroAntesDeMisa}
                onChange={(e) => setEncuentroAntesDeMisa(e.target.checked)}
                className="rounded text-lit-primary focus:ring-lit-primary w-4 h-4"
              />
              <span className="font-semibold text-app-text">
                {encuentroAntesDeMisa ? 'Encuentro antes que Misa' : 'Misa antes que Encuentro'}
              </span>
            </label>
          </div>

          {/* Franja 1: Puntual */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                1. Franja Puntual ({encuentroAntesDeMisa ? 'Antes del Encuentro' : 'Antes de la Misa'})
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Estado: PRESENTE</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-app-muted mb-1">Hora Inicio</label>
                <input
                  type="time"
                  value={horaInicioPuntual}
                  onChange={(e) => setHoraInicioPuntual(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-emerald-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-app-muted mb-1">Hora Fin</label>
                <input
                  type="time"
                  value={horaFinPuntual}
                  onChange={(e) => setHoraFinPuntual(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-emerald-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Franjas 2 y 3 ordenadas según flujo */}
          {encuentroAntesDeMisa ? (
            <>
              {/* 2. Encuentro (Presente) */}
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    2. Franja Durante el Encuentro
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">Estado: PRESENTE</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-app-muted mb-1">Hora Inicio Encuentro</label>
                    <input
                      type="time"
                      value={horaInicioCatequesis}
                      onChange={(e) => setHoraInicioCatequesis(e.target.value)}
                      className="w-full text-xs font-mono font-bold rounded-lg border border-amber-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-app-muted mb-1">Hora Fin Encuentro</label>
                    <input
                      type="time"
                      value={horaFinCatequesis}
                      onChange={(e) => setHoraFinCatequesis(e.target.value)}
                      className="w-full text-xs font-mono font-bold rounded-lg border border-amber-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Descripción del Encuentro</label>
                  <input
                    type="text"
                    value={descripcionCatequesis}
                    onChange={(e) => setDescripcionCatequesis(e.target.value)}
                    placeholder="Ej: Encuentro de Confirmación (1er y 2do año)"
                    className="w-full text-xs rounded-lg border border-amber-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* 3. Misa (Atraso) */}
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                    <Church className="w-3.5 h-3.5 text-rose-600" />
                    3. Franja Durante la Santa Misa (Atraso)
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">Estado: ATRASO</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-app-muted mb-1">Hora Inicio Misa</label>
                    <input
                      type="time"
                      value={horaInicioMisa}
                      onChange={(e) => setHoraInicioMisa(e.target.value)}
                      className="w-full text-xs font-mono font-bold rounded-lg border border-rose-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-app-muted mb-1">Hora Fin Misa</label>
                    <input
                      type="time"
                      value={horaFinMisa}
                      onChange={(e) => setHoraFinMisa(e.target.value)}
                      className="w-full text-xs font-mono font-bold rounded-lg border border-rose-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Descripción de la Misa</label>
                  <input
                    type="text"
                    value={descripcionMisa}
                    onChange={(e) => setDescripcionMisa(e.target.value)}
                    placeholder="Ej: Eucaristía Dominical"
                    className="w-full text-xs rounded-lg border border-rose-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 2. Misa (Presente) */}
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <Church className="w-3.5 h-3.5 text-amber-600" />
                    2. Franja Durante la Misa
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">Estado: PRESENTE</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-app-muted mb-1">Hora Inicio Misa</label>
                    <input
                      type="time"
                      value={horaInicioMisa}
                      onChange={(e) => setHoraInicioMisa(e.target.value)}
                      className="w-full text-xs font-mono font-bold rounded-lg border border-amber-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-app-muted mb-1">Hora Fin Misa</label>
                    <input
                      type="time"
                      value={horaFinMisa}
                      onChange={(e) => setHoraFinMisa(e.target.value)}
                      className="w-full text-xs font-mono font-bold rounded-lg border border-amber-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Descripción de la Celebración</label>
                  <input
                    type="text"
                    value={descripcionMisa}
                    onChange={(e) => setDescripcionMisa(e.target.value)}
                    placeholder="Ej: Misa Dominical Comunitaria"
                    className="w-full text-xs rounded-lg border border-amber-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* 3. Catequesis (Atraso) */}
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                    3. Franja Durante la Catequesis (Atraso)
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">Estado: ATRASO</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-app-muted mb-1">Hora Inicio Catequesis</label>
                    <input
                      type="time"
                      value={horaInicioCatequesis}
                      onChange={(e) => setHoraInicioCatequesis(e.target.value)}
                      className="w-full text-xs font-mono font-bold rounded-lg border border-rose-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-app-muted mb-1">Hora Fin Catequesis</label>
                    <input
                      type="time"
                      value={horaFinCatequesis}
                      onChange={(e) => setHoraFinCatequesis(e.target.value)}
                      className="w-full text-xs font-mono font-bold rounded-lg border border-rose-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Descripción del Encuentro</label>
                  <input
                    type="text"
                    value={descripcionCatequesis}
                    onChange={(e) => setDescripcionCatequesis(e.target.value)}
                    placeholder="Ej: Encuentro de Formación y Catequesis"
                    className="w-full text-xs rounded-lg border border-rose-500/40 p-2 bg-app-card text-app-text outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-app-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={loading}
              disabled={Boolean(validationMsg)}
            >
              {isEdit ? 'Guardar Horario' : 'Registrar Horario'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HorarioModal;
