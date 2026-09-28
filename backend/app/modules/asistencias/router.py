from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.asistencias.schemas import (
    ScanQRPayload, AsistenciaScanResponse, AsistenciaListResponse,
    AsistenciaHeatmapResponse, AsistenciaDetalleFechaResponse
)
from app.modules.asistencias import service

router = APIRouter()


@router.post(
    "/escanear-qr",
    response_model=AsistenciaScanResponse,
    status_code=status.HTTP_200_OK,
    summary="Escanear QR y marcar asistencia",
    description="Procesa la lectura del código QR del catecúmeno y registra su presencia con fecha y hora exacta."
)
async def escanear_qr(
    payload: ScanQRPayload,
    db: AsyncSession = Depends(get_db)
):
    return await service.registrar_asistencia_qr(
        db,
        token_qr=payload.token_qr,
        estado=payload.estado,
        observacion=payload.observacion,
        capilla_id=payload.capilla_id,
        hora_simulada=payload.hora_simulada
    )


@router.get(
    "/hoy",
    response_model=AsistenciaListResponse,
    summary="Listar asistencias del día",
    description="Retorna el listado completo de asistencias marcadas en el día de hoy ordenadas por hora."
)
async def listar_asistencias_hoy(
    db: AsyncSession = Depends(get_db)
):
    return await service.listar_asistencias_hoy(db)


@router.get(
    "/heatmap",
    response_model=AsistenciaHeatmapResponse,
    summary="Matriz Anual de Asistencia (Estilo GitHub Commits)",
    description="Calcula todas las semanas y domingos del año pastoral, agrupados por meses y con cómputo automático de faltas."
)
async def obtener_heatmap_asistencias(
    gestion: int = Query(2026, description="Año de gestión pastoral"),
    capilla_id: int = Query(1, description="ID de Capilla (por defecto 1 = Jesús Obrero)"),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_asistencias_heatmap(db, gestion=gestion, capilla_id=capilla_id)


@router.get(
    "/detalle-fecha",
    response_model=AsistenciaDetalleFechaResponse,
    summary="Detalle nominal exacto de asistencia por fecha",
    description="Retorna catecúmenos con hora exacta de marcación, estado y asignación automática de faltas para ausentes."
)
async def obtener_detalle_fecha(
    fecha: date = Query(..., description="Fecha de la sesión (YYYY-MM-DD)"),
    capilla_id: int = Query(1, description="ID de Capilla"),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_asistencias_detalle_fecha(db, fecha=fecha, capilla_id=capilla_id)
