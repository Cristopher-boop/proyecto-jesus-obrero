import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/client';
import type {
  AsistenciaHeatmapResponse,
  AsistenciaDetalleFechaResponse,
  AsistenciaListResponse,
  AsistenciaScanResponse
} from '../types';

export function useAsistenciaHeatmap(gestion = 2026, capillaId = 1) {
  const [data, setData] = useState<AsistenciaHeatmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHeatmap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<AsistenciaHeatmapResponse>(
        `/asistencias/heatmap?gestion=${gestion}&capilla_id=${capillaId}`
      );
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al cargar la matriz de asistencia.');
    } finally {
      setLoading(false);
    }
  }, [gestion, capillaId]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  return { data, loading, error, refetch: fetchHeatmap };
}

export function useAsistenciaDetalleFecha(fecha: string | null, capillaId = 1) {
  const [data, setData] = useState<AsistenciaDetalleFechaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetalle = useCallback(async () => {
    if (!fecha) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<AsistenciaDetalleFechaResponse>(
        `/asistencias/detalle-fecha?fecha=${fecha}&capilla_id=${capillaId}`
      );
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al cargar el detalle de la fecha.');
    } finally {
      setLoading(false);
    }
  }, [fecha, capillaId]);

  useEffect(() => {
    fetchDetalle();
  }, [fetchDetalle]);

  return { data, loading, error, refetch: fetchDetalle };
}

export function useAsistenciasHoy() {
  const [data, setData] = useState<AsistenciaListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useRegistrarAsistenciaQR() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
