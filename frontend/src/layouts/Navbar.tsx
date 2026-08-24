import React from 'react';
import {
  Bell,
  LogOut,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import { useLiturgicalTheme, LITURGICAL_SEASONS, LiturgicalSeason } from '@/core/context/ThemeContext';
import { useAuth } from '@/core/context/AuthContext';
import Badge from '@/components/ui/Badge';

export const Navbar: React.FC = () => {
  const { season, setSeason } = useLiturgicalTheme();
  const { user, logout } = useAuth();

  const seasonKeys: LiturgicalSeason[] = ['ordinario', 'cuaresma', 'pentecostes', 'pascua'];

  return (
    <header className="h-16 bg-white border-b border-app-border px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Parish Breadcrumb & Active Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-app-text">
          <CalendarDays className="w-4 h-4 text-lit-primary" />
          <span>Gestión Pastoral 2026</span>
          <span className="text-stone-300">/</span>
          <span className="text-app-muted font-normal">Parroquia Jesús Obrero</span>
        </div>
      </div>

      {/* Right: Theme Switcher + Notifications + User Profile */}
      <div className="flex items-center gap-4">
        {/* Interactive Liturgical Theme Buttons (Selector en vivo) */}
        <div className="flex items-center bg-stone-100/80 p-1 rounded-xl border border-app-border gap-1">
          <span className="text-[11px] font-semibold text-app-muted px-2 flex items-center gap-1 hidden md:inline-flex">
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
                    ? 'bg-white text-lit-primary shadow-xs font-bold border border-app-border/80'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden lg:inline">{item.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 text-stone-500 hover:text-lit-primary hover:bg-lit-surface rounded-lg transition-colors"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-semantic-error-text" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-app-border">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-app-text">{user?.username || 'admin'}</p>
            <Badge variant="gold" size="sm">
              {user?.rol || 'ADMIN'}
            </Badge>
          </div>

          <button
            onClick={logout}
            className="p-2 text-stone-400 hover:text-semantic-error-text hover:bg-semantic-error-bg rounded-lg transition-colors"
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
