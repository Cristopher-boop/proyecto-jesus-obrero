/**
 * ConfirmDialog — Modal de confirmación genérico para acciones críticas o eliminaciones.
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fadeIn" onClick={onClose} />

      <div className="relative bg-white rounded-2xl border border-app-border shadow-2xl max-w-md w-full p-6 z-10 animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-xs ${
            variant === 'danger'
              ? 'bg-rose-100 text-rose-700'
              : variant === 'warning'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-lit-surface text-lit-primary'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-app-text">{title}</h3>
            <p className="text-xs text-app-muted mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-app-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            isLoading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
