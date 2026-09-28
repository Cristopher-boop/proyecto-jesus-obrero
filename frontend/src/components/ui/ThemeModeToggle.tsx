/**
 * ThemeModeToggle.tsx — Selector de Modo de Color Accesible y Responsivo.
 * 
 * Permite conmutar fluidamente entre:
 *  - ☀️ Claro (light)
 *  - 🌙 Oscuro (dark)
 *  - 💻 Sistema (system: adaptado a prefers-color-scheme del SO)
 * 
 * Diseñado respetando las pautas de frontend-design y vercel-react-best-practices.
 */

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useLiturgicalTheme, ColorMode } from '@/core/context/ThemeContext';

export interface ThemeModeToggleProps {
  size?: 'sm' | 'md';
  showLabels?: boolean;
  className?: string;
}

export const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
  size = 'sm',
  showLabels = false,
  className = '',
}) => {
  const { colorMode, resolvedColorMode, setColorMode } = useLiturgicalTheme();

  const options: { id: ColorMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
    {
      id: 'light',
      label: 'Claro',
      icon: <Sun className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
      tooltip: 'Forzar Tema Claro',
    },
    {
      id: 'dark',
      label: 'Oscuro',
      icon: <Moon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
      tooltip: 'Forzar Tema Oscuro',
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: <Monitor className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
      tooltip: `Tema del Sistema (${resolvedColorMode === 'dark' ? 'Actualmente Oscuro' : 'Actualmente Claro'})`,
    },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Seleccionar modo de color"
      className={`inline-flex items-center bg-app-bg p-1 rounded-xl border border-app-border gap-0.5 select-none transition-colors ${className}`}
    >
      {options.map((opt) => {
        const isSelected = colorMode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setColorMode(opt.id)}
            title={opt.tooltip}
            className={`flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 outline-none focus:ring-1 focus:ring-lit-primary ${
              size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'
            } ${
              isSelected
                ? 'bg-app-card text-lit-primary font-bold shadow-2xs border border-app-border'
                : 'text-app-muted hover:text-app-text hover:bg-app-card/50'
            }`}
          >
            <span className={isSelected ? 'text-lit-primary' : 'text-app-muted'}>
              {opt.icon}
            </span>
            {showLabels && (
              <span className="hidden sm:inline text-[11px]">{opt.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeModeToggle;
