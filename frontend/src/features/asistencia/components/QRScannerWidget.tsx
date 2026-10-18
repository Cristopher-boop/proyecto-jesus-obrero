/**
 * QRScannerWidget — Escáner óptico mediante Cámara Web / Móvil en tiempo real.
 * Exclusivamente cámara web para la marcación en puerta de templo o salón parroquial.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, Church, RefreshCw, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { useCapillas, useFaseActual } from '@/features/capillas/hooks/useCapillas';

interface Props {
  onScan: (token: string, estado?: string, observacion?: string, capilla_id?: number) => void;
  loading: boolean;
  selectedCapillaId: number;
  onCapillaChange: (capillaId: number) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const QRScannerWidget: React.FC<Props> = ({
  onScan,
  loading,
  selectedCapillaId,
  onCapillaChange,
  isOpen = true,
  onClose,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [lastScannedToken, setLastScannedToken] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const { data: capillasData } = useCapillas();
  const { fase: faseActual } = useFaseActual(selectedCapillaId);

  const selectedCapilla = capillasData?.items.find(c => c.id === selectedCapillaId);

  // Iniciar / Limpiar escáner de cámara
  useEffect(() => {
    if (!cameraActive || !isOpen) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    // Inicializar lector óptico
    const scanner = new Html5QrcodeScanner(
      'qr-camera-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        if (decodedText !== lastScannedToken) {
          setLastScannedToken(decodedText);
          onScan(decodedText, undefined, undefined, selectedCapillaId);

          // Pausar relectura durante 3 segundos para el mismo token
          setTimeout(() => {
            setLastScannedToken(null);
          }, 3500);
        }
      },
      (_error) => {
        // Ignorar errores de frames continuos sin QR
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [cameraActive, isOpen, onScan, selectedCapillaId, lastScannedToken]);

  if (!isOpen) return null;

  return (
    <div className="rounded-2xl border border-app-border bg-app-card shadow-sm overflow-hidden transition-all duration-300">
      {/* Barra superior de control */}
      <div className="p-4 sm:p-5 border-b border-app-border bg-app-bg/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lit-surface text-lit-primary border border-lit-border flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
            <Camera className="w-5 h-5 text-lit-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-app-text font-serif">
              Escáner QR
            </h3>
            <p className="text-xs text-app-muted mt-0.5">
              Enfoca el gafete QR frente a la cámara.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Selector de Capilla */}
          <div className="w-48 sm:w-56">
            <Select<number>
              variant="filter"
              size="sm"
              leftIcon={<Church className="w-3.5 h-3.5 text-app-muted" />}
              value={selectedCapillaId}
              onChange={(val) => onCapillaChange(val)}
              options={capillasData?.items.map(c => ({
                value: c.id,
                label: c.nombre,
              })) ?? []}
            />
          </div>

          {/* Indicador de Fase */}
          {faseActual && (
            <div className="flex items-center gap-2 bg-app-card border border-app-border px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-lit-primary animate-pulse" />
              <span className="text-[11px] text-app-muted hidden sm:inline">Fase:</span>
              <span className="text-[11px] font-bold text-lit-primary truncate max-w-[120px]">
                {faseActual.fase}
              </span>
              <Badge
                variant={faseActual.estado === 'PRESENTE' ? 'success' : faseActual.estado === 'ATRASO' ? 'warning' : 'neutral'}
                size="sm"
              >
                {faseActual.estado}
              </Badge>
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-app-muted hover:text-app-text hover:bg-lit-surface transition-colors"
              title="Cerrar escáner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contenedor del visor óptico */}
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        {!cameraActive ? (
          <div className="py-8 px-4 text-center max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-lit-surface border border-lit-border mx-auto flex items-center justify-center shadow-xs text-lit-primary">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-app-text">Cámara en Pausa</h4>
              <p className="text-xs text-app-muted mt-1">
                Activa la cámara para escanear en <strong className="text-app-text">{selectedCapilla?.nombre}</strong>.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Camera className="w-4 h-4" />}
              onClick={() => setCameraActive(true)}
              className="shadow-sm"
            >
              Activar Cámara
            </Button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-3">
            <div className="w-full max-w-sm rounded-2xl overflow-hidden border-2 border-lit-primary/40 shadow-md bg-black relative">
              <div id="qr-camera-reader" className="w-full" />
              {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white space-y-2 z-10">
                  <RefreshCw className="w-8 h-8 animate-spin text-lit-accent" />
                  <span className="text-xs font-bold">Procesando código QR...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCameraActive(false)}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Pausar Cámara
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerWidget;
