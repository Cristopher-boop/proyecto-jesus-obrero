/**
 * Sidebar.tsx — Navegación Lateral Parroquial Responsiva y Colapsable.
 * 
 * Soporta colapso total en escritorio y comportamiento de cajón (drawer)
 * con fondo translúcido en dispositivos móviles.
 */

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
  X,
} from 'lucide-react';
import { useLiturgicalTheme } from '@/core/context/ThemeContext';
import Badge from '@/components/ui/Badge';

export interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'dashboard',
  onTabChange,
  isOpen,
  onClose,
}) => {
  const { seasonInfo } = useLiturgicalTheme();

  const navigation = [
    { id: 'dashboard',    name: 'Panel Principal',      icon: LayoutDashboard },
    { id: 'asistencia',   name: 'Asistencia QR',        icon: QrCode, badge: 'En Vivo' },
    { id: 'catecumenos',  name: 'Catecúmenos',          icon: Users },
    { id: 'feligreses',   name: 'Feligreses',           icon: UserCheck },
    { id: 'calendario',   name: 'Calendario Litúrgico', icon: Calendar, badge: '2026' },
    { id: 'documentos',   name: 'Validar Documentos',   icon: FileCheck, badge: '3' },
    { id: 'capillas',     name: 'Capillas y Grupos',    icon: Church },
    { id: 'configuracion',name: 'Configuración',        icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    if (onTabChange) {
      onTabChange(id);
    }
    // En móviles, cerrar automáticamente al hacer clic en un ítem
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* ── Backdrop / Telón de fondo oscuro para móviles ────────────── */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* ── Contenedor del Sidebar ───────────────────────────────────── */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-app-card border-r border-app-border flex flex-col justify-between flex-shrink-0 min-h-screen transition-all duration-300 ease-in-out ${
          isOpen
            ? 'w-64 translate-x-0 opacity-100 shadow-2xl md:shadow-none'
            : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden opacity-0 md:opacity-100'
        }`}
      >
        <div className="w-64 flex flex-col h-full">
          {/* Cabecera / Identidad Parroquial */}
          <div className="p-5 border-b border-app-border/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lit-surface border border-lit-border flex items-center justify-center text-xl shadow-xs">
                ⛪
              </div>
              <div>
                <h1 className="text-sm font-bold text-app-text tracking-tight flex items-center gap-1.5 font-serif">
                  Jesús Obrero
                  <span className="w-1.5 h-1.5 rounded-full bg-lit-accent inline-block animate-pulse" />
                </h1>
                <p className="text-[11px] text-app-muted font-medium">Gestión Parroquial</p>
              </div>
            </div>

            {/* Botón Cerrar Sidebar (En móvil y escritorio) */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-app-muted hover:text-app-text hover:bg-lit-surface transition-colors"
              title="Cerrar Menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tarjeta del Tiempo Litúrgico Activo */}
          <div className="mx-4 my-4 p-3.5 rounded-2xl bg-lit-surface border border-lit-border/80 transition-colors">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-lit-primary opacity-80 flex items-center gap-1">
                <Flame className="w-3 h-3 text-lit-accent" /> Tiempo Litúrgico
              </span>
              <span className="text-base">{seasonInfo.icon}</span>
            </div>
            <p className="text-xs font-bold text-lit-primary">{seasonInfo.name}</p>
            <p className="text-[10px] text-app-muted mt-0.5">{seasonInfo.colorName}</p>
          </div>

          {/* Lista de Navegación */}
          <nav className="px-3 space-y-1 overflow-y-auto flex-1 scrollbar-thin">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-lit-surface text-lit-primary font-bold shadow-xs border-l-4 border-lit-primary'
                      : 'text-app-text hover:bg-lit-surface hover:text-lit-primary'
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

          {/* Pie del Sidebar */}
          <div className="p-4 border-t border-app-border/70 bg-app-bg/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-lit-primary text-white flex items-center justify-center text-xs font-bold shadow-xs">
                JO
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-app-text truncate">Sede Central</p>
                <p className="text-[10px] text-app-muted truncate">Diócesis de El Alto</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
