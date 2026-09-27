"""
Router FastAPI para el módulo de Capillas y Horarios de Asistencia.
CRUD completo para Capillas y Horarios.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.modules.capillas_grupos.schemas import (
    CapillaListResponse, CapillaResponse, CapillaCreate, CapillaUpdate,
    FaseHorarioActual, HorarioAsistenciaCreate, HorarioAsistenciaUpdate,
    HorarioAsistenciaResponse
)
from app.modules.capillas_grupos import service

router = APIRouter()


# ─── Capillas ─────────────────────────────────────────────────────────────────

@router.get("", response_model=CapillaListResponse, summary="Listar todas las capillas y sus horarios")
async def get_capillas(db: AsyncSession = Depends(get_db)):
    return await service.list_capillas(db)


@router.get("/{capilla_id}", response_model=CapillaResponse, summary="Obtener detalle de una capilla")
async def get_capilla(capilla_id: int, db: AsyncSession = Depends(get_db)):
    return await service.get_capilla(db, capilla_id)


@router.post("", response_model=CapillaResponse, status_code=status.HTTP_201_CREATED, summary="Crear una nueva capilla")
async def create_capilla(data: CapillaCreate, db: AsyncSession = Depends(get_db)):
    return await service.create_capilla(db, data)


@router.put("/{capilla_id}", response_model=CapillaResponse, summary="Actualizar datos de una capilla")
async def update_capilla(capilla_id: int, data: CapillaUpdate, db: AsyncSession = Depends(get_db)):
    return await service.update_capilla(db, capilla_id, data)


@router.delete("/{capilla_id}", summary="Eliminar una capilla")
async def delete_capilla(capilla_id: int, db: AsyncSession = Depends(get_db)):
    return await service.delete_capilla(db, capilla_id)


@router.get("/{capilla_id}/fase-actual", response_model=FaseHorarioActual, summary="Obtener fase operativa actual de una capilla")
async def get_fase_actual(
    capilla_id: int,
    hora: Optional[str] = Query(None, description="Hora en formato HH:MM para simulación"),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_fase_actual_capilla(db, capilla_id, hora)


# ─── Horarios de Asistencia ───────────────────────────────────────────────────

@router.post(
    "/{capilla_id}/horarios",
    response_model=HorarioAsistenciaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar un horario a una capilla"
)
async def create_horario(
    capilla_id: int,
    data: HorarioAsistenciaCreate,
    db: AsyncSession = Depends(get_db)
):
    return await service.create_horario(db, capilla_id, data)


@router.put(
    "/{capilla_id}/horarios/{horario_id}",
    response_model=HorarioAsistenciaResponse,
    summary="Actualizar un horario de una capilla"
)
async def update_horario(
    capilla_id: int,
    horario_id: int,
    data: HorarioAsistenciaUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await service.update_horario(db, capilla_id, horario_id, data)


@router.delete(
    "/{capilla_id}/horarios/{horario_id}",
    summary="Eliminar un horario de una capilla"
)
async def delete_horario(
    capilla_id: int,
    horario_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await service.delete_horario(db, capilla_id, horario_id)


# ─── Subgrupos de Catequesis (Jesús Obrero) ───────────────────────────────────

@router.get(
    "/{capilla_id}/grupos",
    response_model=service.GrupoListResponse,
    summary="Listar subgrupos de catequesis de una capilla"
)
async def get_grupos(
    capilla_id: int,
    gestion: Optional[int] = Query(None, description="Filtrar por año de gestión"),
    etapa: Optional[str] = Query(None, description="Filtrar por etapa (PRIMER_ANO, SEGUNDO_ANO)"),
    tipo_sacramento: Optional[str] = Query(None, description="Filtrar por sacramento"),
    db: AsyncSession = Depends(get_db)
):
    etapa_enum = service.EtapaFormacion(etapa) if etapa else None
    sacramento_enum = service.TipoSacramento(tipo_sacramento) if tipo_sacramento else None
    return await service.list_grupos(db, capilla_id, gestion, etapa_enum, sacramento_enum)


@router.post(
    "/{capilla_id}/grupos",
    response_model=service.GrupoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo subgrupo en una capilla"
)
async def create_grupo(
    capilla_id: int,
    data: service.GrupoCreate,
    db: AsyncSession = Depends(get_db)
):
    return await service.create_grupo(db, capilla_id, data)


@router.put(
    "/{capilla_id}/grupos/{grupo_id}",
    response_model=service.GrupoResponse,
    summary="Actualizar un subgrupo"
)
async def update_grupo(
    capilla_id: int,
    grupo_id: int,
    data: service.GrupoUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await service.update_grupo(db, capilla_id, grupo_id, data)


@router.delete(
    "/{capilla_id}/grupos/{grupo_id}",
    summary="Eliminar un subgrupo"
)
async def delete_grupo(
    capilla_id: int,
    grupo_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await service.delete_grupo(db, capilla_id, grupo_id)


@router.post(
    "/{capilla_id}/grupos/{grupo_id}/asignar-santo",
    response_model=service.GrupoResponse,
    summary="Asignar o actualizar el nombre patronal de Santo al subgrupo"
)
async def asignar_santo(
    capilla_id: int,
    grupo_id: int,
    payload: service.AsignarSantoPayload,
    db: AsyncSession = Depends(get_db)
):
    return await service.asignar_santo_grupo(db, capilla_id, grupo_id, payload.nombre_santo)


@router.post(
    "/{capilla_id}/grupos/auto-agrupar-por-edad",
    response_model=service.GrupoListResponse,
    summary="Conformar automáticamente subgrupos balanceados por edad / fecha de nacimiento"
)
async def auto_agrupar_por_edad(
    capilla_id: int,
    payload: service.AutoAgruparPayload,
    db: AsyncSession = Depends(get_db)
):
    return await service.auto_agrupar_por_edad(db, capilla_id, payload)

