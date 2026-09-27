/**
 * HorarioModal — Modal para Crear y Editar Horarios de Asistencia por Capilla.
 *
 * Incluye:
 *  - Validación cronológica estricta en tiempo real (Puntual < Misa < Catequesis).
 *  - Previsualizador interactivo de línea de tiempo con colores litúrgicos y badges.
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, Church, BookOpen, CheckCircle2, AlertTriangle, Sparkles, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Select from '@/components/ui/Select';
import type { HorarioAsistencia, HorarioAsistenciaCreate, HorarioAsistenciaUpdate, DiaSemana } from '@/types';

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
  const [horaInicioPuntual, setHoraInicioPuntual] = useState('09:20');
  const [horaFinPuntual, setHoraFinPuntual] = useState('10:10');
  const [horaInicioMisa, setHoraInicioMisa] = useState('10:11');
  const [horaFinMisa, setHoraFinMisa] = useState('12:00');
  const [horaInicioCatequesis, setHoraInicioCatequesis] = useState('12:01');
  const [horaFinCatequesis, setHoraFinCatequesis] = useState('13:00');
  const [descripcionMisa, setDescripcionMisa] = useState('Misa Comunitaria');
  const [descripcionCatequesis, setDescripcionCatequesis] = useState('Encuentro de Catequesis');
  const [activo, setActivo] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (horarioToEdit) {
      setDiaSemana(horarioToEdit.dia_semana);
      setHoraInicioPuntual(horarioToEdit.hora_inicio_puntual.slice(0, 5));
      setHoraFinPuntual(horarioToEdit.hora_fin_puntual.slice(0, 5));
      setHoraInicioMisa(horarioToEdit.hora_inicio_misa.slice(0, 5));
      setHoraFinMisa(horarioToEdit.hora_fin_misa.slice(0, 5));
      setHoraInicioCatequesis(horarioToEdit.hora_inicio_catequesis.slice(0, 5));
      setHoraFinCatequesis(horarioToEdit.hora_fin_catequesis.slice(0, 5));
      setDescripcionMisa(horarioToEdit.descripcion_misa || 'Misa Comunitaria');
      setDescripcionCatequesis(horarioToEdit.descripcion_catequesis || 'Encuentro de Catequesis');
      setActivo(horarioToEdit.activo);
    } else {
      setDiaSemana('DOMINGO');
      setHoraInicioPuntual('09:20');
      setHoraFinPuntual('10:10');
      setHoraInicioMisa('10:11');
      setHoraFinMisa('12:00');
      setHoraInicioCatequesis('12:01');
      setHoraFinCatequesis('13:00');
      setDescripcionMisa('Misa Dominical');
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
  } else if (mFinP > mIniM) {
    validationMsg = 'El fin del periodo puntual no puede ser posterior al inicio de la misa.';
  } else if (mIniM >= mFinM) {
    validationMsg = 'El inicio de la misa debe ser anterior a su finalización.';
  } else if (mFinM > mIniC) {
    validationMsg = 'El fin de la misa no puede ser posterior al inicio de la catequesis.';
  } else if (mIniC >= mFinC) {
    validationMsg = 'El inicio de la catequesis debe ser anterior a su finalización.';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fadeIn" onClick={onClose} />

      <div className="relative bg-white rounded-2xl border border-app-border shadow-2xl max-w-2xl w-full p-6 z-10 animate-scaleUp overflow-y-auto max-h-[90vh]">
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
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
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
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span><strong>Inconsistencia horaria:</strong> {validationMsg}</span>
          </div>
        )}

        {/* Previsualización en Vivo de la Línea de Tiempo */}
        <div className="mt-4 p-4 rounded-xl bg-stone-900 text-white space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-lit-accent flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Previsualización en Vivo de Franjas
            </span>
            <span className="font-mono text-stone-300">
              {horaInicioPuntual} → {horaFinCatequesis}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Puntual */}
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-200">
              <span className="text-[9px] font-bold block uppercase text-emerald-400">1. Puntual</span>
              <span className="text-xs font-mono font-bold">{horaInicioPuntual} - {horaFinPuntual}</span>
              <Badge variant="success" size="sm" className="mt-1">PRESENTE</Badge>
            </div>

            {/* Misa */}
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/30 text-amber-200">
              <span className="text-[9px] font-bold block uppercase text-amber-400">2. Misa</span>
              <span className="text-xs font-mono font-bold">{horaInicioMisa} - {horaFinMisa}</span>
              <Badge variant="warning" size="sm" className="mt-1">PRESENTE</Badge>
            </div>

            {/* Catequesis */}
            <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-500/30 text-rose-200">
              <span className="text-[9px] font-bold block uppercase text-rose-400">3. Catequesis</span>
              <span className="text-xs font-mono font-bold">{horaInicioCatequesis} - {horaFinCatequesis}</span>
              <Badge variant="error" size="sm" className="mt-1">ATRASO</Badge>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Día de la Semana */}
          <div>
            <Select<DiaSemana>
              label="Día de la Semana"
              leftIcon={<Calendar className="w-3.5 h-3.5 text-lit-primary" />}
              value={diaSemana}
              onChange={(val) => setDiaSemana(val)}
              options={DIAS_SEMANA}
            />
          </div>

          {/* Franja 1: Puntual */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                1. Franja Puntual (Antes del Inicio)
              </span>
              <span className="text-[10px] font-bold text-emerald-700">Estado: PRESENTE</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Hora Inicio</label>
                <input
                  type="time"
                  value={horaInicioPuntual}
                  onChange={(e) => setHoraInicioPuntual(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-emerald-300 p-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Hora Fin</label>
                <input
                  type="time"
                  value={horaFinPuntual}
                  onChange={(e) => setHoraFinPuntual(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-emerald-300 p-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Franja 2: Durante Misa */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Church className="w-3.5 h-3.5 text-amber-600" />
                2. Franja Durante la Misa
              </span>
              <span className="text-[10px] font-bold text-amber-700">Estado: PRESENTE (En Misa)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Hora Inicio Misa</label>
                <input
                  type="time"
                  value={horaInicioMisa}
                  onChange={(e) => setHoraInicioMisa(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-amber-300 p-2 bg-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Hora Fin Misa</label>
                <input
                  type="time"
                  value={horaFinMisa}
                  onChange={(e) => setHoraFinMisa(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-amber-300 p-2 bg-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Descripción de la Celebración</label>
              <input
                type="text"
                value={descripcionMisa}
                onChange={(e) => setDescripcionMisa(e.target.value)}
                placeholder="Ej: Misa Dominical Comunitaria"
                className="w-full text-xs rounded-lg border border-amber-300 p-2 bg-white outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Franja 3: Catequesis / Atraso */}
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                3. Franja Durante la Catequesis (Atraso)
              </span>
              <span className="text-[10px] font-bold text-rose-700">Estado: ATRASO</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Hora Inicio Catequesis</label>
                <input
                  type="time"
                  value={horaInicioCatequesis}
                  onChange={(e) => setHoraInicioCatequesis(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-rose-300 p-2 bg-white outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Hora Fin Catequesis</label>
                <input
                  type="time"
                  value={horaFinCatequesis}
                  onChange={(e) => setHoraFinCatequesis(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-rose-300 p-2 bg-white outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Descripción del Encuentro</label>
              <input
                type="text"
                value={descripcionCatequesis}
                onChange={(e) => setDescripcionCatequesis(e.target.value)}
                placeholder="Ej: Encuentro de Formación y Catequesis"
                className="w-full text-xs rounded-lg border border-rose-300 p-2 bg-white outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

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
