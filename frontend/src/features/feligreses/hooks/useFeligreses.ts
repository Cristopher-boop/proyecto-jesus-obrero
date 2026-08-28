import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/client';
import type {
  FeligresListResponse,
  FeligresDetalle,
  FeligresCreatedResponse,
} from '@/types';

export interface CreateFeligresPayload {
  ci_dni:           string;
  complemento?:     string;
  nombres:          string;
  primer_apellido:  string;
  segundo_apellido?: string;
  telefono?:        string;
  email?:           string;
}

export function useFeligreses(search?: string, skip = 0, limit = 50) {
  const [data,    setData]    = useState<FeligresListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('skip',  String(skip));
      params.append('limit', String(limit));
      const res = await apiClient.get<FeligresListResponse>(`/feligreses/?${params}`);
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al cargar feligreses.');
    } finally {
      setLoading(false);
    }
  }, [search, skip, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useFeligresDetalle(personaId: number | null) {
  const [data,    setData]    = useState<FeligresDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!personaId) { setData(null); return; }
    setLoading(true);
    apiClient.get<FeligresDetalle>(`/feligreses/${personaId}`)
      .then(r => setData(r.data))
      .catch(e => setError(e?.response?.data?.detail ?? 'Error al cargar.'))
      .finally(() => setLoading(false));
  }, [personaId]);

  return { data, loading, error };
}

export function useCreateFeligres() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const create = useCallback(async (payload: CreateFeligresPayload): Promise<FeligresCreatedResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<FeligresCreatedResponse>('/feligreses/', payload);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al crear cuenta.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}
