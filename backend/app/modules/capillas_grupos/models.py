"""
Modelos de base de datos para el módulo Capillas, Horarios de Asistencia y Grupos.
"""

import enum
from datetime import datetime, time
from sqlalchemy import (
    Column, Integer, String, Boolean, Time, DateTime,
    Text, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.modules.personas.models import EtapaFormacion, TipoSacramento


class DiaSemana(str, enum.Enum):
    LUNES     = 'LUNES'
    MARTES    = 'MARTES'
    MIERCOLES = 'MIERCOLES'
    JUEVES    = 'JUEVES'
    VIERNES   = 'VIERNES'
    SABADO    = 'SABADO'
    DOMINGO   = 'DOMINGO'


class Capilla(Base):
    """
    Representa un templo o capilla perteneciente a la Parroquia Jesús Obrero.
    """
    __tablename__ = 'capillas'

    id                 = Column(Integer, primary_key=True, index=True)
    nombre             = Column(String(150), nullable=False, unique=True)
    codigo             = Column(String(30),  nullable=False, unique=True)
    direccion          = Column(String(255), nullable=True)
    es_sede_principal  = Column(Boolean, default=False, nullable=False)
    activo             = Column(Boolean, default=True, nullable=False)
    descripcion        = Column(Text, nullable=True)
    created_at         = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at         = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    horarios = relationship('HorarioAsistencia', back_populates='capilla', cascade='all, delete-orphan')
    grupos   = relationship('Grupo', back_populates='capilla', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Capilla {self.nombre} [{self.codigo}]>'


class HorarioAsistencia(Base):
    """
    Configuración horaria de asistencia para una capilla.
    Define las franjas de Puntual, Durante Misa, Durante Catequesis (Atraso) y Falta.
    """
    __tablename__ = 'horarios_asistencia'

    id                      = Column(Integer, primary_key=True, index=True)
    capilla_id              = Column(Integer, ForeignKey('capillas.id', ondelete='CASCADE'), nullable=False)
    dia_semana              = Column(Enum(DiaSemana), nullable=False, default=DiaSemana.DOMINGO)
    
    # 1. Rango Puntual (Antes de la misa) -> PRESENTE
    hora_inicio_puntual     = Column(Time, nullable=False)   # Ej: 09:20
    hora_fin_puntual        = Column(Time, nullable=False)   # Ej: 10:10
    
    # 2. Rango Durante la Misa -> PRESENTE (Durante Misa)
    hora_inicio_misa        = Column(Time, nullable=False)   # Ej: 10:11
    hora_fin_misa           = Column(Time, nullable=False)   # Ej: 12:00
    
    # 3. Rango Durante la Catequesis -> ATRASO
    hora_inicio_catequesis  = Column(Time, nullable=False)   # Ej: 12:01
    hora_fin_catequesis     = Column(Time, nullable=False)   # Ej: 13:00

    descripcion_misa        = Column(String(150), nullable=True, default="Misa Comunitaria")
    descripcion_catequesis  = Column(String(150), nullable=True, default="Encuentro de Catequesis")
    activo                  = Column(Boolean, default=True, nullable=False)
    created_at              = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at              = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    capilla = relationship('Capilla', back_populates='horarios')

    def __repr__(self):
        return f'<HorarioAsistencia Capilla={self.capilla_id} {self.dia_semana.value} [{self.hora_inicio_puntual}-{self.hora_fin_catequesis}]>'


class Grupo(Base):
    """
    Subgrupo de catequesis.
    En Jesús Obrero se conforman inicialmente según edades/fechas de nacimiento
    y posteriormente se les asigna su nombre patronal de Santo
    (ej: Juan Don Bosco, San Nicolás, San Pablo, San Francisco de Asís).
    """
    __tablename__ = 'grupos'

    id              = Column(Integer, primary_key=True, index=True)
    capilla_id      = Column(Integer, ForeignKey('capillas.id', ondelete='CASCADE'), nullable=False)
    nombre          = Column(String(100), nullable=False)        # Ej: "Grupo 1" o "Juan Don Bosco"
    nombre_santo    = Column(String(100), nullable=True)         # Ej: "Juan Don Bosco", "San Nicolás"
    codigo          = Column(String(30), nullable=False)         # Ej: "GRP-JDB", "GRP-1"
    gestion         = Column(Integer, nullable=False, default=2026, index=True)
    etapa           = Column(Enum(EtapaFormacion), nullable=False, default=EtapaFormacion.SEGUNDO_ANO, index=True)
    tipo_sacramento = Column(Enum(TipoSacramento), nullable=False, default=TipoSacramento.PRIMERA_COMUNION)
    edad_minima     = Column(Integer, nullable=True)
    edad_maxima     = Column(Integer, nullable=True)
    descripcion     = Column(Text, nullable=True)
    activo          = Column(Boolean, default=True, nullable=False)
    created_at      = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at      = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    capilla       = relationship('Capilla', back_populates='grupos')
    inscripciones = relationship('Inscripcion', back_populates='grupo')

    def __repr__(self):
        santo_str = f" ({self.nombre_santo})" if self.nombre_santo else ""
        return f'<Grupo {self.nombre}{santo_str} - {self.gestion} [{self.etapa}]>'
