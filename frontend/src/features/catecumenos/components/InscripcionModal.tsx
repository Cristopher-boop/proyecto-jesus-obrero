/**
 * InscripcionModal v2 — Multi-tutor + búsqueda de feligrés existente + requisitos de ingreso/salida.
 * 
 * Paso 1: Datos del niño/niña y requisitos de ingreso
 * Paso 2: Tutores (0-3, cada uno puede ser nuevo o feligrés existente)
 * Paso 3: Resumen y confirmación
 */

import React, { useState, useRef } from 'react';
import {
  X, ChevronRight, ChevronLeft, UserPlus, CheckCircle2,
  Baby, Users, Plus, Trash2, Search, UserCheck,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import Select from '@/components/ui/Select';
import apiClient from '@/core/api/client';
import { useCreateCatecumeno, type CreateCatecumenoPayload, type TutorNuevoPayload } from '../hooks/useCatecumenos';
import type { FeligresBusquedaItem, Parentesco } from '@/types';

const PARENTESCO_LABEL: Record<string, string> = {
  PAPA: '👨 Padre', MAMA: '👩 Madre', TUTOR_LEGAL: '🧑‍⚖️ Tutor Legal', OTRO: '👤 Otro',
};

interface TutorEntry {
  id:     number; // solo para el key de React
  tipo:   'nuevo' | 'vinculado';
  // Si nuevo:
  datos?: Partial<TutorNuevoPayload>;
  // Si vinculado:
  feligres?: FeligresBusquedaItem;
  parentesco: Parentesco;
  es_contacto_emergencia: boolean;
}

interface FormNino {
  ci_dni:                     string;
  nombres:                    string;
  primer_apellido:            string;
  segundo_apellido:           string;
  fecha_nacimiento:           string;
  genero:                     string;
  direccion:                  string;
  es_bautizado:               boolean;
  // Requisitos de Ingreso
  cuadernillo_comprado:       boolean;
  libro_comprado:             boolean;
  pago_cuota_inicial:         boolean;
  // Documentos de Salida (Fotocopias)
  doc_formulario_inscripcion: boolean;
  doc_fe_bautismo:            boolean;
  doc_cert_nacimiento:        boolean;
  doc_cert_matrimonio_padres: boolean;
  doc_ci_nino:                boolean;
  doc_ci_padre:               boolean;
  doc_ci_madre:               boolean;
  doc_ci_tutor:               boolean;
  observaciones:              string;
}

const INIT_NINO: FormNino = {
  ci_dni: '', nombres: '', primer_apellido: '', segundo_apellido: '', fecha_nacimiento: '',
  genero: '', direccion: '', es_bautizado: false,
  cuadernillo_comprado: false, libro_comprado: false, pago_cuota_inicial: false,
  doc_formulario_inscripcion: false, doc_fe_bautismo: false, doc_cert_nacimiento: false,
  doc_cert_matrimonio_padres: false, doc_ci_nino: false, doc_ci_padre: false,
  doc_ci_madre: false, doc_ci_tutor: false,
  observaciones: '',
};

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; }

const steps = [
  { id: 1, label: 'Catecúmeno', icon: Baby },
  { id: 2, label: 'Tutores', icon: Users },
  { id: 3, label: 'Confirmar', icon: CheckCircle2 },
];

