import enum
import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime,
    Text, ForeignKey, Table, Enum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base


# ─── Enums ────────────────────────────────────────────────────────────────────

class EstadoUsuario(str, enum.Enum):
    ACTIVO   = 'ACTIVO'
    INACTIVO = 'INACTIVO'
    BLOQUEADO = 'BLOQUEADO'


class NombreRol(str, enum.Enum):
    ADMIN      = 'ADMIN'
    DIACONO    = 'DIACONO'
    SECRETARIA = 'SECRETARIA'
    CATEQUISTA = 'CATEQUISTA'
    TUTOR      = 'TUTOR'


class Parentesco(str, enum.Enum):
    PAPA        = 'PAPA'
    MAMA        = 'MAMA'
    TUTOR_LEGAL = 'TUTOR_LEGAL'
    OTRO        = 'OTRO'


class Genero(str, enum.Enum):
    MASCULINO = 'MASCULINO'
    FEMENINO  = 'FEMENINO'
    OTRO      = 'OTRO'


class TipoSacramento(str, enum.Enum):
    PRIMERA_COMUNION = 'PRIMERA_COMUNION'
    CONFIRMACION     = 'CONFIRMACION'


class EstadoInscripcion(str, enum.Enum):
    ACTIVO   = 'ACTIVO'
    BAJA     = 'BAJA'
    GRADUADO = 'GRADUADO'


# ─── Tabla asociativa Usuarios ↔ Roles ────────────────────────────────────────

usuarios_roles = Table(
    'usuarios_roles',
    Base.metadata,
    Column('usuario_id', Integer, ForeignKey('usuarios.id',  ondelete='CASCADE'), primary_key=True),
    Column('rol_id',     Integer, ForeignKey('roles.id',     ondelete='CASCADE'), primary_key=True),
)


# ─── Modelos ──────────────────────────────────────────────────────────────────

class Rol(Base):
    __tablename__ = 'roles'

    id          = Column(Integer, primary_key=True, index=True)
    nombre      = Column(Enum(NombreRol), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)

    def __repr__(self):
        return f'<Rol {self.nombre}>'


class Persona(Base):
    __tablename__ = 'personas'

    id                  = Column(Integer, primary_key=True, index=True)
    ci_dni              = Column(String(20),  nullable=True)
    complemento         = Column(String(5),   nullable=True)
    nombres             = Column(String(100), nullable=False)
    primer_apellido     = Column(String(100), nullable=False)
    segundo_apellido    = Column(String(100), nullable=True)
    fecha_nacimiento    = Column(Date,        nullable=True)
    genero              = Column(Enum(Genero), nullable=True)
    telefono_principal  = Column(String(20),  nullable=True)
    direccion           = Column(Text,        nullable=True)
    es_bautizado        = Column(Boolean, default=False)
    es_primera_comunion = Column(Boolean, default=False)
    created_at          = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at          = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    usuario       = relationship('Usuario',        back_populates='persona',        uselist=False, cascade='all, delete-orphan')
    inscripciones = relationship('Inscripcion',    back_populates='persona',        cascade='all, delete-orphan')
    # Relaciones familiares donde este registro es el catecúmeno
    como_catecumeno = relationship(
        'RelacionFamiliar',
        foreign_keys='RelacionFamiliar.catecumeno_persona_id',
        back_populates='catecumeno',
        cascade='all, delete-orphan'
    )
    # Relaciones familiares donde este registro es el tutor
    como_tutor = relationship(
        'RelacionFamiliar',
        foreign_keys='RelacionFamiliar.tutor_persona_id',
        back_populates='tutor',
        cascade='all, delete-orphan'
    )

    def __repr__(self):
        return f'<Persona {self.nombres} {self.primer_apellido}>'


class Usuario(Base):
    __tablename__ = 'usuarios'

    id            = Column(Integer, primary_key=True, index=True)
    persona_id    = Column(Integer, ForeignKey('personas.id', ondelete='CASCADE'), unique=True, nullable=False)
    email         = Column(String(150), unique=True, nullable=True)
    username      = Column(String(50),  unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    estado        = Column(Enum(EstadoUsuario), default=EstadoUsuario.ACTIVO)
    created_at    = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at    = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    persona = relationship('Persona', back_populates='usuario')
    roles   = relationship('Rol', secondary=usuarios_roles)

    def __repr__(self):
        return f'<Usuario {self.username}>'


class RelacionFamiliar(Base):
    __tablename__ = 'relaciones_familiares'

    id                    = Column(Integer, primary_key=True, index=True)
    catecumeno_persona_id = Column(Integer, ForeignKey('personas.id', ondelete='CASCADE'), nullable=False)
    tutor_persona_id      = Column(Integer, ForeignKey('personas.id', ondelete='CASCADE'), nullable=False)
    parentesco            = Column(Enum(Parentesco), nullable=False)
    es_contacto_emergencia = Column(Boolean, default=False)
    created_at            = Column(DateTime(timezone=True), default=datetime.utcnow)

    catecumeno = relationship('Persona', foreign_keys=[catecumeno_persona_id], back_populates='como_catecumeno')
    tutor      = relationship('Persona', foreign_keys=[tutor_persona_id],      back_populates='como_tutor')

    __table_args__ = (
        UniqueConstraint('catecumeno_persona_id', 'tutor_persona_id', name='uq_relacion_familiar'),
    )

    def __repr__(self):
        return f'<RelacionFamiliar {self.parentesco}>'


class Inscripcion(Base):
    """
    Registro de inscripción de un catecúmeno a un ciclo sacramental.
    Cada persona puede tener una inscripción activa por tipo de sacramento.
    Al inscribirse se genera un token_qr UUID único para el control de asistencia.
    """
    __tablename__ = 'inscripciones'

    id                  = Column(Integer, primary_key=True, index=True)
    persona_id          = Column(Integer, ForeignKey('personas.id', ondelete='CASCADE'), nullable=False)
    tipo_sacramento     = Column(Enum(TipoSacramento),    nullable=False, default=TipoSacramento.PRIMERA_COMUNION)
    estado              = Column(Enum(EstadoInscripcion), nullable=False, default=EstadoInscripcion.ACTIVO)

    # Sede: todos los catecúmenos actuales van a Jesús Obrero (sin grupo por ahora)
    capilla_id          = Column(Integer, nullable=True)   # FK a capillas cuando exista el módulo
    grupo_id            = Column(Integer, nullable=True)   # FK a grupos cuando se asigne

    # Seguimiento de materiales comprados
    libro_comprado      = Column(Boolean, default=False, nullable=False)
    cuadernillo_comprado = Column(Boolean, default=False, nullable=False)

    # Estado documental (verificación de requisitos)
    doc_fe_bautismo      = Column(Boolean, default=False, nullable=False)
    doc_cert_nacimiento  = Column(Boolean, default=False, nullable=False)
    doc_ci_nino          = Column(Boolean, default=False, nullable=False)
    doc_ci_tutor         = Column(Boolean, default=False, nullable=False)

    # QR único por catecúmeno (UUID4)
    token_qr            = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))

    fecha_inscripcion   = Column(Date, nullable=False, default=date.today)
    observaciones       = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    persona = relationship('Persona', back_populates='inscripciones')

    __table_args__ = (
        # Un catecúmeno sólo puede tener una inscripción activa por tipo de sacramento
        UniqueConstraint('persona_id', 'tipo_sacramento', name='uq_inscripcion_persona_sacramento'),
    )

    def __repr__(self):
        return f'<Inscripcion {self.persona_id} - {self.tipo_sacramento}>'
