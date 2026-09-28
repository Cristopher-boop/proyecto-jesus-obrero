/**
 * Pagination.tsx — Componente de Paginación Eclesiástica y Responsiva.
 * 
 * Sigue la arquitectura y tokens del sistema:
 * - Soporte de Modo Claro y Oscuro nativo sin colores quemados.
 * - Navegación accesible (teclado, aria-labels, aria-current).
 * - Selector de tamaño de página configurable.
 * - Diseño compacto adaptativo en dispositivos móviles.
 */

import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
  className = '',
  itemLabel = 'registros',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(totalItems, safePage * pageSize);

  // Generar secuencia inteligente de páginas con elipsis
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safePage <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis-right', totalPages];
    }

    if (safePage >= totalPages - 3) {
      return [1, 'ellipsis-left', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, 'ellipsis-left', safePage - 1, safePage, safePage + 1, 'ellipsis-right', totalPages];
  }, [totalPages, safePage]);

  const canGoPrev = safePage > 1;
  const canGoNext = safePage < totalPages;

  return (
    <nav
      role="navigation"
      aria-label="Controles de paginación"
      className={`flex flex-col sm:flex-row items-center justify-between gap-3.5 px-4 py-3 bg-app-card border border-app-border rounded-2xl shadow-2xs text-xs ${className}`}
    >
      {/* ── Resumen de Registros y Selector de Tamaño de Página ───────── */}
      <div className="flex items-center gap-3 text-app-muted flex-wrap justify-center sm:justify-start">
        <span>
          Mostrando{' '}
          <strong className="text-app-text font-bold">
            {startIndex}–{endIndex}
          </strong>{' '}
          de{' '}
          <strong className="text-app-text font-bold">
            {totalItems}
          </strong>{' '}
          {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-app-border/80">
            <span className="text-[11px]">Por pág:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Cantidad de registros por página"
              className="bg-app-bg text-app-text border border-app-border rounded-lg text-xs py-1 px-2 outline-none focus:ring-1 focus:ring-lit-primary transition-all cursor-pointer font-medium"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-app-card text-app-text">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Botones de Navegación entre Páginas ───────────────────────── */}
      <div className="flex items-center gap-1">
        {/* Ir a la primera página */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev}
          aria-label="Ir a la primera página"
          className="p-1.5 rounded-lg border border-app-border bg-app-bg text-app-text hover:bg-lit-surface hover:text-lit-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Primera página"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Página anterior */}
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!canGoPrev}
          aria-label="Página anterior"
          className="p-1.5 rounded-lg border border-app-border bg-app-bg text-app-text hover:bg-lit-surface hover:text-lit-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Página anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Páginas numeradas (visibles en desktop/tablet) */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-app-muted select-none font-bold"
                >
                  …
                </span>
              );
            }

            const isActive = p === safePage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[30px] h-[30px] px-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-lit-primary text-white shadow-xs scale-105'
                    : 'border border-app-border bg-app-bg text-app-text hover:bg-lit-surface hover:text-lit-primary'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Indicador de página compacta para móviles */}
        <span className="sm:hidden px-2 py-1 font-bold text-app-text">
          {safePage} / {totalPages}
        </span>

        {/* Página siguiente */}
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!canGoNext}
          aria-label="Página siguiente"
          className="p-1.5 rounded-lg border border-app-border bg-app-bg text-app-text hover:bg-lit-surface hover:text-lit-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Página siguiente"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Ir a la última página */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          aria-label="Ir a la última página"
          className="p-1.5 rounded-lg border border-app-border bg-app-bg text-app-text hover:bg-lit-surface hover:text-lit-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Última página"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
