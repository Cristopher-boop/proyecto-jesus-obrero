import React, { createContext, useContext, useState, useEffect } from 'react';

export type LiturgicalSeason = 'ordinario' | 'cuaresma' | 'pentecostes' | 'pascua';

export interface LiturgicalThemeInfo {
  id: LiturgicalSeason;
  name: string;
  colorName: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const LITURGICAL_SEASONS: Record<LiturgicalSeason, LiturgicalThemeInfo> = {
  ordinario: {
    id: 'ordinario',
    name: 'Tiempo Ordinario',
    colorName: 'Verde Sacro',
    icon: '🌿',
    badgeBg: '#1E4D38',
    badgeText: '#EBF3EE',
    description: 'Esperanza y crecimiento espiritual en la vida cotidiana de la Iglesia.',
  },
  cuaresma: {
    id: 'cuaresma',
    name: 'Cuaresma y Adviento',
    colorName: 'Morado Penitencial',
    icon: '🕯️',
    badgeBg: '#4A2040',
    badgeText: '#F5EEF3',
    description: 'Conversión, penitencia, preparación y espera reverente.',
  },
  pentecostes: {
    id: 'pentecostes',
    name: 'Pentecostés y Pasión',
    colorName: 'Rojo Carmesí',
    icon: '🍷',
    badgeBg: '#721C24',
    badgeText: '#F9ECEE',
    description: 'Fuego del Espíritu Santo, martirio y la Pasión de Cristo.',
  },
  pascua: {
    id: 'pascua',
    name: 'Pascua y Navidad',
    colorName: 'Blanco y Oro Solemne',
    icon: '🕊️',
    badgeBg: '#916B1E',
    badgeText: '#FDF8EE',
    description: 'Victoria sobre la muerte, gozo pascual, pureza y máxima solemnidad.',
  },
};

interface ThemeContextType {
  season: LiturgicalSeason;
  seasonInfo: LiturgicalThemeInfo;
  setSeason: (season: LiturgicalSeason) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const LiturgicalThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [season, setSeasonState] = useState<LiturgicalSeason>(() => {
    const saved = localStorage.getItem('liturgical_season') as LiturgicalSeason;
    return saved && LITURGICAL_SEASONS[saved] ? saved : 'ordinario';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', season);
    localStorage.setItem('liturgical_season', season);
  }, [season]);

  const setSeason = (newSeason: LiturgicalSeason) => {
    setSeasonState(newSeason);
  };

  return (
    <ThemeContext.Provider
      value={{
        season,
        seasonInfo: LITURGICAL_SEASONS[season],
        setSeason,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useLiturgicalTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useLiturgicalTheme debe usarse dentro de un LiturgicalThemeProvider');
  }
  return context;
};
