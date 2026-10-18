/**
 * Tipos completos y tipados estrictos para la Landing Page de la Parroquia Jesús Obrero.
 * Modelado modular para las 6 Capillas, Comunión, Kairos, Confirmación, Comunidad Juvenil,
 * Comunidades de Vida, Tradiciones & Eventos, Sacramentos, Coro y Vocaciones Consagradas.
 */

export interface CapillaInfoLanding {
  id: number;
  nombre: string;
  esCentral: boolean;
  patrono: string;
  zona: string;
  direccion: string;
  misaComunion: string;
  encuentroComunion: string;
  misaConfirmacion: string;
  encuentroConfirmacion: string;
  ordenEncuentro: 'misa_primero' | 'encuentro_primero';
  horarioPuntualComunion: string;
  horarioPuntualConfirmacion: string;
  descripcion: string;
  carisma: string;
  imagenUrl: string;
  imagenPlaceholderTexto: string;
}

export interface ActividadNinez {
  id: string;
  titulo: string;
  subtitulo: string;
  temporada: string;
  participantes: string;
  descripcion: string;
  detalles: string[];
  imagenUrl: string;
  imagenPlaceholderTexto: string;
  icono: string;
  etiqueta: string;
}

export interface ActividadJuventud {
  id: string;
  titulo: string;
  tipo: 'confirmacion' | 'comunidad_juvenil' | 'fraternidad';
  subtitulo: string;
  temporada: string;
  lema?: string;
  descripcion: string;
  caracteristicas: string[];
  imagenUrl: string;
  imagenPlaceholderTexto: string;
  icono: string;
  etiquetas: string[];
}

export interface ComunidadAdultos {
  id: string;
  nombre: string;
  rangoEdad: string;
  frecuencia: string;
  mision: string;
  descripcion: string;
  actividades: string[];
  icono: string;
  imagenUrl: string;
  imagenPlaceholderTexto: string;
}

export interface TradicionParroquial {
  id: string;
  nombre: string;
  fecha: string;
  destinatarios: string;
  descripcion: string;
  destacados: string[];
  icono: string;
  imagenUrl: string;
  imagenPlaceholderTexto: string;
  etiqueta: string;
}

export interface FormacionVocacional {
  id: string;
  titulo: string;
  destino: string;
  vocacion: string;
  destinatarios: string;
  nombreHermandad: string;
  descripcion: string;
  etapas: string[];
  imagenUrl: string;
  imagenPlaceholderTexto: string;
  icono: string;
}

export interface SacramentoInfo {
  id: string;
  nombre: string;
  destinatarios: string;
  duracion: string;
  descripcion: string;
  requisitos: string[];
  icono: string;
}

export interface MinisterioCoroInfo {
  nombre: string;
  lema: string;
  descripcion: string;
  integrantes: string;
  ensayos: string;
  instrumentos: string[];
  imagenUrl: string;
  imagenPlaceholderTexto: string;
}
