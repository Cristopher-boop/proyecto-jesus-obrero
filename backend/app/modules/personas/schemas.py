from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional, List
from app.modules.personas.models import EstadoUsuario, NombreRol

# --- ROL SCHEMAS ---
class RolResponse(BaseModel):
    id: int
    nombre: NombreRol
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True

# --- PERSONA SCHEMAS ---
class PersonaBase(BaseModel):
    ci_dni: Optional[str] = None
    complemento: Optional[str] = None
    nombres: str
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    genero: Optional[str] = None
    telefono_principal: Optional[str] = None
    direccion: Optional[str] = None
    es_bautizado: Optional[bool] = False
    es_primera_comunion: Optional[bool] = False

class PersonaCreate(PersonaBase):
    pass

class PersonaResponse(PersonaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- USUARIO SCHEMAS ---
class UsuarioBase(BaseModel):
    email: Optional[EmailStr] = None
    username: str
    estado: EstadoUsuario = EstadoUsuario.ACTIVO

class UsuarioCreate(UsuarioBase):
    password: str
    persona_id: int
    role_ids: List[int] = []

class UsuarioResponse(UsuarioBase):
    id: int
    persona_id: int
    created_at: datetime
    updated_at: datetime
    persona: Optional[PersonaResponse] = None
    roles: List[RolResponse] = []

    class Config:
        from_attributes = True
