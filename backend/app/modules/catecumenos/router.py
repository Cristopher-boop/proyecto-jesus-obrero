"""
Router del módulo Catecúmenos — v3.
- Gestión de ciclo (etapa, gestión, grupo)
- Baja lógica / reactivación
- Gestión completa de subida y verificación de documentos
"""

import os
import shutil
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.personas.models import TipoSacramento, EstadoInscripcion, EtapaFormacion, TipoDocumento
from app.modules.catecumenos.schemas import (
    CatecumenoCreate, CatecumenoUpdate, CatecumenoDetalle,
    CatecumenoListResponse, TutorVinculacion, DocumentoItem,
    DocumentoListResponse, VerificarDocumentoPayload
)
from app.modules.catecumenos import service

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "documentos")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=CatecumenoDetalle, status_code=201,
             summary="Inscribir catecúmeno",
             description="Crea persona + inscripción con QR único + hasta 3 tutores en una sola transacción.")
async def inscribir_catecumeno(data: CatecumenoCreate, db: AsyncSession = Depends(get_db)):
    inscripcion = await service.create_catecumeno(db, data)
    return await service.get_catecumeno_detalle(db, inscripcion.persona_id)


@router.get("/", response_model=CatecumenoListResponse, summary="Listar catecúmenos con filtros avanzados")
async def listar_catecumenos(
    tipo:       Optional[TipoSacramento]    = Query(None, description="Filtrar por sacramento"),
    etapa:      Optional[EtapaFormacion]    = Query(None, description="Filtrar por etapa (PRIMER_ANO, SEGUNDO_ANO)"),
    gestion:    Optional[int]               = Query(None, description="Filtrar por año de gestión (ej: 2026)"),
    grupo_id:   Optional[int]               = Query(None, description="Filtrar por subgrupo"),
    capilla_id: Optional[int]               = Query(None, description="Filtrar por capilla"),
    estado:     Optional[EstadoInscripcion] = Query(None, description="Filtrar por estado"),
    search:     Optional[str]               = Query(None, description="Buscar por nombre o CI"),
    skip:       int = Query(0,  ge=0),
    limit:      int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    return await service.list_catecumenos(
        db,
        tipo=tipo,
        etapa=etapa,
        gestion=gestion,
        grupo_id=grupo_id,
        capilla_id=capilla_id,
        estado=estado,
        search=search,
        skip=skip,
        limit=limit
    )


@router.get("/{persona_id}", response_model=CatecumenoDetalle, summary="Detalle de catecúmeno")
async def detalle_catecumeno(persona_id: int, db: AsyncSession = Depends(get_db)):
    return await service.get_catecumeno_detalle(db, persona_id)


@router.put("/{persona_id}", response_model=CatecumenoDetalle, summary="Actualizar catecúmeno")
async def actualizar_catecumeno(persona_id: int, data: CatecumenoUpdate, db: AsyncSession = Depends(get_db)):
    return await service.update_catecumeno(db, persona_id, data)


@router.patch("/{persona_id}/baja", response_model=CatecumenoDetalle,
              summary="Dar de baja (lógica)")
async def dar_baja(persona_id: int, db: AsyncSession = Depends(get_db)):
    return await service.dar_baja(db, persona_id)


@router.patch("/{persona_id}/reactivar", response_model=CatecumenoDetalle,
              summary="Reactivar catecúmeno")
async def reactivar(persona_id: int, db: AsyncSession = Depends(get_db)):
    return await service.reactivar(db, persona_id)


@router.post("/{persona_id}/tutores", summary="Vincular tutor adicional")
async def vincular_tutor(persona_id: int, data: TutorVinculacion, db: AsyncSession = Depends(get_db)):
    return await service.vincular_tutor(db, persona_id, data)


# ─── Gestión de Documentos ───────────────────────────────────────────────────

@router.get("/{persona_id}/documentos", response_model=DocumentoListResponse, summary="Listar documentos del catecúmeno")
async def listar_documentos(persona_id: int, db: AsyncSession = Depends(get_db)):
    return await service.get_documentos_catecumeno(db, persona_id)


@router.post("/{persona_id}/documentos", response_model=DocumentoItem, status_code=status.HTTP_201_CREATED, summary="Subir documento")
async def subir_documento(
    persona_id: int,
    tipo_documento: TipoDocumento = Form(...),
    observaciones: Optional[str] = Form(None),
    archivo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    ext = os.path.splitext(archivo.filename or "")[1].lower()
    allowed_exts = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato no permitido ({ext}). Formatos aceptados: PDF, JPG, PNG, WEBP."
        )

    # Generar nombre único para el archivo guardado
    safe_filename = f"{persona_id}_{tipo_documento.value}_{uuid.uuid4().hex[:8]}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(dest_path, "wb") as f_out:
        shutil.copyfileobj(archivo.file, f_out)

    tamano = os.path.getsize(dest_path)
    rel_path = f"/uploads/documentos/{safe_filename}"

    return await service.subir_documento_catecumeno(
        db=db,
        persona_id=persona_id,
        tipo_documento=tipo_documento,
        nombre_archivo=archivo.filename or safe_filename,
        ruta_archivo=rel_path,
        mime_type=archivo.content_type,
        tamano_bytes=tamano,
        observaciones=observaciones,
    )


@router.put("/{persona_id}/documentos/{doc_id}/verificar", response_model=DocumentoItem, summary="Verificar documento")
async def verificar_documento(
    persona_id: int,
    doc_id: int,
    payload: VerificarDocumentoPayload,
    db: AsyncSession = Depends(get_db)
):
    return await service.verificar_documento(db, persona_id, doc_id, payload)


@router.delete("/{persona_id}/documentos/{doc_id}", summary="Eliminar documento")
async def eliminar_documento(
    persona_id: int,
    doc_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await service.eliminar_documento(db, persona_id, doc_id)
