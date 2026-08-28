/**
 * Hooks para el módulo de Catecúmenos — v2.
 * Añade: useUpdateCatecumeno, useBajaCatecumeno.
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/client';
import type {
  CatecumenoListResponse,
  CatecumenoDetalle,
  TipoSacramento,
  EstadoInscripcion,
} from '@/types';

// ─── Tipos locales ────────────────────────────────────────────────────────────

export interface CatecumenoFilters {
  tipo?:   TipoSacramento;
  estado?: EstadoInscripcion;
  search?: string;
  skip?:   number;
  limit?:  number;
}

export interface TutorNuevoPayload {
  nombres:               string;
  primer_apellido:       string;
  segundo_apellido?:     string;
  telefono_principal?:   string;
  parentesco:            string;
  es_contacto_emergencia: boolean;
}

export interface TutorVinculoPayload {
  tutor_persona_id:      number;
  parentesco:            string;
  es_contacto_emergencia: boolean;
}

export interface CreateCatecumenoPayload {
  ci_dni?:          string;
  complemento?:     string;
  nombres:          string;
  primer_apellido:  string;
  segundo_apellido?: string;
  fecha_nacimiento?: string;
  genero?:          string;
  direccion?:       string;
  es_bautizado:     boolean;
  tipo_sacramento:  string;
  libro_comprado:   boolean;
  cuadernillo_comprado: boolean;
  observaciones?:   string;
  tutores_nuevos:   TutorNuevoPayload[];
  tutores_vinculo:  TutorVinculoPayload[];
}

export interface UpdateCatecumenoPayload {
  ci_dni?:              string;
  nombres?:             string;
  primer_apellido?:     string;
  segundo_apellido?:    string;
  fecha_nacimiento?:    string;
  genero?:              string;
  direccion?:           string;
  es_bautizado?:        boolean;
  libro_comprado?:      boolean;
  cuadernillo_comprado?: boolean;
  estado?:              EstadoInscripcion;
  observaciones?:       string;
}

// ─── Hook: Listado ────────────────────────────────────────────────────────────

export function useCatecumenos(filters: CatecumenoFilters = {}) {
  const [data,    setData]    = useState<CatecumenoListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.tipo)   params.append('tipo',   filters.tipo);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.search) params.append('search', filters.search);
      if (filters.skip  !== undefined) params.append('skip',  String(filters.skip));
      if (filters.limit !== undefined) params.append('limit', String(filters.limit));

      const res = await apiClient.get<CatecumenoListResponse>(`/catecumenos/?${params.toString()}`);
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al cargar catecúmenos.');
    } finally {
      setLoading(false);
    }
  }, [filters.tipo, filters.estado, filters.search, filters.skip, filters.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ─── Hook: Detalle individual ─────────────────────────────────────────────────

export function useCatecumenoDetalle(personaId: number | null) {
  const [data,    setData]    = useState<CatecumenoDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!personaId) { setData(null); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<CatecumenoDetalle>(`/catecumenos/${personaId}`);
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al cargar el catecúmeno.');
    } finally {
      setLoading(false);
    }
  }, [personaId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ─── Hook: Crear ─────────────────────────────────────────────────────────────

export function useCreateCatecumeno() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const create = useCallback(async (payload: CreateCatecumenoPayload): Promise<CatecumenoDetalle | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<CatecumenoDetalle>('/catecumenos/', payload);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al inscribir catecúmeno.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

// ─── Hook: Actualizar ─────────────────────────────────────────────────────────

export function useUpdateCatecumeno() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const update = useCallback(async (personaId: number, payload: UpdateCatecumenoPayload): Promise<CatecumenoDetalle | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.put<CatecumenoDetalle>(`/catecumenos/${personaId}`, payload);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al actualizar catecúmeno.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}

// ─── Hook: Baja / Reactivar ───────────────────────────────────────────────────

export function useBajaCatecumeno() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const darBaja = useCallback(async (personaId: number): Promise<CatecumenoDetalle | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.patch<CatecumenoDetalle>(`/catecumenos/${personaId}/baja`);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al dar de baja.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivar = useCallback(async (personaId: number): Promise<CatecumenoDetalle | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.patch<CatecumenoDetalle>(`/catecumenos/${personaId}/reactivar`);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al reactivar.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { darBaja, reactivar, loading, error };
}
