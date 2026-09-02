import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/client';
import type {
  CapillaListResponse,
  CapillaCreate,
  CapillaUpdate,
  HorarioAsistenciaCreate,
  HorarioAsistenciaUpdate,
  HorarioAsistencia,
  FaseHorarioActual
} from '@/types';

export function useCapillas() {
  const [data,    setData]    = useState<CapillaListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchCapillas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<CapillaListResponse>('/capillas');
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al cargar las capillas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCapillas(); }, [fetchCapillas]);

  // ─── CRUD Capillas ──────────────────────────────────────────────────────────

  const crearCapilla = useCallback(async (payload: CapillaCreate): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiClient.post('/capillas', payload);
      await fetchCapillas();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.detail ?? 'Error al crear la capilla.' };
    }
  }, [fetchCapillas]);

  const editarCapilla = useCallback(async (id: number, payload: CapillaUpdate): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiClient.put(`/capillas/${id}`, payload);
      await fetchCapillas();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.detail ?? 'Error al actualizar la capilla.' };
    }
  }, [fetchCapillas]);

  const eliminarCapilla = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiClient.delete(`/capillas/${id}`);
      await fetchCapillas();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.detail ?? 'Error al eliminar la capilla.' };
    }
  }, [fetchCapillas]);

  // ─── CRUD Horarios ──────────────────────────────────────────────────────────

  const crearHorario = useCallback(async (capillaId: number, payload: HorarioAsistenciaCreate): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiClient.post<HorarioAsistencia>(`/capillas/${capillaId}/horarios`, payload);
      await fetchCapillas();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.detail ?? 'Error al registrar el horario.' };
    }
  }, [fetchCapillas]);

  const editarHorario = useCallback(async (capillaId: number, horarioId: number, payload: HorarioAsistenciaUpdate): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiClient.put<HorarioAsistencia>(`/capillas/${capillaId}/horarios/${horarioId}`, payload);
      await fetchCapillas();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.detail ?? 'Error al actualizar el horario.' };
    }
  }, [fetchCapillas]);

  const eliminarHorario = useCallback(async (capillaId: number, horarioId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiClient.delete(`/capillas/${capillaId}/horarios/${horarioId}`);
      await fetchCapillas();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.detail ?? 'Error al eliminar el horario.' };
    }
  }, [fetchCapillas]);

  return {
    data,
    loading,
    error,
    refetch: fetchCapillas,
    crearCapilla,
    editarCapilla,
    eliminarCapilla,
    crearHorario,
    editarHorario,
    eliminarHorario,
  };
}

export function useFaseActual(capillaId?: number, horaCustom?: string) {
  const [fase,    setFase]    = useState<FaseHorarioActual | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFase = useCallback(async () => {
    if (!capillaId) return;
    setLoading(true);
    try {
      const params = horaCustom ? { hora: horaCustom } : {};
      const res = await apiClient.get<FaseHorarioActual>(`/capillas/${capillaId}/fase-actual`, { params });
      setFase(res.data);
    } catch (err) {
      // Ignorar fallback silencioso
    } finally {
      setLoading(false);
    }
  }, [capillaId, horaCustom]);

  useEffect(() => {
    fetchFase();
    const interval = setInterval(fetchFase, 30000);
    return () => clearInterval(interval);
  }, [fetchFase]);

  return { fase, loading, refetch: fetchFase };
}
