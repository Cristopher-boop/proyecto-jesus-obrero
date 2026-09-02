"""
Router del módulo de Asistencias.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.asistencias.schemas import (
    ScanQRPayload, AsistenciaScanResponse, AsistenciaListResponse
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
