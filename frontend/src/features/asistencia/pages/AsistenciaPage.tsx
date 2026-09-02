/**
 * AsistenciaPage — Página de control de Asistencia QR para Catequistas y Administración.
 *
 * Muestra el widget de escaneo (Cámara + Simulador 1-Clic en 3 estados),
 * alerta dinámica de resultado y la tabla en vivo de asistencias marcadas hoy en formato HH:MM.
 */

import React, { useState } from 'react';
import { QrCode, RefreshCw, CheckCircle2, AlertTriangle, Clock, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { useAsistenciasHoy, useRegistrarAsistenciaQR } from '../hooks/useAsistenciaQR';
import { QRScannerWidget } from '../components/QRScannerWidget';
import type { AsistenciaScanResponse } from '@/types';

function formatHHMM(timeStr?: string): string {
  if (!timeStr) return '--:--';
  return timeStr.slice(0, 5);
}

export const AsistenciaPage: React.FC = () => {
  const { data, loading: loadingLista, error: errorLista, refetch } = useAsistenciasHoy();
  const { escanear, loading: scanning, error: scanError, clearError } = useRegistrarAsistenciaQR();

  const [lastScanResult, setLastScanResult] = useState<AsistenciaScanResponse | null>(null);

  const handleScan = async (
    token: string,
    estado?: string,
    observacion?: string,
    capilla_id?: number,
    hora_simulada?: string
  ) => {
    clearError();
    const result = await escanear(token, estado, observacion, capilla_id, hora_simulada);
    if (result) {
      setLastScanResult(result);
      refetch(); // Actualizar la lista en tiempo real
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-app-text flex items-center gap-2">
            <QrCode className="w-5 h-5 text-lit-primary" /> Control de Asistencia QR
          </h2>
          <p className="text-xs text-app-muted mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Fecha actual: {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loadingLista ? 'animate-spin' : ''}`} />}
          onClick={refetch}
        >
          Actualizar Lista
        </Button>
      </div>

      {/* Widget de Escaneado y Simulación */}
      <QRScannerWidget onScan={handleScan} loading={scanning} />

      {/* Alerta de Error de Escaneo */}
      {scanError && (
        <Alert variant="error" title="Atención">
          {scanError}
        </Alert>
      )}

      {/* Alerta de Resultado de Marcación Reciente */}
      {lastScanResult && (
        <div
          className={`p-5 rounded-2xl border shadow-lg transition-all duration-300 animate-fadeIn ${
            lastScanResult.ya_registrado
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${
                  lastScanResult.ya_registrado ? 'bg-amber-200 text-amber-800' : 'bg-emerald-600 text-white'
                }`}
              >
                {lastScanResult.ya_registrado ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 border border-current">
                  {lastScanResult.ya_registrado ? 'Aviso de Asistencia Registrada' : 'Marcación Exitosa'}
                </span>
                <h3 className="text-base font-extrabold mt-1">{lastScanResult.nombre_completo}</h3>
                <p className="text-xs opacity-90 flex items-center gap-2 mt-0.5">
                  <span>{lastScanResult.tipo_sacramento === 'PRIMERA_COMUNION' ? '1ª Comunión' : 'Confirmación'}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono font-bold">
                    <Clock className="w-3.5 h-3.5" /> Marcado a las {formatHHMM(lastScanResult.hora)}
                  </span>
                </p>
              </div>
            </div>

            <Badge variant={lastScanResult.estado === 'PRESENTE' ? 'success' : 'warning'} size="md">
              {lastScanResult.estado}
            </Badge>
          </div>

          <p className="text-xs font-semibold mt-3 pt-2 border-t border-current/20 opacity-90">
            {lastScanResult.mensaje}
          </p>
        </div>
      )}

      {/* Tabla de Asistencias del Día en Tiempo Real */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-app-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-lit-primary" /> Asistencias Marcadas Hoy
          </h3>
          <span className="text-xs font-bold text-lit-primary bg-lit-surface px-2.5 py-1 rounded-full border border-lit-border">
            Total hoy: {data?.total ?? 0}
          </span>
        </div>

        {errorLista && <Alert variant="error" title="Error">{errorLista}</Alert>}

        {loadingLista && !data ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lit-primary" />
          </div>
        ) : data?.items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-app-border p-12 text-center space-y-2">
            <div className="text-5xl">📋</div>
            <h4 className="text-sm font-bold text-app-text">Aún no hay asistencias registradas hoy</h4>
            <p className="text-xs text-app-muted max-w-sm mx-auto">
              Utiliza la cámara web o el simulador de 1-clic arriba para registrar la primera asistencia.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-app-border bg-white shadow-xs">
            <table className="w-full min-w-[600px]">
              <thead className="bg-stone-50 border-b border-app-border">
                <tr>
                  {['Hora', 'Catecúmeno', 'Sacramento', 'Estado', 'Momento / Observación'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-app-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border/50">
                {data?.items.map(item => (
                  <tr key={item.id} className="hover:bg-lit-surface/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-bold text-lit-primary flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatHHMM(item.hora)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-app-text">{item.nombre_completo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-app-muted">
                        {item.tipo_sacramento === 'PRIMERA_COMUNION' ? '1ª Comunión' : 'Confirmación'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.estado === 'PRESENTE' ? 'success' : item.estado === 'ATRASO' ? 'warning' : 'neutral'} size="sm">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {item.estado}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-stone-600">
                        {item.observacion || 'Puntual (Antes de la Misa)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsistenciaPage;
