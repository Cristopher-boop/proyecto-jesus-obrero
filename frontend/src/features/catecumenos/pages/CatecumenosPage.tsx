import React, { useState, useCallback } from 'react';
import {
  UserPlus, Search, RefreshCw, Baby, X,
  CheckCircle2, AlertCircle, GraduationCap, Phone,
  QrCode, BookOpen, BookCheck, Droplets, Edit3,
  ClipboardList, UserX, RotateCcw,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import {
  useCatecumenos, useCatecumenoDetalle, useBajaCatecumeno,
  type CatecumenoFilters,
} from '../hooks/useCatecumenos';
import { InscripcionModal }       from '../components/InscripcionModal';
import { QRGafete }               from '../components/QRGafete';
import { EditCatecumenoDrawer }   from '../components/EditCatecumenoDrawer';
import type { CatecumenoListItem, EstadoInscripcion, Genero } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GENERO_LABEL: Record<Genero, string> = {
  MASCULINO: '♂ Masculino', FEMENINO: '♀ Femenino', OTRO: '⚬ Otro',
};

const PARENTESCO_LABEL: Record<string, string> = {
  PAPA: 'Padre', MAMA: 'Madre', TUTOR_LEGAL: 'Tutor Legal', OTRO: 'Otro',
};

const ESTADO_CONFIG: Record<EstadoInscripcion, { label: string; variant: 'success' | 'warning' | 'neutral'; icon: React.ReactNode }> = {
  ACTIVO:   { label: 'Activo',   variant: 'success', icon: <CheckCircle2  className="w-3 h-3" /> },
  BAJA:     { label: 'Baja',     variant: 'warning', icon: <AlertCircle   className="w-3 h-3" /> },
  GRADUADO: { label: 'Graduado', variant: 'neutral',  icon: <GraduationCap className="w-3 h-3" /> },
};

function calcularEdad(fechaNac?: string): string {
  if (!fechaNac) return '—';
  const hoy = new Date();
  const nac = new Date(fechaNac + 'T12:00:00');
  let edad  = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
  return `${edad} años`;
}

type PanelTab = 'ficha' | 'editar' | 'qr';

// ─── Componente ───────────────────────────────────────────────────────────────

export const CatecumenosPage: React.FC = () => {
  const [search,         setSearch]         = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [estadoFiltro,   setEstadoFiltro]   = useState<EstadoInscripcion | ''>('');
  const [modalOpen,      setModalOpen]      = useState(false);
  const [selectedId,     setSelectedId]     = useState<number | null>(null);
  const [panelTab,       setPanelTab]       = useState<PanelTab>('ficha');
  const [bajaConfirm,    setBajaConfirm]    = useState(false);

  const filters: CatecumenoFilters = {
    tipo: 'PRIMERA_COMUNION',
    estado: estadoFiltro || undefined,
    search: searchDebounce || undefined,
    skip: 0, limit: 100,
  };

  const { data, loading, error, refetch }                          = useCatecumenos(filters);
  const { data: detalle, loading: detalleLoading, refetch: refetchDetalle } = useCatecumenoDetalle(selectedId);
  const { darBaja, reactivar, loading: bajaLoading }               = useBajaCatecumeno();

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    const t = setTimeout(() => setSearchDebounce(val), 400);
    return () => clearTimeout(t);
  }, []);

  const handleSelectRow = (personaId: number) => {
    if (selectedId === personaId) { setSelectedId(null); return; }
    setSelectedId(personaId);
    setPanelTab('ficha');
    setBajaConfirm(false);
  };

  const handleDarBaja = async () => {
    if (!selectedId) return;
    const res = await darBaja(selectedId);
    if (res) { refetch(); refetchDetalle(); setBajaConfirm(false); }
  };

  const handleReactivar = async () => {
    if (!selectedId) return;
    const res = await reactivar(selectedId);
    if (res) { refetch(); refetchDetalle(); }
  };

  const handleSavedEdit = () => {
    refetch();
    refetchDetalle();
    setPanelTab('ficha');
  };

  const nombreCompleto = (item: CatecumenoListItem) =>
    [item.nombres, item.primer_apellido, item.segundo_apellido].filter(Boolean).join(' ');

  return (
    <div className="flex gap-6 h-full">

      {/* ── Panel Principal ─────────────────────────────────────────── */}
      <div className={`flex flex-col gap-5 flex-1 min-w-0 transition-all ${selectedId ? 'max-w-[calc(100%-22rem)]' : ''}`}>

        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-app-text flex items-center gap-2">
              <Baby className="w-5 h-5 text-lit-primary" /> Catecúmenos · Primera Comunión
            </h2>
            <p className="text-xs text-app-muted mt-0.5">
              {data ? `${data.total} catecúmeno${data.total !== 1 ? 's' : ''}` : 'Sede: Parroquia Jesús Obrero'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />} onClick={refetch}>Actualizar</Button>
            <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Nueva Inscripción</Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <Input placeholder="Buscar por nombre, apellido o CI..." value={search} onChange={e => handleSearch(e.target.value)} leftIcon={<Search className="w-3.5 h-3.5" />} />
          </div>
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg">
            {([{ val: '', label: 'Todos' }, { val: 'ACTIVO', label: 'Activos' }, { val: 'BAJA', label: 'Bajas' }, { val: 'GRADUADO', label: 'Graduados' }] as Array<{ val: EstadoInscripcion | ''; label: string }>).map(({ val, label }) => (
              <button key={val} onClick={() => setEstadoFiltro(val)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${estadoFiltro === val ? 'bg-white shadow-xs text-lit-primary font-semibold' : 'text-app-muted hover:text-app-text'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <Alert variant="error" title="Error al cargar">{error}</Alert>}

        {/* Tabla */}
        {loading && !data ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lit-primary" /></div>
        ) : data && data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">🕊️</div>
            <h3 className="text-base font-bold text-app-text">No hay catecúmenos registrados</h3>
            <p className="text-xs text-app-muted mt-1 max-w-xs">{searchDebounce ? `Sin resultados para "${searchDebounce}"` : 'Usa "Nueva Inscripción" para registrar el primero.'}</p>
            {!searchDebounce && <Button variant="primary" size="sm" className="mt-4" leftIcon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => setModalOpen(true)}>Inscribir primer catecúmeno</Button>}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-app-border bg-white shadow-xs">
            <table className="w-full min-w-[680px]">
              <thead className="bg-stone-50 border-b border-app-border">
                <tr>
                  {['Nombre', 'Edad / Bautismo', 'Tutor / Tel.', 'Materiales', 'Estado', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-app-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border/50">
                {data?.items.map(item => {
                  const ec = ESTADO_CONFIG[item.estado];
                  const isSel = selectedId === item.persona_id;
                  return (
                    <tr key={item.persona_id} onClick={() => handleSelectRow(item.persona_id)}
                      className={`cursor-pointer transition-colors hover:bg-lit-surface/50 ${isSel ? 'bg-lit-surface border-l-4 border-lit-primary' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-app-text">{nombreCompleto(item)}</p>
                        {item.genero && <p className="text-[10px] text-app-muted">{GENERO_LABEL[item.genero]}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-app-text">{calcularEdad(item.fecha_nacimiento)}</p>
                        <p className={`text-[10px] flex items-center gap-1 mt-0.5 ${item.es_bautizado ? 'text-semantic-success' : 'text-app-muted'}`}>
                          <Droplets className="w-3 h-3" />{item.es_bautizado ? 'Bautizado/a' : 'Sin bautismo'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-app-text">{item.tutor_nombre ?? '—'}</p>
                        {item.tutor_telefono && <p className="text-[10px] text-app-muted flex items-center gap-1"><Phone className="w-3 h-3" />{item.tutor_telefono}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[10px] flex items-center gap-1 ${item.libro_comprado ? 'text-semantic-success' : 'text-app-muted'}`}><BookOpen className="w-3 h-3" />{item.libro_comprado ? 'Libro ✓' : 'Sin libro'}</span>
                          <span className={`text-[10px] flex items-center gap-1 ${item.cuadernillo_comprado ? 'text-semantic-success' : 'text-app-muted'}`}><BookCheck className="w-3 h-3" />{item.cuadernillo_comprado ? 'Cuadernillo ✓' : 'Sin cuadernillo'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ec.variant} size="sm"><span className="flex items-center gap-1">{ec.icon}{ec.label}</span></Badge>
                        <p className="text-[10px] text-app-muted mt-1">
                          {new Date(item.fecha_inscripcion + 'T12:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={e => { e.stopPropagation(); handleSelectRow(item.persona_id); }}
                          className={`p-1.5 rounded-lg transition-all ${isSel ? 'bg-lit-primary text-white' : 'bg-lit-surface text-lit-primary hover:bg-lit-border'}`} title="Ver detalle">
                          <QrCode className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Panel Lateral ────────────────────────────────────────────── */}
      {selectedId && (
        <div className="w-80 flex-shrink-0 flex flex-col gap-3 animate-slide-in-right">
          {/* Pestañas del panel */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg gap-0.5">
              {([
                { id: 'ficha',  label: '📋 Ficha',   icon: ClipboardList },
                { id: 'editar', label: '✏️ Editar',   icon: Edit3         },
                { id: 'qr',     label: '🆔 QR Gafete', icon: QrCode       },
              ] as Array<{ id: PanelTab; label: string; icon: React.FC<any> }>).map(tab => (
                <button key={tab.id} onClick={() => { setPanelTab(tab.id); setBajaConfirm(false); }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${panelTab === tab.id ? 'bg-white shadow-xs text-lit-primary font-semibold' : 'text-app-muted hover:text-app-text'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <button onClick={() => { setSelectedId(null); setBajaConfirm(false); }} className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-app-muted"><X className="w-3.5 h-3.5" /></button>
          </div>

          {detalleLoading ? (
            <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lit-primary" /></div>
          ) : detalle ? (
            <div className="relative flex-1">
              {/* ── TAB: FICHA ──────────────────────────────────── */}
              {panelTab === 'ficha' && (
                <div className="space-y-4">
                  {/* Datos básicos */}
                  <div className="p-4 rounded-xl border border-app-border bg-white space-y-2">
                    <p className="text-xs font-bold text-lit-primary uppercase tracking-wide">Catecúmeno</p>
                    <p className="text-sm font-bold text-app-text">{[detalle.nombres, detalle.primer_apellido, detalle.segundo_apellido].filter(Boolean).join(' ')}</p>
                    {detalle.fecha_nacimiento && <p className="text-[11px] text-app-muted">Edad: {calcularEdad(detalle.fecha_nacimiento)}</p>}
                    {detalle.ci_dni    && <p className="text-[11px] text-app-muted">CI: {detalle.ci_dni}</p>}
                    {detalle.direccion && <p className="text-[11px] text-app-muted">📍 {detalle.direccion}</p>}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {detalle.es_bautizado               && <span className="px-2 py-0.5 bg-lit-surface border border-lit-border text-lit-primary text-[10px] rounded-full">✓ Bautizado/a</span>}
                      {detalle.inscripcion.libro_comprado        && <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-600 text-[10px] rounded-full">📚 Libro</span>}
                      {detalle.inscripcion.cuadernillo_comprado  && <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-600 text-[10px] rounded-full">📓 Cuadernillo</span>}
                    </div>
                  </div>

                  {/* Tutores */}
                  {detalle.tutores.length > 0 && (
                    <div className="p-4 rounded-xl border border-app-border bg-white space-y-2">
                      <p className="text-xs font-bold text-lit-primary uppercase tracking-wide">Tutores ({detalle.tutores.length})</p>
                      {detalle.tutores.map((t, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-lit-surface border border-lit-border flex items-center justify-center text-xs flex-shrink-0">{i + 1}</div>
                          <div>
                            <p className="text-xs font-semibold text-app-text">{t.nombres} {t.primer_apellido}</p>
                            <p className="text-[10px] text-app-muted">{PARENTESCO_LABEL[t.parentesco]}{t.telefono_principal ? ` · ${t.telefono_principal}` : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Estado de inscripción */}
                  <div className="p-4 rounded-xl border border-app-border bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-lit-primary uppercase tracking-wide">Estado</p>
                      <Badge variant={ESTADO_CONFIG[detalle.inscripcion.estado].variant} size="sm">
                        {ESTADO_CONFIG[detalle.inscripcion.estado].label}
                      </Badge>
                    </div>

                    {/* Baja / Reactivar */}
                    {detalle.inscripcion.estado === 'ACTIVO' && !bajaConfirm && (
                      <button onClick={() => setBajaConfirm(true)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors">
                        <UserX className="w-3.5 h-3.5" /> Dar de Baja
                      </button>
                    )}
                    {bajaConfirm && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 space-y-2">
                        <p className="text-xs text-red-700 font-medium">¿Confirmas la baja? El registro se conserva.</p>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="flex-1" onClick={() => setBajaConfirm(false)}>Cancelar</Button>
                          <button onClick={handleDarBaja} disabled={bajaLoading}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
                            {bajaLoading ? 'Procesando...' : 'Confirmar Baja'}
                          </button>
                        </div>
                      </div>
                    )}
                    {detalle.inscripcion.estado !== 'ACTIVO' && (
                      <button onClick={handleReactivar} disabled={bajaLoading}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-lit-border text-lit-primary text-xs font-medium hover:bg-lit-surface transition-colors disabled:opacity-50">
                        <RotateCcw className="w-3.5 h-3.5" /> Reactivar Catecúmeno
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB: EDITAR ─────────────────────────────────── */}
              {panelTab === 'editar' && (
                <EditCatecumenoDrawer
                  catecumeno={detalle}
                  onClose={() => setPanelTab('ficha')}
                  onSaved={handleSavedEdit}
                />
              )}

              {/* ── TAB: QR GAFETE ──────────────────────────────── */}
              {panelTab === 'qr' && <QRGafete catecumeno={detalle} />}
            </div>
          ) : null}
        </div>
      )}

      {/* Modal */}
      <InscripcionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={() => { refetch(); setModalOpen(false); }} />
    </div>
  );
};

export default CatecumenosPage;
