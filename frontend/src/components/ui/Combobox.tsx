import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface ComboboxOption<T extends string | number = string> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps<T extends string | number = string> {
  options: ComboboxOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
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

// Normalizador de texto para búsqueda flexible sin acentos
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function Combobox<T extends string | number = string>({
  options,
  value,
  onChange,
  label,
  placeholder = 'Buscar o seleccionar...',
  searchPlaceholder = 'Escribe para filtrar...',
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
}: ComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  const selectedOption = options.find((opt) => opt.value === value);

  // Filtrado flexible por similitud de texto
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const query = normalizeText(search);
    return options.filter((opt) => {
      const labelNorm = normalizeText(opt.label);
      const sublabelNorm = opt.sublabel ? normalizeText(opt.sublabel) : '';
      return labelNorm.includes(query) || sublabelNorm.includes(query);
    });
  }, [options, search]);

  // Enfocar input de búsqueda al abrir
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

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

  // Manejador de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else {
        setIsOpen(true);
      }
    }
  };

  const handleSelect = (option: ComboboxOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const sizeStyles = {
    sm: 'text-xs py-1.5 px-2.5 rounded-lg min-h-[32px]',
    md: 'text-sm py-2 px-3 rounded-xl min-h-[40px]',
  };

  const variantStyles = {
    default: error
      ? 'bg-app-card border-semantic-error-border text-semantic-error-text focus:ring-semantic-error-border/30'
      : 'bg-app-card border-app-border text-app-text hover:border-lit-accent focus:ring-lit-primary/20',
    filter: 'bg-app-bg border-app-border text-app-text hover:bg-lit-surface hover:border-lit-border focus:ring-lit-primary/20',
    dark: 'bg-app-card border-app-border text-app-text hover:border-lit-accent focus:ring-lit-accent/40',
  };

  return (
    <div className={`relative w-full text-left ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-app-text mb-1.5 tracking-wide"
        >
          {label}
        </label>
      )}

      {/* Botón Trigger */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
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

      {/* Menú Desplegable con Buscador */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 mt-1 max-h-72 rounded-xl border shadow-xl z-50 animate-scale-in flex flex-col overflow-hidden bg-app-card border-app-border text-app-text ${menuClassName}`}
        >
          {/* Input de Búsqueda Integrado */}
          <div className="p-2 border-b border-app-border/70 flex items-center gap-2 bg-app-bg/60">
            <Search className="w-3.5 h-3.5 text-app-muted flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder={searchPlaceholder}
              className="w-full text-xs bg-transparent outline-none placeholder:text-app-muted text-app-text"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-app-muted hover:text-app-text p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Lista de Resultados Filtrados */}
          <div className="overflow-y-auto max-h-56 py-1 divide-y divide-app-border/30">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-xs text-app-muted text-center space-y-1">
                <p>No se encontraron resultados</p>
                {search && (
                  <p className="text-[11px] text-app-muted">
                    Sin coincidencias para &quot;{search}&quot;
                  </p>
                )}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={String(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 text-xs transition-colors cursor-pointer select-none ${
                      option.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-lit-surface text-lit-primary font-bold'
                        : isHighlighted
                        ? 'bg-lit-surface text-app-text'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      {option.icon && (
                        <span className="flex-shrink-0">{option.icon}</span>
                      )}
                      <div className="flex flex-col truncate">
                        <span className="truncate">{option.label}</span>
                        {option.sublabel && (
                          <span className="text-[10px] text-app-muted font-normal truncate">
                            {option.sublabel}
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
        </div>
      )}

      {error && <p className="text-xs text-semantic-error-text font-medium mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-app-muted mt-1">{helperText}</p>}
    </div>
  );
}

export default Combobox;
