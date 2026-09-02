"""
Servicio de lógica de negocio para el módulo de Capillas y Horarios de Asistencia.
CRUD completo para Capillas y Horarios con validaciones y reglas de negocio.
"""

from datetime import datetime, time, date
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import update
from fastapi import HTTPException, status

from app.modules.personas.models import Persona, Inscripcion
from app.modules.capillas_grupos.models import Capilla, HorarioAsistencia, DiaSemana
from app.modules.asistencias.models import EstadoAsistencia
from app.modules.capillas_grupos.schemas import (
    CapillaCreate, CapillaUpdate, CapillaResponse, CapillaListItem,
    CapillaListResponse, FaseHorarioActual, HorarioAsistenciaResponse,
    HorarioAsistenciaCreate, HorarioAsistenciaUpdate
)

DIAS_MAP = {
    0: DiaSemana.LUNES,
    1: DiaSemana.MARTES,
    2: DiaSemana.MIERCOLES,
    3: DiaSemana.JUEVES,
    4: DiaSemana.VIERNES,
    5: DiaSemana.SABADO,
    6: DiaSemana.DOMINGO,
}


async def list_capillas(db: AsyncSession) -> CapillaListResponse:
    """Lista todas las capillas con sus horarios asociados."""
    result = await db.execute(
        select(Capilla)
        .options(selectinload(Capilla.horarios))
        .order_by(Capilla.es_sede_principal.desc(), Capilla.nombre.asc())
    )
    capillas = result.scalars().all()

    items = [
        CapillaListItem(
            id=c.id,
            nombre=c.nombre,
            codigo=c.codigo,
            direccion=c.direccion,
            es_sede_principal=c.es_sede_principal,
            activo=c.activo,
            descripcion=c.descripcion,
            total_horarios=len(c.horarios),
            horarios=[HorarioAsistenciaResponse.model_validate(h) for h in c.horarios if h.activo],
        )
        for c in capillas
    ]
    return CapillaListResponse(total=len(items), items=items)


async def get_capilla(db: AsyncSession, capilla_id: int) -> CapillaResponse:
    """Obtiene el detalle de una capilla por su ID."""
    result = await db.execute(
        select(Capilla)
        .where(Capilla.id == capilla_id)
        .options(selectinload(Capilla.horarios))
    )
    capilla = result.scalar_one_or_none()
    if not capilla:
        raise HTTPException(status_code=404, detail="Capilla no encontrada.")

    return CapillaResponse.model_validate(capilla)


