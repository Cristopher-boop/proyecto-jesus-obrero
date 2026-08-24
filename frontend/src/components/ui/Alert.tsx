import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const config = {
    success: {
      bg: 'bg-semantic-success-bg',
      border: 'border-semantic-success-border',
      text: 'text-semantic-success-text',
      icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-semantic-success-text" />,
    },
    warning: {
      bg: 'bg-semantic-warning-bg',
      border: 'border-semantic-warning-border',
      text: 'text-semantic-warning-text',
      icon: <AlertTriangle className="w-5 h-5 flex-shrink-0 text-semantic-warning-text" />,
    },
    error: {
      bg: 'bg-semantic-error-bg',
      border: 'border-semantic-error-border',
      text: 'text-semantic-error-text',
      icon: <XCircle className="w-5 h-5 flex-shrink-0 text-semantic-error-text" />,
    },
    info: {
      bg: 'bg-semantic-info-bg',
      border: 'border-semantic-info-border',
      text: 'text-semantic-info-text',
      icon: <Info className="w-5 h-5 flex-shrink-0 text-semantic-info-text" />,
    },
  };

  const { bg, border, text, icon } = config[variant];

  return (
    <div className={`p-4 rounded-xl border ${bg} ${border} ${text} ${className} transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon}
          <div>
            {title && <h4 className="text-sm font-semibold mb-0.5">{title}</h4>}
            <div className="text-xs leading-relaxed opacity-95">{children}</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-current opacity-70 hover:opacity-100 p-0.5 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
