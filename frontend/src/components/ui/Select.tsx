import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string | number = string> {
  options: SelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'filter' | 'dark';
  leftIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  id?: string;
}

export function Select<T extends string | number = string>({
  options,
  value,
  onChange,
  label,
  placeholder = 'Seleccionar...',
  size = 'md',
  variant = 'default',
  leftIcon,
  error,
  helperText,
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  id,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  const selectedOption = options.find((opt) => opt.value === value);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar con Escape y navegación básica
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const nextOption = options[currentIndex + 1];
        if (nextOption && !nextOption.disabled) {
          onChange(nextOption.value);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const prevOption = options[currentIndex - 1];
        if (prevOption && !prevOption.disabled) {
          onChange(prevOption.value);
        }
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  // Variantes de tamaño
  const sizeStyles = {
    sm: 'text-xs py-1.5 px-2.5 rounded-lg min-h-[32px]',
    md: 'text-sm py-2 px-3 rounded-xl min-h-[40px]',
  };

  // Variantes temáticas
  const variantStyles = {
    default: error
      ? 'bg-app-card border-semantic-error-border text-semantic-error-text focus:ring-semantic-error-border/30'
      : 'bg-app-card border-app-border text-app-text hover:border-lit-accent focus:ring-lit-primary/20',
    filter: 'bg-app-bg border-app-border text-app-text hover:bg-lit-surface hover:border-lit-border focus:ring-lit-primary/20',
    dark: 'bg-app-card border-app-border text-app-text hover:border-lit-accent focus:ring-lit-accent/40',
  };

  return (
    <div className={`relative w-full text-left ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-app-text mb-1.5 tracking-wide"
        >
          {label}
        </label>
      )}

      {/* Botón Trigger del Select */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 border font-medium transition-all outline-none focus:ring-2 select-none shadow-2xs ${
          sizeStyles[size]
        } ${variantStyles[variant]} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-app-bg' : 'cursor-pointer'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {leftIcon && (
            <span className="flex-shrink-0 text-app-muted">
              {leftIcon}
            </span>
          )}
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : (
              <span className="text-app-muted">
                {placeholder}
              </span>
            )}
          </span>
          {selectedOption?.badge && (
            <span className="flex-shrink-0 ml-1">{selectedOption.badge}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 text-app-muted ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menú Flotante de Opciones */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border shadow-xl z-50 animate-scale-in py-1 bg-app-card border-app-border text-app-text ${menuClassName}`}
        >
          {options.length === 0 ? (
            <div className="py-2.5 px-3 text-xs text-app-muted text-center">
              No hay opciones disponibles
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={String(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 text-xs transition-colors cursor-pointer select-none ${
                    option.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-lit-surface text-lit-primary font-bold'
                      : 'hover:bg-lit-surface hover:text-app-text'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {option.icon && (
                      <span className="flex-shrink-0">{option.icon}</span>
                    )}
                    <div className="flex flex-col truncate">
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className="text-[10px] text-app-muted font-normal truncate">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {option.badge && (
                      <span className="flex-shrink-0">{option.badge}</span>
                    )}
                  </div>

                  {isSelected && (
                    <Check
                      className="w-3.5 h-3.5 flex-shrink-0 text-lit-primary"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {error && <p className="text-xs text-semantic-error-text font-medium mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-app-muted mt-1">{helperText}</p>}
    </div>
  );
}

export default Select;
