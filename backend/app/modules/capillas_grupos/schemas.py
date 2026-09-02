"""
Esquemas Pydantic para el módulo de Capillas y Horarios de Asistencia.
"""

from pydantic import BaseModel, Field, model_validator
from datetime import time, datetime
from typing import Optional, List
from app.modules.capillas_grupos.models import DiaSemana


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
