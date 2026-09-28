"""
Router del módulo Feligreses.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.feligreses.schemas import (
    FeligresCreate, FeligresResponse, FeligresDetalle,
    FeligresListResponse, FeligresBusquedaItem
)
from app.modules.feligreses import service

router = APIRouter()


@router.post("/", response_model=FeligresResponse, status_code=201,
             summary="Crear cuenta de feligrés",
             description="""
Registra un padre/madre/tutor con cuenta de acceso.
- El CI actúa como clave única — si ya existe una Persona con ese CI se reutiliza.
- El username se auto-genera ({inicial}{apellido}, ej: cmamani).
- La contraseña temporal es `JO-{CI}` (comunicada en ventanilla).
""")
async def crear_feligres(data: FeligresCreate, db: AsyncSession = Depends(get_db)):
    return await service.create_feligres(db, data)


@router.get("/buscar", response_model=List[FeligresBusquedaItem],
            summary="Búsqueda rápida de feligreses",
            description="Búsqueda por nombre o CI para el selector del modal de inscripción.")
async def buscar_feligreses(
    q: str = Query(..., min_length=2, description="Texto de búsqueda (nombre, apellido o CI)"),
    db: AsyncSession = Depends(get_db),
):
    return await service.buscar_feligreses(db, q)


@router.get("/", response_model=FeligresListResponse, summary="Listar feligreses")
async def listar_feligreses(
    search: Optional[str] = Query(None),
    con_hijos: Optional[bool] = Query(None, description="Filtrar por feligreses con o sin hijos vinculados"),
    skip:  int = Query(0,  ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    return await service.list_feligreses(db, search=search, con_hijos=con_hijos, skip=skip, limit=limit)


@router.get("/mi-perfil", response_model=FeligresDetalle, summary="Perfil del feligrés autenticado")
async def mi_perfil(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_mi_perfil(db, current_user["usuario_id"])


@router.post("/registro-publico", response_model=FeligresResponse, status_code=201,
             summary="Registro público de feligrés")
async def registro_publico(data: FeligresCreate, db: AsyncSession = Depends(get_db)):
    return await service.create_feligres(db, data)


@router.get("/{persona_id}", response_model=FeligresDetalle, summary="Detalle de feligrés")
async def detalle_feligres(persona_id: int, db: AsyncSession = Depends(get_db)):
    return await service.get_feligres_detalle(db, persona_id)
