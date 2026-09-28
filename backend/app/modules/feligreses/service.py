"""
Lógica de negocio del módulo Feligreses.

Reglas clave:
  - CI es la clave única de identidad. Si ya existe una Persona con ese CI,
    se reutiliza sin duplicar; solo se crea el Usuario.
  - Username auto-generado: {inicial_nombre}{primer_apellido} en minúsculas sin tildes.
    Si ya existe, se añade un número incremental (ej: cmamani2).
  - Contraseña temporal: JO-{CI} (fácil de comunicar en ventanilla).
"""

import unicodedata
from datetime import datetime
from typing import Optional, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, or_

from app.modules.personas.models import (
    Persona, Usuario, Rol, NombreRol, EstadoUsuario,
    RelacionFamiliar, Inscripcion, usuarios_roles
)
from app.modules.feligreses.schemas import (
    FeligresCreate, FeligresResponse, FeligresListItem,
    FeligresDetalle, HijoVinculado, FeligresListResponse, FeligresBusquedaItem
)
from app.core.security import hash_password
from fastapi import HTTPException, status


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _normalize(s: str) -> str:
    """Elimina tildes y convierte a minúsculas para generar usernames."""
    nfkd = unicodedata.normalize('NFD', s)
    return ''.join(c for c in nfkd if unicodedata.category(c) != 'Mn').lower().replace(' ', '')


async def _generate_username(db: AsyncSession, nombres: str, primer_apellido: str) -> str:
    """
    Genera un username único: {1ra_letra_nombre}{apellido}
    Ej: Carlos Mamani → cmamani
    Si ya existe, prueba cmamani2, cmamani3, ...
    """
    base = _normalize(nombres[0]) + _normalize(primer_apellido)
    # Máx 20 caracteres
    base = base[:20]

    candidate = base
    counter   = 2
    while True:
        result = await db.execute(select(Usuario).where(Usuario.username == candidate))
        if not result.scalar_one_or_none():
            return candidate
        candidate = f"{base}{counter}"
        counter  += 1
        if counter > 999:
            # Fallback seguro
            import uuid
            return f"f{str(uuid.uuid4())[:8]}"


# ─── Creación ─────────────────────────────────────────────────────────────────

async def create_feligres(db: AsyncSession, data: FeligresCreate) -> FeligresResponse:
    """
    1. Busca si ya existe una Persona con ese CI.
       - Si existe y ya tiene Usuario → error 409.
       - Si existe sin Usuario → reutiliza la Persona.
       - Si no existe → crea la Persona.
    2. Genera username único y contraseña temporal JO-{CI}.
    3. Crea Usuario con rol TUTOR.
    """

    # 1 — Verificar CI
    result = await db.execute(
        select(Persona)
        .where(Persona.ci_dni == data.ci_dni.strip())
        .options(selectinload(Persona.usuario))
    )
    persona = result.scalar_one_or_none()

    if persona and persona.usuario:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe una cuenta vinculada al CI {data.ci_dni}. Si olvidaste tus credenciales, contacta a secretaría."
        )

    if not persona:
        # Crear nueva Persona
        persona = Persona(
            ci_dni=data.ci_dni.strip(),
            complemento=data.complemento,
            nombres=data.nombres.strip().title(),
            primer_apellido=data.primer_apellido.strip().title(),
            segundo_apellido=data.segundo_apellido.strip().title() if data.segundo_apellido else None,
            telefono_principal=data.telefono,
        )
        db.add(persona)
        await db.flush()
    else:
        # Actualizar teléfono si viene
        if data.telefono:
            persona.telefono_principal = data.telefono

    # 2 — Obtener o crear el Rol TUTOR
    result = await db.execute(select(Rol).where(Rol.nombre == NombreRol.TUTOR))
    rol_tutor = result.scalar_one_or_none()
    if not rol_tutor:
        rol_tutor = Rol(nombre=NombreRol.TUTOR, descripcion="Padre, madre o tutor con acceso restringido")
        db.add(rol_tutor)
        await db.flush()

    # 3 — Generar credenciales
    username     = await _generate_username(db, data.nombres, data.primer_apellido)
    temp_password = data.password if data.password else f"JO-{data.ci_dni.strip()}"

    # 4 — Crear Usuario
    usuario = Usuario(
        persona_id=persona.id,
        username=username,
        email=str(data.email) if data.email else None,
        password_hash=hash_password(temp_password),
        estado=EstadoUsuario.ACTIVO,
    )
    usuario.roles.append(rol_tutor)
    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)
    await db.refresh(persona)

    return FeligresResponse(
        persona_id=persona.id,
        nombres=persona.nombres,
        primer_apellido=persona.primer_apellido,
        segundo_apellido=persona.segundo_apellido,
        ci_dni=persona.ci_dni,
        telefono=persona.telefono_principal,
        email=usuario.email,
        username=username,
        temp_password=temp_password,
        created_at=usuario.created_at,
    )


# ─── Listado ──────────────────────────────────────────────────────────────────