async def create_capilla(db: AsyncSession, data: CapillaCreate) -> CapillaResponse:
    """Crea una nueva capilla con sus horarios iniciales."""
    # 1. Verificar si ya existe nombre o código
    result = await db.execute(
        select(Capilla).where((Capilla.nombre == data.nombre.strip()) | (Capilla.codigo == data.codigo.strip().upper()))
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Ya existe una capilla con ese nombre o código.")

    # 2. Si se marca como sede principal, desmarcar las demás
    if data.es_sede_principal:
        await db.execute(update(Capilla).values(es_sede_principal=False))

    capilla = Capilla(
        nombre=data.nombre.strip(),
        codigo=data.codigo.strip().upper(),
        direccion=data.direccion.strip() if data.direccion else None,
        es_sede_principal=data.es_sede_principal,
        descripcion=data.descripcion.strip() if data.descripcion else None,
        activo=data.activo,
    )
    db.add(capilla)
    await db.flush()

    if data.horarios:
        for h in data.horarios:
            horario = HorarioAsistencia(
                capilla_id=capilla.id,
                dia_semana=h.dia_semana,
                hora_inicio_puntual=h.hora_inicio_puntual,
                hora_fin_puntual=h.hora_fin_puntual,
                hora_inicio_misa=h.hora_inicio_misa,
                hora_fin_misa=h.hora_fin_misa,
                hora_inicio_catequesis=h.hora_inicio_catequesis,
                hora_fin_catequesis=h.hora_fin_catequesis,
                descripcion_misa=h.descripcion_misa,
                descripcion_catequesis=h.descripcion_catequesis,
                activo=h.activo,
            )
            db.add(horario)

    await db.commit()
    return await get_capilla(db, capilla.id)


async def update_capilla(db: AsyncSession, capilla_id: int, data: CapillaUpdate) -> CapillaResponse:
    """Actualiza los datos de una capilla existente."""
    result = await db.execute(
        select(Capilla).where(Capilla.id == capilla_id).options(selectinload(Capilla.horarios))
    )
    capilla = result.scalar_one_or_none()
    if not capilla:
        raise HTTPException(status_code=404, detail="Capilla no encontrada.")

    # Validar código y nombre únicos si se modifican
    if data.nombre and data.nombre.strip() != capilla.nombre:
        dup = await db.execute(select(Capilla).where(Capilla.nombre == data.nombre.strip(), Capilla.id != capilla_id))
        if dup.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Ya existe otra capilla con ese nombre.")
        capilla.nombre = data.nombre.strip()

    if data.codigo and data.codigo.strip().upper() != capilla.codigo:
        dup = await db.execute(select(Capilla).where(Capilla.codigo == data.codigo.strip().upper(), Capilla.id != capilla_id))
        if dup.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Ya existe otra capilla con ese código.")
        capilla.codigo = data.codigo.strip().upper()

    if data.direccion is not None:
        capilla.direccion = data.direccion.strip() if data.direccion else None
    if data.descripcion is not None:
        capilla.descripcion = data.descripcion.strip() if data.descripcion else None
    if data.activo is not None:
        capilla.activo = data.activo

    if data.es_sede_principal is not None:
        if data.es_sede_principal and not capilla.es_sede_principal:
            # Desmarcar las demás
            await db.execute(update(Capilla).values(es_sede_principal=False))
            capilla.es_sede_principal = True
        elif not data.es_sede_principal and capilla.es_sede_principal:
            capilla.es_sede_principal = False

    await db.commit()
    return await get_capilla(db, capilla.id)


async def delete_capilla(db: AsyncSession, capilla_id: int) -> dict:
    """Elimina una capilla y sus horarios asociados (protegiendo la sede principal activa)."""
    result = await db.execute(select(Capilla).where(Capilla.id == capilla_id))
    capilla = result.scalar_one_or_none()
    if not capilla:
        raise HTTPException(status_code=404, detail="Capilla no encontrada.")

    if capilla.es_sede_principal:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar la Sede Central activa. Primero asigna otra capilla como sede principal."
        )

    await db.delete(capilla)
    await db.commit()
    return {"message": f"Capilla '{capilla.nombre}' eliminada con éxito."}


# ─── CRUD de Horarios de Asistencia ──────────────────────────────────────────

def _validar_franjas_horario(
    h_ini_p: time, h_fin_p: time,
    h_ini_m: time, h_fin_m: time,
    h_ini_c: time, h_fin_c: time
):
    if not (h_ini_p < h_fin_p):
        raise HTTPException(status_code=422, detail="La hora de inicio puntual debe ser anterior al fin puntual.")
    if not (h_fin_p <= h_ini_m):
        raise HTTPException(status_code=422, detail="El fin del periodo puntual no puede ser posterior al inicio de la misa.")
    if not (h_ini_m < h_fin_m):
        raise HTTPException(status_code=422, detail="El inicio de la misa debe ser anterior al fin de la misa.")
    if not (h_fin_m <= h_ini_c):
        raise HTTPException(status_code=422, detail="El fin de la misa no puede ser posterior al inicio de la catequesis.")
    if not (h_ini_c < h_fin_c):
        raise HTTPException(status_code=422, detail="El inicio de la catequesis debe ser anterior al fin de la catequesis.")


async def create_horario(db: AsyncSession, capilla_id: int, data: HorarioAsistenciaCreate) -> HorarioAsistenciaResponse:
    """Crea un nuevo horario de asistencia para una capilla."""
    result = await db.execute(select(Capilla).where(Capilla.id == capilla_id))
    capilla = result.scalar_one_or_none()
    if not capilla:
        raise HTTPException(status_code=404, detail="Capilla no encontrada.")

    _validar_franjas_horario(
        data.hora_inicio_puntual, data.hora_fin_puntual,
        data.hora_inicio_misa, data.hora_fin_misa,
        data.hora_inicio_catequesis, data.hora_fin_catequesis
    )

    horario = HorarioAsistencia(
        capilla_id=capilla_id,
        dia_semana=data.dia_semana,
        hora_inicio_puntual=data.hora_inicio_puntual,
        hora_fin_puntual=data.hora_fin_puntual,
        hora_inicio_misa=data.hora_inicio_misa,
        hora_fin_misa=data.hora_fin_misa,
        hora_inicio_catequesis=data.hora_inicio_catequesis,
        hora_fin_catequesis=data.hora_fin_catequesis,
        descripcion_misa=data.descripcion_misa,
        descripcion_catequesis=data.descripcion_catequesis,
        activo=data.activo,
    )
    db.add(horario)
    await db.commit()
    await db.refresh(horario)
    return HorarioAsistenciaResponse.model_validate(horario)


