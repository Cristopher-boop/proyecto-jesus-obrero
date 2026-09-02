/**
 * QRScannerWidget — Widget de escaneo y simulación de Asistencia QR con control de horarios por Capilla.
 *
 * Integra:
 *  1. Selector de Capilla activa (Sede Central Jesús Obrero o Capillas Filiales).
 *  2. Indicador en vivo de la Fase Horaria actual.
 *  3. Simulador de horas clave (Puntual, Durante Misa, Catequesis/Atraso y Fuera de Horario/Falta).
 *  4. Escaneo óptico por Cámara Web / Móvil con evaluación horaria en tiempo real.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, Zap, QrCode, Sparkles, Clock, BookOpen, Church, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useCatecumenos } from '@/features/catecumenos/hooks/useCatecumenos';
import { useCapillas, useFaseActual } from '@/features/capillas/hooks/useCapillas';
import type { CatecumenoListItem } from '@/types';

type ScanMode = 'simulador' | 'camara';

interface Props {
  onScan: (token: string, estado?: string, observacion?: string, capilla_id?: number, hora_simulada?: string) => void;
  loading: boolean;
}

interface FranjaHorarioSimulada {
  id: string;
  label: string;
  sublabel: string;
  hora: string;
  estadoEsperado: 'PRESENTE' | 'ATRASO' | 'FALTA';
  icon: React.FC<any>;
  colorClass: string;
  badgeVariant: 'success' | 'warning' | 'error' | 'neutral';
}

const FRANJAS_SIMULADAS: FranjaHorarioSimulada[] = [
  {
    id: 'puntual',
    label: 'Puntual',
    sublabel: '09:20 - 10:10 (Antes de Misa)',
    hora: '09:35',
    estadoEsperado: 'PRESENTE',
    icon: Clock,
    colorClass: 'border-emerald-300 bg-emerald-50 text-emerald-950',
    badgeVariant: 'success',
  },
  {
    id: 'misa',
    label: 'Durante la Misa',
    sublabel: '10:11 - 12:00 (Celebración)',
    hora: '10:45',
    estadoEsperado: 'PRESENTE',
    icon: Church,
    colorClass: 'border-amber-300 bg-amber-50 text-amber-950',
    badgeVariant: 'warning',
  },
  {
    id: 'catequesis',
    label: 'En Catequesis (Atraso)',
    sublabel: '12:01 - 13:00 (Aulas formativas)',
    hora: '12:20',
    estadoEsperado: 'ATRASO',
    icon: BookOpen,
    colorClass: 'border-rose-300 bg-rose-50 text-rose-950',
    badgeVariant: 'error',
  },
  {
    id: 'falta',
    label: 'Fuera de Horario (Falta)',
    sublabel: 'Fuera de rango (> 13:00)',
    hora: '14:15',
    estadoEsperado: 'FALTA',
    icon: AlertCircle,
    colorClass: 'border-stone-300 bg-stone-100 text-stone-800',
    badgeVariant: 'neutral',
  },
];

export const QRScannerWidget: React.FC<Props> = ({ onScan, loading }) => {
  const [mode, setMode] = useState<ScanMode>('simulador');
  const [selectedChild, setSelectedChild] = useState<CatecumenoListItem | null>(null);
  const [selectedCapillaId, setSelectedCapillaId] = useState<number | null>(null);
  const [selectedFranja, setSelectedFranja] = useState<FranjaHorarioSimulada>(FRANJAS_SIMULADAS[0]);
  const [usarHoraActual, setUsarHoraActual] = useState(false);

  // Cargar datos
  const { data: capillasData } = useCapillas();
  const { data: catecumenosData } = useCatecumenos({ skip: 0, limit: 100, estado: 'ACTIVO' });

  // Establecer Sede Central por defecto al cargar capillas
  useEffect(() => {
    if (capillasData?.items && capillasData.items.length > 0 && selectedCapillaId === null) {
      const sede = capillasData.items.find(c => c.es_sede_principal) || capillasData.items[0];
      setSelectedCapillaId(sede.id);
    }
  }, [capillasData, selectedCapillaId]);

  // Fase actual de la capilla seleccionada
  const { fase: faseActual } = useFaseActual(selectedCapillaId ?? undefined);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Inicializar escáner de cámara cuando el modo es 'camara'
  useEffect(() => {
    if (mode === 'camara') {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      const scanner = new Html5QrcodeScanner("reader", config, /* verbose= */ false);
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          // Envía con la capilla seleccionada para evaluar automáticamente el horario
          onScan(decodedText, undefined, undefined, selectedCapillaId ?? undefined, undefined);
        },
        (_errorMessage) => {
          // Ignorar frames incompletos
        }
      );

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [mode, selectedCapillaId, onScan]);

  const handleSimulate = () => {
    if (selectedChild) {
      const hora = usarHoraActual ? undefined : selectedFranja.hora;
      // No pasamos estado manual para que el backend evalúe exactamente según la franja horaria
      onScan(
        selectedChild.token_qr,
        undefined,
        undefined,
        selectedCapillaId ?? undefined,
        hora
      );
    }
  };

  const selectedCapilla = capillasData?.items.find(c => c.id === selectedCapillaId);

  return (
    <div className="bg-white rounded-2xl border border-app-border shadow-md overflow-hidden">
      {/* Barra Superior: Selector de Capilla y Estado de Fase en Vivo */}
      <div className="p-4 bg-stone-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
            ⛪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Capilla de Control:
              </label>
            </div>
            <select
              value={selectedCapillaId ?? ''}
              onChange={e => setSelectedCapillaId(Number(e.target.value))}
              className="bg-stone-800 border border-stone-700 text-white text-xs font-bold rounded-lg px-2.5 py-1 outline-none focus:ring-1 focus:ring-lit-accent mt-0.5"
            >
              {capillasData?.items.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.es_sede_principal ? '★ (Sede Central)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Indicador de Fase Operativa */}
        {faseActual && (
          <div className="flex items-center gap-2 bg-stone-800/90 border border-stone-700 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-stone-300">
              Fase Actual: <strong className="text-lit-accent">{faseActual.fase}</strong>
            </span>
            <Badge
              variant={faseActual.estado === 'PRESENTE' ? 'success' : faseActual.estado === 'ATRASO' ? 'warning' : 'neutral'}
              size="sm"
            >
              {faseActual.estado}
            </Badge>
          </div>
        )}
      </div>

      {/* Selector de Modos (Simulador 1-Clic vs Cámara) */}
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
          <span>⚡ Simulador con Horarios de Asistencia</span>
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
          <span>📷 Cámara Web / Móvil (En Vivo)</span>
        </button>
      </div>

      <div className="p-6">
        {/* ─── Modo 1: Simulador con Horarios ────── */}
        {mode === 'simulador' && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-lit-surface border border-lit-border text-xs text-lit-primary">
              <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Evaluación Automática por Horario:</strong> Elige un catecúmeno y una franja horaria para comprobar cómo el sistema clasifica la asistencia en <span className="font-bold">{selectedCapilla?.nombre}</span>.
              </div>
            </div>

            {/* 1. Selector de Catecúmeno */}
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

            {/* 2. Selector de Franja Horaria de Prueba */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-app-text">
                  2. Franja Horaria a Simular
                </label>
                <label className="flex items-center gap-1.5 text-xs text-app-muted cursor-pointer hover:text-app-text">
                  <input
                    type="checkbox"
                    checked={usarHoraActual}
                    onChange={e => setUsarHoraActual(e.target.checked)}
                    className="rounded text-lit-primary focus:ring-lit-primary"
                  />
                  <span>Usar reloj en vivo actual</span>
                </label>
              </div>

              {!usarHoraActual ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {FRANJAS_SIMULADAS.map(f => {
                    const Icon = f.icon;
                    const isSelected = selectedFranja.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFranja(f)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all ${
                          isSelected
                            ? `${f.colorClass} ring-2 ring-lit-primary shadow-xs font-bold`
                            : 'bg-stone-50 border-app-border hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5" />
                            <span>{f.label}</span>
                          </span>
                          <Badge variant={f.badgeVariant} size="sm">
                            {f.estadoEsperado}
                          </Badge>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-mono font-bold block">
                            Hora: {f.hora}
                          </span>
                          <span className="text-[10px] opacity-80 block">
                            {f.sublabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700 animate-spin" />
                  <span>El escaneo se procesará con la hora exacta en tiempo real del reloj del sistema.</span>
                </div>
              )}
            </div>

            {/* 3. Botón de Ejecución */}
            {selectedChild && (
              <div className="p-4 rounded-xl bg-stone-50 border border-app-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                <div>
                  <p className="text-xs font-bold text-app-text">
                    Catecúmeno: {selectedChild.nombres} {selectedChild.primer_apellido}
                  </p>
                  <p className="text-[11px] text-lit-primary font-medium mt-0.5">
                    Evaluando en: <strong>{selectedCapilla?.nombre}</strong> — Hora: <strong>{usarHoraActual ? 'Hora Actual' : selectedFranja.hora}</strong>
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={loading}
                  onClick={handleSimulate}
                  leftIcon={<QrCode className="w-4 h-4" />}
                >
                  ⚡ Registrar Asistencia QR
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ─── Modo 2: Cámara Web ─────────────────────────────────── */}
        {mode === 'camara' && (
          <div className="space-y-3 flex flex-col items-center">
            <p className="text-xs text-app-muted font-medium text-center">
              Apunta la cámara de tu laptop o celular hacia el Gafete QR del niño. El sistema evaluará automáticamente la asistencia según el horario de <strong className="text-app-text">{selectedCapilla?.nombre}</strong>.
            </p>
            <div id="reader" className="w-full max-w-sm overflow-hidden rounded-xl border border-app-border" />
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerWidget;
