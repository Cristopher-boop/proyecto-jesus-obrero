"""
Modelos de base de datos para el módulo de Asistencias.
"""

import enum
from datetime import datetime, date, time
from sqlalchemy import Column, Integer, String, Date, Time, DateTime, Enum, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.modules.personas.models import Persona, Inscripcion, Usuario


class EstadoAsistencia(str, enum.Enum):
    PRESENTE    = 'PRESENTE'
    ATRASO      = 'ATRASO'
    JUSTIFICADO = 'JUSTIFICADO'
    FALTA       = 'FALTA'


class Asistencia(Base):
    """
    Registro individual de asistencia de un catecúmeno en una fecha determinada.
    """
    __tablename__ = 'asistencias'

    id                  = Column(Integer, primary_key=True, index=True)
    inscripcion_id      = Column(Integer, ForeignKey('inscripciones.id', ondelete='CASCADE'), nullable=False)
    fecha               = Column(Date, nullable=False, default=date.today, index=True)
    hora                = Column(Time, nullable=False, default=lambda: datetime.now().time())
    estado              = Column(Enum(EstadoAsistencia), nullable=False, default=EstadoAsistencia.PRESENTE)
    registrado_por_id  = Column(Integer, ForeignKey('usuarios.id', ondelete='SET NULL'), nullable=True)
    observacion         = Column(Text, nullable=True)
    created_at          = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relaciones
    inscripcion    = relationship('Inscripcion', backref='asistencias')
    registrado_por = relationship('Usuario')

    __table_args__ = (
        # Solo se permite un registro de asistencia por inscripción en una misma fecha
        UniqueConstraint('inscripcion_id', 'fecha', name='uq_asistencia_inscripcion_fecha'),
    )

    def __repr__(self):
        return f'<Asistencia {self.inscripcion_id} - {self.fecha} {self.hora} [{self.estado}]>'
