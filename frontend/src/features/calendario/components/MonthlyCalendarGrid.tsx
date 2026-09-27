/**
 * MonthlyCalendarGrid.tsx — Cuadrícula Mensual Completa del Año Litúrgico y Pastoral.
 * 
 * Permite visualizar el mes completo con días teñidos por color litúrgico,
 * solemnidades, misas especiales, sacramentos y actividades parroquiales.
 */

import React, { useState } from 'react';
import {
  generateMonthDays, MONTH_NAMES_ES, DAY_NAMES_ES,
  DayLiturgicalInfo, ParishEvent
} from '../data/calendarUtils';
import {
  ChevronLeft, ChevronRight, Sparkles,
  Clock, X
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

export const MonthlyCalendarGrid: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<DayLiturgicalInfo | null>(null);
  const [filterType, setFilterType] = useState<string>('TODOS');

  const monthDays = generateMonthDays(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Filtrar eventos si se selecciona una categoría
  const filterEvents = (events: ParishEvent[]) => {
    if (filterType === 'TODOS') return events;
    return events.filter(e => e.type === filterType);
  };

  return (
    <div className="bg-white rounded-3xl border border-app-border p-4 sm:p-8 shadow-sm space-y-6">
      
      {/* ── Cabecera y Controles del Mes ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-lit-primary uppercase tracking-wider bg-lit-surface px-3 py-1 rounded-full border border-lit-border">
              Calendario Parroquial {currentYear}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-app-text font-serif">
            {MONTH_NAMES_ES[currentMonth]} {currentYear}
          </h2>
        </div>

        {/* Controles de Navegación y Filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoy
          </Button>

          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-app-border">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-app-muted hover:text-app-text transition-colors"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-app-muted hover:text-app-text transition-colors"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filtro de tipos de eventos */}
          <div className="w-52">
            <Select
              size="sm"
              variant="filter"
              value={filterType}
              onChange={(val) => setFilterType(val)}
              options={[
                { value: 'TODOS', label: 'Todos los Eventos' },
                { value: 'solemnidad', label: 'Solemnidades Mayores' },
                { value: 'fiesta', label: 'Fiestas Litúrgicas' },
                { value: 'parroquia', label: 'Fiestas Parroquiales' },
                { value: 'sacramento', label: 'Primeras Comuniones / Sacramentos' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── Leyenda de Colores Litúrgicos ─────────────────────────────── */}
      <div className="flex items-center gap-3 text-xs text-app-muted flex-wrap bg-stone-50 p-3 rounded-2xl border border-app-border">
        <span className="font-bold text-app-text flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-lit-accent" /> Tiempos Litúrgicos:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1E4D38]" />
          <span>Tiempo Ordinario</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A2040]" />
          <span>Cuaresma / Adviento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#916B1E]" />
          <span>Pascua / Navidad / Solemnidades</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#721C24]" />
          <span>Pentecostés / Semana Santa</span>
        </div>
      </div>

      {/* ── Cuadrícula del Calendario Mensual ─────────────────────────── */}
      <div className="border border-app-border rounded-2xl overflow-hidden shadow-xs">
        {/* Cabecera de Días de la Semana */}
        <div className="grid grid-cols-7 bg-stone-100/90 text-center border-b border-app-border">
          {DAY_NAMES_ES.map((dName, i) => (
            <div
              key={i}
              className={`py-3 text-xs font-bold ${
                i === 0 ? 'text-rose-700' : 'text-stone-700'
              }`}
            >
              {dName}
            </div>
          ))}
        </div>

        {/* Celdas de Días */}
        <div className="grid grid-cols-7 divide-x divide-y divide-app-border/80 bg-stone-50/30">
          {monthDays.map((day, index) => {
            const dayEvents = filterEvents(day.events);
            const isSelected = selectedDay?.date.toDateString() === day.date.toDateString();

            return (
              <div
                key={index}
                onClick={() => setSelectedDay(day)}
                className={`min-h-[90px] sm:min-h-[110px] p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-200 cursor-pointer relative group ${
                  day.isCurrentMonth ? 'bg-white hover:bg-lit-surface/40' : 'bg-stone-50/60 opacity-40'
                } ${day.isToday ? 'ring-2 ring-lit-primary z-10' : ''} ${
                  isSelected ? 'bg-lit-surface ring-2 ring-lit-accent shadow-sm' : ''
                }`}
              >
                {/* Barra superior del color litúrgico del día */}
                <div
                  className="w-full h-1 rounded-full mb-1"
                  style={{ backgroundColor: day.colorHex }}
                />

                {/* Número del día y distintivo */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      day.isToday
                        ? 'bg-lit-primary text-white shadow-xs'
                        : 'text-app-text group-hover:text-lit-primary'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {day.events.length > 0 && (
                    <span
                      className="w-2 h-2 rounded-full shadow-xs"
                      style={{ backgroundColor: day.events[0].colorHex }}
                      title={day.events[0].title}
                    />
                  )}
                </div>

                {/* Eventos / Fiestas dentro de la celda */}
                <div className="space-y-1 mt-1 flex-1">
                  {dayEvents.slice(0, 2).map(ev => (
                    <div
                      key={ev.id}
                      className="p-1 rounded-md text-[9px] font-bold truncate leading-tight shadow-xs text-white"
                      style={{ backgroundColor: ev.colorHex }}
                      title={`${ev.title} - ${ev.description}`}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] font-bold text-lit-primary block">
                      +{dayEvents.length - 2} más...
                    </span>
                  )}
                </div>

                {/* Pie de celda con nombre del tiempo si está vacío */}
                {dayEvents.length === 0 && (
                  <p className="text-[8px] text-stone-400 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.seasonName}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal / Detalle del Día Seleccionado ──────────────────────── */}
      {selectedDay && (
        <div className="p-6 rounded-3xl bg-stone-50 border border-lit-primary/30 shadow-md space-y-4 animate-fadeIn relative">
          <button
            onClick={() => setSelectedDay(null)}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-200 text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
              style={{ backgroundColor: selectedDay.colorHex }}
            >
              {selectedDay.dayNumber}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-app-text font-serif">
                  {selectedDay.date.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                {selectedDay.isToday && (
                  <Badge variant="gold" size="sm">Hoy</Badge>
                )}
              </div>
              <p className="text-xs font-semibold text-lit-primary mt-0.5">
                {selectedDay.seasonName} · Color: {selectedDay.colorName}
              </p>
            </div>
          </div>

          {/* Eventos del Día */}
          {selectedDay.events.length > 0 ? (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-app-muted uppercase tracking-wider">
                Celebraciones y Actividades de esta Fecha
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDay.events.map(ev => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-white border border-app-border shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-app-text">{ev.title}</span>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: ev.colorHex }}
                      >
                        {ev.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-app-muted">{ev.description}</p>
                    {ev.time && (
                      <div className="flex items-center gap-1.5 text-xs text-lit-primary font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Horario: {ev.time}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-app-border text-xs text-app-muted">
              Día ferial del {selectedDay.seasonName}. Misa comunitaria y formación según el horario habitual de la parroquia.
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MonthlyCalendarGrid;
