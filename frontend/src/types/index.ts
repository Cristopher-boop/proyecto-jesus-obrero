// Tipos globales — Parroquia Jesús Obrero (v2)
// Añadidos: Feligres types, actualizados Catecumeno types

// ─── Enums ────────────────────────────────────────────────────────────────────

export type EstadoUsuario     = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
export type NombreRol         = 'ADMIN' | 'DIACONO' | 'SECRETARIA' | 'CATEQUISTA' | 'TUTOR';
export type Parentesco        = 'PAPA' | 'MAMA' | 'TUTOR_LEGAL' | 'OTRO';
export type Genero            = 'MASCULINO' | 'FEMENINO' | 'OTRO';
export type TipoSacramento    = 'PRIMERA_COMUNION' | 'CONFIRMACION';
export type EtapaFormacion    = 'PRIMER_ANO' | 'SEGUNDO_ANO';
export type EstadoInscripcion = 'ACTIVO' | 'BAJA' | 'GRADUADO';
export type EstadoAsistencia  = 'PRESENTE' | 'ATRASO' | 'JUSTIFICADO' | 'FALTA';
export type TipoDocumento     =
  | 'FORMULARIO_INSCRIPCION'
  | 'FE_BAUTISMO'
  | 'CERT_NACIMIENTO'
  | 'CERT_MATRIMONIO_PADRES'
  | 'CI_NINO'
  | 'CI_PADRE'
  | 'CI_MADRE'
  | 'CI_TUTOR'
  | 'OTRO';
export type EstadoDocumento   = 'PENDIENTE' | 'ENTREGADO' | 'VERIFICADO' | 'RECHAZADO';

// ─── Persona / Usuario ────────────────────────────────────────────────────────

export interface Persona {
  id:                  number;
  ci_dni?:             string;
  complemento?:        string;
  nombres:             string;
  primer_apellido:     string;
  segundo_apellido?:   string;
  fecha_nacimiento?:   string;
  genero?:             Genero;
  telefono_principal?: string;
  direccion?:          string;
  es_bautizado:        boolean;
  es_primera_comunion: boolean;
}

export interface Usuario {
  id:         number;
  persona_id: number;
  email?:     string;
  username:   string;
  estado:     EstadoUsuario;
}

// ─── Catecúmenos ──────────────────────────────────────────────────────────────

export interface Inscripcion {
  id:                          number;
  tipo_sacramento:             TipoSacramento;
  etapa?:                      EtapaFormacion;
  gestion?:                    number;
  grupo_id?:                   number;
  grupo_nombre?:               string;
  estado:                      EstadoInscripcion;
  // Requisitos de Ingreso
  cuadernillo_comprado:        boolean;
  libro_comprado:              boolean;
  pago_cuota_inicial:          boolean;
  // Requisitos de Salida (Fotocopias requeridas para el sacramento)
  doc_formulario_inscripcion:  boolean;
  doc_fe_bautismo:             boolean;
  doc_cert_nacimiento:         boolean;
  doc_cert_matrimonio_padres:  boolean;
  doc_ci_nino:                 boolean;
  doc_ci_padre:                boolean;
  doc_ci_madre:                boolean;
  doc_ci_tutor:                boolean;
  token_qr:                    string;
  fecha_inscripcion:           string;
  observaciones?:              string;
  created_at:                  string;
}

export interface Tutor {
  persona_id:             number;
  nombres:                string;
  primer_apellido:        string;
  segundo_apellido?:      string;
  telefono_principal?:    string;
  parentesco:             Parentesco;
  es_contacto_emergencia: boolean;
}

export interface CatecumenoListItem {
  persona_id:                  number;
  nombres:                     string;
  primer_apellido:             string;
  segundo_apellido?:           string;
  genero?:                     Genero;
  fecha_nacimiento?:           string;
  es_bautizado:                boolean;
  inscripcion_id:              number;
  tipo_sacramento:             TipoSacramento;
  etapa?:                      EtapaFormacion;
  gestion?:                    number;
  grupo_id?:                   number;
  grupo_nombre?:               string;
  estado:                      EstadoInscripcion;
  token_qr:                    string;
  cuadernillo_comprado:        boolean;
  libro_comprado:              boolean;
  pago_cuota_inicial:          boolean;
  doc_formulario_inscripcion:  boolean;
  doc_fe_bautismo:             boolean;
  doc_cert_nacimiento:         boolean;
  doc_cert_matrimonio_padres:  boolean;
  doc_ci_nino:                 boolean;
  doc_ci_padre:                boolean;
  doc_ci_madre:                boolean;
  doc_ci_tutor:                boolean;
  total_documentos_subidos?:   number;
  fecha_inscripcion:           string;
  tutor_nombre?:               string;
  tutor_telefono?:             string;
}

