/**
 * Navbar.tsx — Barra de Navegación Superior con Selector Litúrgico,
 * Botón de Apertura de Menú (Hamburger) y Widget de Calendario Rápido.
 */

import React from 'react';
import {
  Bell,
  LogOut,
  Sparkles,
  Menu,
  Church,
} from 'lucide-react';
import { useLiturgicalTheme, LITURGICAL_SEASONS, LiturgicalSeason } from '@/core/context/ThemeContext';
import { useAuth } from '@/core/context/AuthContext';
import Badge from '@/components/ui/Badge';
import { MiniCalendarPopover } from '@/features/calendario/components/MiniCalendarPopover';
import { ThemeModeToggle } from '@/components/ui/ThemeModeToggle';

export interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenFullCalendar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenFullCalendar,
}) => {
  const { season, setSeason } = useLiturgicalTheme();
  const { user, logout } = useAuth();

  const seasonKeys: LiturgicalSeason[] = ['ordinario', 'cuaresma', 'pentecostes', 'pascua'];

  return (
    <header className="h-16 bg-app-card border-b border-app-border px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors">
      
      {/* ── Izquierda: Botón Menú + Título Parroquia ───────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Botón Hamburger para abrir/cerrar Sidebar */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-stone-600 hover:text-lit-primary hover:bg-lit-surface transition-colors"
          title="Alternar Menú Lateral"
          aria-label="Abrir Menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-app-text">
          <Church className="w-4 h-4 text-lit-primary hidden sm:inline" />
          <span className="truncate max-w-[140px] sm:max-w-none">Jesús Obrero</span>
          <span className="text-stone-300 hidden md:inline">/</span>
          <span className="text-app-muted font-normal hidden md:inline">Gestión Pastoral 2026</span>
        </div>
      </div>

      {/* ── Derecha: Mini Calendario + Selector Tema + Perfil Usuario ──── */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Widget Popover de Calendario Rápido */}
        <MiniCalendarPopover
          onOpenFullCalendar={() => {
            if (onOpenFullCalendar) {
              onOpenFullCalendar();
            }
          }}
        />

        {/* Conmutador de Modo de Color (Claro / Oscuro / Sistema) */}
        <ThemeModeToggle size="sm" />

        {/* Selector de Tiempo Litúrgico en Vivo */}
        <div className="hidden lg:flex items-center bg-app-bg p-1 rounded-xl border border-app-border gap-1">
          <span className="text-[11px] font-semibold text-app-muted px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-lit-accent" /> Liturgia:
          </span>
          {seasonKeys.map((key) => {
            const item = LITURGICAL_SEASONS[key];
            const isSelected = season === key;
            return (
              <button
                key={key}
                onClick={() => setSeason(key)}
                title={`Cambiar a ${item.name} (${item.colorName})`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isSelected
                    ? 'bg-app-card text-lit-primary shadow-xs font-bold border border-app-border'
                    : 'text-app-muted hover:text-app-text hover:bg-app-card/50'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden xl:inline">{item.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Notificaciones */}
        <button
          className="relative p-2 text-app-muted hover:text-lit-primary hover:bg-lit-surface rounded-xl transition-colors"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-semantic-error-text" />
        </button>

        {/* Perfil de Usuario y Logout */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-app-border">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-app-text">{user?.username || 'admin'}</p>
            <Badge variant="gold" size="sm">
              {user?.rol || 'ADMIN'}
            </Badge>
          </div>

          <button
            onClick={logout}
            className="p-2 text-app-muted hover:text-semantic-error-text hover:bg-semantic-error-bg rounded-xl transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
