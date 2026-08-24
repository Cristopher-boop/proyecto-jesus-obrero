"""
Schemas Pydantic para el módulo Catecúmenos.
Versión 2: soporte multi-tutor (lista), baja lógica.
"""

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
from app.modules.personas.models import (
    Genero, TipoSacramento, EstadoInscripcion, Parentesco
)


# ─── Tutor ────────────────────────────────────────────────────────────────────

class TutorCreate(BaseModel):
    """Datos para crear un tutor nuevo (la persona no existe aún)."""
    nombres:            str = Field(..., min_length=2, max_length=100)
    primer_apellido:    str = Field(..., min_length=2, max_length=100)
    segundo_apellido:   Optional[str] = Field(None, max_length=100)
    telefono_principal: Optional[str] = Field(None, max_length=20)
    parentesco:         Parentesco = Parentesco.PAPA
    es_contacto_emergencia: bool = False


class TutorVinculacion(BaseModel):
    """Para vincular un feligrés ya registrado en el sistema."""
    tutor_persona_id: int
    parentesco:       Parentesco = Parentesco.PAPA
    es_contacto_emergencia: bool = False


class TutorResponse(BaseModel):
    persona_id:      int
    nombres:         str
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    telefono_principal: Optional[str] = None
    parentesco:      Parentesco
    es_contacto_emergencia: bool

    class Config:
        from_attributes = True


# ─── Inscripción ──────────────────────────────────────────────────────────────

class InscripcionResponse(BaseModel):
    id:                   int
    tipo_sacramento:      TipoSacramento
    estado:               EstadoInscripcion
    libro_comprado:       bool
    cuadernillo_comprado: bool
    token_qr:             str
    fecha_inscripcion:    date
    observaciones:        Optional[str] = None
    created_at:           datetime

    class Config:
        from_attributes = True


# ─── Catecúmeno ───────────────────────────────────────────────────────────────

class CatecumenoCreate(BaseModel):
    """
    Payload para inscribir un catecúmeno desde secretaría.
    Permite agregar 0..3 tutores en la misma transacción:
      - tutores_nuevos:  personas aún no registradas
      - tutores_vinculo: feligreses con cuenta existente (por persona_id)
    """
    # Datos del niño
    ci_dni:           Optional[str] = Field(None, max_length=20)
    complemento:      Optional[str] = Field(None, max_length=5)
    nombres:          str = Field(..., min_length=2, max_length=100)
    primer_apellido:  str = Field(..., min_length=2, max_length=100)
    segundo_apellido: Optional[str] = Field(None, max_length=100)
    fecha_nacimiento: Optional[date] = None
    genero:           Optional[Genero] = None
    direccion:        Optional[str] = None
    es_bautizado:     bool = False

    # Inscripción
    tipo_sacramento:      TipoSacramento = TipoSacramento.PRIMERA_COMUNION
    libro_comprado:       bool = False
    cuadernillo_comprado: bool = False
    observaciones:        Optional[str] = None

    # Tutores (0 a 3, cada uno puede ser nuevo o vinculado)
    tutores_nuevos:  List[TutorCreate]      = Field(default_factory=list, max_length=3)
    tutores_vinculo: List[TutorVinculacion] = Field(default_factory=list, max_length=3)


class CatecumenoUpdate(BaseModel):
    """Campos editables del catecúmeno (secretaría o admin)."""
    ci_dni:           Optional[str] = None
    nombres:          Optional[str] = None
    primer_apellido:  Optional[str] = None
    segundo_apellido: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    genero:           Optional[Genero] = None
    direccion:        Optional[str] = None
    es_bautizado:     Optional[bool] = None
    # Inscripción
    libro_comprado:       Optional[bool] = None
    cuadernillo_comprado: Optional[bool] = None
    estado:               Optional[EstadoInscripcion] = None
    observaciones:        Optional[str] = None


class CatecumenoListItem(BaseModel):
    persona_id:           int
    nombres:              str
    primer_apellido:      str
    segundo_apellido:     Optional[str] = None
    genero:               Optional[Genero] = None
    fecha_nacimiento:     Optional[date] = None
    es_bautizado:         bool
    inscripcion_id:       int
    tipo_sacramento:      TipoSacramento
    estado:               EstadoInscripcion
    token_qr:             str
    libro_comprado:       bool
    cuadernillo_comprado: bool
    fecha_inscripcion:    date
    tutor_nombre:         Optional[str] = None
    tutor_telefono:       Optional[str] = None

    class Config:
        from_attributes = True


class CatecumenoDetalle(BaseModel):
    persona_id:       int
    ci_dni:           Optional[str] = None
    complemento:      Optional[str] = None
    nombres:          str
    primer_apellido:  str
    segundo_apellido: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    genero:           Optional[Genero] = None
    direccion:        Optional[str] = None
    es_bautizado:     bool
    inscripcion:      InscripcionResponse
    tutores:          List[TutorResponse] = []

    class Config:
        from_attributes = True


class CatecumenoListResponse(BaseModel):
    total: int
    skip:  int
    limit: int
    items: List[CatecumenoListItem]