async def update_horario(
    db: AsyncSession,
    capilla_id: int,
    horario_id: int,
    data: HorarioAsistenciaUpdate
) -> HorarioAsistenciaResponse:
    """Actualiza un horario de asistencia existente con validaciones."""
    result = await db.execute(
        select(HorarioAsistencia).where(
            HorarioAsistencia.id == horario_id,
            HorarioAsistencia.capilla_id == capilla_id
        )
    )
    horario = result.scalar_one_or_none()
    if not horario:
        raise HTTPException(status_code=404, detail="Horario de asistencia no encontrado para esta capilla.")

    h_ini_p = data.hora_inicio_puntual or horario.hora_inicio_puntual
    h_fin_p = data.hora_fin_puntual or horario.hora_fin_puntual
    h_ini_m = data.hora_inicio_misa or horario.hora_inicio_misa
    h_fin_m = data.hora_fin_misa or horario.hora_fin_misa
    h_ini_c = data.hora_inicio_catequesis or horario.hora_inicio_catequesis
    h_fin_c = data.hora_fin_catequesis or horario.hora_fin_catequesis

    _validar_franjas_horario(h_ini_p, h_fin_p, h_ini_m, h_fin_m, h_ini_c, h_fin_c)

    if data.dia_semana is not None:
        horario.dia_semana = data.dia_semana
    horario.hora_inicio_puntual = h_ini_p
    horario.hora_fin_puntual = h_fin_p
    horario.hora_inicio_misa = h_ini_m
    horario.hora_fin_misa = h_fin_m
    horario.hora_inicio_catequesis = h_ini_c
    horario.hora_fin_catequesis = h_fin_c

    if data.descripcion_misa is not None:
        horario.descripcion_misa = data.descripcion_misa
    if data.descripcion_catequesis is not None:
        horario.descripcion_catequesis = data.descripcion_catequesis
    if data.activo is not None:
        horario.activo = data.activo

    await db.commit()
    await db.refresh(horario)
    return HorarioAsistenciaResponse.model_validate(horario)


async def delete_horario(db: AsyncSession, capilla_id: int, horario_id: int) -> dict:
    """Elimina un horario de asistencia."""
    result = await db.execute(
        select(HorarioAsistencia).where(
            HorarioAsistencia.id == horario_id,
            HorarioAsistencia.capilla_id == capilla_id
        )
    )
    horario = result.scalar_one_or_none()
    if not horario:
        raise HTTPException(status_code=404, detail="Horario no encontrado.")

    await db.delete(horario)
    await db.commit()
    return {"message": "Horario eliminado con éxito."}


# ─── Evaluación de Horarios ───────────────────────────────────────────────────

