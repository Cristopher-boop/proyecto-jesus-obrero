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
  EtapaFormacion,
  TipoDocumento,
  EstadoDocumento,
  DocumentoListResponse,
} from '@/types';

// ─── Tipos locales ────────────────────────────────────────────────────────────

export interface CatecumenoFilters {
  tipo?:       TipoSacramento;
  etapa?:      EtapaFormacion;
  gestion?:    number;
  grupo_id?:   number;
  capilla_id?: number;
  estado?:     EstadoInscripcion;
  search?:     string;
  skip?:       number;
  limit?:      number;
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
  ci_dni?:                     string;
  complemento?:                string;
  nombres:                     string;
  primer_apellido:             string;
  segundo_apellido?:           string;
  fecha_nacimiento?:           string;
  genero?:                     string;
  direccion?:                  string;
  es_bautizado:                boolean;
  tipo_sacramento:             string;
  // Requisitos de Ingreso
  cuadernillo_comprado:        boolean;
  libro_comprado:              boolean;
  pago_cuota_inicial:          boolean;
  // Documentos de Salida (Fotocopias)
  doc_formulario_inscripcion?: boolean;
  doc_fe_bautismo?:            boolean;
  doc_cert_nacimiento?:        boolean;
  doc_cert_matrimonio_padres?: boolean;
  doc_ci_nino?:                boolean;
  doc_ci_padre?:               boolean;
  doc_ci_madre?:               boolean;
  doc_ci_tutor?:               boolean;
  observaciones?:              string;
  tutores_nuevos:              TutorNuevoPayload[];
  tutores_vinculo:             TutorVinculoPayload[];
}

export interface UpdateCatecumenoPayload {
  ci_dni?:                     string;
  nombres?:                    string;
  primer_apellido?:            string;
  segundo_apellido?:           string;
  fecha_nacimiento?:           string;
  genero?:                     string;
  direccion?:                  string;
  es_bautizado?:               boolean;
  // Requisitos de Ingreso
  cuadernillo_comprado?:       boolean;
  libro_comprado?:             boolean;
  pago_cuota_inicial?:         boolean;
  // Documentos de Salida (Fotocopias)
  doc_formulario_inscripcion?: boolean;
  doc_fe_bautismo?:            boolean;
  doc_cert_nacimiento?:        boolean;
  doc_cert_matrimonio_padres?: boolean;
  doc_ci_nino?:                boolean;
  doc_ci_padre?:               boolean;
  doc_ci_madre?:               boolean;
  doc_ci_tutor?:               boolean;
  estado?:                     EstadoInscripcion;
  observaciones?:              string;
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
      if (filters.tipo)       params.append('tipo',       filters.tipo);
      if (filters.etapa)      params.append('etapa',      filters.etapa);
      if (filters.gestion)    params.append('gestion',    String(filters.gestion));
      if (filters.grupo_id)   params.append('grupo_id',   String(filters.grupo_id));
      if (filters.capilla_id) params.append('capilla_id', String(filters.capilla_id));
      if (filters.estado)     params.append('estado',     filters.estado);
      if (filters.search)     params.append('search',     filters.search);
      if (filters.skip  !== undefined) params.append('skip',  String(filters.skip));
      if (filters.limit !== undefined) params.append('limit', String(filters.limit));

      const res = await apiClient.get<CatecumenoListResponse>(`/catecumenos/?${params.toString()}`);
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al cargar catecúmenos.');
    } finally {
      setLoading(false);
    }
  }, [
    filters.tipo,
    filters.etapa,
    filters.gestion,
    filters.grupo_id,
    filters.capilla_id,
    filters.estado,
    filters.search,
    filters.skip,
    filters.limit,
  ]);

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

// ─── Hook: Documentos del Catecúmeno ──────────────────────────────────────────

export function useDocumentosCatecumeno(personaId: number | null) {
  const [data,    setData]    = useState<DocumentoListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchDocumentos = useCallback(async () => {
    if (!personaId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<DocumentoListResponse>(`/catecumenos/${personaId}/documentos`);
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al cargar documentos.');
    } finally {
      setLoading(false);
    }
  }, [personaId]);

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  const subirDocumento = useCallback(async (
    tipoDocumento: TipoDocumento,
    archivo: File,
    observaciones?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!personaId) return { success: false, error: 'Catecúmeno no seleccionado.' };
    setActionLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('tipo_documento', tipoDocumento);
      formData.append('archivo', archivo);
      if (observaciones) {
        formData.append('observaciones', observaciones);
      }

      await apiClient.post(`/catecumenos/${personaId}/documentos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchDocumentos();
      return { success: true };
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Error al subir documento.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  }, [personaId, fetchDocumentos]);

  const verificarDocumento = useCallback(async (
    docId: number,
    estado: EstadoDocumento,
    observaciones?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!personaId) return { success: false, error: 'Catecúmeno no seleccionado.' };
    setActionLoading(true);
    try {
      await apiClient.put(`/catecumenos/${personaId}/documentos/${docId}/verificar`, {
        estado,
        observaciones,
      });
      await fetchDocumentos();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.response?.data?.detail ?? 'Error al verificar documento.',
      };
    } finally {
      setActionLoading(false);
    }
  }, [personaId, fetchDocumentos]);

  const eliminarDocumento = useCallback(async (docId: number): Promise<{ success: boolean; error?: string }> => {
    if (!personaId) return { success: false, error: 'Catecúmeno no seleccionado.' };
    setActionLoading(true);
    try {
      await apiClient.delete(`/catecumenos/${personaId}/documentos/${docId}`);
      await fetchDocumentos();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.response?.data?.detail ?? 'Error al eliminar documento.',
      };
    } finally {
      setActionLoading(false);
    }
  }, [personaId, fetchDocumentos]);

  return {
    data,
    loading,
    actionLoading,
    error,
    refetch: fetchDocumentos,
    subirDocumento,
    verificarDocumento,
    eliminarDocumento,
  };
}
