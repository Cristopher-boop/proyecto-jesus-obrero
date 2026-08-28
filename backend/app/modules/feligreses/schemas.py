"""
Schemas Pydantic para el módulo Feligreses.
Un feligrés es un padre/madre/tutor con cuenta de acceso al sistema.
Su CI es el identificador único que evita duplicados.
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


class FeligresCreate(BaseModel):
    """
    Payload para registrar la cuenta de un feligrés.
    El CI actúa como clave única — si ya existe una Persona con ese CI,
    se reutiliza esa persona (sin crear duplicado) y se le añade la cuenta.
    El username y contraseña temporal se generan automáticamente.
    """
    ci_dni:           str = Field(..., min_length=4, max_length=20, description="Cédula de Identidad (sin extensión)")
    complemento:      Optional[str] = Field(None, max_length=5,   description="Complemento CI (ej: 1A)")
    nombres:          str = Field(..., min_length=2, max_length=100)
    primer_apellido:  str = Field(..., min_length=2, max_length=100)
    segundo_apellido: Optional[str] = Field(None, max_length=100)
    telefono:         Optional[str] = Field(None, max_length=20)
    email:            Optional[EmailStr] = None
    password:         Optional[str] = Field(None, min_length=4, max_length=50)


class FeligresResponse(BaseModel):
    """Respuesta completa de un feligrés tras la creación."""
    persona_id:       int
    nombres:          str
    primer_apellido:  str
    segundo_apellido: Optional[str] = None
    ci_dni:           str
    telefono:         Optional[str] = None
    email:            Optional[str] = None
    username:         str
    temp_password:    str   # Solo se retorna en la creación; nunca en listados
    created_at:       datetime

    class Config:
        from_attributes = True


class FeligresListItem(BaseModel):
    """Representación compacta para la tabla de feligreses."""
    persona_id:       int
    nombres:          str
    primer_apellido:  str
    segundo_apellido: Optional[str] = None
    ci_dni:           str
    telefono:         Optional[str] = None
    email:            Optional[str] = None
    username:         str
    total_hijos:      int = 0
    created_at:       datetime

    class Config:
        from_attributes = True


class HijoVinculado(BaseModel):
    """Catecúmeno hijo de este feligrés."""
    persona_id:      int
    nombres:         str
    primer_apellido: str
    tipo_sacramento: str
    estado:          str
    token_qr:        str

    class Config:
        from_attributes = True


class FeligresDetalle(BaseModel):
    """Detalle completo del feligrés con sus hijos vinculados."""
    persona_id:       int
    nombres:          str
    primer_apellido:  str
    segundo_apellido: Optional[str] = None
    ci_dni:           str
    telefono:         Optional[str] = None
    email:            Optional[str] = None
    username:         str
    hijos:            List[HijoVinculado] = []
    created_at:       datetime

    class Config:
        from_attributes = True


class FeligresListResponse(BaseModel):
    total: int
    skip:  int
    limit: int
    items: List[FeligresListItem]


class FeligresBusquedaItem(BaseModel):
    """Item simplificado para el selector del modal de inscripción."""
    persona_id:   int
    nombres:      str
    primer_apellido: str
    telefono:     Optional[str] = None
    ci_dni:       str

    class Config:
        from_attributes = True