async def evaluar_horario_marcado(
    db: AsyncSession,
    capilla_id: Optional[int],
    hora_marcada: time,
    dia_fecha: date
) -> Tuple[EstadoAsistencia, str, str]:
    """
    Evalúa la hora y fecha de marcación contra el horario configurado de la capilla.
    Retorna: (EstadoAsistencia, observacion_momento, mensaje_explicativo)
    """
    query = select(Capilla).options(selectinload(Capilla.horarios))
    if capilla_id:
        query = query.where(Capilla.id == capilla_id)
    else:
        query = query.where(Capilla.es_sede_principal == True)

    result = await db.execute(query)
    capilla = result.scalar_one_or_none()

    if not capilla:
        result_any = await db.execute(select(Capilla).options(selectinload(Capilla.horarios)).limit(1))
        capilla = result_any.scalar_one_or_none()

    if not capilla or not capilla.horarios:
        if time(9, 20) <= hora_marcada <= time(10, 10):
            return EstadoAsistencia.PRESENTE, "Puntual (Antes de la Misa)", "Marcación Puntual antes del inicio de la celebración."
        elif time(10, 11) <= hora_marcada <= time(12, 0):
            return EstadoAsistencia.PRESENTE, "Durante la Misa", "Marcación durante la celebración litúrgica."
        elif time(12, 1) <= hora_marcada <= time(13, 0):
            return EstadoAsistencia.ATRASO, "Durante la Catequesis (Atraso)", "Marcación tardía durante el encuentro de catequesis."
        else:
            return EstadoAsistencia.FALTA, "Fuera de Horario (Falta)", "Marcación registrada fuera del rango horario establecido."

    dia_semana_actual = DIAS_MAP[dia_fecha.weekday()]
    horario_dia = next((h for h in capilla.horarios if h.activo and h.dia_semana == dia_semana_actual), None)
    if not horario_dia:
        horario_dia = next((h for h in capilla.horarios if h.activo), capilla.horarios[0])

    if horario_dia.hora_inicio_puntual <= hora_marcada <= horario_dia.hora_fin_puntual:
        return (
            EstadoAsistencia.PRESENTE,
            "Puntual (Antes de la Misa)",
            f"Marcación puntual en {capilla.nombre} ({horario_dia.hora_inicio_puntual.strftime('%H:%M')} - {horario_dia.hora_fin_puntual.strftime('%H:%M')})."
        )
    elif horario_dia.hora_inicio_misa <= hora_marcada <= horario_dia.hora_fin_misa:
        return (
            EstadoAsistencia.PRESENTE,
            "Durante la Misa",
            f"Marcación durante la misa en {capilla.nombre} ({horario_dia.hora_inicio_misa.strftime('%H:%M')} - {horario_dia.hora_fin_misa.strftime('%H:%M')})."
        )
    elif horario_dia.hora_inicio_catequesis <= hora_marcada <= horario_dia.hora_fin_catequesis:
        return (
            EstadoAsistencia.ATRASO,
            "Durante la Catequesis (Atraso)",
            f"Atraso registrado durante catequesis en {capilla.nombre} ({horario_dia.hora_inicio_catequesis.strftime('%H:%M')} - {horario_dia.hora_fin_catequesis.strftime('%H:%M')})."
        )
    else:
        return (
            EstadoAsistencia.FALTA,
            "Fuera de Horario (Falta)",
            f"Marcación fuera del horario autorizado en {capilla.nombre}."
        )


async def get_fase_actual_capilla(
    db: AsyncSession,
    capilla_id: int,
    hora_custom: Optional[str] = None
) -> FaseHorarioActual:
    result = await db.execute(
        select(Capilla)
        .where(Capilla.id == capilla_id)
        .options(selectinload(Capilla.horarios))
    )
    capilla = result.scalar_one_or_none()
    if not capilla:
        raise HTTPException(status_code=404, detail="Capilla no encontrada.")

    ahora = datetime.now()
    dia_actual = DIAS_MAP[ahora.weekday()]

    if hora_custom:
        partes = hora_custom.split(":")
        hora_eval = time(int(partes[0]), int(partes[1]))
    else:
        hora_eval = ahora.time()

    horario = next((h for h in capilla.horarios if h.activo and h.dia_semana == dia_actual), None)
    if not horario and capilla.horarios:
        horario = capilla.horarios[0]

    if not horario:
        return FaseHorarioActual(
            fase="CERRADO",
            estado="FALTA",
            mensaje="No hay horarios configurados para esta capilla.",
            hora_actual=hora_eval.strftime("%H:%M"),
            dia_actual=dia_actual.value,
            horario=None
        )

    estado, momento, msg = await evaluar_horario_marcado(db, capilla_id, hora_eval, ahora.date())

    fase = "CERRADO"
    if "Puntual" in momento:
        fase = "PUNTUAL"
    elif "Misa" in momento:
        fase = "MISA"
    elif "Catequesis" in momento:
        fase = "CATEQUESIS"

    return FaseHorarioActual(
        fase=fase,
        estado=estado.value,
        mensaje=msg,
        hora_actual=hora_eval.strftime("%H:%M"),
        dia_actual=dia_actual.value,
        horario=HorarioAsistenciaResponse.model_validate(horario)
    )
