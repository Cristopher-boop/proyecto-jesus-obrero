import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Text, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

# Enums
class EstadoUsuario(str, enum.Enum):
    ACTIVO = 'ACTIVO'
    INACTIVO = 'INACTIVO'
    BLOQUEADO = 'BLOQUEADO'

class NombreRol(str, enum.Enum):
    ADMIN = 'ADMIN'
    DIACONO = 'DIACONO'
    SECRETARIA = 'SECRETARIA'
    CATEQUISTA = 'CATEQUISTA'
    TUTOR = 'TUTOR'

class Parentesco(str, enum.Enum):
    PAPA = 'PAPA'
    MAMA = 'MAMA'
    TUTOR_LEGAL = 'TUTOR_LEGAL'
    OTRO = 'OTRO'

# Tabla asociativa para Roles de Usuario
usuarios_roles = Table(
    'usuarios_roles',
    Base.metadata,
    Column('usuario_id', Integer, ForeignKey('usuarios.id', ondelete='CASCADE'), primary_key=True),
    Column('rol_id', Integer, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True)
)

class Rol(Base):
    __tablename__ = 'roles'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(Enum(NombreRol), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)

    def __repr__(self):
        return f"<Rol {self.nombre}>"

class Persona(Base):
    __tablename__ = 'personas'

    id = Column(Integer, primary_key=True, index=True)
    ci_dni = Column(String(20), nullable=True)
    complemento = Column(String(5), nullable=True)
    nombres = Column(String(100), nullable=False)
    primer_apellido = Column(String(100), nullable=False)
    segundo_apellido = Column(String(100), nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    genero = Column(String(10), nullable=True)
    telefono_principal = Column(String(20), nullable=True)
    direccion = Column(Text, nullable=True)
    es_bautizado = Column(Boolean, default=False)
    es_primera_comunion = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relación de uno a uno con Usuario
    usuario = relationship("Usuario", back_populates="persona", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Persona {self.nombres} {self.primer_apellido}>"

class Usuario(Base):
    __tablename__ = 'usuarios'

    id = Column(Integer, primary_key=True, index=True)
    persona_id = Column(Integer, ForeignKey('personas.id', ondelete='CASCADE'), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    estado = Column(Enum(EstadoUsuario), default=EstadoUsuario.ACTIVO)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    persona = relationship("Persona", back_populates="usuario")
    roles = relationship("Rol", secondary=usuarios_roles)

    def __repr__(self):
        return f"<Usuario {self.username}>"

class RelacionFamiliar(Base):
    __tablename__ = 'relaciones_familiares'

    id = Column(Integer, primary_key=True, index=True)
    catecumeno_persona_id = Column(Integer, ForeignKey('personas.id', ondelete='CASCADE'), nullable=False)
    tutor_persona_id = Column(Integer, ForeignKey('personas.id', ondelete='CASCADE'), nullable=False)
    parentesco = Column(Enum(Parentesco), nullable=False)
    es_contacto_emergencia = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self):
        return f"<RelacionFamiliar {self.parentesco}>"
