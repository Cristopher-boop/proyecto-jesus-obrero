/**
 * LiturgicalDetailCard.tsx — Retablo e Inspector Teológico del Tiempo Litúrgico.
 * 
 * Presenta el significado sagrado, lecturas bíblicas, himnos tradicionales,
 * símbolos eucarísticos, desglose de Semana Santa y botón para aplicar el tema vivo al sistema.
 */

import React from 'react';
import { LiturgicalStation } from '../data/liturgicalData';
import { useLiturgicalTheme } from '@/core/context/ThemeContext';
import {
  Sparkles, BookOpen, Music, CheckCircle2,
  Flame, Cross, Shield
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Props {
  station: LiturgicalStation;
  onNext: () => void;
  onPrev: () => void;
}

export const LiturgicalDetailCard: React.FC<Props> = ({ station, onNext, onPrev }) => {
  const { season, setSeason, resolvedColorMode } = useLiturgicalTheme();
  const isDark = resolvedColorMode === 'dark';
  const isCurrentActiveTheme = season === station.themeId;

  return (
    <div className="bg-app-card rounded-3xl border border-app-border shadow-xl overflow-hidden flex flex-col transition-all duration-500">
      
      {/* ── Cabecera Solemne del Retablo ────────────────────────────── */}
      <div 
        className={`p-6 sm:p-8 relative overflow-hidden transition-all duration-700 ${
          isDark 
            ? 'text-white' 
            : 'text-app-text bg-app-card border-b border-app-border'
        }`}
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${station.colorHex} 0%, #1A1A1A 100%)`
            : `radial-gradient(ellipse at top right, ${station.colorHex}18 0%, #FFFFFF 65%, #FAF7F2 100%)`
        }}
      >
        {/* Marca de agua sacra de fondo */}
        <div className={`absolute right-[-2%] top-[-20%] text-9xl font-serif select-none pointer-events-none ${
          isDark ? 'opacity-10 text-white' : 'opacity-[0.04] text-lit-primary'
        }`}>
          ✝
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              isDark 
                ? 'bg-white/15 backdrop-blur-md border border-white/20' 
                : 'bg-lit-surface border border-lit-border text-lit-primary'
            }`}>
              <span className="text-sm">{station.icon}</span>
              <span className={`font-mono tracking-wider uppercase ${isDark ? 'text-amber-200' : 'text-lit-accent font-bold'}`}>
                {station.latinMotto}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                isDark 
                  ? 'bg-white/15 border border-white/20 text-white' 
                  : 'bg-app-card border border-app-border text-app-text shadow-2xs'
              }`}>
                {station.approxDates}
              </span>
            </div>
          </div>

          <div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-serif ${
              isDark ? 'text-white' : 'text-app-text'
            }`}>
              {station.name}
            </h2>
            <p className={`text-sm mt-1 font-medium ${
              isDark ? 'text-white/85' : 'text-app-muted'
            }`}>
              {station.subtitle}
            </p>
          </div>

          {/* Cita Bíblica Iluminadora */}
          <div className={`p-3.5 rounded-2xl text-xs italic leading-relaxed ${
            isDark 
              ? 'bg-white/15 backdrop-blur-md border border-white/20 text-amber-100/95' 
              : 'bg-lit-surface/80 border border-lit-border text-app-text'
          }`}>
            "{station.scriptureVerse}"
            <div className={`text-[11px] not-italic font-bold text-right mt-1 font-sans ${
              isDark ? 'text-amber-300' : 'text-lit-accent'
            }`}>
              — {station.scriptureReference}
            </div>
          </div>

          {/* Botón de Aplicación de Tema Vivo */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-white/80' : 'text-app-muted'}`}>
              <span 
                className="w-4 h-4 rounded-full border border-white shadow-xs inline-block" 
                style={{ backgroundColor: station.colorHex }}
              />
              <span className="font-semibold text-app-text">{station.colorName}</span>
            </div>

            <Button
              variant={isCurrentActiveTheme ? 'ghost' : 'accent'}
              size="sm"
              onClick={() => setSeason(station.themeId)}
              className={
                isCurrentActiveTheme 
                  ? isDark 
                    ? 'bg-white/20 text-white hover:bg-white/30' 
                    : 'bg-lit-surface text-lit-primary border border-lit-border font-bold'
                  : 'shadow-md'
              }
              leftIcon={<Flame className="w-3.5 h-3.5" />}
            >
              {isCurrentActiveTheme ? '✓ Tema Vivo Activo en el Sistema' : 'Vivir este Tiempo (Cambiar Tema)'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Cuerpo del Retablo ───────────────────────────────────────── */}
      <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto max-h-[580px]">

        {/* Síntesis Teológica */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-lit-primary uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-lit-accent" /> Significado Teológico y Eclesial
          </h3>
          <p className="text-xs sm:text-sm text-app-text/90 leading-relaxed">
            {station.theologicalSummary}
          </p>
        </div>

        {/* ── Desglose Especial de Semana Santa y Triduo Pascual (Si aplica) ── */}
        {station.holyWeekDays && (
          <div className="p-5 rounded-2xl bg-app-bg border border-app-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-app-text uppercase tracking-wider flex items-center gap-2">
                <Cross className="w-4 h-4 text-[#721C24]" /> Días Santos del Triduo Pascual
              </h3>
              <Badge variant="warning" size="sm">Culmen de la Redención</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {station.holyWeekDays.map((hDay, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-xl bg-app-card border border-app-border/80 shadow-xs space-y-1.5 hover:border-lit-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-app-text flex items-center gap-1.5">
                      <span>{hDay.symbol}</span>
                      <span>{hDay.dayName}</span>
                    </span>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: hDay.color }}
                    >
                      {hDay.colorName.split(' ')[0]}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-lit-primary">
                    {hDay.title}
                  </p>
                  <p className="text-[11px] text-app-muted leading-tight">
                    {hDay.significance}
                  </p>
                  <p className="text-[10px] italic text-app-muted pt-1 border-t border-app-border">
                    "{hDay.keyGospel}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Símbolos Eucarísticos y Sagrados */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-lit-primary uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lit-accent" /> Símbolos y Signos Litúrgicos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {station.symbols.map((sym, i) => (
              <div 
                key={i} 
                className="p-3.5 rounded-2xl bg-lit-surface/50 border border-lit-border/80 space-y-1 hover:bg-lit-surface transition-colors"
              >
                <div className="text-xl mb-1">{sym.icon}</div>
                <h4 className="text-xs font-bold text-app-text">{sym.name}</h4>
                <p className="text-[11px] text-app-muted leading-snug">
                  {sym.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Himno Tradicional & Canto Litúrgico */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Music className="w-4 h-4 text-lit-accent" /> Canto e Himno Principal
            </h3>
            <span className="text-[10px] font-mono text-amber-800 dark:text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded">
              {station.keyHymn.latinTitle}
            </span>
          </div>
          <p className="text-xs font-bold text-app-text">
            {station.keyHymn.title}
          </p>
          <p className="text-[11px] text-app-muted italic">
            {station.keyHymn.meaning}
          </p>
        </div>

        {/* Enfoque Pastoral para la Parroquia */}
        <div className="space-y-2 pt-2 border-t border-app-border">
          <h3 className="text-xs font-bold text-app-muted uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-lit-primary" /> Vivencia Pastoral y Catequética en Jesús Obrero
          </h3>
          <ul className="space-y-1.5">
            {station.pastoralFocus.map((focus, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-app-text">
                <CheckCircle2 className="w-3.5 h-3.5 text-lit-primary flex-shrink-0 mt-0.5" />
                <span>{focus}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Pie con Navegación Entre Estaciones ───────────────────────── */}
      <div className="p-4 bg-app-bg border-t border-app-border flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onPrev}>
          ← Anterior
        </Button>

        <div className="text-center">
          <span className="text-[10px] font-mono font-bold text-app-muted uppercase">
            Estación {station.order} de 10
          </span>
        </div>

        <Button variant="ghost" size="sm" onClick={onNext}>
          Siguiente →
        </Button>
      </div>

    </div>
  );
};

export default LiturgicalDetailCard;
