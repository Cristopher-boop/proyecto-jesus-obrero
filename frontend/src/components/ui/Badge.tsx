import React from 'react';

export interface BadgeProps {
  variant?: 'liturgical' | 'gold' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'liturgical',
  size = 'md',
  icon,
  children,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    liturgical: 'bg-lit-surface text-lit-primary border border-lit-border font-medium',
    gold: 'bg-lit-accent-light text-lit-accent-dark border border-lit-accent/40 font-semibold',
    success: 'bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border font-medium',
    warning: 'bg-semantic-warning-bg text-semantic-warning-text border border-semantic-warning-border font-medium',
    error: 'bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border font-medium',
    info: 'bg-semantic-info-bg text-semantic-info-text border border-semantic-info-border font-medium',
    neutral: 'bg-app-bg text-app-text border border-app-border font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-wide transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