async def list_feligreses(
    db: AsyncSession,
    search: Optional[str] = None,
    con_hijos: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
) -> FeligresListResponse:
    """
    Lista todos los usuarios con rol TUTOR (feligreses).
    Filtro de búsqueda por nombre, apellido, CI o username.
    """
    # Subquery: IDs de personas que tienen rol TUTOR
    tutor_rol_q = select(Rol.id).where(Rol.nombre == NombreRol.TUTOR).scalar_subquery()
    query = (
        select(Usuario)
        .join(Persona, Usuario.persona_id == Persona.id)
        .where(
            Usuario.id.in_(
                select(usuarios_roles.c.usuario_id).where(
                    usuarios_roles.c.rol_id == tutor_rol_q
                )
            )
        )
        .options(selectinload(Usuario.persona))
    )

    if search:
        term = f"%{search.lower()}%"
        query = query.where(
            or_(
                func.lower(Persona.nombres).like(term),
                func.lower(Persona.primer_apellido).like(term),
                func.lower(Persona.ci_dni).like(term),
                func.lower(Usuario.username).like(term),
            )
        )

    if con_hijos is True:
        hijos_subquery = select(RelacionFamiliar.tutor_persona_id).distinct()
        query = query.where(Persona.id.in_(hijos_subquery))
    elif con_hijos is False:
        hijos_subquery = select(RelacionFamiliar.tutor_persona_id).distinct()
        query = query.where(~Persona.id.in_(hijos_subquery))

    count_q = await db.execute(select(func.count()).select_from(query.subquery()))
    total   = count_q.scalar_one()

    result  = await db.execute(query.order_by(Usuario.created_at.desc()).offset(skip).limit(limit))
    usuarios = result.scalars().unique().all()

    items = []
    for u in usuarios:
        p = u.persona
        # Contar hijos vinculados
        hijos_q = await db.execute(
            select(func.count()).where(RelacionFamiliar.tutor_persona_id == p.id)
        )
        total_hijos = hijos_q.scalar_one()

        items.append(FeligresListItem(
            persona_id=p.id,
            nombres=p.nombres,
            primer_apellido=p.primer_apellido,
            segundo_apellido=p.segundo_apellido,
            ci_dni=p.ci_dni,
            telefono=p.telefono_principal,
            email=u.email,
            username=u.username,
            total_hijos=total_hijos,
            created_at=u.created_at,
        ))

    return FeligresListResponse(total=total, skip=skip, limit=limit, items=items)


# ─── Detalle ──────────────────────────────────────────────────────────────────

async def get_feligres_detalle(db: AsyncSession, persona_id: int) -> FeligresDetalle:
    """Retorna el feligrés con sus hijos catecúmenos vinculados."""
    result = await db.execute(
        select(Persona)
        .where(Persona.id == persona_id)
        .options(
            selectinload(Persona.usuario),
            selectinload(Persona.como_tutor).selectinload(RelacionFamiliar.catecumeno)
            .selectinload(Persona.inscripciones),
        )
    )
    persona = result.scalar_one_or_none()
    if not persona or not persona.usuario:
        raise HTTPException(status_code=404, detail="Feligrés no encontrado.")

    hijos = []
    for rel in persona.como_tutor:
        cat = rel.catecumeno
        if cat.inscripciones:
            insc = cat.inscripciones[0]
            hijos.append(HijoVinculado(
                persona_id=cat.id,
                nombres=cat.nombres,
                primer_apellido=cat.primer_apellido,
                tipo_sacramento=insc.tipo_sacramento.value,
                estado=insc.estado.value,
                token_qr=insc.token_qr,
            ))

    return FeligresDetalle(
        persona_id=persona.id,
        nombres=persona.nombres,
        primer_apellido=persona.primer_apellido,
        segundo_apellido=persona.segundo_apellido,
        ci_dni=persona.ci_dni,
        telefono=persona.telefono_principal,
        email=persona.usuario.email,
        username=persona.usuario.username,
        hijos=hijos,
        created_at=persona.usuario.created_at,
    )


# ─── Búsqueda rápida (para selector del modal) ───────────────────────────────

async def buscar_feligreses(db: AsyncSession, q: str) -> List[FeligresBusquedaItem]:
    """Búsqueda rápida por nombre/CI para el selector del modal de inscripción."""
    if len(q) < 2:
        return []

    tutor_rol_q = select(Rol.id).where(Rol.nombre == NombreRol.TUTOR).scalar_subquery()
    term = f"%{q.lower()}%"

    result = await db.execute(
        select(Persona)
        .join(Usuario, Persona.id == Usuario.persona_id)
        .where(
            Usuario.id.in_(
                select(usuarios_roles.c.usuario_id).where(
                    usuarios_roles.c.rol_id == tutor_rol_q
                )
            )
        )
        .where(
            or_(
                func.lower(Persona.nombres).like(term),
                func.lower(Persona.primer_apellido).like(term),
                func.lower(Persona.ci_dni).like(term),
            )
        )
        .limit(10)
    )
    personas = result.scalars().all()

    return [
        FeligresBusquedaItem(
            persona_id=p.id,
            nombres=p.nombres,
            primer_apellido=p.primer_apellido,
            telefono=p.telefono_principal,
            ci_dni=p.ci_dni,
        )
        for p in personas
    ]


async def get_mi_perfil(db: AsyncSession, usuario_id: int) -> FeligresDetalle:
    """Retorna la información del feligrés autenticado y sus hijos catecúmenos vinculados."""
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    return await get_feligres_detalle(db, usuario.persona_id)

