import React from 'react';
import {
  LayoutDashboard,
  QrCode,
  Users,
  UserCheck,
  FileCheck,
  Church,
  Calendar,
  Settings,
  Flame,
} from 'lucide-react';
import { useLiturgicalTheme } from '@/core/context/ThemeContext';
import Badge from '@/components/ui/Badge';

export interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'dashboard',
  onTabChange,
}) => {
  const { seasonInfo } = useLiturgicalTheme();

  const navigation = [
    { id: 'dashboard',    name: 'Panel Principal',      icon: LayoutDashboard },
    { id: 'asistencia',   name: 'Asistencia QR',        icon: QrCode, badge: 'En Vivo' },
    { id: 'catecumenos',  name: 'Catecúmenos',          icon: Users },
    { id: 'feligreses',   name: 'Feligreses',           icon: UserCheck },
    { id: 'documentos',   name: 'Validar Documentos',   icon: FileCheck, badge: '3' },
    { id: 'capillas',     name: 'Capillas y Grupos',    icon: Church },
    { id: 'calendario',   name: 'Calendario Litúrgico', icon: Calendar },
    { id: 'configuracion',name: 'Configuración',        icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-app-border flex flex-col justify-between flex-shrink-0 min-h-screen transition-all duration-300">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-app-border/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lit-surface border border-lit-border flex items-center justify-center text-xl shadow-sm">
            ⛪
          </div>
          <div>
            <h1 className="text-sm font-bold text-app-text tracking-tight flex items-center gap-1.5">
              Jesús Obrero
              <span className="w-1.5 h-1.5 rounded-full bg-lit-accent inline-block animate-pulse" />
            </h1>
            <p className="text-[11px] text-app-muted font-medium">Gestión Parroquial</p>
          </div>
        </div>

        {/* Liturgical Season Indicator Badge */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-lit-surface border border-lit-border/80 transition-colors">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-lit-primary opacity-80 flex items-center gap-1">
              <Flame className="w-3 h-3 text-lit-accent" /> Tiempo Litúrgico
            </span>
            <span className="text-sm">{seasonInfo.icon}</span>
          </div>
          <p className="text-xs font-bold text-lit-primary">{seasonInfo.name}</p>
          <p className="text-[10px] text-app-muted mt-0.5">{seasonInfo.colorName}</p>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange && onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-lit-surface text-lit-primary font-semibold shadow-xs border-l-4 border-lit-primary'
                    : 'text-app-text hover:bg-stone-50 hover:text-lit-primary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-lit-primary' : 'text-app-muted group-hover:text-lit-primary'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={item.badge === 'En Vivo' ? 'gold' : 'neutral'}
                    size="sm"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Parish Footer info */}
      <div className="p-4 border-t border-app-border/70 bg-stone-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-lit-primary text-white flex items-center justify-center text-xs font-bold shadow-xs">
            JO
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-app-text truncate">Sede Central</p>
            <p className="text-[10px] text-app-muted truncate">Diócesis de El Alto</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
