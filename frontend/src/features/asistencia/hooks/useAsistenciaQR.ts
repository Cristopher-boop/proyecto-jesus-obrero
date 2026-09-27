import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/client';
import type { AsistenciaListResponse, AsistenciaScanResponse } from '@/types';

export function useAsistenciasHoy() {
  const [data,    setData]    = useState<AsistenciaListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<AsistenciaListResponse>('/asistencias/hoy');
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al cargar asistencias del día.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useRegistrarAsistenciaQR() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const escanear = useCallback(async (
    token_qr: string,
    estado?: string,
    observacion?: string,
    capilla_id?: number,
    hora_simulada?: string
  ): Promise<AsistenciaScanResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<AsistenciaScanResponse>('/asistencias/escanear-qr', {
        token_qr,
        estado,
        observacion,
        capilla_id,
        hora_simulada,
      });
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Código QR no reconocido o inválido.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { escanear, loading, error, clearError: () => setError(null) };
}
