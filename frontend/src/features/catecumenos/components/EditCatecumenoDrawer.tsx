/**
 * EditCatecumenoDrawer — Drawer lateral para editar datos del catecúmeno y verificar requisitos.
 * Se desliza sobre el panel de detalle existente.
 */

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { useUpdateCatecumeno, type UpdateCatecumenoPayload } from '../hooks/useCatecumenos';
import type { CatecumenoDetalle, EstadoInscripcion } from '@/types';

interface Props {
  catecumeno: CatecumenoDetalle;
  onClose:   () => void;
  onSaved:   (updated: CatecumenoDetalle) => void;
}

export const EditCatecumenoDrawer: React.FC<Props> = ({ catecumeno, onClose, onSaved }) => {
  const { update, loading, error } = useUpdateCatecumeno();

  // Inicializar form con datos actuales
  const [form, setForm] = useState<UpdateCatecumenoPayload>({
    ci_dni:                     catecumeno.ci_dni                  ?? '',
    nombres:                    catecumeno.nombres,
    primer_apellido:            catecumeno.primer_apellido,
    segundo_apellido:           catecumeno.segundo_apellido         ?? '',
    fecha_nacimiento:           catecumeno.fecha_nacimiento         ?? '',
    genero:                     catecumeno.genero                   ?? '',
    direccion:                  catecumeno.direccion                ?? '',
    es_bautizado:               catecumeno.es_bautizado,
    cuadernillo_comprado:       catecumeno.inscripcion.cuadernillo_comprado,
    libro_comprado:             catecumeno.inscripcion.libro_comprado,
    pago_cuota_inicial:         catecumeno.inscripcion.pago_cuota_inicial,
    doc_formulario_inscripcion: catecumeno.inscripcion.doc_formulario_inscripcion,
    doc_fe_bautismo:            catecumeno.inscripcion.doc_fe_bautismo,
    doc_cert_nacimiento:        catecumeno.inscripcion.doc_cert_nacimiento,
    doc_cert_matrimonio_padres: catecumeno.inscripcion.doc_cert_matrimonio_padres,
    doc_ci_nino:                catecumeno.inscripcion.doc_ci_nino,
    doc_ci_padre:               catecumeno.inscripcion.doc_ci_padre,
    doc_ci_madre:               catecumeno.inscripcion.doc_ci_madre,
    doc_ci_tutor:               catecumeno.inscripcion.doc_ci_tutor,
    estado:                     catecumeno.inscripcion.estado,
    observaciones:              catecumeno.inscripcion.observaciones ?? '',
  });

  // Refrescar si cambia el catecúmeno seleccionado
  useEffect(() => {
    setForm({
      ci_dni:                     catecumeno.ci_dni                  ?? '',
      nombres:                    catecumeno.nombres,
      primer_apellido:            catecumeno.primer_apellido,
      segundo_apellido:           catecumeno.segundo_apellido         ?? '',
      fecha_nacimiento:           catecumeno.fecha_nacimiento         ?? '',
      genero:                     catecumeno.genero                   ?? '',
      direccion:                  catecumeno.direccion                ?? '',
      es_bautizado:               catecumeno.es_bautizado,
      cuadernillo_comprado:       catecumeno.inscripcion.cuadernillo_comprado,
      libro_comprado:             catecumeno.inscripcion.libro_comprado,
      pago_cuota_inicial:         catecumeno.inscripcion.pago_cuota_inicial,
      doc_formulario_inscripcion: catecumeno.inscripcion.doc_formulario_inscripcion,
      doc_fe_bautismo:            catecumeno.inscripcion.doc_fe_bautismo,
      doc_cert_nacimiento:        catecumeno.inscripcion.doc_cert_nacimiento,
      doc_cert_matrimonio_padres: catecumeno.inscripcion.doc_cert_matrimonio_padres,
      doc_ci_nino:                catecumeno.inscripcion.doc_ci_nino,
      doc_ci_padre:               catecumeno.inscripcion.doc_ci_padre,
      doc_ci_madre:               catecumeno.inscripcion.doc_ci_madre,
      doc_ci_tutor:               catecumeno.inscripcion.doc_ci_tutor,
      estado:                     catecumeno.inscripcion.estado,
      observaciones:              catecumeno.inscripcion.observaciones ?? '',
    });
  }, [catecumeno.persona_id]);

  const fld = (key: keyof UpdateCatecumenoPayload, val: string | boolean) =>
    setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    const payload: UpdateCatecumenoPayload = {
      ...form,
      ci_dni:           form.ci_dni           || undefined,
      segundo_apellido: form.segundo_apellido  || undefined,
      fecha_nacimiento: form.fecha_nacimiento  || undefined,
      genero:           form.genero            || undefined,
      direccion:        form.direccion         || undefined,
      observaciones:    form.observaciones     || undefined,
    };
    const result = await update(catecumeno.persona_id, payload);
    if (result) onSaved(result);
  };

  return (
    <div className="absolute inset-0 bg-white rounded-xl z-10 flex flex-col border border-app-border shadow-xl">
      {/* Cabecera */}
      <div className="flex items-center justify-between p-4 border-b border-app-border flex-shrink-0">
        <h3 className="text-sm font-bold text-app-text">✏️ Editar Catecúmeno y Requisitos</h3>
        <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-app-muted">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Formulario scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && <Alert variant="error" title="Error">{error}</Alert>}

        {/* 1. Datos personales */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-lit-primary uppercase tracking-wide">1. Datos personales</p>
          <div className="grid grid-cols-2 gap-2">
            <Input label="CI" value={form.ci_dni as string} onChange={e => fld('ci_dni', e.target.value)} placeholder="1234567" />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-app-text">Género</label>
              <select value={form.genero as string} onChange={e => fld('genero', e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-app-border bg-white outline-none focus:ring-2 focus:ring-lit-primary/30">
                <option value="">—</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
          </div>

          <Input label="Nombre(s)" value={form.nombres as string} onChange={e => fld('nombres', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Primer Apellido" value={form.primer_apellido as string} onChange={e => fld('primer_apellido', e.target.value)} />
            <Input label="Segundo Apellido" value={form.segundo_apellido as string} onChange={e => fld('segundo_apellido', e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-app-text">Fecha de Nacimiento</label>
            <input type="date" value={form.fecha_nacimiento as string} onChange={e => fld('fecha_nacimiento', e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-app-border bg-white outline-none focus:ring-2 focus:ring-lit-primary/30" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-app-text">Dirección</label>
            <input value={form.direccion as string} onChange={e => fld('direccion', e.target.value)} placeholder="Zona, calle, número..." className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-app-border bg-white outline-none focus:ring-2 focus:ring-lit-primary/30" />
          </div>
        </div>

        {/* 2. Requisitos de Ingreso (Entrada) */}
        <div className="p-3.5 rounded-xl bg-lit-surface/60 border border-lit-border space-y-2.5">
          <p className="text-[11px] font-bold text-lit-primary uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> 2. Requisitos de Ingreso (Entrada)
          </p>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.cuadernillo_comprado as boolean} onChange={e => fld('cuadernillo_comprado', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
              <span className="text-app-text font-medium">Cuadernillo de Asistencia comprado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.libro_comprado as boolean} onChange={e => fld('libro_comprado', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
              <span className="text-app-text font-medium">Libro Oficial de Catequesis comprado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.pago_cuota_inicial as boolean} onChange={e => fld('pago_cuota_inicial', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
              <span className="text-app-text font-medium">Cuota Inicial de Ingreso (20 Bs) pagada</span>
            </label>
          </div>
        </div>

        {/* 3. Requisitos de Salida (Graduación / Sacramento) */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-app-border space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">
              3. Documentos para Salida / Sacramento
            </p>
            <span className="text-[10px] text-app-muted italic">Solo fotocopias</span>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.doc_formulario_inscripcion as boolean} onChange={e => fld('doc_formulario_inscripcion', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
              <span className="text-app-text">1. Formulario de Inscripción (Firmado)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.doc_fe_bautismo as boolean} onChange={e => fld('doc_fe_bautismo', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
              <span className="text-app-text">2. Certificado de Bautismo / Fe de Bautizo</span>
            </label>

            {!form.es_bautizado && (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span><strong>Aviso pastoral:</strong> Si no está bautizado, debe realizar el sacramento antes de 2º año en la Vigilia Pascual.</span>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.doc_cert_nacimiento as boolean} onChange={e => fld('doc_cert_nacimiento', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
              <span className="text-app-text">3. Certificado de Nacimiento</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.doc_cert_matrimonio_padres as boolean} onChange={e => fld('doc_cert_matrimonio_padres', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
              <span className="text-app-text">4. Certificado de Matrimonio Religioso o Carta Compromiso</span>
            </label>

            <div className="pt-2 border-t border-app-border/60 space-y-1.5">
              <p className="text-[10px] font-semibold text-app-muted uppercase">Fotocopias de CIs:</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.doc_ci_nino as boolean} onChange={e => fld('doc_ci_nino', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
                <span className="text-app-text">CI del Catecúmeno</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.doc_ci_padre as boolean} onChange={e => fld('doc_ci_padre', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
                <span className="text-app-text">CI del Padre</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.doc_ci_madre as boolean} onChange={e => fld('doc_ci_madre', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
                <span className="text-app-text">CI de la Madre</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.doc_ci_tutor as boolean} onChange={e => fld('doc_ci_tutor', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
                <span className="text-app-text">CI del Tutor Legal (si aplica)</span>
              </label>
            </div>
          </div>
        </div>

        {/* 4. Estado sacramental general y observaciones */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-app-muted uppercase tracking-wide">4. Estado general</p>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-app-text">Estado de Inscripción</label>
            <select value={form.estado as string} onChange={e => fld('estado', e.target.value as EstadoInscripcion)} className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-app-border bg-white outline-none focus:ring-2 focus:ring-lit-primary/30">
              <option value="ACTIVO">Activo</option>
              <option value="BAJA">Baja</option>
              <option value="GRADUADO">Graduado</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input type="checkbox" checked={form.es_bautizado as boolean} onChange={e => fld('es_bautizado', e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary rounded" />
            <span className="text-xs text-app-text font-medium">¿Está bautizado/a en la Iglesia Católica?</span>
          </label>

          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold text-app-text">Observaciones</label>
            <textarea value={form.observaciones as string} onChange={e => fld('observaciones', e.target.value)} rows={2} className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-app-border bg-white resize-none outline-none focus:ring-2 focus:ring-lit-primary/30" />
          </div>
        </div>
      </div>

      {/* Pie */}
      <div className="p-4 border-t border-app-border flex-shrink-0">
        <Button variant="primary" size="sm" className="w-full" isLoading={loading} onClick={handleSave} leftIcon={<Save className="w-3.5 h-3.5" />}>
          Guardar cambios
        </Button>
      </div>
    </div>
  );
};

export default EditCatecumenoDrawer;
