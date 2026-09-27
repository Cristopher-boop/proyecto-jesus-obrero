"""
Lógica de negocio del módulo Catecúmenos — v3.
- Creación con multi-tutor (lista), etapa, gestión y subgrupos
- Baja lógica / Reactivación
- Listado con filtros avanzados (gestión, etapa, sacramento, subgrupo)
- Gestión y verificación de documentos adjuntos
"""

import os
import uuid
from datetime import date
from typing import Optional, List, Dict

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, or_
from fastapi import HTTPException, status

from app.modules.personas.models import (
    Persona, Inscripcion, RelacionFamiliar, DocumentoCatecumeno,
    TipoSacramento, EstadoInscripcion, EtapaFormacion, TipoDocumento, EstadoDocumento
)
from app.modules.capillas_grupos.models import Grupo
from app.modules.catecumenos.schemas import (
    CatecumenoCreate, CatecumenoUpdate,
    CatecumenoListItem, CatecumenoDetalle, TutorResponse, InscripcionResponse,
    CatecumenoListResponse, TutorVinculacion, DocumentoItem, DocumentoListResponse,
    VerificarDocumentoPayload
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _title(s: Optional[str]) -> Optional[str]:
    return s.strip().title() if s else None

DOC_CHECKLIST_MAP = {
    TipoDocumento.FORMULARIO_INSCRIPCION: "doc_formulario_inscripcion",
    TipoDocumento.FE_BAUTISMO:            "doc_fe_bautismo",
    TipoDocumento.CERT_NACIMIENTO:        "doc_cert_nacimiento",
    TipoDocumento.CERT_MATRIMONIO_PADRES: "doc_cert_matrimonio_padres",
    TipoDocumento.CI_NINO:                "doc_ci_nino",
    TipoDocumento.CI_PADRE:               "doc_ci_padre",
    TipoDocumento.CI_MADRE:               "doc_ci_madre",
    TipoDocumento.CI_TUTOR:               "doc_ci_tutor",
}


# ─── Creación ─────────────────────────────────────────────────────────────────

async def create_catecumeno(db: AsyncSession, data: CatecumenoCreate) -> Inscripcion:
    """
    Transacción atómica:
      1. Persona del catecúmeno
      2. Inscripción con QR UUID4, gestión y etapa
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
        etapa=data.etapa,
        gestion=data.gestion,
        capilla_id=data.capilla_id,
        grupo_id=data.grupo_id,
        estado=EstadoInscripcion.ACTIVO,
        cuadernillo_comprado=data.cuadernillo_comprado,
        libro_comprado=data.libro_comprado,
        pago_cuota_inicial=data.pago_cuota_inicial,
        doc_formulario_inscripcion=data.doc_formulario_inscripcion,
        doc_fe_bautismo=data.doc_fe_bautismo,
        doc_cert_nacimiento=data.doc_cert_nacimiento,
        doc_cert_matrimonio_padres=data.doc_cert_matrimonio_padres,
        doc_ci_nino=data.doc_ci_nino,
        doc_ci_padre=data.doc_ci_padre,
        doc_ci_madre=data.doc_ci_madre,
        doc_ci_tutor=data.doc_ci_tutor,
        token_qr=str(uuid.uuid4()),
        observaciones=data.observaciones,
    )
    db.add(inscripcion)
    await db.flush()

    # 3 — Tutores nuevos
    for t_data in data.tutores_nuevos:
        tutor = Persona(
            nombres=_title(t_data.nombres),
            primer_apellido=_title(t_data.primer_apellido),
            segundo_apellido=_title(t_data.segundo_apellido),
            telefono_principal=t_data.telefono_principal,
        )
        db.add(tutor)
        await db.flush()

        relacion = RelacionFamiliar(
            catecumeno_persona_id=catecumeno.id,
            tutor_persona_id=tutor.id,
            parentesco=t_data.parentesco,
            es_contacto_emergencia=t_data.es_contacto_emergencia,
        )
        db.add(relacion)

    # 4 — Tutores vinculados
    for v in data.tutores_vinculo:
        res = await db.execute(select(Persona).where(Persona.id == v.tutor_persona_id))
        tutor = res.scalar_one_or_none()
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


# ─── Listado paginado con Filtros ─────────────────────────────────────────────

async def list_catecumenos(
    db: AsyncSession,
    tipo: Optional[TipoSacramento] = None,
    etapa: Optional[EtapaFormacion] = None,
    gestion: Optional[int] = None,
    grupo_id: Optional[int] = None,
    capilla_id: Optional[int] = None,
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
            .selectinload(RelacionFamiliar.tutor),
            selectinload(Inscripcion.grupo),
            selectinload(Inscripcion.documentos),
        )
        .join(Persona, Inscripcion.persona_id == Persona.id)
    )

    if tipo:
        query = query.where(Inscripcion.tipo_sacramento == tipo)
    if etapa:
        query = query.where(Inscripcion.etapa == etapa)
    if gestion:
        query = query.where(Inscripcion.gestion == gestion)
    if grupo_id:
        query = query.where(Inscripcion.grupo_id == grupo_id)
    if capilla_id:
        query = query.where(Inscripcion.capilla_id == capilla_id)
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
            etapa=insc.etapa,
            gestion=insc.gestion,
            grupo_id=insc.grupo_id,
            grupo_nombre=insc.grupo.nombre if insc.grupo else None,
            estado=insc.estado,
            token_qr=insc.token_qr,
            cuadernillo_comprado=insc.cuadernillo_comprado,
            libro_comprado=insc.libro_comprado,
            pago_cuota_inicial=insc.pago_cuota_inicial,
            doc_formulario_inscripcion=insc.doc_formulario_inscripcion,
            doc_fe_bautismo=insc.doc_fe_bautismo,
            doc_cert_nacimiento=insc.doc_cert_nacimiento,
            doc_cert_matrimonio_padres=insc.doc_cert_matrimonio_padres,
            doc_ci_nino=insc.doc_ci_nino,
            doc_ci_padre=insc.doc_ci_padre,
            doc_ci_madre=insc.doc_ci_madre,
            doc_ci_tutor=insc.doc_ci_tutor,
            total_documentos_subidos=len(insc.documentos) if insc.documentos else 0,
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
            selectinload(Persona.inscripciones).selectinload(Inscripcion.grupo),
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

    insc_resp = InscripcionResponse(
        id=insc.id,
        tipo_sacramento=insc.tipo_sacramento,
        estado=insc.estado,
        etapa=insc.etapa,
        gestion=insc.gestion,
        grupo_id=insc.grupo_id,
        grupo_nombre=insc.grupo.nombre if insc.grupo else None,
        cuadernillo_comprado=insc.cuadernillo_comprado,
        libro_comprado=insc.libro_comprado,
        pago_cuota_inicial=insc.pago_cuota_inicial,
        doc_formulario_inscripcion=insc.doc_formulario_inscripcion,
        doc_fe_bautismo=insc.doc_fe_bautismo,
        doc_cert_nacimiento=insc.doc_cert_nacimiento,
        doc_cert_matrimonio_padres=insc.doc_cert_matrimonio_padres,
        doc_ci_nino=insc.doc_ci_nino,
        doc_ci_padre=insc.doc_ci_padre,
        doc_ci_madre=insc.doc_ci_madre,
        doc_ci_tutor=insc.doc_ci_tutor,
        token_qr=insc.token_qr,
        fecha_inscripcion=insc.fecha_inscripcion,
        observaciones=insc.observaciones,
        created_at=insc.created_at,
    )

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
        inscripcion=insc_resp,
        tutores=tutores,
    )


# ─── Edición ──────────────────────────────────────────────────────────────────

async def update_catecumeno(
    db: AsyncSession,
    persona_id: int,
    data: CatecumenoUpdate,
) -> CatecumenoDetalle:
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
        for campo in [
            'tipo_sacramento', 'etapa', 'gestion', 'capilla_id', 'grupo_id',
            'cuadernillo_comprado', 'libro_comprado', 'pago_cuota_inicial',
            'doc_formulario_inscripcion', 'doc_fe_bautismo', 'doc_cert_nacimiento',
            'doc_cert_matrimonio_padres', 'doc_ci_nino', 'doc_ci_padre',
            'doc_ci_madre', 'doc_ci_tutor', 'estado', 'observaciones'
        ]:
            val = getattr(data, campo, None)
            if val is not None:
                setattr(insc, campo, val)

    await db.commit()
    return await get_catecumeno_detalle(db, persona_id)


# ─── Baja Lógica y Reactivación ───────────────────────────────────────────────

async def dar_baja(db: AsyncSession, persona_id: int) -> CatecumenoDetalle:
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


# ─── Gestión de Documentos de Catecúmenos ─────────────────────────────────────

async def get_documentos_catecumeno(db: AsyncSession, persona_id: int) -> DocumentoListResponse:
    """Retorna la lista de archivos subidos y el estado del checklist para un catecúmeno."""
    result = await db.execute(
        select(Persona)
        .where(Persona.id == persona_id)
        .options(
            selectinload(Persona.inscripciones).selectinload(Inscripcion.documentos)
        )
    )
    persona = result.scalar_one_or_none()
    if not persona or not persona.inscripciones:
        raise HTTPException(status_code=404, detail="Catecúmeno o inscripción no encontrada.")

    insc = persona.inscripciones[0]
    nombre_completo = f"{persona.nombres} {persona.primer_apellido} {persona.segundo_apellido or ''}".strip()

    docs_items = [DocumentoItem.model_validate(d) for d in insc.documentos]

    checklist = {
        "doc_formulario_inscripcion": insc.doc_formulario_inscripcion,
        "doc_fe_bautismo":            insc.doc_fe_bautismo,
        "doc_cert_nacimiento":        insc.doc_cert_nacimiento,
        "doc_cert_matrimonio_padres": insc.doc_cert_matrimonio_padres,
        "doc_ci_nino":                insc.doc_ci_nino,
        "doc_ci_padre":               insc.doc_ci_padre,
        "doc_ci_madre":               insc.doc_ci_madre,
        "doc_ci_tutor":               insc.doc_ci_tutor,
    }

    return DocumentoListResponse(
        persona_id=persona.id,
        nombre_completo=nombre_completo,
        inscripcion_id=insc.id,
        total_subidos=len(docs_items),
        documentos=docs_items,
        checklist_estado=checklist,
    )


async def subir_documento_catecumeno(
    db: AsyncSession,
    persona_id: int,
    tipo_documento: TipoDocumento,
    nombre_archivo: str,
    ruta_archivo: str,
    mime_type: Optional[str] = None,
    tamano_bytes: Optional[int] = None,
    observaciones: Optional[str] = None
) -> DocumentoItem:
    """Registra un archivo de documento y marca automáticamente el requisito en la inscripción."""
    result = await db.execute(
        select(Persona)
        .where(Persona.id == persona_id)
        .options(selectinload(Persona.inscripciones))
    )
    persona = result.scalar_one_or_none()
    if not persona or not persona.inscripciones:
        raise HTTPException(status_code=404, detail="Catecúmeno o inscripción no encontrada.")

    insc = persona.inscripciones[0]

    doc = DocumentoCatecumeno(
        inscripcion_id=insc.id,
        tipo_documento=tipo_documento,
        nombre_archivo=nombre_archivo,
        ruta_archivo=ruta_archivo,
        mime_type=mime_type,
        tamano_bytes=tamano_bytes,
        estado=EstadoDocumento.ENTREGADO,
        observaciones=observaciones,
    )
    db.add(doc)

    # Actualizar checklist booleano en la inscripción
    col_name = DOC_CHECKLIST_MAP.get(tipo_documento)
    if col_name and hasattr(insc, col_name):
        setattr(insc, col_name, True)

    await db.commit()
    await db.refresh(doc)
    return DocumentoItem.model_validate(doc)


async def verificar_documento(
    db: AsyncSession,
    persona_id: int,
    doc_id: int,
    payload: VerificarDocumentoPayload
) -> DocumentoItem:
    """Actualiza el estado de verificación de un documento."""
    result = await db.execute(
        select(DocumentoCatecumeno)
        .join(Inscripcion, DocumentoCatecumeno.inscripcion_id == Inscripcion.id)
        .where(
            DocumentoCatecumeno.id == doc_id,
            Inscripcion.persona_id == persona_id
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado.")

    doc.estado = payload.estado
    if payload.observaciones is not None:
        doc.observaciones = payload.observaciones

    await db.commit()
    await db.refresh(doc)
    return DocumentoItem.model_validate(doc)


async def eliminar_documento(
    db: AsyncSession,
    persona_id: int,
    doc_id: int
) -> dict:
    """Elimina un documento y recalcula si el requisito sigue cumplido."""
    result = await db.execute(
        select(DocumentoCatecumeno)
        .join(Inscripcion, DocumentoCatecumeno.inscripcion_id == Inscripcion.id)
        .where(
            DocumentoCatecumeno.id == doc_id,
            Inscripcion.persona_id == persona_id
        )
        .options(selectinload(DocumentoCatecumeno.inscripcion))
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado.")

    insc = doc.inscripcion
    tipo_doc = doc.tipo_documento

    await db.delete(doc)
    await db.flush()

    # Verificar si quedan otros documentos del mismo tipo
    restantes = await db.execute(
        select(DocumentoCatecumeno)
        .where(
            DocumentoCatecumeno.inscripcion_id == insc.id,
            DocumentoCatecumeno.tipo_documento == tipo_doc
        )
    )
    if not restantes.scalars().first():
        col_name = DOC_CHECKLIST_MAP.get(tipo_doc)
        if col_name and hasattr(insc, col_name):
            setattr(insc, col_name, False)

    await db.commit()
    return {"message": "Documento eliminado con éxito."}
