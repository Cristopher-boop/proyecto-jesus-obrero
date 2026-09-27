"""
Schemas Pydantic para el módulo de Asistencias.
"""

from pydantic import BaseModel, Field
from datetime import date, time, datetime
from typing import Optional, List
from app.modules.asistencias.models import EstadoAsistencia


class ScanQRPayload(BaseModel):
    """Payload enviado al escanear un código QR."""
    token_qr:       str = Field(..., min_length=5, description="Token UUID del catecúmeno o cadena completa PARROQUIA-JO:<uuid>")
    estado:         Optional[EstadoAsistencia] = None
    observacion:    Optional[str] = None
    capilla_id:     Optional[int] = None
    hora_simulada:  Optional[str] = None  # Formato 'HH:MM' para pruebas o reloj en vivo


class AsistenciaScanResponse(BaseModel):
    """Respuesta tras procesar el escaneo de un código QR."""
    asistencia_id:   int
    persona_id:      int
    nombre_completo: str
    tipo_sacramento: str
    fecha:           date
    hora:            time
    estado:          EstadoAsistencia
    mensaje:         str
    ya_registrado:   bool


class AsistenciaListItem(BaseModel):
    """Item para la tabla de control e historial del día."""
    id:              int
    persona_id:      int
    nombre_completo: str
    tipo_sacramento: str
    fecha:           date
    hora:            time
    estado:          EstadoAsistencia
    token_qr:        str
    observacion:     Optional[str] = None

    class Config:
        from_attributes = True


class AsistenciaListResponse(BaseModel):
    total: int
    fecha: date
    items: List[AsistenciaListItem]
