import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/client';
import type {
  CapillaListResponse,
  CapillaCreate,
  CapillaUpdate,
  HorarioAsistenciaCreate,
  HorarioAsistenciaUpdate,
  HorarioAsistencia,
  FaseHorarioActual,
  GrupoListResponse,
  GrupoResponse,
  EtapaFormacion,
  TipoSacramento,
  AutoAgruparPayload,
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

export function useGruposCapilla(
  capillaId?: number,
  gestion?: number,
  etapa?: EtapaFormacion,
  tipoSacramento?: TipoSacramento
) {
  const [data,    setData]    = useState<GrupoListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchGrupos = useCallback(async () => {
    if (!capillaId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (gestion) params.gestion = gestion;
      if (etapa) params.etapa = etapa;
      if (tipoSacramento) params.tipo_sacramento = tipoSacramento;

      const res = await apiClient.get<GrupoListResponse>(`/capillas/${capillaId}/grupos`, { params });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al cargar subgrupos.');
    } finally {
      setLoading(false);
    }
  }, [capillaId, gestion, etapa, tipoSacramento]);

  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

  const asignarSanto = useCallback(async (
    grupoId: number,
    nombreSanto: string
  ): Promise<{ success: boolean; data?: GrupoResponse; error?: string }> => {
    if (!capillaId) return { success: false, error: 'Capilla no definida' };
    try {
      const res = await apiClient.post<GrupoResponse>(
        `/capillas/${capillaId}/grupos/${grupoId}/asignar-santo`,
        { nombre_santo: nombreSanto }
      );
      await fetchGrupos();
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.detail ?? 'Error al asignar santo' };
    }
  }, [capillaId, fetchGrupos]);

  const autoAgruparPorEdad = useCallback(async (
    payload: AutoAgruparPayload
  ): Promise<{ success: boolean; data?: GrupoListResponse; error?: string }> => {
    if (!capillaId) return { success: false, error: 'Capilla no definida' };
    try {
      const res = await apiClient.post<GrupoListResponse>(
        `/capillas/${capillaId}/grupos/auto-agrupar-por-edad`,
        payload
      );
      await fetchGrupos();
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.detail ?? 'Error al auto-agrupar' };
    }
  }, [capillaId, fetchGrupos]);

  return {
    data,
    loading,
    error,
    refetch: fetchGrupos,
    asignarSanto,
    autoAgruparPorEdad,
  };
}
