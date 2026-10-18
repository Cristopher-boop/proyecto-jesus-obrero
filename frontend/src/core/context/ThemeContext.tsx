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

export type ColorMode = 'light' | 'dark' | 'system';
export type ResolvedColorMode = 'light' | 'dark';

interface ThemeContextType {
  // Tema Litúrgico Parroquial
  season: LiturgicalSeason;
  seasonInfo: LiturgicalThemeInfo;
  setSeason: (season: LiturgicalSeason) => void;

  // Modo de Color (Claro / Oscuro / Sistema)
  colorMode: ColorMode;
  resolvedColorMode: ResolvedColorMode;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const LiturgicalThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Estado del Tiempo Litúrgico
  const [season, setSeasonState] = useState<LiturgicalSeason>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('liturgical_season') as LiturgicalSeason;
      if (saved && LITURGICAL_SEASONS[saved]) return saved;
    }
    return 'ordinario';
  });

  // 2. Estado del Modo de Color ('light' | 'dark' | 'system')
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('parroquia_color_mode') as ColorMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    }
    return 'system';
  });

  // Función helper para resolver el esquema del sistema operativo
  const getSystemTheme = (): ResolvedColorMode => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const [resolvedColorMode, setResolvedColorMode] = useState<ResolvedColorMode>(() => {
    return colorMode === 'system' ? getSystemTheme() : colorMode;
  });

  // Efecto: Sincronizar atributo data-theme con el tiempo litúrgico
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', season);
    localStorage.setItem('liturgical_season', season);
  }, [season]);

  // Efecto: Sincronizar clase .dark y data-mode con el modo de color y escuchar el sistema
  useEffect(() => {
    const applyColorMode = () => {
      const resolved = colorMode === 'system' ? getSystemTheme() : colorMode;
      setResolvedColorMode(resolved);

      const root = document.documentElement;
      if (resolved === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      root.setAttribute('data-mode', resolved);
    };

    applyColorMode();

    // Si el modo es 'system', escuchar cambios dinámicos del sistema operativo
    if (colorMode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = () => {
        applyColorMode();
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMediaChange);
        return () => mediaQuery.removeEventListener('change', handleMediaChange);
      } else if ((mediaQuery as any).addListener) {
        (mediaQuery as any).addListener(handleMediaChange);
        return () => (mediaQuery as any).removeListener(handleMediaChange);
      }
    }
  }, [colorMode]);

  const setSeason = (newSeason: LiturgicalSeason) => {
    setSeasonState(newSeason);
  };

  const setColorMode = (newMode: ColorMode) => {
    setColorModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('parroquia_color_mode', newMode);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        season,
        seasonInfo: LITURGICAL_SEASONS[season],
        setSeason,
        colorMode,
        resolvedColorMode,
        setColorMode,
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

export const useTheme = useLiturgicalTheme;