export const InscripcionModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [step,   setStep]   = useState(1);
  const [nino,   setNino]   = useState<FormNino>(INIT_NINO);
  const [tutores, setTutores] = useState<TutorEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Para agregar un tutor nuevo inline
  const [addMode, setAddMode]           = useState<'none' | 'nuevo' | 'buscar'>('none');
  const [nuevoTutor, setNuevoTutor]     = useState<Partial<TutorNuevoPayload & { parentesco: Parentesco }>>({ parentesco: 'PAPA', es_contacto_emergencia: true });
  const [busquedaQ, setBusquedaQ]       = useState('');
  const [busquedaRes, setBusquedaRes]   = useState<FeligresBusquedaItem[]>([]);
  const [buscando, setBuscando]         = useState(false);
  const nextId = useRef(1);

  const { create, loading, error: apiError } = useCreateCatecumeno();

  if (!isOpen) return null;

  // ── Validaciones ─────────────────────────────────────────────────────────

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!nino.nombres.trim())          e.nombres         = 'Obligatorio.';
    if (!nino.primer_apellido.trim())  e.primer_apellido = 'Obligatorio.';
    if (!nino.fecha_nacimiento)        e.fecha_nacimiento = 'Obligatorio.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setAddMode('none');
    setErrors({});
    setStep(s => s + 1);
  };

  const handleBack = () => { setAddMode('none'); setErrors({}); setStep(s => s - 1); };

  // ── Tutores ───────────────────────────────────────────────────────────────

  const handleAddNuevo = () => {
    if (!nuevoTutor.nombres?.trim() || !nuevoTutor.primer_apellido?.trim()) return;
    const entry: TutorEntry = {
      id: nextId.current++,
      tipo: 'nuevo',
      datos: { ...nuevoTutor } as TutorNuevoPayload,
      parentesco: nuevoTutor.parentesco ?? 'PAPA',
      es_contacto_emergencia: nuevoTutor.es_contacto_emergencia ?? true,
    };
    setTutores(prev => [...prev, entry]);
    setNuevoTutor({ parentesco: 'PAPA', es_contacto_emergencia: true });
    setAddMode('none');
  };

  const handleSearchFeligres = async (q: string) => {
    setBusquedaQ(q);
    if (q.length < 2) { setBusquedaRes([]); return; }
    setBuscando(true);
    try {
      const res = await apiClient.get<FeligresBusquedaItem[]>(`/feligreses/buscar?q=${encodeURIComponent(q)}`);
      setBusquedaRes(res.data);
    } catch { setBusquedaRes([]); }
    finally { setBuscando(false); }
  };

  const handleSelectFeligres = (f: FeligresBusquedaItem) => {
    const entry: TutorEntry = {
      id: nextId.current++,
      tipo: 'vinculado',
      feligres: f,
      parentesco: 'PAPA',
      es_contacto_emergencia: true,
    };
    setTutores(prev => [...prev, entry]);
    setBusquedaQ(''); setBusquedaRes([]); setAddMode('none');
  };

  const handleRemoveTutor = (id: number) => setTutores(prev => prev.filter(t => t.id !== id));

  const handleSubmit = async () => {
    const payload: CreateCatecumenoPayload = {
      ci_dni:                     nino.ci_dni     || undefined,
      nombres:                    nino.nombres,
      primer_apellido:            nino.primer_apellido,
      segundo_apellido:           nino.segundo_apellido || undefined,
      fecha_nacimiento:           nino.fecha_nacimiento || undefined,
      genero:                     nino.genero || undefined,
      direccion:                  nino.direccion || undefined,
      es_bautizado:               nino.es_bautizado,
      tipo_sacramento:            'PRIMERA_COMUNION',
      // Requisitos de Ingreso
      cuadernillo_comprado:       nino.cuadernillo_comprado,
      libro_comprado:             nino.libro_comprado,
      pago_cuota_inicial:         nino.pago_cuota_inicial,
      // Documentos de Salida (Fotocopias)
      doc_formulario_inscripcion: nino.doc_formulario_inscripcion,
      doc_fe_bautismo:            nino.doc_fe_bautismo,
      doc_cert_nacimiento:        nino.doc_cert_nacimiento,
      doc_cert_matrimonio_padres: nino.doc_cert_matrimonio_padres,
      doc_ci_nino:                nino.doc_ci_nino,
      doc_ci_padre:               nino.doc_ci_padre,
      doc_ci_madre:               nino.doc_ci_madre,
      doc_ci_tutor:               nino.doc_ci_tutor,
      observaciones:              nino.observaciones || undefined,
      tutores_nuevos: tutores.filter(t => t.tipo === 'nuevo').map(t => ({
        nombres:              t.datos!.nombres!,
        primer_apellido:      t.datos!.primer_apellido!,
        segundo_apellido:     t.datos!.segundo_apellido,
        telefono_principal:   t.datos!.telefono_principal,
        parentesco:           t.parentesco,
        es_contacto_emergencia: t.es_contacto_emergencia,
      })),
      tutores_vinculo: tutores.filter(t => t.tipo === 'vinculado').map(t => ({
        tutor_persona_id: t.feligres!.persona_id,
        parentesco:       t.parentesco,
        es_contacto_emergencia: t.es_contacto_emergencia,
      })),
    };

    const result = await create(payload);
    if (result) { onSuccess(); handleClose(); }
  };

  const handleClose = () => {
    setStep(1); setNino(INIT_NINO); setTutores([]); setErrors({});
    setAddMode('none'); setBusquedaQ(''); setBusquedaRes([]);
    setNuevoTutor({ parentesco: 'PAPA', es_contacto_emergencia: true });
    onClose();
  };

  const nF = (k: keyof FormNino, v: string | boolean) => setNino(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-app-card w-full max-w-lg rounded-2xl shadow-2xl border border-app-border flex flex-col max-h-[90vh]">

        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-app-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lit-surface border border-lit-border flex items-center justify-center text-xl">📝</div>
            <div>
              <h2 className="text-base font-bold text-app-text">Nueva Inscripción</h2>
              <p className="text-[11px] text-app-muted">Primera Comunión · Jesús Obrero</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-lit-surface flex items-center justify-center text-app-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Stepper */}
        <div className="flex items-center px-6 py-4 gap-2 border-b border-app-border/60 flex-shrink-0">
          {steps.map((s, i) => {
            const Icon    = s.icon;
            const isDone  = step > s.id;
            const isActive = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isDone ? 'bg-lit-primary text-white' : isActive ? 'bg-lit-surface border-2 border-lit-primary text-lit-primary' : 'bg-app-bg border border-app-border text-app-muted'}`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[11px] font-medium hidden sm:block ${isActive ? 'text-lit-primary font-bold' : isDone ? 'text-lit-primary/70' : 'text-app-muted'}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-px ${step > s.id ? 'bg-lit-primary/40' : 'bg-app-border'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ─── PASO 1: Datos del niño ─────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-app-muted font-semibold uppercase tracking-wide">Información personal del catecúmeno</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nombre(s) *" value={nino.nombres} onChange={e => nF('nombres', e.target.value)} error={errors.nombres} placeholder="Ej: María José" />
                <Input label="CI" value={nino.ci_dni} onChange={e => nF('ci_dni', e.target.value)} placeholder="Ej: 1234567" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Primer Apellido *" value={nino.primer_apellido} onChange={e => nF('primer_apellido', e.target.value)} error={errors.primer_apellido} placeholder="Ej: Mamani" />
                <Input label="Segundo Apellido" value={nino.segundo_apellido} onChange={e => nF('segundo_apellido', e.target.value)} placeholder="Ej: Quispe" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-app-text">Fecha de Nacimiento *</label>
                  <input type="date" value={nino.fecha_nacimiento} onChange={e => nF('fecha_nacimiento', e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-app-card text-app-text outline-none focus:ring-2 focus:ring-lit-primary/30 ${errors.fecha_nacimiento ? 'border-semantic-error' : 'border-app-border'}`} />
                  {errors.fecha_nacimiento && <p className="text-[11px] text-semantic-error">{errors.fecha_nacimiento}</p>}
                </div>
                <Select
                  label="Género"
                  value={nino.genero}
                  onChange={val => nF('genero', val)}
                  placeholder="No especificado"
                  options={[
                    { value: '', label: 'No especificado' },
                    { value: 'MASCULINO', label: '♂ Masculino' },
                    { value: 'FEMENINO', label: '♀ Femenino' },
                    { value: 'OTRO', label: '⚬ Otro' },
                  ]}
                />
              </div>
              <Input label="Dirección" value={nino.direccion} onChange={e => nF('direccion', e.target.value)} placeholder="Ej: Zona Rosas Pampa, Calle X N° 123" />

              {/* Requisitos de Ingreso (Entrada) */}
              <div className="p-3.5 rounded-xl bg-lit-surface border border-lit-border space-y-2.5">
                <p className="text-[11px] font-bold text-lit-primary uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Requisitos de Ingreso (Entrada)
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={nino.cuadernillo_comprado} onChange={e => nF('cuadernillo_comprado', e.target.checked)} className="w-4 h-4 rounded accent-lit-primary" />
                    <span className="text-xs text-app-text font-medium group-hover:text-lit-primary transition-colors">Cuadernillo de asistencia comprado</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={nino.libro_comprado} onChange={e => nF('libro_comprado', e.target.checked)} className="w-4 h-4 rounded accent-lit-primary" />
                    <span className="text-xs text-app-text font-medium group-hover:text-lit-primary transition-colors">Libro oficial de catequesis comprado</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={nino.pago_cuota_inicial} onChange={e => nF('pago_cuota_inicial', e.target.checked)} className="w-4 h-4 rounded accent-lit-primary" />
                    <span className="text-xs text-app-text font-medium group-hover:text-lit-primary transition-colors">Cuota inicial de ingreso (20 Bs) pagada</span>
                  </label>
                </div>
              </div>

              {/* Estado Sacramental */}
              <div className="p-3 rounded-xl bg-app-bg border border-app-border space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={nino.es_bautizado} onChange={e => nF('es_bautizado', e.target.checked)} className="w-4 h-4 rounded accent-lit-primary" />
                  <span className="text-xs text-app-text font-medium group-hover:text-lit-primary transition-colors">¿Está bautizado/a en la Iglesia Católica?</span>
                </label>
                {!nino.es_bautizado && (
                  <p className="text-[10px] text-semantic-warning-text bg-semantic-warning-bg p-2 rounded-lg border border-semantic-warning-border">
                    ℹ️ Si aún no está bautizado/a, deberá realizar el sacramento del Bautismo antes de segundo año en la Vigilia Pascual.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-app-text">Observaciones</label>
                <textarea value={nino.observaciones} onChange={e => nF('observaciones', e.target.value)} rows={2} placeholder="Alergias, necesidades especiales..." className="w-full px-3 py-2 text-sm rounded-lg border border-app-border bg-app-card text-app-text resize-none outline-none focus:ring-2 focus:ring-lit-primary/30" />
              </div>
            </div>
          )}

          {/* ─── PASO 2: Tutores ────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-app-muted font-semibold uppercase tracking-wide">Tutores responsables (opcional, máx. 3)</p>
                <span className="text-[11px] text-app-muted">{tutores.length}/3</span>
              </div>

              {/* Lista de tutores añadidos */}
              {tutores.length === 0 && (
                <p className="text-xs text-app-muted italic text-center py-4">Ningún tutor añadido. Puedes inscribir al niño ahora y vincular tutores después.</p>
              )}
              {tutores.map(t => (
                <div key={t.id} className="flex items-start justify-between p-3 rounded-xl bg-app-bg border border-app-border">
                  <div className="flex items-start gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${t.tipo === 'vinculado' ? 'bg-lit-primary text-white' : 'bg-app-card border border-app-border text-app-muted'}`}>
                      {t.tipo === 'vinculado' ? <UserCheck className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-app-text">
                        {t.tipo === 'vinculado'
                          ? `${t.feligres!.nombres} ${t.feligres!.primer_apellido}`
                          : `${t.datos!.nombres} ${t.datos!.primer_apellido}`}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] bg-lit-surface px-1.5 py-0.5 rounded text-lit-primary font-medium">
                          {PARENTESCO_LABEL[t.parentesco]}
                        </span>
                        {t.tipo === 'vinculado' && (
                          <span className="text-[10px] text-lit-primary font-semibold">✓ Cuenta registrada</span>
                        )}
                        {t.tipo === 'nuevo' && t.datos?.telefono_principal && (
                          <span className="text-[10px] text-app-muted">{t.datos.telefono_principal}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveTutor(t.id)} className="w-6 h-6 rounded hover:bg-semantic-error-bg flex items-center justify-center text-semantic-error/70 hover:text-semantic-error flex-shrink-0 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Botones para agregar */}
              {tutores.length < 3 && addMode === 'none' && (
                <div className="flex gap-2">
                  <button onClick={() => setAddMode('nuevo')} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-dashed border-app-border text-xs text-app-muted hover:border-lit-primary hover:text-lit-primary transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Añadir tutor nuevo
                  </button>
                  <button onClick={() => setAddMode('buscar')} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-dashed border-lit-border text-xs text-lit-primary hover:bg-lit-surface transition-colors">
                    <Search className="w-3.5 h-3.5" /> Vincular feligrés
                  </button>
                </div>
              )}

              {/* Sub-formulario: Tutor nuevo */}
              {addMode === 'nuevo' && (
                <div className="p-4 rounded-xl border border-lit-border bg-lit-surface/50 space-y-3">
                  <p className="text-xs font-bold text-lit-primary">Datos del tutor</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Nombre(s) *" value={nuevoTutor.nombres ?? ''} onChange={e => setNuevoTutor(p => ({ ...p, nombres: e.target.value }))} className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-app-border bg-app-card text-app-text outline-none focus:ring-2 focus:ring-lit-primary/30" />
                    <input placeholder="Primer Apellido *" value={nuevoTutor.primer_apellido ?? ''} onChange={e => setNuevoTutor(p => ({ ...p, primer_apellido: e.target.value }))} className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-app-border bg-app-card text-app-text outline-none focus:ring-2 focus:ring-lit-primary/30" />
                    <input placeholder="Segundo Apellido" value={nuevoTutor.segundo_apellido ?? ''} onChange={e => setNuevoTutor(p => ({ ...p, segundo_apellido: e.target.value }))} className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-app-border bg-app-card text-app-text outline-none focus:ring-2 focus:ring-lit-primary/30" />
                    <input placeholder="Teléfono" type="tel" value={nuevoTutor.telefono_principal ?? ''} onChange={e => setNuevoTutor(p => ({ ...p, telefono_principal: e.target.value }))} className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-app-border bg-app-card text-app-text outline-none focus:ring-2 focus:ring-lit-primary/30" />
                  </div>
                  {/* Parentesco */}
                  <div className="flex gap-1.5 flex-wrap">
                    {(['PAPA', 'MAMA', 'TUTOR_LEGAL', 'OTRO'] as Parentesco[]).map(p => (
                      <button key={p} type="button" onClick={() => setNuevoTutor(prev => ({ ...prev, parentesco: p }))}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${nuevoTutor.parentesco === p ? 'bg-lit-surface border-lit-primary text-lit-primary font-bold' : 'bg-app-card border-app-border text-app-muted'}`}>
                        {PARENTESCO_LABEL[p]}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={handleAddNuevo} className="flex-1" leftIcon={<Plus className="w-3 h-3" />}>Agregar</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setAddMode('none'); setNuevoTutor({ parentesco: 'PAPA', es_contacto_emergencia: true }); }}>Cancelar</Button>
                  </div>
                </div>
              )}

              {/* Sub-formulario: Buscar feligrés */}
              {addMode === 'buscar' && (
                <div className="p-4 rounded-xl border border-lit-border bg-lit-surface/50 space-y-3">
                  <p className="text-xs font-bold text-lit-primary">Buscar cuenta de feligrés</p>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-app-muted" />
                    <input placeholder="Nombre, apellido o CI..." value={busquedaQ} onChange={e => handleSearchFeligres(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-app-border bg-app-card text-app-text outline-none focus:ring-2 focus:ring-lit-primary/30" />
                  </div>
                  {buscando && <p className="text-[11px] text-app-muted text-center">Buscando...</p>}
                  {busquedaRes.length > 0 && (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {busquedaRes.map(f => (
                        <button key={f.persona_id} onClick={() => handleSelectFeligres(f)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-lit-surface text-left transition-colors">
                          <div>
                            <p className="text-xs font-semibold text-app-text">{f.nombres} {f.primer_apellido}</p>
                            <p className="text-[10px] text-app-muted">CI: {f.ci_dni} {f.telefono ? `· ${f.telefono}` : ''}</p>
                          </div>
                          <UserCheck className="w-3.5 h-3.5 text-lit-primary flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                  {busquedaQ.length >= 2 && !buscando && busquedaRes.length === 0 && (
                    <p className="text-[11px] text-app-muted text-center">No se encontraron feligreses con ese nombre o CI.</p>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => { setAddMode('none'); setBusquedaQ(''); setBusquedaRes([]); }}>Cancelar</Button>
                </div>
              )}
            </div>
          )}

          {/* ─── PASO 3: Confirmación ───────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-app-muted font-semibold uppercase tracking-wide">Resumen de la inscripción</p>
              {apiError && <Alert variant="error" title="Error al inscribir">{apiError}</Alert>}

              <div className="p-4 rounded-xl bg-app-bg border border-app-border space-y-2">
                <div className="flex items-center gap-2 mb-2"><Baby className="w-4 h-4 text-lit-primary" /><p className="text-xs font-bold text-lit-primary uppercase tracking-wide">Catecúmeno</p></div>
                <p className="text-sm font-bold text-app-text">{[nino.nombres, nino.primer_apellido, nino.segundo_apellido].filter(Boolean).join(' ')}</p>
                {nino.fecha_nacimiento && <p className="text-xs text-app-muted">Nació: {new Date(nino.fecha_nacimiento + 'T12:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>}
                {nino.ci_dni && <p className="text-xs text-app-muted">CI: {nino.ci_dni}</p>}
                
                <div className="pt-2 border-t border-app-border space-y-1">
                  <p className="text-[10px] font-bold text-app-muted uppercase">Requisitos de Ingreso:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {nino.cuadernillo_comprado ? <span className="px-2 py-0.5 bg-semantic-success-bg border border-semantic-success-border text-semantic-success-text text-[10px] rounded-full font-semibold">✓ Cuadernillo</span> : <span className="px-2 py-0.5 bg-app-card border border-app-border text-app-muted text-[10px] rounded-full">Cuadernillo pendiente</span>}
                    {nino.libro_comprado ? <span className="px-2 py-0.5 bg-semantic-success-bg border border-semantic-success-border text-semantic-success-text text-[10px] rounded-full font-semibold">✓ Libro</span> : <span className="px-2 py-0.5 bg-app-card border border-app-border text-app-muted text-[10px] rounded-full">Libro pendiente</span>}
                    {nino.pago_cuota_inicial ? <span className="px-2 py-0.5 bg-semantic-success-bg border border-semantic-success-border text-semantic-success-text text-[10px] rounded-full font-semibold">✓ Cuota 20 Bs</span> : <span className="px-2 py-0.5 bg-app-card border border-app-border text-app-muted text-[10px] rounded-full">Cuota 20 Bs pendiente</span>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {nino.es_bautizado && <span className="px-2 py-0.5 bg-lit-surface border border-lit-border text-lit-primary text-[10px] rounded-full font-semibold">✓ Bautizado/a</span>}
                </div>
              </div>

              {tutores.length > 0 && (
                <div className="p-4 rounded-xl bg-app-bg border border-app-border space-y-2">
                  <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-lit-primary" /><p className="text-xs font-bold text-lit-primary uppercase tracking-wide">Tutores ({tutores.length})</p></div>
                  {tutores.map(t => (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="text-xs text-app-text font-medium">
                        {t.tipo === 'vinculado' ? `${t.feligres!.nombres} ${t.feligres!.primer_apellido}` : `${t.datos!.nombres} ${t.datos!.primer_apellido}`}
                      </span>
                      <span className="text-[10px] text-app-muted">— {PARENTESCO_LABEL[t.parentesco]}</span>
                      {t.tipo === 'vinculado' && <span className="text-[10px] text-lit-primary font-semibold">✓ Feligrés</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 rounded-xl bg-semantic-warning-bg border border-semantic-warning-border text-[11px] text-semantic-warning-text">
                🆔 Se generará un <strong>código QR único</strong> al confirmar. Podrás imprimirlo como gafete desde el panel de detalle.
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="flex items-center justify-between p-5 border-t border-app-border flex-shrink-0">
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={handleBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>Atrás</Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleClose}>Cancelar</Button>
          )}
          {step < 3 ? (
            <Button variant="primary" size="sm" onClick={handleNext} rightIcon={<ChevronRight className="w-4 h-4" />}>Siguiente</Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={loading} leftIcon={<UserPlus className="w-4 h-4" />}>
              Inscribir Catecúmeno
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InscripcionModal;
