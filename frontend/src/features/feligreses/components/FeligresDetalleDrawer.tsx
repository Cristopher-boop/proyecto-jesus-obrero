import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck, X, Phone, Mail, Baby, ShieldCheck,
  Calendar, QrCode, Sparkles, Copy, Check
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useFeligresDetalle } from '../hooks/useFeligreses';

interface Props {
  personaId: number | null;
  onClose: () => void;
}

const ESTADO_LABEL: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  ACTIVO: { label: 'Activo en Formación', variant: 'success' },
  BAJA: { label: 'Baja Pastoral', variant: 'warning' },
  GRADUADO: { label: 'Sacramento Recibido', variant: 'neutral' },
};

const SACRAMENTO_LABEL: Record<string, string> = {
  PRIMERA_COMUNION: 'Primera Comunión',
  CONFIRMACION: 'Confirmación',
};

export const FeligresDetalleDrawer: React.FC<Props> = ({ personaId, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: detalle, loading: detalleLoading } = useFeligresDetalle(personaId);

  // Cierre con animación fluida
  const handleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 190);
  };

  // Escuchar tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleCopyUsername = (username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedUser(true);
    setTimeout(() => setCopiedUser(false), 2000);
  };

  if (!personaId) return null;

  return (
    <>
      {/* Backdrop con desenfoque para superposición frontal responsiva en laptops y móviles */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 2xl:hidden transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />

      {/* Drawer Superpuesto hacia adelante (z-50) */}
      <div
        role="dialog"
        aria-label="Expediente del Feligrés"
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-app-card shadow-2xl p-5 overflow-y-auto border-l border-app-border flex flex-col gap-4 2xl:relative 2xl:inset-auto 2xl:z-auto 2xl:w-80 2xl:shadow-none 2xl:border-none 2xl:p-0 2xl:bg-transparent 2xl:flex-shrink-0 transition-transform ${
          isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
        }`}
      >
        {/* Cabecera del Panel */}
        <div className="flex items-start justify-between pb-3 border-b border-app-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lit-surface border border-lit-border flex items-center justify-center text-lit-primary shadow-2xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-app-text font-serif leading-tight">
                Ficha del Feligrés
              </h3>
              <p className="text-[11px] text-app-muted">
                Credencial y catecúmenos a cargo
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-lit-surface flex items-center justify-center text-app-muted hover:text-app-text transition-colors border border-transparent hover:border-lit-border"
            title="Cerrar panel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {detalleLoading ? (
          <div className="flex flex-col items-center justify-center h-56 gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lit-primary" />
            <span className="text-xs text-app-muted">Cargando expediente pastoral...</span>
          </div>
        ) : detalle ? (
          <div className="space-y-4">
            {/* 1. Tarjeta de Datos Personales y Acceso */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-app-border/70">
                <span className="text-[10px] font-bold text-lit-primary uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-lit-accent" /> Cuenta de Usuario
                </span>
                <span className="text-[10px] text-app-muted flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(detalle.created_at).toLocaleDateString('es-BO', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-app-text font-serif">
                  {detalle.nombres} {detalle.primer_apellido} {detalle.segundo_apellido ?? ''}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold text-lit-primary bg-lit-surface px-2 py-0.5 rounded-md border border-lit-border">
                    CI: {detalle.ci_dni}
                  </span>
                </div>
              </div>

              {/* Datos de contacto */}
              <div className="space-y-1.5 pt-1 text-xs text-app-text">
                {detalle.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-app-muted flex-shrink-0" />
                    <a
                      href={`tel:${detalle.telefono}`}
                      className="font-medium hover:text-lit-primary transition-colors hover:underline"
                    >
                      {detalle.telefono}
                    </a>
                  </div>
                )}

                {detalle.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-app-muted flex-shrink-0" />
                    <a
                      href={`mailto:${detalle.email}`}
                      className="font-medium hover:text-lit-primary transition-colors hover:underline truncate"
                      title={detalle.email}
                    >
                      {detalle.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Usuario del portal */}
              <div className="pt-2 border-t border-app-border/60 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-app-muted font-medium">Usuario de Acceso</p>
                  <code className="text-xs font-mono font-bold text-app-text bg-app-bg px-2 py-0.5 rounded border border-app-border inline-block mt-0.5">
                    {detalle.username}
                  </code>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyUsername(detalle.username)}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 bg-lit-surface text-lit-primary border border-lit-border hover:bg-lit-border/30 transition-colors"
                  title="Copiar nombre de usuario"
                >
                  {copiedUser ? <Check className="w-3 h-3 text-semantic-success" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUser ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </Card>

            {/* 2. Sección de Hijos / Catecúmenos Vinculados */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-lit-primary" />
                  Hijos Vinculados ({detalle.hijos.length})
                </span>
                <span className="text-[10px] text-app-muted">
                  Control pastoral de ingreso
                </span>
              </div>

              {detalle.hijos.length === 0 ? (
                <div className="p-4 rounded-xl bg-app-bg border border-app-border text-center space-y-1">
                  <p className="text-xs font-semibold text-app-text">Sin catecúmenos asociados</p>
                  <p className="text-[10px] text-app-muted">
                    Este feligrés aún no tiene hijos vinculados mediante Cédula de Identidad en los registros parroquiales.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {detalle.hijos.map(h => {
                    const est = ESTADO_LABEL[h.estado] || { label: h.estado, variant: 'neutral' };
                    return (
                      <div
                        key={h.persona_id}
                        className="p-3 rounded-xl border border-app-border bg-app-card hover:border-lit-border transition-colors space-y-2 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-app-text">
                              {h.nombres} {h.primer_apellido}
                            </p>
                            <p className="text-[10px] text-lit-primary font-medium mt-0.5">
                              {SACRAMENTO_LABEL[h.tipo_sacramento] || h.tipo_sacramento}
                            </p>
                          </div>

                          <Badge variant={est.variant} size="sm">
                            {est.label}
                          </Badge>
                        </div>

                        {h.token_qr && (
                          <div className="pt-2 border-t border-app-border/50 flex items-center justify-between text-[10px] text-app-muted">
                            <span className="flex items-center gap-1">
                              <QrCode className="w-3.5 h-3.5 text-lit-accent" />
                              Pase QR habilitado
                            </span>
                            <span className="font-mono text-[9px] text-app-muted truncate max-w-[120px]">
                              {h.token_qr.slice(0, 10)}…
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mensaje pastoral informativo */}
            <div className="p-3 rounded-xl bg-lit-surface border border-lit-border text-[11px] text-lit-primary space-y-1 leading-snug">
              <p className="font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-lit-accent" />
                Vínculo Sacramental
              </p>
              <p className="opacity-90">
                Los hijos se enlazan automáticamente a la cuenta del feligrés mediante la coincidencia de CI en el formulario de inscripción.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default FeligresDetalleDrawer;
