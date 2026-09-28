/**
 * Tipos e interfaces para el Módulo de Asistencia.
 * Incluye modelos para el Heatmap anual estilo GitHub, detalle nominal de fechas y escaneo QR.
 */

export interface AsistenciaScanResponse {
  asistencia_id:   number;
  persona_id:      number;
  nombre_completo: string;
  tipo_sacramento: string;
  fecha:           string;
  hora:            string;
  estado:          string;
  mensaje:         string;
  ya_registrado:   boolean;
}

export interface AsistenciaListItem {
  id:              number;
  persona_id:      number;
  nombre_completo: string;
  tipo_sacramento: string;
  fecha:           string;
  hora:            string;
  estado:          string;
  token_qr:        string;
  observacion?:    string;
}

export interface AsistenciaListResponse {
  total: number;
  fecha: string;
  items: AsistenciaListItem[];
}

export interface AsistenciaDiaHeatmap {
  fecha:           string;
  dia_numero:      number;
  mes:             number;
  es_domingo:      boolean;
  numero_sesion?:  number | null;
  total_esperados: number;
  total_presentes: number;
  total_atrasos:   number;
  total_faltas:    number;
  porcentaje:      number;
  nivel_actividad: number; // 0: Sin sesión/Futuro, 1: <50%, 2: 50-69%, 3: 70-84%, 4: >=85%
  es_pasado:       boolean;
  es_hoy:          boolean;
  es_futuro:       boolean;
}

export interface AsistenciaMesResumen {
  mes:                 number;
  mes_nombre:          string;
  total_sesiones:      number;
  total_presentes:     number;
  total_atrasos:       number;
  total_faltas:        number;
  porcentaje_promedio: number;
}

export interface AsistenciaHeatmapResponse {
  gestion:           number;
  capilla_id:        number;
  capilla_nombre:    string;
  total_catecumenos: number;
  tasa_anual:        number;
  total_sesiones:    number;
  meses:             AsistenciaMesResumen[];
  domingos:          AsistenciaDiaHeatmap[];
}

export interface AsistenciaDetalleItem {
  id?:                  number | null;
  persona_id:          number;
  inscripcion_id:      number;
  nombre_completo:     string;
  tipo_sacramento:     string;
  grupo_nombre?:        string | null;
  fecha:               string;
  hora?:                string | null;
  hora_str:            string;
  estado:              string;
  observacion?:        string | null;
  es_falta_automatica: boolean;
}

export interface AsistenciaDetalleFechaResponse {
  fecha:            string;
  fecha_formateada: string;
  dia_semana:       string;
  es_domingo:       boolean;
  capilla_id:       number;
  capilla_nombre:   string;
  total_esperados:  number;
  presentes:        number;
  atrasos:          number;
  faltas:           number;
  porcentaje:       number;
  items:            AsistenciaDetalleItem[];
}
