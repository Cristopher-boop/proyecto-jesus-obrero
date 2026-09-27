"""
Schemas Pydantic para el módulo Catecúmenos.
Soporte multi-tutor, gestión/etapa, subgrupos y gestión de documentos.
"""

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List, Dict
from app.modules.personas.models import (
    Genero, TipoSacramento, EstadoInscripcion, Parentesco,
    EtapaFormacion, TipoDocumento, EstadoDocumento
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
    id:                          int
    tipo_sacramento:             TipoSacramento
    estado:                      EstadoInscripcion
    etapa:                       EtapaFormacion = EtapaFormacion.PRIMER_ANO
    gestion:                     int = 2026
    grupo_id:                    Optional[int] = None
    grupo_nombre:                Optional[str] = None

    # Requisitos de Ingreso
    cuadernillo_comprado:        bool
    libro_comprado:              bool
    pago_cuota_inicial:          bool = False

    # Requisitos de Salida (Fotocopias)
    doc_formulario_inscripcion:  bool = False
    doc_fe_bautismo:             bool = False
    doc_cert_nacimiento:         bool = False
    doc_cert_matrimonio_padres:  bool = False
    doc_ci_nino:                 bool = False
    doc_ci_padre:                bool = False
    doc_ci_madre:                bool = False
    doc_ci_tutor:                bool = False
    token_qr:                    str
    fecha_inscripcion:           date
    observaciones:               Optional[str] = None
    created_at:                  datetime

    class Config:
        from_attributes = True


# ─── Catecúmeno ───────────────────────────────────────────────────────────────

class CatecumenoCreate(BaseModel):
    """
    Payload para inscribir un catecúmeno desde secretaría.
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

    # Inscripción & Requisitos de Ingreso
    tipo_sacramento:             TipoSacramento = TipoSacramento.PRIMERA_COMUNION
    etapa:                       EtapaFormacion = EtapaFormacion.PRIMER_ANO
    gestion:                     int = 2026
    capilla_id:                  Optional[int] = None
    grupo_id:                    Optional[int] = None
    cuadernillo_comprado:        bool = False
    libro_comprado:              bool = False
    pago_cuota_inicial:          bool = False

    # Documentos de salida opcionales al inscribir
    doc_formulario_inscripcion:  bool = False
    doc_fe_bautismo:             bool = False
    doc_cert_nacimiento:         bool = False
    doc_cert_matrimonio_padres:  bool = False
    doc_ci_nino:                 bool = False
    doc_ci_padre:                bool = False
    doc_ci_madre:                bool = False
    doc_ci_tutor:                bool = False
    observaciones:               Optional[str] = None

    # Tutores (0 a 3)
    tutores_nuevos:  List[TutorCreate]      = Field(default_factory=list, max_length=3)
    tutores_vinculo: List[TutorVinculacion] = Field(default_factory=list, max_length=3)


class CatecumenoUpdate(BaseModel):
    """Campos editables del catecúmeno."""
    ci_dni:           Optional[str] = None
    nombres:          Optional[str] = None
    primer_apellido:  Optional[str] = None
    segundo_apellido: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    genero:           Optional[Genero] = None
    direccion:        Optional[str] = None
    es_bautizado:     Optional[bool] = None

    # Inscripción
    tipo_sacramento:             Optional[TipoSacramento] = None
    etapa:                       Optional[EtapaFormacion] = None
    gestion:                     Optional[int] = None
    capilla_id:                  Optional[int] = None
    grupo_id:                    Optional[int] = None
    cuadernillo_comprado:        Optional[bool] = None
    libro_comprado:              Optional[bool] = None
    pago_cuota_inicial:          Optional[bool] = None
    doc_formulario_inscripcion:  Optional[bool] = None
    doc_fe_bautismo:             Optional[bool] = None
    doc_cert_nacimiento:         Optional[bool] = None
    doc_cert_matrimonio_padres:  Optional[bool] = None
    doc_ci_nino:                 Optional[bool] = None
    doc_ci_padre:                Optional[bool] = None
    doc_ci_madre:                Optional[bool] = None
    doc_ci_tutor:                Optional[bool] = None
    estado:                      Optional[EstadoInscripcion] = None
    observaciones:               Optional[str] = None


class CatecumenoListItem(BaseModel):
    persona_id:                  int
    nombres:                     str
    primer_apellido:             str
    segundo_apellido:            Optional[str] = None
    genero:                      Optional[Genero] = None
    fecha_nacimiento:            Optional[date] = None
    es_bautizado:                bool
    inscripcion_id:              int
    tipo_sacramento:             TipoSacramento
    etapa:                       EtapaFormacion = EtapaFormacion.PRIMER_ANO
    gestion:                     int = 2026
    grupo_id:                    Optional[int] = None
    grupo_nombre:                Optional[str] = None
    estado:                      EstadoInscripcion
    token_qr:                    str
    cuadernillo_comprado:        bool
    libro_comprado:              bool
    pago_cuota_inicial:          bool = False
    doc_formulario_inscripcion:  bool = False
    doc_fe_bautismo:             bool = False
    doc_cert_nacimiento:         bool = False
    doc_cert_matrimonio_padres:  bool = False
    doc_ci_nino:                 bool = False
    doc_ci_padre:                bool = False
    doc_ci_madre:                bool = False
    doc_ci_tutor:                bool = False
    total_documentos_subidos:    int = 0
    fecha_inscripcion:           date
    tutor_nombre:                Optional[str] = None
    tutor_telefono:              Optional[str] = None

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


# ─── Documentos ───────────────────────────────────────────────────────────────

class DocumentoItem(BaseModel):
    id:             int
    inscripcion_id: int
    tipo_documento: TipoDocumento
    nombre_archivo: str
    ruta_archivo:   str
    mime_type:      Optional[str] = None
    tamano_bytes:   Optional[int] = None
    estado:         EstadoDocumento = EstadoDocumento.ENTREGADO
    observaciones:  Optional[str] = None
    created_at:     datetime

    class Config:
        from_attributes = True


class DocumentoListResponse(BaseModel):
    persona_id:        int
    nombre_completo:   str
    inscripcion_id:    int
    total_subidos:     int
    documentos:        List[DocumentoItem]
    checklist_estado:  Dict[str, bool]


class VerificarDocumentoPayload(BaseModel):
    estado:        EstadoDocumento
    observaciones: Optional[str] = None
