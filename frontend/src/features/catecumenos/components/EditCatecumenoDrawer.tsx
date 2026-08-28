/**
 * EditCatecumenoDrawer — Drawer lateral para editar datos del catecúmeno.
 * Se desliza sobre el panel de detalle existente.
 */

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
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
    ci_dni:              catecumeno.ci_dni          ?? '',
    nombres:             catecumeno.nombres,
    primer_apellido:     catecumeno.primer_apellido,
    segundo_apellido:    catecumeno.segundo_apellido ?? '',
    fecha_nacimiento:    catecumeno.fecha_nacimiento ?? '',
    genero:              catecumeno.genero           ?? '',
    direccion:           catecumeno.direccion        ?? '',
    es_bautizado:        catecumeno.es_bautizado,
    libro_comprado:      catecumeno.inscripcion.libro_comprado,
    cuadernillo_comprado: catecumeno.inscripcion.cuadernillo_comprado,
    estado:              catecumeno.inscripcion.estado,
    observaciones:       catecumeno.inscripcion.observaciones ?? '',
  });

  // Refrescar si cambia el catecúmeno seleccionado
  useEffect(() => {
    setForm({
      ci_dni:              catecumeno.ci_dni          ?? '',
      nombres:             catecumeno.nombres,
      primer_apellido:     catecumeno.primer_apellido,
      segundo_apellido:    catecumeno.segundo_apellido ?? '',
      fecha_nacimiento:    catecumeno.fecha_nacimiento ?? '',
      genero:              catecumeno.genero           ?? '',
      direccion:           catecumeno.direccion        ?? '',
      es_bautizado:        catecumeno.es_bautizado,
      libro_comprado:      catecumeno.inscripcion.libro_comprado,
      cuadernillo_comprado: catecumeno.inscripcion.cuadernillo_comprado,
      estado:              catecumeno.inscripcion.estado,
      observaciones:       catecumeno.inscripcion.observaciones ?? '',
    });
  }, [catecumeno.persona_id]);

  const fld = (key: keyof UpdateCatecumenoPayload, val: string | boolean) =>
    setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    // Enviar solo campos no vacíos
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
        <h3 className="text-sm font-bold text-app-text">✏️ Editar datos</h3>
        <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-app-muted">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Formulario scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && <Alert variant="error" title="Error">{error}</Alert>}

        <p className="text-[10px] font-bold text-app-muted uppercase tracking-wide">Datos personales</p>

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

        <div className="border-t border-app-border/60 pt-3">
          <p className="text-[10px] font-bold text-app-muted uppercase tracking-wide mb-2">Inscripción</p>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-app-text">Estado</label>
            <select value={form.estado as string} onChange={e => fld('estado', e.target.value as EstadoInscripcion)} className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-app-border bg-white outline-none focus:ring-2 focus:ring-lit-primary/30">
              <option value="ACTIVO">Activo</option>
              <option value="BAJA">Baja</option>
              <option value="GRADUADO">Graduado</option>
            </select>
          </div>

          {(['es_bautizado', 'libro_comprado', 'cuadernillo_comprado'] as const).map(key => (
            <label key={key} className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={form[key] as boolean} onChange={e => fld(key, e.target.checked)} className="w-3.5 h-3.5 accent-lit-primary" />
              <span className="text-xs text-app-text">{{ es_bautizado: 'Bautizado/a', libro_comprado: 'Libro comprado', cuadernillo_comprado: 'Cuadernillo comprado' }[key]}</span>
            </label>
          ))}

          <div className="mt-2 space-y-1">
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
