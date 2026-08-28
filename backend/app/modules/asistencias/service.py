"""
Servicio de lógica de negocio para Asistencias y escaneado de QR.
"""

from datetime import date, datetime
from typing import Optional, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.modules.personas.models import Persona, Inscripcion
from app.modules.asistencias.models import Asistencia, EstadoAsistencia
from app.modules.asistencias.schemas import (
    AsistenciaScanResponse, AsistenciaListItem, AsistenciaListResponse
)
from fastapi import HTTPException, status


def _clean_token(token_qr: str) -> str:
    """Extrae el UUID limpio si el token viene con prefijo 'PARROQUIA-JO:'."""
    raw = token_qr.strip()
    if raw.startswith("PARROQUIA-JO:"):
        return raw.split("PARROQUIA-JO:")[1].strip()
    return raw


async def registrar_asistencia_qr(
    db: AsyncSession,
    token_qr: str,
    estado: Optional[EstadoAsistencia] = None,
    observacion: Optional[str] = None,
    usuario_id: Optional[int] = None
) -> AsistenciaScanResponse:
    """
    Procesa la lectura del código QR de un catecúmeno:
      1. Extrae y valida el token UUID.
      2. Busca la inscripción activa correspondiente.
      3. Verifica si ya tiene marcada la asistencia hoy.
      4. Si no tiene, crea el registro con el estado indicado (por defecto PRESENTE) a la hora actual (HH:MM).
    """
    clean_uuid = _clean_token(token_qr)

    # 1 — Buscar inscripción por token QR
    result = await db.execute(
        select(Inscripcion)
        .where(Inscripcion.token_qr == clean_uuid)
        .options(selectinload(Inscripcion.persona))
    )
    inscripcion = result.scalar_one_or_none()

    if not inscripcion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Código QR no reconocido. Verifica que sea el gafete oficial del catecúmeno."
        )

    persona = inscripcion.persona
    nombre_completo = f"{persona.nombres} {persona.primer_apellido} {persona.segundo_apellido or ''}".strip()
    hoy = date.today()

    # 2 — Verificar si ya existe asistencia registrada en la fecha de hoy
    result_asistencia = await db.execute(
        select(Asistencia).where(
            Asistencia.inscripcion_id == inscripcion.id,
            Asistencia.fecha == hoy
        )
    )
    existente = result_asistencia.scalar_one_or_none()

    if existente:
        hora_str = existente.hora.strftime('%H:%M')
        return AsistenciaScanResponse(
            asistencia_id=existente.id,
            persona_id=persona.id,
            nombre_completo=nombre_completo,
            tipo_sacramento=inscripcion.tipo_sacramento.value,
            fecha=existente.fecha,
            hora=existente.hora,
            estado=existente.estado,
            mensaje=f"⚠️ Asistencia ya fue registrada hoy a las {hora_str}",
            ya_registrado=True,
        )

    # 3 — Registrar nueva asistencia
    ahora_hora = datetime.now().time()
    estado_final = estado or EstadoAsistencia.PRESENTE
    nueva_asistencia = Asistencia(
        inscripcion_id=inscripcion.id,
        fecha=hoy,
        hora=ahora_hora,
        estado=estado_final,
        observacion=observacion,
        registrado_por_id=usuario_id,
    )
    db.add(nueva_asistencia)
    await db.commit()
    await db.refresh(nueva_asistencia)

    hora_str = nueva_asistencia.hora.strftime('%H:%M')
    obs_info = f" ({observacion})" if observacion else ""
    return AsistenciaScanResponse(
        asistencia_id=nueva_asistencia.id,
        persona_id=persona.id,
        nombre_completo=nombre_completo,
        tipo_sacramento=inscripcion.tipo_sacramento.value,
        fecha=nueva_asistencia.fecha,
        hora=nueva_asistencia.hora,
        estado=nueva_asistencia.estado,
        mensaje=f"✓ {nueva_asistencia.estado.value}{obs_info} — Asistencia registrada a las {hora_str}",
        ya_registrado=False,
    )


async def listar_asistencias_hoy(db: AsyncSession) -> AsistenciaListResponse:
    """Retorna la lista de todas las asistencias registradas en la fecha actual."""
    hoy = date.today()
    result = await db.execute(
        select(Asistencia)
        .where(Asistencia.fecha == hoy)
        .options(
            selectinload(Asistencia.inscripcion).selectinload(Inscripcion.persona)
        )
        .order_by(Asistencia.hora.desc())
    )
    asistencias = result.scalars().all()

    items = []
    for a in asistencias:
        p = a.inscripcion.persona
        nombre_completo = f"{p.nombres} {p.primer_apellido} {p.segundo_apellido or ''}".strip()
        items.append(
            AsistenciaListItem(
                id=a.id,
                persona_id=p.id,
                nombre_completo=nombre_completo,
                tipo_sacramento=a.inscripcion.tipo_sacramento.value,
                fecha=a.fecha,
                hora=a.hora,
                estado=a.estado,
                token_qr=a.inscripcion.token_qr,
                observacion=a.observacion,
            )
        )

    return AsistenciaListResponse(
        total=len(items),
        fecha=hoy,
        items=items,
    )
