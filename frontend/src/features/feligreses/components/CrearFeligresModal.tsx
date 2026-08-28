/**
 * CrearFeligresModal — Modal de 1 paso para crear cuenta de feligrés.
 * El username y contraseña se auto-generan en el backend.
 * Muestra las credenciales al secretaria al finalizar para entregarlas al padre.
 */

import React, { useState } from 'react';
import { X, UserCheck, Copy, CheckCheck, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { useCreateFeligres, type CreateFeligresPayload } from '../hooks/useFeligreses';
import type { FeligresCreatedResponse } from '@/types';

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; }

export const CrearFeligresModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState<CreateFeligresPayload>({
    ci_dni: '', complemento: '', nombres: '', primer_apellido: '',
    segundo_apellido: '', telefono: '', email: '',
  });
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [created,  setCreated]  = useState<FeligresCreatedResponse | null>(null);
  const [copied,   setCopied]   = useState<'user' | 'pass' | null>(null);

  const { create, loading, error: apiError } = useCreateFeligres();

  if (!isOpen) return null;

  const fld = (k: keyof CreateFeligresPayload, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.ci_dni.trim())          e.ci_dni         = 'El CI es obligatorio para evitar duplicados.';
    if (!form.nombres.trim())          e.nombres         = 'Obligatorio.';
    if (!form.primer_apellido.trim())  e.primer_apellido = 'Obligatorio.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const result = await create({
      ci_dni:           form.ci_dni.trim(),
      complemento:      form.complemento  || undefined,
      nombres:          form.nombres,
      primer_apellido:  form.primer_apellido,
      segundo_apellido: form.segundo_apellido || undefined,
      telefono:         form.telefono    || undefined,
      email:            form.email       || undefined,
    });
    if (result) {
      setCreated(result);
      onSuccess();
    }
  };

  const handleCopy = (text: string, type: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => {
    setForm({ ci_dni: '', complemento: '', nombres: '', primer_apellido: '', segundo_apellido: '', telefono: '', email: '' });
    setErrors({}); setCreated(null); setCopied(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-app-border flex flex-col max-h-[90vh]">

        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-app-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lit-surface border border-lit-border flex items-center justify-center text-xl">👨‍👩‍👦</div>
            <div>
              <h2 className="text-base font-bold text-app-text">Nueva Cuenta de Feligrés</h2>
              <p className="text-[11px] text-app-muted">Padre, madre o tutor con acceso al sistema</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-app-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* ── Formulario ─────────────────────────────────────────── */}
          {!created ? (
            <div className="space-y-4">
              <Alert variant="info">
                El CI es la clave única de identidad. Si el padre o madre ya tiene una Persona registrada en el sistema con ese CI, la cuenta se vinculará automáticamente sin duplicar datos.
              </Alert>

              {apiError && <Alert variant="error" title="Error">{apiError}</Alert>}

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Input label="CI (Cédula de Identidad) *" value={form.ci_dni} onChange={e => fld('ci_dni', e.target.value)} error={errors.ci_dni} placeholder="Ej: 1234567" />
                </div>
                <Input label="Compl." value={form.complemento ?? ''} onChange={e => fld('complemento', e.target.value)} placeholder="1A" />
              </div>

              <Input label="Nombre(s) *" value={form.nombres} onChange={e => fld('nombres', e.target.value)} error={errors.nombres} placeholder="Ej: Carlos Alberto" />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Primer Apellido *" value={form.primer_apellido} onChange={e => fld('primer_apellido', e.target.value)} error={errors.primer_apellido} placeholder="Ej: Mamani" />
                <Input label="Segundo Apellido" value={form.segundo_apellido ?? ''} onChange={e => fld('segundo_apellido', e.target.value)} placeholder="Ej: Quispe" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Teléfono / Celular" type="tel" value={form.telefono ?? ''} onChange={e => fld('telefono', e.target.value)} placeholder="+591 71234567" />
                <Input label="Correo Electrónico" type="email" value={form.email ?? ''} onChange={e => fld('email', e.target.value)} placeholder="opcional" />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Credenciales auto-generadas:</strong> El sistema creará el nombre de usuario y la contraseña temporal. Anótalas cuando aparezcan para entregárselas al padre/tutor.
                </div>
              </div>
            </div>
          ) : (
            /* ── Credenciales generadas ───────────────────────────── */
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-14 h-14 rounded-full bg-semantic-success/10 flex items-center justify-center mb-3">
                  <UserCheck className="w-7 h-7 text-semantic-success" />
                </div>
                <h3 className="text-base font-bold text-app-text">¡Cuenta creada!</h3>
                <p className="text-xs text-app-muted mt-1">
                  {created.nombres} {created.primer_apellido} ya puede iniciar sesión.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-lit-surface border border-lit-border space-y-3">
                <p className="text-xs font-bold text-lit-primary uppercase tracking-wide">🔑 Credenciales de Acceso</p>
                <p className="text-[11px] text-app-muted">Entrega estas credenciales al padre/madre en ventanilla.</p>

                {([
                  { label: 'Usuario', value: created.username, key: 'user' as const },
                  { label: 'Contraseña Temporal', value: created.temp_password, key: 'pass' as const },
                ]).map(({ label, value, key }) => (
                  <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-app-border">
                    <div>
                      <p className="text-[10px] text-app-muted">{label}</p>
                      <p className="text-sm font-mono font-bold text-app-text">{value}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(value, key)}
                      className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-app-muted transition-colors"
                    >
                      {copied === key ? <CheckCheck className="w-3.5 h-3.5 text-semantic-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}

                <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                  ⚠️ La contraseña no se vuelve a mostrar. El feligrés puede cambiarla desde su perfil.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-app-border flex-shrink-0 flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleClose} className="flex-1">{created ? 'Cerrar' : 'Cancelar'}</Button>
          {!created && (
            <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={loading} className="flex-1" leftIcon={<UserCheck className="w-4 h-4" />}>
              Crear Cuenta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrearFeligresModal;
