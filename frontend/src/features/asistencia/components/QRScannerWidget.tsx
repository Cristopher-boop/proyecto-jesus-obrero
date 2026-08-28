/**
 * QRScannerWidget — Widget de escaneo y simulación de Asistencia QR.
 *
 * Soporta 2 modos optimizados:
 *  1. ⚡ Simulador 1-Clic (PC): Simula marcaciones en 3 momentos reales:
 *     - Puntual (Antes de la Misa) [PRESENTE]
 *     - Durante la Misa [PRESENTE]
 *     - Durante la Catequesis [ATRASO]
 *  2. 📷 Cámara Web / Móvil: Escaneo óptico instantáneo de gafetes QR.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, Zap, QrCode, Sparkles, CheckCircle2, Clock, BookOpen, Church } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCatecumenos } from '@/features/catecumenos/hooks/useCatecumenos';
import type { CatecumenoListItem } from '@/types';

type ScanMode = 'simulador' | 'camara';
type MomentoLlegada = 'puntual' | 'misa' | 'catequesis';

interface Props {
  onScan: (token: string, estado?: string, observacion?: string) => void;
  loading: boolean;
}

const MOMENTOS_CONFIG: Record<MomentoLlegada, { label: string; sublabel: string; estado: string; observacion: string; icon: React.FC<any>; colorClass: string }> = {
  puntual: {
    label: 'Puntual',
    sublabel: 'Antes de la Misa',
    estado: 'PRESENTE',
    observacion: 'Puntual (Antes de la Misa)',
    icon: Clock,
    colorClass: 'border-emerald-300 bg-emerald-50 text-emerald-950',
  },
  misa: {
    label: 'Durante la Misa',
    sublabel: 'Ingreso durante la celebración',
    estado: 'PRESENTE',
    observacion: 'Durante la Misa',
    icon: Church,
    colorClass: 'border-amber-300 bg-amber-50 text-amber-950',
  },
  catequesis: {
    label: 'Durante la Catequesis',
    sublabel: 'Llegada con atraso a las aulas',
    estado: 'ATRASO',
    observacion: 'Durante la Catequesis',
    icon: BookOpen,
    colorClass: 'border-rose-300 bg-rose-50 text-rose-950',
  },
};

export const QRScannerWidget: React.FC<Props> = ({ onScan, loading }) => {
  const [mode, setMode] = useState<ScanMode>('simulador');
  const [selectedChild, setSelectedChild] = useState<CatecumenoListItem | null>(null);
  const [momento, setMomento] = useState<MomentoLlegada>('puntual');

  // Cargar catecúmenos activos para el simulador de 1-clic
  const { data: catecumenosData } = useCatecumenos({ skip: 0, limit: 100, estado: 'ACTIVO' });
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Inicializar escáner de cámara cuando el modo es 'camara'
  useEffect(() => {
    if (mode === 'camara') {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      const scanner = new Html5QrcodeScanner("reader", config, /* verbose= */ false);
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          // Escaneo por cámara registra por defecto como puntual
          onScan(decodedText, 'PRESENTE', 'Puntual (Antes de la Misa)');
        },
        (_errorMessage) => {
          // Ignorar errores de frame parcial
        }
      );

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [mode, onScan]);

  const handleSimulate = () => {
    if (selectedChild) {
      const cfg = MOMENTOS_CONFIG[momento];
      onScan(selectedChild.token_qr, cfg.estado, cfg.observacion);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-app-border shadow-md overflow-hidden">
      {/* Selector de Modos (Sin Pegar/Manual) */}
      <div className="flex items-center border-b border-app-border bg-stone-50 p-2 gap-2">
        <button
          onClick={() => setMode('simulador')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mode === 'simulador'
              ? 'bg-white shadow-xs text-lit-primary border border-lit-border'
              : 'text-app-muted hover:text-app-text hover:bg-stone-100'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>⚡ Simulador 1-Clic (Pruebas PC)</span>
        </button>

        <button
          onClick={() => setMode('camara')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mode === 'camara'
              ? 'bg-white shadow-xs text-lit-primary border border-lit-border'
              : 'text-app-muted hover:text-app-text hover:bg-stone-100'
          }`}
        >
          <Camera className="w-4 h-4 text-lit-primary" />
          <span>📷 Cámara Web / Móvil</span>
        </button>
      </div>

      <div className="p-6">
        {/* ─── Modo 1: Simulador 1-Clic con Selección de Momentos ────── */}
        {mode === 'simulador' && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-lit-surface border border-lit-border text-xs text-lit-primary">
              <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Simulador de Marcación:</strong> Selecciona un catecúmeno y el momento de llegada para registrar su asistencia en el sistema.
              </div>
            </div>

            {/* Selector de Catecúmeno (Sin mostrar código de token) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-app-text">1. Seleccionar Catecúmeno</label>
              <select
                value={selectedChild?.persona_id ?? ''}
                onChange={e => {
                  const found = catecumenosData?.items.find(c => c.persona_id === Number(e.target.value));
                  setSelectedChild(found || null);
                }}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-app-border bg-white outline-none focus:ring-2 focus:ring-lit-primary/30"
              >
                <option value="">-- Elige un catecúmeno para marcar --</option>
                {catecumenosData?.items.map(c => (
                  <option key={c.persona_id} value={c.persona_id}>
                    {c.nombres} {c.primer_apellido} {c.segundo_apellido ?? ''} ({c.tipo_sacramento === 'PRIMERA_COMUNION' ? '1ª Comunión' : 'Confirmación'})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Momentos / Estados de Llegada */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-app-text">2. Momento / Estado de Asistencia</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(['puntual', 'misa', 'catequesis'] as MomentoLlegada[]).map(key => {
                  const cfg = MOMENTOS_CONFIG[key];
                  const Icon = cfg.icon;
                  const isSelected = momento === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMomento(key)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all ${
                        isSelected
                          ? `${cfg.colorClass} ring-2 ring-lit-primary shadow-xs font-bold`
                          : 'bg-stone-50 border-app-border hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cfg.label}</span>
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-lit-primary" />}
                      </div>
                      <span className="text-[10px] opacity-80">{cfg.sublabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón de Ejecución de la Simulación */}
            {selectedChild && (
              <div className="p-4 rounded-xl bg-stone-50 border border-app-border flex items-center justify-between gap-3 animate-fadeIn">
                <div>
                  <p className="text-xs font-bold text-app-text">
                    {selectedChild.nombres} {selectedChild.primer_apellido}
                  </p>
                  <p className="text-[11px] text-lit-primary font-medium">
                    Marcación como: <strong>{MOMENTOS_CONFIG[momento].label}</strong>
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={loading}
                  onClick={handleSimulate}
                  leftIcon={<QrCode className="w-4 h-4" />}
                >
                  ⚡ Registrar Asistencia
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ─── Modo 2: Cámara Web ─────────────────────────────────── */}
        {mode === 'camara' && (
          <div className="space-y-3 flex flex-col items-center">
            <p className="text-xs text-app-muted font-medium text-center">
              Apunta la cámara de tu laptop o celular hacia el Gafete QR del niño (se registrará como puntual).
            </p>
            <div id="reader" className="w-full max-w-sm overflow-hidden rounded-xl border border-app-border" />
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerWidget;
