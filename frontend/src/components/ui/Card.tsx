import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  accentBorder?: boolean;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  accentBorder = false,
  title,
  subtitle,
  action,
}) => {
  return (
    <div
      className={`bg-app-card rounded-xl border ${
        accentBorder ? 'border-lit-accent/50' : 'border-app-border'
      } shadow-ecclesiastical transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-md hover:border-lit-primary/30' : ''
      } ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-app-border/70 flex items-center justify-between">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-app-text">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-app-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
