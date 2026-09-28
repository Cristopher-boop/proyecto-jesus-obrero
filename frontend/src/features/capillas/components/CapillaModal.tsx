/**
 * CapillaModal — Modal para Crear y Editar Capillas Parroquiales.
 *
 * Incluye validaciones en tiempo real para nombre, código estandarizado y estado de Sede Principal.
 */

import React, { useState, useEffect } from 'react';
import { X, Church, ShieldCheck, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import type { CapillaListItem, CapillaCreate, CapillaUpdate } from '@/types';

interface CapillaModalProps {
  isOpen: boolean;
  capillaToEdit?: CapillaListItem | null;
  onClose: () => void;
  onSubmit: (data: CapillaCreate | CapillaUpdate, isEdit: boolean) => Promise<{ success: boolean; error?: string }>;
}

export const CapillaModal: React.FC<CapillaModalProps> = ({
  isOpen,
  capillaToEdit,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(capillaToEdit);

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esSedePrincipal, setEsSedePrincipal] = useState(false);
  const [activo, setActivo] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Cargar datos al abrir o cambiar la capilla a editar
  useEffect(() => {
    if (capillaToEdit) {
      setNombre(capillaToEdit.nombre);
      setCodigo(capillaToEdit.codigo);
      setDireccion(capillaToEdit.direccion || '');
      setDescripcion(capillaToEdit.descripcion || '');
      setEsSedePrincipal(capillaToEdit.es_sede_principal);
      setActivo(capillaToEdit.activo);
    } else {
      setNombre('');
      setCodigo('');
      setDireccion('');
      setDescripcion('');
      setEsSedePrincipal(false);
      setActivo(true);
    }
    setError(null);
    setTouched({});
  }, [capillaToEdit, isOpen]);

  if (!isOpen) return null;

  // Validaciones
  const nombreInvalido = nombre.trim().length < 3;
  const codigoInvalido = codigo.trim().length < 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nombre: true, codigo: true });

    if (nombreInvalido) {
      setError('El nombre de la capilla debe tener al menos 3 caracteres.');
      return;
    }
    if (codigoInvalido) {
      setError('El código de la capilla debe tener al menos 2 caracteres (ej: CAP-SMP).');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim().toUpperCase(),
      direccion: direccion.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
      es_sede_principal: esSedePrincipal,
      activo,
    };

    const res = await onSubmit(payload, isEdit);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Ocurrió un error al guardar los cambios.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fadeIn" onClick={onClose} />

      <div className="relative bg-app-card rounded-2xl border border-app-border shadow-2xl max-w-lg w-full p-6 z-10 animate-scaleUp overflow-y-auto max-h-[90vh]">
        {/* Cabecera del Modal */}
        <div className="flex items-start justify-between pb-4 border-b border-app-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lit-surface border border-lit-border text-lit-primary flex items-center justify-center text-xl shadow-xs">
              <Church className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-app-text font-serif">
                {isEdit ? 'Editar Capilla' : 'Nueva Capilla'}
              </h3>
              <p className="text-xs text-app-muted">
                {isEdit ? 'Modifica los datos del templo o sede' : 'Registra un nuevo templo o capilla filial'}
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
            <Alert variant="error" title="Error de validación">
              {error}
            </Alert>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-app-text mb-1">
              Nombre de la Capilla <span className="text-rose-500">*</span>
            </label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, nombre: true }))}
              placeholder="Ej: Capilla Virgen de Copacabana"
              error={touched.nombre && nombreInvalido ? 'Mínimo 3 caracteres' : undefined}
            />
          </div>

          {/* Código */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-app-text mb-1">
                Código Identificador <span className="text-rose-500">*</span>
              </label>
              <Input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onBlur={() => setTouched(prev => ({ ...prev, codigo: true }))}
                placeholder="Ej: CAP-COP"
                error={touched.codigo && codigoInvalido ? 'Mínimo 2 caracteres' : undefined}
              />
              <span className="text-[10px] text-app-muted mt-0.5 block">
                Identificador único corto
              </span>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs font-bold text-app-text mb-1">
                Dirección / Ubicación
              </label>
              <Input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej: Zona 1ro de Mayo, Calle 3"
                leftIcon={<MapPin className="w-4 h-4 text-stone-400" />}
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-app-text mb-1">
              Descripción o Notas
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              placeholder="Notas pastorales sobre la comunidad o sector..."
              className="w-full text-xs rounded-xl border border-app-border bg-app-bg text-app-text p-2.5 outline-none focus:ring-2 focus:ring-lit-primary/30"
            />
          </div>

          {/* Configuración de Sede Principal y Estado */}
          <div className="p-3.5 rounded-xl bg-app-bg border border-app-border space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={esSedePrincipal}
                onChange={(e) => setEsSedePrincipal(e.target.checked)}
                className="rounded mt-0.5 text-lit-primary focus:ring-lit-primary w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-app-text flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-lit-accent" />
                  Marcar como Sede Central / Parroquial
                </span>
                <span className="text-[10px] text-app-muted block mt-0.5 leading-tight">
                  Al marcar esta capilla, se convertirá en la sede principal y se desmarcará la anterior.
                </span>
              </div>
            </label>

            <div className="pt-2 border-t border-app-border/70 flex items-center justify-between">
              <span className="text-xs font-bold text-app-text">Estado Operativo</span>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="rounded text-lit-primary focus:ring-lit-primary w-4 h-4"
                />
                <span className={activo ? 'text-semantic-success font-bold' : 'text-app-muted font-medium'}>
                  {activo ? 'Activa' : 'Inactiva'}
                </span>
              </label>
            </div>
          </div>

          {/* Botones de Acción */}
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
            >
              {isEdit ? 'Guardar Cambios' : 'Crear Capilla'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CapillaModal;
