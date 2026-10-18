/**
 * MiniCalendarPopover.tsx — Widget de Calendario Rápido para el NavBar.
 * 
 * Permite a cualquier usuario ver rápidamente la fecha actual, el color litúrgico de hoy,
 * los próximos eventos importantes y un botón de 1-clic para ver el calendario completo.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  generateMonthDays, MONTH_NAMES_ES, DAY_NAMES_ES,
  PARISH_EVENTS_2026, getDayLiturgicalColor
} from '../data/calendarUtils';
import { useLiturgicalTheme } from '@/core/context/ThemeContext';

interface Props {
  onOpenFullCalendar: () => void;
}

export const MiniCalendarPopover: React.FC<Props> = ({ onOpenFullCalendar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const { seasonInfo } = useLiturgicalTheme();
  const todayLiturgical = getDayLiturgicalColor(today.getFullYear(), today.getMonth(), today.getDate());

  const monthDays = generateMonthDays(viewYear, viewMonth);

  // Próximos eventos a partir de hoy
  const upcomingEvents = PARISH_EVENTS_2026.filter(e => {
    if (e.year > today.getFullYear()) return true;
    if (e.year === today.getFullYear()) {
      if (e.month > today.getMonth()) return true;
      if (e.month === today.getMonth() && e.day >= today.getDate()) return true;
    }
    return false;
  }).slice(0, 3);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Botón Disparador en el NavBar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
          isOpen
            ? 'bg-lit-surface border-lit-primary text-lit-primary shadow-xs'
            : 'bg-app-card hover:bg-lit-surface border-app-border text-app-text hover:border-lit-primary/50'
        }`}
        title="Ver Calendario Litúrgico Rápido"
      >
        <CalendarDays className="w-4 h-4 text-lit-primary" />
        <span className="hidden sm:inline">
          {today.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
        </span>
        <span
          className="w-2.5 h-2.5 rounded-full inline-block shadow-xs"
          style={{ backgroundColor: todayLiturgical.colorHex }}
          title={`Color de hoy: ${todayLiturgical.colorName}`}
        />
      </button>

      {/* Popover / Menú Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-app-card rounded-3xl border border-app-border shadow-2xl z-50 p-5 space-y-4 animate-fadeIn">
          
          {/* Cabecera del Popover */}
          <div className="flex items-center justify-between pb-3 border-b border-app-border">
            <div className="flex items-center gap-2">
              <span className="text-lg">{seasonInfo.icon}</span>
              <div>
                <h4 className="text-xs font-bold text-app-text font-serif">
                  {MONTH_NAMES_ES[viewMonth]} {viewYear}
                </h4>
                <p className="text-[10px] text-lit-primary font-semibold">
                  {todayLiturgical.seasonName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-lg hover:bg-lit-surface flex items-center justify-center text-app-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-lg hover:bg-lit-surface flex items-center justify-center text-app-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cuadrícula Mini del Mes */}
          <div>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAY_NAMES_ES.map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-app-muted">
                  {d[0]}
                </span>
              ))}
            </div>

            {/* Días */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, idx) => {
                const hasEvent = day.events.length > 0;
                return (
                  <div
                    key={idx}
                    className={`h-7 rounded-lg flex flex-col items-center justify-center text-[10px] relative transition-all ${
                      day.isToday
                        ? 'bg-lit-primary text-white font-extrabold shadow-xs'
                        : day.isCurrentMonth
                        ? 'text-app-text hover:bg-lit-surface font-medium'
                        : 'text-app-muted/40'
                    }`}
                  >
                    <span>{day.dayNumber}</span>
                    {hasEvent && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 ${
                          day.isToday ? 'bg-amber-300' : ''
                        }`}
                        style={{ backgroundColor: day.isToday ? undefined : day.colorHex }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Próximas Fiestas / Solemnidades */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-app-border">
              <p className="text-[10px] font-bold text-app-muted uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-lit-accent" /> Próximas Solemnidades
              </p>
              <div className="space-y-1.5">
                {upcomingEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="p-2 rounded-xl bg-app-bg border border-app-border/60 flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="text-[11px] font-bold text-app-text leading-tight">{ev.title}</p>
                      <p className="text-[9px] text-app-muted">
                        {ev.day} de {MONTH_NAMES_ES[ev.month]} {ev.time ? `· ${ev.time}` : ''}
                      </p>
                    </div>
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0"
                      style={{ backgroundColor: ev.colorHex }}
                    >
                      {ev.liturgicalColor.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón para abrir el Calendario Completo */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenFullCalendar();
            }}
            className="w-full py-2 px-3 rounded-xl bg-lit-primary text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity"
          >
            <span>Ver Calendario Completo y Rueda Litúrgica</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>
      )}
    </div>
  );
};

export default MiniCalendarPopover;