export interface CatecumenoDetalle {
  persona_id:        number;
  ci_dni?:           string;
  complemento?:      string;
  nombres:           string;
  primer_apellido:   string;
  segundo_apellido?: string;
  fecha_nacimiento?: string;
  genero?:           Genero;
  direccion?:        string;
  es_bautizado:      boolean;
  inscripcion:       Inscripcion;
  tutores:           Tutor[];
}

export interface CatecumenoListResponse {
  total: number;
  skip:  number;
  limit: number;
  items: CatecumenoListItem[];
}

// ─── Documentos de Catecúmenos ───────────────────────────────────────────────

export interface DocumentoItem {
  id:             number;
  inscripcion_id: number;
  tipo_documento: TipoDocumento;
  nombre_archivo: string;
  ruta_archivo:   string;
  mime_type?:     string;
  tamano_bytes?:  number;
  estado:         EstadoDocumento;
  observaciones?: string;
  created_at:     string;
}

export interface DocumentoListResponse {
  persona_id:       number;
  nombre_completo:  string;
  inscripcion_id:   number;
  total_subidos:    number;
  documentos:       DocumentoItem[];
  checklist_estado: Record<string, boolean>;
}

export interface VerificarDocumentoPayload {
  estado:        EstadoDocumento;
  observaciones?: string;
}

// ─── Feligreses ───────────────────────────────────────────────────────────────

export interface HijoVinculado {
  persona_id:      number;
  nombres:         string;
  primer_apellido: string;
  tipo_sacramento: TipoSacramento;
  estado:          EstadoInscripcion;
  token_qr:        string;
}

export interface FeligresListItem {
  persona_id:       number;
  nombres:          string;
  primer_apellido:  string;
  segundo_apellido?: string;
  ci_dni:           string;
  telefono?:        string;
  email?:           string;
  username:         string;
  total_hijos:      number;
  created_at:       string;
}

export interface FeligresDetalle {
  persona_id:        number;
  nombres:           string;
  primer_apellido:   string;
  segundo_apellido?: string;
  ci_dni:            string;
  telefono?:         string;
  email?:            string;
  username:          string;
  hijos:             HijoVinculado[];
  created_at:        string;
}

export interface FeligresCreatedResponse {
  persona_id:    number;
  nombres:       string;
  primer_apellido: string;
  ci_dni:        string;
  username:      string;
  temp_password: string;
  created_at:    string;
}

export interface FeligresListResponse {
  total: number;
  skip:  number;
  limit: number;
  items: FeligresListItem[];
}

export interface FeligresBusquedaItem {
  persona_id:      number;
  nombres:         string;
  primer_apellido: string;
  telefono?:       string;
  ci_dni:          string;
}

// ─── Asistencias ──────────────────────────────────────────────────────────────

export interface AsistenciaScanResponse {
  asistencia_id:   number;
  persona_id:      number;
  nombre_completo: string;
  tipo_sacramento: TipoSacramento;
  fecha:           string;
  hora:            string;
  estado:          EstadoAsistencia;
  mensaje:         string;
  ya_registrado:   boolean;
}

export interface AsistenciaListItem {
  id:              number;
  persona_id:      number;
  nombre_completo: string;
  tipo_sacramento: TipoSacramento;
  fecha:           string;
  hora:            string;
  estado:          EstadoAsistencia;
  token_qr:        string;
  observacion?:    string;
}

export interface AsistenciaListResponse {
  total: number;
  fecha: string;
  items: AsistenciaListItem[];
}

// ─── Capillas y Horarios de Asistencia ───────────────────────────────────────

export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

