// Tipos de datos globales para la aplicación

export interface Persona {
  id: number;
  ci_dni?: string;
  complemento?: string;
  nombres: string;
  primer_apellido: string;
  segundo_apellido?: string;
  fecha_nacimiento?: string;
  genero?: string;
  telefono_principal?: string;
  direccion?: string;
  es_bautizado: boolean;
  es_primera_comunion: boolean;
}

export interface Usuario {
  id: number;
  persona_id: number;
  email?: string;
  username: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
}
