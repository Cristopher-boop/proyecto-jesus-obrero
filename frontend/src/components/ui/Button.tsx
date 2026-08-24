import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-lit-primary text-white hover:bg-lit-primary-dark shadow-sm hover:shadow focus:ring-lit-primary/40',
    secondary: 'bg-lit-surface text-lit-primary hover:bg-lit-surface/80 border border-lit-border focus:ring-lit-primary/30',
    accent: 'bg-lit-accent text-stone-900 font-semibold hover:bg-lit-accent-dark hover:text-white shadow-sm focus:ring-lit-accent/50',
    outline: 'border border-app-border text-app-text hover:bg-lit-surface hover:text-lit-primary focus:ring-lit-primary/30',
    ghost: 'text-app-text hover:bg-lit-surface/70 hover:text-lit-primary focus:ring-lit-primary/20',
    danger: 'bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border hover:bg-semantic-error-border/30 focus:ring-semantic-error-text/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
