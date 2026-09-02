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
