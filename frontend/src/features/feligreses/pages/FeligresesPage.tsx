import React, { useState, useCallback, useMemo } from 'react';
import {
  UserCheck, Search, RefreshCw, UserPlus, Phone, Baby
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import Pagination from '@/components/ui/Pagination';
import { useFeligreses } from '../hooks/useFeligreses';
import { CrearFeligresModal } from '../components/CrearFeligresModal';
import { FeligresDetalleDrawer } from '../components/FeligresDetalleDrawer';
import type { FeligresListItem } from '@/types';

type FiltroHijos = 'TODOS' | 'CON_HIJOS' | 'SIN_HIJOS';

export const FeligresesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [searchDebounce, setDebouncedSearch] = useState('');
  const [filtroHijos, setFiltroHijos] = useState<FiltroHijos>('TODOS');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const conHijosParam = useMemo(() => {
    if (filtroHijos === 'CON_HIJOS') return true;
    if (filtroHijos === 'SIN_HIJOS') return false;
    return undefined;
  }, [filtroHijos]);

  const { data, loading, error, refetch } = useFeligreses(
    searchDebounce || undefined,
    conHijosParam,
    (page - 1) * pageSize,
    pageSize
  );

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
    const t = setTimeout(() => setDebouncedSearch(val), 400);
    return () => clearTimeout(t);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleSelectRow = (personaId: number) => {
    if (selectedId === personaId) {
      handleClosePanel();
      return;
    }
    setSelectedId(personaId);
  };

  const nombreCompleto = (item: FeligresListItem) =>
    [item.nombres, item.primer_apellido, item.segundo_apellido].filter(Boolean).join(' ');

  return (
    <div className="flex gap-6 h-full">
      {/* ── Panel Principal ─────────────────────────────────────── */}
      <div className={`flex flex-col gap-5 flex-1 min-w-0 transition-all ${selectedId ? '2xl:max-w-[calc(100%-22rem)]' : ''}`}>

        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-app-text flex items-center gap-2 font-serif">
              <UserCheck className="w-5 h-5 text-lit-primary" /> Cuentas de Feligreses
            </h2>
            <p className="text-xs text-app-muted mt-0.5">
              {data ? `${data.total} cuenta${data.total !== 1 ? 's' : ''} registrada${data.total !== 1 ? 's' : ''}` : 'Padres, madres y tutores con acceso al sistema'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={refetch}
            >
              Actualizar
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => setModalOpen(true)}
            >
              Nueva Cuenta
            </Button>
          </div>
        </div>

        {/* Filtros: Búsqueda y Filtro de Vinculación */}
        <div className="p-3.5 rounded-2xl bg-app-card border border-app-border shadow-xs space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Buscador de texto */}
            <div className="flex-1 min-w-[240px]">
              <Input
                placeholder="Buscar por nombre, CI, usuario o teléfono..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                leftIcon={<Search className="w-3.5 h-3.5 text-app-muted" />}
              />
            </div>
          </div>

          {/* Filtro secundario: Estado de vinculación */}
          <div className="flex items-center justify-between pt-1 border-t border-app-border/40 text-xs flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-app-muted uppercase tracking-wider">Filtrar por:</span>
              <div className="flex items-center gap-1 bg-app-bg border border-app-border p-0.5 rounded-lg">
                {([
                  { val: 'TODOS', label: 'Todos' },
                  { val: 'CON_HIJOS', label: 'Con Hijos' },
                  { val: 'SIN_HIJOS', label: 'Sin Hijos' },
                ] as Array<{ val: FiltroHijos; label: string }>).map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => {
                      setFiltroHijos(val);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      filtroHijos === val
                        ? 'bg-lit-surface shadow-2xs text-lit-primary font-bold'
                        : 'text-app-muted hover:text-app-text'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {(filtroHijos !== 'TODOS' || search) && (
              <button
                onClick={() => {
                  setFiltroHijos('TODOS');
                  setSearch('');
                  setDebouncedSearch('');
                  setPage(1);
                }}
                className="text-[11px] font-semibold text-semantic-error hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {error && <Alert variant="error" title="Error">{error}</Alert>}

        {/* Tabla */}
        {loading && !data ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lit-primary" />
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-app-card rounded-2xl border border-app-border">
            <div className="text-5xl mb-4">👨‍👩‍👦</div>
            <h3 className="text-base font-bold text-app-text">No se encontraron cuentas de feligreses</h3>
            <p className="text-xs text-app-muted mt-1 max-w-xs">
              {searchDebounce
                ? `Sin resultados para "${searchDebounce}".`
                : filtroHijos !== 'TODOS'
                ? 'No hay registros que coincidan con el filtro seleccionado.'
                : 'Crea la primera cuenta para un padre o tutor.'}
            </p>
            {!searchDebounce && filtroHijos === 'TODOS' && (
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                onClick={() => setModalOpen(true)}
              >
                Crear primera cuenta
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-card shadow-xs">
              <table className="w-full min-w-[640px]">
                <thead className="bg-app-bg border-b border-app-border">
                  <tr>
                    {['Feligrés', 'CI / Teléfono', 'Usuario', 'Hijos vinculados', 'Registro', 'Acción'].map(h => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-left text-[10px] font-bold text-app-muted uppercase tracking-wider ${
                          h === 'Acción' ? 'text-right' : ''
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border/50">
                  {data?.items?.map(item => {
                    const isSelected = selectedId === item.persona_id;
                    return (
                      <tr
                        key={item.persona_id}
                        onClick={() => handleSelectRow(item.persona_id)}
                        className={`cursor-pointer transition-colors hover:bg-lit-surface/40 ${
                          isSelected ? 'bg-lit-surface border-l-4 border-lit-primary' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-app-text">{nombreCompleto(item)}</p>
                          {item.email && <p className="text-[10px] text-app-muted">{item.email}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-mono font-bold text-app-text">{item.ci_dni}</p>
                          {item.telefono && (
                            <p className="text-[10px] text-app-muted flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-app-muted" />{item.telefono}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-app-bg border border-app-border px-2 py-0.5 rounded font-mono text-app-text font-bold">
                            {item.username}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Baby className="w-3.5 h-3.5 text-lit-primary" />
                            <span className="text-sm font-bold text-lit-primary">{item.total_hijos}</span>
                            <span className="text-[10px] text-app-muted">hijo{item.total_hijos !== 1 ? 's' : ''}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-app-muted">
                            {new Date(item.created_at).toLocaleDateString('es-BO', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectRow(item.persona_id);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${
                              isSelected
                                ? 'bg-lit-primary text-white shadow-xs'
                                : 'bg-lit-surface text-lit-primary hover:bg-lit-border'
                            }`}
                            title="Ver ficha del feligrés"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {data && data.total > 0 && (
              <Pagination
                currentPage={page}
                totalItems={data.total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setPage(1);
                }}
                itemLabel="feligreses"
              />
            )}
          </>
        )}
      </div>

      {/* ── Drawer de Detalle Superpuesto hacia adelante (z-50) ────────────── */}
      <FeligresDetalleDrawer
        personaId={selectedId}
        onClose={handleClosePanel}
      />

      <CrearFeligresModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { refetch(); setModalOpen(false); }}
      />
    </div>
  );
};

export default FeligresesPage;
