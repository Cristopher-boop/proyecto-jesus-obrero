"""
Router del módulo Catecúmenos — v2.
Añade endpoints PATCH /baja y /reactivar para baja lógica.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.personas.models import TipoSacramento, EstadoInscripcion
from app.modules.catecumenos.schemas import (
    CatecumenoCreate, CatecumenoUpdate, CatecumenoDetalle,
    CatecumenoListResponse, TutorVinculacion
)
from app.modules.catecumenos import service

router = APIRouter()


@router.post("/", response_model=CatecumenoDetalle, status_code=201,
             summary="Inscribir catecúmeno",
             description="Crea persona + inscripción con QR único + hasta 3 tutores en una sola transacción.")
async def inscribir_catecumeno(data: CatecumenoCreate, db: AsyncSession = Depends(get_db)):
    inscripcion = await service.create_catecumeno(db, data)
    return await service.get_catecumeno_detalle(db, inscripcion.persona_id)


@router.get("/", response_model=CatecumenoListResponse, summary="Listar catecúmenos")
async def listar_catecumenos(
    tipo:   Optional[TipoSacramento]    = Query(None),
    estado: Optional[EstadoInscripcion] = Query(None),
    search: Optional[str]               = Query(None),
    skip:  int = Query(0,  ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    return await service.list_catecumenos(db, tipo=tipo, estado=estado, search=search, skip=skip, limit=limit)


@router.get("/{persona_id}", response_model=CatecumenoDetalle, summary="Detalle de catecúmeno")
async def detalle_catecumeno(persona_id: int, db: AsyncSession = Depends(get_db)):
    return await service.get_catecumeno_detalle(db, persona_id)


@router.put("/{persona_id}", response_model=CatecumenoDetalle, summary="Actualizar catecúmeno")
async def actualizar_catecumeno(persona_id: int, data: CatecumenoUpdate, db: AsyncSession = Depends(get_db)):
    return await service.update_catecumeno(db, persona_id, data)


@router.patch("/{persona_id}/baja", response_model=CatecumenoDetalle,
              summary="Dar de baja (lógica)",
              description="Cambia el estado de la inscripción a BAJA. No elimina ningún registro.")
async def dar_baja(persona_id: int, db: AsyncSession = Depends(get_db)):
    return await service.dar_baja(db, persona_id)


@router.patch("/{persona_id}/reactivar", response_model=CatecumenoDetalle,
              summary="Reactivar catecúmeno",
              description="Cambia el estado de una inscripción BAJA o GRADUADO de vuelta a ACTIVO.")
async def reactivar(persona_id: int, db: AsyncSession = Depends(get_db)):
    return await service.reactivar(db, persona_id)


@router.post("/{persona_id}/tutores",
             summary="Vincular tutor adicional")
async def vincular_tutor(persona_id: int, data: TutorVinculacion, db: AsyncSession = Depends(get_db)):
    return await service.vincular_tutor(db, persona_id, data)
