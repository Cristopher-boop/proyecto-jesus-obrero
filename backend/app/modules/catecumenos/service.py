"""
Lógica de negocio del módulo Catecúmenos — v2.
- Creación con multi-tutor (lista)
- Baja lógica / Reactivación
- Listado, detalle, actualización, vinculación de tutor adicional
"""

import uuid
from datetime import date
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, or_

from app.modules.personas.models import (
    Persona, Inscripcion, RelacionFamiliar,
    TipoSacramento, EstadoInscripcion
)
from app.modules.catecumenos.schemas import (
    CatecumenoCreate, CatecumenoUpdate,
    CatecumenoListItem, CatecumenoDetalle, TutorResponse, InscripcionResponse,
    CatecumenoListResponse, TutorVinculacion
)
from fastapi import HTTPException, status


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _title(s: Optional[str]) -> Optional[str]:
    return s.strip().title() if s else None


# ─── Creación ─────────────────────────────────────────────────────────────────

async def create_catecumeno(db: AsyncSession, data: CatecumenoCreate) -> Inscripcion:
    """
    Transacción atómica:
      1. Persona del catecúmeno
      2. Inscripción con QR UUID4
      3. Iterar tutores_nuevos → crear Persona + RelacionFamiliar
      4. Iterar tutores_vinculo → verificar que existan + RelacionFamiliar
    Máx. 3 tutores en total.
    """
    total_tutores = len(data.tutores_nuevos) + len(data.tutores_vinculo)
    if total_tutores > 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Se pueden registrar máximo 3 tutores por catecúmeno."
        )

    # 1 — Crear Persona del catecúmeno
    catecumeno = Persona(
        ci_dni=data.ci_dni,
        complemento=data.complemento,
        nombres=_title(data.nombres),
        primer_apellido=_title(data.primer_apellido),
        segundo_apellido=_title(data.segundo_apellido),
        fecha_nacimiento=data.fecha_nacimiento,
        genero=data.genero,
        direccion=data.direccion,
        es_bautizado=data.es_bautizado,
        es_primera_comunion=(data.tipo_sacramento == TipoSacramento.PRIMERA_COMUNION),
    )
    db.add(catecumeno)
    await db.flush()

    # 2 — Inscripción con QR único
    inscripcion = Inscripcion(
        persona_id=catecumeno.id,
        tipo_sacramento=data.tipo_sacramento,
        estado=EstadoInscripcion.ACTIVO,
        libro_comprado=data.libro_comprado,
        cuadernillo_comprado=data.cuadernillo_comprado,
        token_qr=str(uuid.uuid4()),
        fecha_inscripcion=date.today(),
        observaciones=data.observaciones,
        capilla_id=None,
        grupo_id=None,
    )
    db.add(inscripcion)
    await db.flush()

    # 3 — Tutores nuevos (crear Persona + RelacionFamiliar)
    for t in data.tutores_nuevos:
        tutor = Persona(
            nombres=_title(t.nombres),
            primer_apellido=_title(t.primer_apellido),
            segundo_apellido=_title(t.segundo_apellido),
            telefono_principal=t.telefono_principal,
        )
        db.add(tutor)
        await db.flush()

        relacion = RelacionFamiliar(
            catecumeno_persona_id=catecumeno.id,
            tutor_persona_id=tutor.id,
            parentesco=t.parentesco,
            es_contacto_emergencia=t.es_contacto_emergencia,
        )
        db.add(relacion)

    # 4 — Tutores vinculados (feligreses ya existentes)
    for v in data.tutores_vinculo:
        result = await db.execute(select(Persona).where(Persona.id == v.tutor_persona_id))
        tutor = result.scalar_one_or_none()
        if not tutor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No existe una persona con id={v.tutor_persona_id} para vincular."
            )
        relacion = RelacionFamiliar(
            catecumeno_persona_id=catecumeno.id,
            tutor_persona_id=tutor.id,
            parentesco=v.parentesco,
            es_contacto_emergencia=v.es_contacto_emergencia,
        )
        db.add(relacion)

    await db.commit()
    await db.refresh(inscripcion)
    return inscripcion


