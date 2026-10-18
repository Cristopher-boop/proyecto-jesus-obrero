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


# ─── Heatmap Visual y Control por Días y Meses ──────────────────────────────────

class AsistenciaDiaHeatmap(BaseModel):
    """Representa una sesión dominical en la matriz estilo GitHub commits."""
    fecha:               date
    dia_numero:          int
    mes:                 int
    es_domingo:          bool
    numero_sesion:       Optional[int] = None
    total_esperados:     int
    total_presentes:     int
    total_atrasos:       int
    total_faltas:        int
    porcentaje:          float
    nivel_actividad:     int  # 0: Futuro/Sin sesión, 1: <50%, 2: 50-69%, 3: 70-84%, 4: >=85%
    es_pasado:           bool
    es_hoy:              bool
    es_futuro:           bool


class AsistenciaMesResumen(BaseModel):
    """Resumen agregado de un mes de formación."""
    mes:                 int
    mes_nombre:          str
    total_sesiones:      int
    total_presentes:     int
    total_atrasos:       int
    total_faltas:        int
    porcentaje_promedio: float


class AsistenciaHeatmapResponse(BaseModel):
    """Respuesta general para la visualización del Heatmap Pastoral."""
    gestion:             int
    capilla_id:          int
    capilla_nombre:      str
    total_catecumenos:   int
    tasa_anual:          float
    total_sesiones:      int
    meses:               List[AsistenciaMesResumen]
    domingos:            List[AsistenciaDiaHeatmap]


class AsistenciaDetalleItem(BaseModel):
    """Detalle nominal de un catecúmeno en una fecha específica."""
    id:                  Optional[int] = None
    persona_id:          int
    inscripcion_id:      int
    nombre_completo:     str
    tipo_sacramento:     str
    grupo_nombre:        Optional[str] = None
    fecha:               date
    hora:                Optional[time] = None
    hora_str:            str
    estado:              str
    observacion:         Optional[str] = None
    es_falta_automatica: bool = False


class AsistenciaDetalleFechaResponse(BaseModel):
    """Respuesta con desglose exhaustivo y exacto de un día determinado."""
    fecha:               date
    fecha_formateada:    str
    dia_semana:          str
    es_domingo:          bool
    capilla_id:          int
    capilla_nombre:      str
    total_esperados:     int
    presentes:           int
    atrasos:             int
    faltas:              int
    porcentaje:          float
    items:               List[AsistenciaDetalleItem]
