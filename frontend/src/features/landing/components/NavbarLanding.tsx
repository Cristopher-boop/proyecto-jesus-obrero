import React, { useState, useEffect } from 'react';
import { useLiturgicalTheme } from '@/core/context/ThemeContext';
import { ThemeModeToggle } from '@/components/ui/ThemeModeToggle';
import { Menu, X, LogIn, Church } from 'lucide-react';
import Button from '@/components/ui/Button';

interface NavbarLandingProps {
  onGoToLogin: () => void;
}

export const NavbarLanding: React.FC<NavbarLandingProps> = ({ onGoToLogin }) => {
  const { seasonInfo } = useLiturgicalTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: '6 Capillas', href: '#capillas' },
    { label: 'Comunión & Kairos', href: '#ninez' },
    { label: 'Juventud & Confirmación', href: '#juventud' },
    { label: 'Comunidades', href: '#comunidades' },
    { label: 'Tradiciones', href: '#tradiciones' },
    { label: 'Sacramentos & Coro', href: '#sacramentos' },
    { label: 'Vocaciones', href: '#vocaciones' },
    { label: 'Historia', href: '#historia' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Banner Litúrgico Superior */}
      <div className="bg-lit-primary text-white text-[11px] py-1.5 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base" role="img" aria-label="Icono litúrgico">{seasonInfo.icon}</span>
            <span className="font-semibold">{seasonInfo.name}</span>
            <span className="hidden sm:inline text-white/70">·</span>
            <span className="hidden sm:inline text-white/90 italic">
              "Una sola familia unida en la fe, la esperanza y el amor fraterno"
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 text-white/90 font-medium">
              <Church className="w-3.5 h-3.5 text-lit-accent" />
              <span>Red de 6 Capillas Hermanas</span>
            </span>
            <div className="flex items-center">
              <ThemeModeToggle size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Navegación Principal */}
      <nav
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-app-card/95 backdrop-blur-md border-b border-app-border shadow-md py-2.5'
            : 'bg-app-card/85 backdrop-blur-xs border-b border-app-border/40 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo y Nombre de la Parroquia */}
          <a href="#inicio" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-lit-surface border border-lit-border text-lit-primary flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0">
              ⛪
            </div>
            <div>
              <span className="font-serif text-base sm:text-lg font-bold text-app-text tracking-tight block leading-tight">
                Parroquia Jesús Obrero
              </span>
              <span className="text-[10px] sm:text-[11px] text-lit-primary font-semibold block">
                Comunidad de Comunidades
              </span>
            </div>
          </a>

          {/* Enlaces de Navegación de Escritorio */}
          <div className="hidden xl:flex items-center gap-4 lg:gap-5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-app-text/80 hover:text-lit-primary transition-colors hover:underline underline-offset-4 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Botón CTA hacia el Portal Parroquial */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<LogIn className="w-4 h-4" />}
              onClick={onGoToLogin}
            >
              Portal Parroquial
            </Button>
          </div>

          {/* Botón Hamburguesa en Móvil y pantallas intermedias */}
          <div className="flex items-center gap-2 xl:hidden">
            <Button
              variant="primary"
              size="sm"
              className="sm:hidden text-xs px-2.5 py-1"
              leftIcon={<LogIn className="w-3.5 h-3.5" />}
              onClick={onGoToLogin}
            >
              Ingresar
            </Button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-app-text hover:bg-lit-surface border border-app-border transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menú Desplegable en Móvil */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-app-border bg-app-card px-4 pt-3 pb-5 space-y-3 shadow-lg animate-fadeIn max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-app-text hover:bg-lit-surface hover:text-lit-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-app-border/80">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                leftIcon={<LogIn className="w-4 h-4" />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGoToLogin();
                }}
              >
                Ingresar al Portal Parroquial
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default NavbarLanding;