# ─── Listado paginado ─────────────────────────────────────────────────────────

async def list_catecumenos(
    db: AsyncSession,
    tipo: Optional[TipoSacramento] = None,
    estado: Optional[EstadoInscripcion] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> CatecumenoListResponse:

    query = (
        select(Inscripcion)
        .options(
            selectinload(Inscripcion.persona)
            .selectinload(Persona.como_catecumeno)
            .selectinload(RelacionFamiliar.tutor)
        )
        .join(Persona, Inscripcion.persona_id == Persona.id)
    )

    if tipo:
        query = query.where(Inscripcion.tipo_sacramento == tipo)
    if estado:
        query = query.where(Inscripcion.estado == estado)
    if search:
        term = f"%{search.lower()}%"
        query = query.where(
            or_(
                func.lower(Persona.nombres).like(term),
                func.lower(Persona.primer_apellido).like(term),
                func.lower(Persona.segundo_apellido).like(term),
                func.lower(Persona.ci_dni).like(term),
            )
        )

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar_one()

    result = await db.execute(
        query.order_by(Inscripcion.fecha_inscripcion.desc()).offset(skip).limit(limit)
    )
    inscripciones = result.scalars().unique().all()

    items = []
    for insc in inscripciones:
        p = insc.persona
        tutor_nombre = None
        tutor_tel    = None
        if p.como_catecumeno:
            t = p.como_catecumeno[0].tutor
            tutor_nombre = f"{t.nombres} {t.primer_apellido}"
            tutor_tel    = t.telefono_principal

        items.append(CatecumenoListItem(
            persona_id=p.id,
            nombres=p.nombres,
            primer_apellido=p.primer_apellido,
            segundo_apellido=p.segundo_apellido,
            genero=p.genero,
            fecha_nacimiento=p.fecha_nacimiento,
            es_bautizado=p.es_bautizado,
            inscripcion_id=insc.id,
            tipo_sacramento=insc.tipo_sacramento,
            estado=insc.estado,
            token_qr=insc.token_qr,
            libro_comprado=insc.libro_comprado,
            cuadernillo_comprado=insc.cuadernillo_comprado,
            fecha_inscripcion=insc.fecha_inscripcion,
            tutor_nombre=tutor_nombre,
            tutor_telefono=tutor_tel,
        ))

    return CatecumenoListResponse(total=total, skip=skip, limit=limit, items=items)


# ─── Detalle ──────────────────────────────────────────────────────────────────

async def get_catecumeno_detalle(db: AsyncSession, persona_id: int) -> CatecumenoDetalle:
    result = await db.execute(
        select(Persona)
        .where(Persona.id == persona_id)
        .options(
            selectinload(Persona.inscripciones),
            selectinload(Persona.como_catecumeno).selectinload(RelacionFamiliar.tutor),
        )
    )
    persona = result.scalar_one_or_none()

    if not persona:
        raise HTTPException(status_code=404, detail="Catecúmeno no encontrado.")
    if not persona.inscripciones:
        raise HTTPException(status_code=404, detail="Esta persona no tiene inscripción registrada.")

    insc = persona.inscripciones[0]

    tutores = [
        TutorResponse(
            persona_id=rel.tutor.id,
            nombres=rel.tutor.nombres,
            primer_apellido=rel.tutor.primer_apellido,
            segundo_apellido=rel.tutor.segundo_apellido,
            telefono_principal=rel.tutor.telefono_principal,
            parentesco=rel.parentesco,
            es_contacto_emergencia=rel.es_contacto_emergencia,
        )
        for rel in persona.como_catecumeno
    ]

    return CatecumenoDetalle(
        persona_id=persona.id,
        ci_dni=persona.ci_dni,
        complemento=persona.complemento,
        nombres=persona.nombres,
        primer_apellido=persona.primer_apellido,
        segundo_apellido=persona.segundo_apellido,
        fecha_nacimiento=persona.fecha_nacimiento,
        genero=persona.genero,
        direccion=persona.direccion,
        es_bautizado=persona.es_bautizado,
        inscripcion=InscripcionResponse.model_validate(insc),
        tutores=tutores,
    )


# ─── Actualización ────────────────────────────────────────────────────────────

async def update_catecumeno(db: AsyncSession, persona_id: int, data: CatecumenoUpdate) -> CatecumenoDetalle:
    result = await db.execute(
        select(Persona)
        .where(Persona.id == persona_id)
        .options(selectinload(Persona.inscripciones))
    )
    persona = result.scalar_one_or_none()
    if not persona:
        raise HTTPException(status_code=404, detail="Catecúmeno no encontrado.")

    for campo in ['ci_dni', 'nombres', 'primer_apellido', 'segundo_apellido',
                  'fecha_nacimiento', 'genero', 'direccion', 'es_bautizado']:
        val = getattr(data, campo, None)
        if val is not None:
            setattr(persona, campo, val)

    if persona.inscripciones:
        insc = persona.inscripciones[0]
        for campo in ['libro_comprado', 'cuadernillo_comprado', 'doc_fe_bautismo',
                      'doc_cert_nacimiento', 'doc_ci_nino', 'doc_ci_tutor',
                      'estado', 'observaciones']:
            val = getattr(data, campo, None)
            if val is not None:
                setattr(insc, campo, val)

    await db.commit()
    return await get_catecumeno_detalle(db, persona_id)


# ─── Baja Lógica ──────────────────────────────────────────────────────────────

async def dar_baja(db: AsyncSession, persona_id: int) -> CatecumenoDetalle:
    """Marca la inscripción como BAJA (no elimina ningún registro)."""
    result = await db.execute(
        select(Persona).where(Persona.id == persona_id)
        .options(selectinload(Persona.inscripciones))
    )
    persona = result.scalar_one_or_none()
    if not persona or not persona.inscripciones:
        raise HTTPException(status_code=404, detail="Catecúmeno no encontrado.")

    insc = persona.inscripciones[0]
    if insc.estado == EstadoInscripcion.BAJA:
        raise HTTPException(status_code=409, detail="El catecúmeno ya tiene estado BAJA.")

    insc.estado = EstadoInscripcion.BAJA
    await db.commit()
    return await get_catecumeno_detalle(db, persona_id)


async def reactivar(db: AsyncSession, persona_id: int) -> CatecumenoDetalle:
    """Reactiva una inscripción en estado BAJA o GRADUADO."""
    result = await db.execute(
        select(Persona).where(Persona.id == persona_id)
        .options(selectinload(Persona.inscripciones))
    )
    persona = result.scalar_one_or_none()
    if not persona or not persona.inscripciones:
        raise HTTPException(status_code=404, detail="Catecúmeno no encontrado.")

    insc = persona.inscripciones[0]
    if insc.estado == EstadoInscripcion.ACTIVO:
        raise HTTPException(status_code=409, detail="El catecúmeno ya está activo.")

    insc.estado = EstadoInscripcion.ACTIVO
    await db.commit()
    return await get_catecumeno_detalle(db, persona_id)


# ─── Vincular tutor adicional ─────────────────────────────────────────────────

async def vincular_tutor(db: AsyncSession, catecumeno_persona_id: int, data: TutorVinculacion) -> dict:
    result = await db.execute(select(Persona).where(Persona.id == catecumeno_persona_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Catecúmeno no encontrado.")

    result = await db.execute(select(Persona).where(Persona.id == data.tutor_persona_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Persona tutor no encontrada.")

    result = await db.execute(
        select(RelacionFamiliar).where(
            RelacionFamiliar.catecumeno_persona_id == catecumeno_persona_id,
            RelacionFamiliar.tutor_persona_id == data.tutor_persona_id,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Este tutor ya está vinculado al catecúmeno.")

    relacion = RelacionFamiliar(
        catecumeno_persona_id=catecumeno_persona_id,
        tutor_persona_id=data.tutor_persona_id,
        parentesco=data.parentesco,
        es_contacto_emergencia=data.es_contacto_emergencia,
    )
    db.add(relacion)
    await db.commit()
    return {"detail": "Tutor vinculado correctamente."}