export interface HorarioAsistencia {
  id:                     number;
  capilla_id:             number;
  dia_semana:             DiaSemana;
  hora_inicio_puntual:    string;
  hora_fin_puntual:       string;
  hora_inicio_misa:       string;
  hora_fin_misa:          string;
  hora_inicio_catequesis: string;
  hora_fin_catequesis:    string;
  descripcion_misa?:      string;
  descripcion_catequesis?: string;
  activo:                 boolean;
}

export interface HorarioAsistenciaCreate {
  dia_semana:             DiaSemana;
  hora_inicio_puntual:    string;
  hora_fin_puntual:       string;
  hora_inicio_misa:       string;
  hora_fin_misa:          string;
  hora_inicio_catequesis: string;
  hora_fin_catequesis:    string;
  descripcion_misa?:      string;
  descripcion_catequesis?: string;
  activo?:                boolean;
}

export interface HorarioAsistenciaUpdate {
  dia_semana?:             DiaSemana;
  hora_inicio_puntual?:    string;
  hora_fin_puntual?:       string;
  hora_inicio_misa?:       string;
  hora_fin_misa?:          string;
  hora_inicio_catequesis?: string;
  hora_fin_catequesis?:    string;
  descripcion_misa?:      string;
  descripcion_catequesis?: string;
  activo?:                boolean;
}

export interface CapillaCreate {
  nombre:            string;
  codigo:            string;
  direccion?:        string;
  es_sede_principal?: boolean;
  descripcion?:      string;
  activo?:           boolean;
}

export interface CapillaUpdate {
  nombre?:            string;
  codigo?:            string;
  direccion?:         string;
  es_sede_principal?: boolean;
  descripcion?:       string;
  activo?:            boolean;
}

export interface CapillaListItem {
  id:                number;
  nombre:            string;
  codigo:            string;
  direccion?:        string;
  es_sede_principal: boolean;
  activo:            boolean;
  descripcion?:      string;
  total_horarios:    number;
  horarios:          HorarioAsistencia[];
}

export interface CapillaListResponse {
  total: number;
  items: CapillaListItem[];
}

export interface FaseHorarioActual {
  fase:        'PUNTUAL' | 'MISA' | 'CATEQUESIS' | 'CERRADO';
  estado:      EstadoAsistencia;
  mensaje:     string;
  hora_actual: string;
  dia_actual:  string;
  horario?:    HorarioAsistencia;
}

// ─── Subgrupos de Catequesis (Jesús Obrero) ──────────────────────────────────

export interface GrupoCatecumenoSimple {
  persona_id:       number;
  nombre_completo:  string;
  fecha_nacimiento?: string;
  edad?:            number;
}

export interface GrupoResponse {
  id:                 number;
  capilla_id:         number;
  nombre:             string;
  nombre_santo?:      string;
  codigo:             string;
  gestion:            number;
  etapa:              EtapaFormacion;
  tipo_sacramento:    TipoSacramento;
  edad_minima?:       number;
  edad_maxima?:       number;
  color_identificador?: string;
  activo:             boolean;
  total_catecumenos:  number;
  catecumenos:        GrupoCatecumenoSimple[];
}

export interface GrupoListResponse {
  total: number;
  items: GrupoResponse[];
}

export interface GrupoCreate {
  nombre:              string;
  nombre_santo?:       string;
  codigo:              string;
  gestion:             number;
  etapa?:              EtapaFormacion;
  tipo_sacramento?:    TipoSacramento;
  edad_minima?:        number;
  edad_maxima?:        number;
  color_identificador?: string;
}

export interface GrupoUpdate {
  nombre?:              string;
  nombre_santo?:       string;
  codigo?:             string;
  gestion?:            number;
  etapa?:              EtapaFormacion;
  tipo_sacramento?:    TipoSacramento;
  edad_minima?:        number;
  edad_maxima?:        number;
  color_identificador?: string;
  activo?:             boolean;
}

export interface AsignarSantoPayload {
  nombre_santo: string;
}

export interface AutoAgruparPayload {
  gestion?:         number;
  etapa?:           EtapaFormacion;
  tipo_sacramento?: TipoSacramento;
  cantidad_grupos?: number;
  nombres_santos?:  string[];
}



