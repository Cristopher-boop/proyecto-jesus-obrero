"""
Esquemas Pydantic para el módulo de Capillas, Horarios de Asistencia y Grupos.
"""

from pydantic import BaseModel, Field, model_validator
from datetime import time, datetime, date
from typing import Optional, List
from app.modules.capillas_grupos.models import DiaSemana
from app.modules.personas.models import EtapaFormacion, TipoSacramento


# ─── Horarios de Asistencia ───────────────────────────────────────────────────

class HorarioAsistenciaBase(BaseModel):
    dia_semana:             DiaSemana
    hora_inicio_puntual:    time
    hora_fin_puntual:       time
    hora_inicio_misa:       time
    hora_fin_misa:          time
    hora_inicio_catequesis: time
    hora_fin_catequesis:    time
    descripcion_misa:       Optional[str] = "Misa Comunitaria"
    descripcion_catequesis: Optional[str] = "Encuentro de Catequesis"
    activo:                 bool = True

    @model_validator(mode='after')
    def validar_secuencia_horaria(self):
        """Valida que los rangos sigan una secuencia cronológica coherente."""
        if not (self.hora_inicio_puntual < self.hora_fin_puntual):
            raise ValueError("La hora de inicio puntual debe ser anterior al fin puntual.")
        if not (self.hora_fin_puntual <= self.hora_inicio_misa):
            raise ValueError("El fin del periodo puntual no puede ser posterior al inicio de la misa.")
        if not (self.hora_inicio_misa < self.hora_fin_misa):
            raise ValueError("El inicio de la misa debe ser anterior al fin de la misa.")
        if not (self.hora_fin_misa <= self.hora_inicio_catequesis):
            raise ValueError("El fin de la misa no puede ser posterior al inicio de la catequesis.")
        if not (self.hora_inicio_catequesis < self.hora_fin_catequesis):
            raise ValueError("El inicio de la catequesis debe ser anterior al fin de la catequesis.")
        return self


class HorarioAsistenciaCreate(HorarioAsistenciaBase):
    pass


class HorarioAsistenciaUpdate(BaseModel):
    dia_semana:             Optional[DiaSemana] = None
    hora_inicio_puntual:    Optional[time] = None
    hora_fin_puntual:       Optional[time] = None
    hora_inicio_misa:       Optional[time] = None
    hora_fin_misa:          Optional[time] = None
    hora_inicio_catequesis: Optional[time] = None
    hora_fin_catequesis:    Optional[time] = None
    descripcion_misa:       Optional[str] = None
    descripcion_catequesis: Optional[str] = None
    activo:                 Optional[bool] = None


class HorarioAsistenciaResponse(HorarioAsistenciaBase):
    id:         int
    capilla_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Grupos de Catequesis ─────────────────────────────────────────────────────

class GrupoBase(BaseModel):
    nombre:          str = Field(..., min_length=2, max_length=100)
    nombre_santo:    Optional[str] = Field(None, max_length=100)
    codigo:          str = Field(..., min_length=2, max_length=30)
    gestion:         int = Field(default=2026, ge=2000, le=2100)
    etapa:           EtapaFormacion = EtapaFormacion.SEGUNDO_ANO
    tipo_sacramento: TipoSacramento = TipoSacramento.PRIMERA_COMUNION
    edad_minima:     Optional[int] = None
    edad_maxima:     Optional[int] = None
    descripcion:     Optional[str] = None
    activo:          bool = True


class GrupoCreate(GrupoBase):
    pass


class GrupoUpdate(BaseModel):
    nombre:          Optional[str] = None
    nombre_santo:    Optional[str] = None
    codigo:          Optional[str] = None
    gestion:         Optional[int] = None
    etapa:           Optional[EtapaFormacion] = None
    tipo_sacramento: Optional[TipoSacramento] = None
    edad_minima:     Optional[int] = None
    edad_maxima:     Optional[int] = None
    descripcion:     Optional[str] = None
    activo:          Optional[bool] = None


class AsignarSantoPayload(BaseModel):
    nombre_santo: str = Field(..., min_length=3, max_length=100)


class AutoAgruparPayload(BaseModel):
    gestion:         int = 2026
    etapa:           EtapaFormacion = EtapaFormacion.SEGUNDO_ANO
    tipo_sacramento: TipoSacramento = TipoSacramento.PRIMERA_COMUNION
    cantidad_grupos: int = Field(default=4, ge=2, le=10)
    nombres_santos:  Optional[List[str]] = [
        "Juan Don Bosco",
        "San Nicolás",
        "San Pablo",
        "San Francisco de Asís"
    ]


class GrupoCatecumenoSimple(BaseModel):
    inscripcion_id:   int
    persona_id:       int
    nombre_completo:  str
    fecha_nacimiento: Optional[date] = None
    edad:             Optional[int] = None
    genero:           Optional[str] = None


class GrupoResponse(GrupoBase):
    id:                int
    capilla_id:        int
    total_catecumenos: int = 0
    catecumenos:       List[GrupoCatecumenoSimple] = []
    created_at:        datetime

    class Config:
        from_attributes = True


class GrupoListResponse(BaseModel):
    total: int
    items: List[GrupoResponse]


# ─── Capillas ─────────────────────────────────────────────────────────────────

class CapillaBase(BaseModel):
    nombre:            str = Field(..., min_length=3, max_length=150)
    codigo:            str = Field(..., min_length=2, max_length=30)
    direccion:         Optional[str] = None
    es_sede_principal: bool = False
    descripcion:       Optional[str] = None
    activo:            bool = True


class CapillaCreate(CapillaBase):
    horarios: Optional[List[HorarioAsistenciaCreate]] = []


class CapillaUpdate(BaseModel):
    nombre:            Optional[str] = Field(None, min_length=3, max_length=150)
    codigo:            Optional[str] = Field(None, min_length=2, max_length=30)
    direccion:         Optional[str] = None
    es_sede_principal: Optional[bool] = None
    descripcion:       Optional[str] = None
    activo:            Optional[bool] = None


class CapillaResponse(CapillaBase):
    id:         int
    horarios:   List[HorarioAsistenciaResponse] = []
    grupos:     List[GrupoResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class CapillaListItem(BaseModel):
    id:                int
    nombre:            str
    codigo:            str
    direccion:         Optional[str] = None
    es_sede_principal: bool
    activo:            bool
    descripcion:       Optional[str] = None
    total_horarios:    int = 0
    total_grupos:      int = 0
    horarios:          List[HorarioAsistenciaResponse] = []

    class Config:
        from_attributes = True


class CapillaListResponse(BaseModel):
    total: int
    items: List[CapillaListItem]


class FaseHorarioActual(BaseModel):
    fase:        str   # 'PUNTUAL' | 'MISA' | 'CATEQUESIS' | 'CERRADO'
    estado:      str   # 'PRESENTE' | 'ATRASO' | 'FALTA'
    mensaje:     str
    hora_actual: str
    dia_actual:  str
    horario:     Optional[HorarioAsistenciaResponse] = None
