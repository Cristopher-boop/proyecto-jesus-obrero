import React, { useState, useCallback } from 'react';
import {
  UserCheck, Search, RefreshCw, UserPlus, X, Phone, Baby,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useFeligreses, useFeligresDetalle } from '../hooks/useFeligreses';
import { CrearFeligresModal } from '../components/CrearFeligresModal';
import type { FeligresListItem } from '@/types';

const ESTADO_LABEL: Record<string, string> = {
  ACTIVO: 'Activo', BAJA: 'Baja', GRADUADO: 'Graduado',
};
const SACRAMENTO_LABEL: Record<string, string> = {
  PRIMERA_COMUNION: '1ª Comunión', CONFIRMACION: 'Confirmación',
};

export const FeligresesPage: React.FC = () => {
  const [search,       setSearch]       = useState('');
  const [searchDebounce, setDebouncedSearch] = useState('');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [selectedId,   setSelectedId]   = useState<number | null>(null);

  const { data, loading, error, refetch } = useFeligreses(searchDebounce || undefined);
  const { data: detalle, loading: detalleLoading } = useFeligresDetalle(selectedId);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    const t = setTimeout(() => setDebouncedSearch(val), 400);
    return () => clearTimeout(t);
  }, []);

  const nombreCompleto = (item: FeligresListItem) =>
    [item.nombres, item.primer_apellido, item.segundo_apellido].filter(Boolean).join(' ');

  return (
    <div className="flex gap-6 h-full">
      {/* ── Panel Principal ─────────────────────────────────────── */}
      <div className={`flex flex-col gap-5 flex-1 min-w-0 transition-all ${selectedId ? 'max-w-[calc(100%-22rem)]' : ''}`}>

        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-app-text flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-lit-primary" /> Cuentas de Feligreses
            </h2>
            <p className="text-xs text-app-muted mt-0.5">
              {data ? `${data.total} cuenta${data.total !== 1 ? 's' : ''} registrada${data.total !== 1 ? 's' : ''}` : 'Padres, madres y tutores con acceso al sistema'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />} onClick={refetch}>Actualizar</Button>
            <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Nueva Cuenta</Button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="max-w-sm">
          <Input placeholder="Buscar por nombre, CI o usuario..." value={search} onChange={e => handleSearch(e.target.value)} leftIcon={<Search className="w-3.5 h-3.5" />} />
        </div>

        {error && <Alert variant="error" title="Error">{error}</Alert>}

        {/* Tabla */}
        {loading && !data ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lit-primary" />
          </div>
        ) : data?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">👨‍👩‍👦</div>
            <h3 className="text-base font-bold text-app-text">No hay cuentas de feligreses</h3>
            <p className="text-xs text-app-muted mt-1 max-w-xs">
              {searchDebounce ? `Sin resultados para "${searchDebounce}"` : 'Crea la primera cuenta para un padre o tutor.'}
            </p>
            {!searchDebounce && <Button variant="primary" size="sm" className="mt-4" leftIcon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => setModalOpen(true)}>Crear primera cuenta</Button>}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-app-border bg-white shadow-xs">
            <table className="w-full min-w-[600px]">
              <thead className="bg-stone-50 border-b border-app-border">
                <tr>
                  {['Feligrés', 'CI / Teléfono', 'Usuario', 'Hijos vinculados', 'Registro'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-app-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border/50">
                {data?.items.map(item => {
                  const isSelected = selectedId === item.persona_id;
                  return (
                    <tr key={item.persona_id} onClick={() => setSelectedId(isSelected ? null : item.persona_id)}
                      className={`cursor-pointer transition-colors hover:bg-lit-surface/50 ${isSelected ? 'bg-lit-surface border-l-4 border-lit-primary' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-app-text">{nombreCompleto(item)}</p>
                        {item.email && <p className="text-[10px] text-app-muted">{item.email}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-mono text-app-text">{item.ci_dni}</p>
                        {item.telefono && <p className="text-[10px] text-app-muted flex items-center gap-1"><Phone className="w-3 h-3" />{item.telefono}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-stone-100 px-2 py-0.5 rounded font-mono text-stone-700">{item.username}</code>
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
                          {new Date(item.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Panel Lateral de Detalle ─────────────────────────────── */}
      {selectedId && (
        <div className="w-80 flex-shrink-0 flex flex-col gap-4 animate-slide-in-right">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-app-text flex items-center gap-2"><UserCheck className="w-4 h-4 text-lit-primary" /> Detalle</h3>
            <button onClick={() => setSelectedId(null)} className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-app-muted"><X className="w-3.5 h-3.5" /></button>
          </div>

          {detalleLoading ? (
            <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lit-primary" /></div>
          ) : detalle ? (
            <div className="space-y-4">
              <Card className="p-4 space-y-2">
                <p className="text-xs font-bold text-lit-primary uppercase tracking-wide">Datos del feligrés</p>
                <p className="text-sm font-bold text-app-text">{detalle.nombres} {detalle.primer_apellido} {detalle.segundo_apellido ?? ''}</p>
                <p className="text-[11px] font-mono text-app-muted">CI: {detalle.ci_dni}</p>
                {detalle.telefono && <p className="text-[11px] text-app-muted flex items-center gap-1"><Phone className="w-3 h-3" />{detalle.telefono}</p>}
                <div className="pt-1 border-t border-app-border/60">
                  <p className="text-[10px] text-app-muted">Usuario</p>
                  <code className="text-xs font-mono font-bold text-app-text">{detalle.username}</code>
                </div>
              </Card>

              {/* Hijos vinculados */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-app-muted uppercase tracking-wide flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-lit-primary" /> Catecúmenos vinculados ({detalle.hijos.length})
                </p>
                {detalle.hijos.length === 0 ? (
                  <p className="text-xs text-app-muted italic">Ningún catecúmeno vinculado aún.</p>
                ) : detalle.hijos.map(h => (
                  <div key={h.persona_id} className="p-3 rounded-lg border border-app-border bg-white space-y-1">
                    <p className="text-xs font-semibold text-app-text">{h.nombres} {h.primer_apellido}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={h.estado === 'ACTIVO' ? 'success' : h.estado === 'BAJA' ? 'warning' : 'neutral'} size="sm">
                        {ESTADO_LABEL[h.estado]}
                      </Badge>
                      <span className="text-[10px] text-app-muted">{SACRAMENTO_LABEL[h.tipo_sacramento]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      <CrearFeligresModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={() => { refetch(); setModalOpen(false); }} />
    </div>
  );
};

export default FeligresesPage;
