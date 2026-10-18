"""
Servicio de lógica de negocio para Asistencias y escaneado de QR.
Integra evaluación automática de horarios por Capilla (Puntual, Durante Misa, Catequesis/Atraso y Falta).
"""

from datetime import date, datetime, time, timedelta
from typing import Optional, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.modules.personas.models import Persona, Inscripcion, EstadoInscripcion
from app.modules.capillas_grupos.models import Capilla, Grupo
from app.modules.asistencias.models import Asistencia, EstadoAsistencia
from app.modules.asistencias.schemas import (
    AsistenciaScanResponse, AsistenciaListItem, AsistenciaListResponse,
    AsistenciaDiaHeatmap, AsistenciaMesResumen, AsistenciaHeatmapResponse,
    AsistenciaDetalleItem, AsistenciaDetalleFechaResponse,
)
from app.modules.capillas_grupos.service import evaluar_horario_marcado
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
    capilla_id: Optional[int] = None,
    hora_simulada: Optional[str] = None,
    usuario_id: Optional[int] = None
) -> AsistenciaScanResponse:
    """
    Procesa la lectura del código QR de un catecúmeno:
      1. Extrae y valida el token UUID.
      2. Busca la inscripción activa correspondiente.
      3. Verifica si ya tiene marcada la asistencia hoy.
      4. Si no tiene estado explícito, evalúa automáticamente el horario de la Capilla:
         - Puntual (Antes de Misa): PRESENTE
         - Durante la Misa: PRESENTE
         - Durante la Catequesis: ATRASO
         - Fuera de horario: FALTA
      5. Registra la asistencia en base de datos.
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
            mensaje=f"⚠️ Asistencia ya registrada hoy a las {hora_str} [{existente.estado.value}]",
            ya_registrado=True,
        )

    # 3 — Determinar la hora efectiva de marcación
    if hora_simulada:
        partes = hora_simulada.strip().split(":")
        ahora_hora = time(int(partes[0]), int(partes[1]))
    else:
        ahora_hora = datetime.now().time()

    # 4 — Evaluación automática de horario si no se forzó un estado manual
    target_capilla_id = capilla_id or inscripcion.capilla_id
    if not estado or not observacion:
        estado_auto, obs_auto, msg_auto = await evaluar_horario_marcado(
            db, target_capilla_id, ahora_hora, hoy, tipo_sacramento=inscripcion.tipo_sacramento
        )
        estado_final = estado or estado_auto
        obs_final = observacion or obs_auto
        mensaje_final = msg_auto
    else:
        estado_final = estado
        obs_final = observacion
        mensaje_final = f"Marcación registrada como {estado_final.value} ({obs_final})"

    # 5 — Crear nuevo registro de asistencia
    nueva_asistencia = Asistencia(
        inscripcion_id=inscripcion.id,
        fecha=hoy,
        hora=ahora_hora,
        estado=estado_final,
        observacion=obs_final,
        registrado_por_id=usuario_id,
    )
    db.add(nueva_asistencia)
    await db.commit()
    await db.refresh(nueva_asistencia)

    hora_str = nueva_asistencia.hora.strftime('%H:%M')
    return AsistenciaScanResponse(
        asistencia_id=nueva_asistencia.id,
        persona_id=persona.id,
        nombre_completo=nombre_completo,
        tipo_sacramento=inscripcion.tipo_sacramento.value,
        fecha=nueva_asistencia.fecha,
        hora=nueva_asistencia.hora,
        estado=nueva_asistencia.estado,
        mensaje=f"✓ {nueva_asistencia.estado.value} — {obs_final} a las {hora_str}. {mensaje_final}",
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


# ─── Módulo Visual Heatmap & Detalle por Días y Meses ──────────────────────────

MESES_ES = [
    "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]
DIAS_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]


async def get_asistencias_heatmap(
    db: AsyncSession,
    gestion: int = 2026,
    capilla_id: int = 1
) -> AsistenciaHeatmapResponse:
    """
    Construye la matriz visual anual para todas las semanas/domingos
    del año formativo pastoral, computando asistencias, atrasos y asignando
    automáticamente FALTA para catecúmenos que no hayan registrado asistencia en domingos pasados.
    """
    hoy = date.today()

    # 1. Obtener Capilla
    capilla_res = await db.execute(select(Capilla).where(Capilla.id == capilla_id))
    capilla = capilla_res.scalar_one_or_none()
    capilla_nombre = capilla.nombre if capilla else "Parroquia Jesús Obrero"

    # 2. Obtener inscripciones activas para la capilla y gestión
    insc_query = select(Inscripcion).where(
        Inscripcion.gestion == gestion,
        Inscripcion.estado == EstadoInscripcion.ACTIVO
    )
    if capilla_id == 1:
        insc_query = insc_query.where(
            (Inscripcion.capilla_id == 1) | (Inscripcion.capilla_id.is_(None))
        )
    else:
        insc_query = insc_query.where(Inscripcion.capilla_id == capilla_id)

    insc_res = await db.execute(insc_query)
    inscripciones = insc_res.scalars().all()
    total_catecumenos = len(inscripciones)
    insc_ids = [i.id for i in inscripciones]

    # 3. Obtener todas las asistencias registradas para estas inscripciones en el año
    fecha_inicio_ano = date(gestion, 1, 1)
    fecha_fin_ano = date(gestion, 12, 31)

    asist_map = {}
    if insc_ids:
        asist_q = select(Asistencia).where(
            Asistencia.inscripcion_id.in_(insc_ids),
            Asistencia.fecha >= fecha_inicio_ano,
            Asistencia.fecha <= fecha_fin_ano
        )
        asist_res = await db.execute(asist_q)
        for a in asist_res.scalars().all():
            asist_map[(a.inscripcion_id, a.fecha)] = a

    # 4. Generar todos los domingos del año de gestión
    domingos_heatmap: List[AsistenciaDiaHeatmap] = []
    
    # Encontrar primer domingo del año
    d = date(gestion, 1, 1)
    while d.weekday() != 6:
        d += timedelta(days=1)

    numero_sesion = 0
    total_sesiones_pasadas = 0
    suma_porcentajes_pasadas = 0.0

    while d.year == gestion:
        es_pasado = d < hoy
        es_hoy = d == hoy
        es_futuro = d > hoy

        # Sesiones dominicales oficiales (Marzo a Noviembre o con registros previos)
        asistencias_en_fecha = [
            a for (iid, f), a in asist_map.items() if f == d
        ]
        es_ciclo_activo = (d >= date(gestion, 3, 1) and d <= date(gestion, 11, 30)) or len(asistencias_en_fecha) > 0

        if es_ciclo_activo:
            numero_sesion += 1
            cur_sesion = numero_sesion
        else:
            cur_sesion = None

        presentes = 0
        atrasos = 0
        faltas = 0

        if es_ciclo_activo and total_catecumenos > 0:
            for iid in insc_ids:
                reg = asist_map.get((iid, d))
                if reg:
                    if reg.estado == EstadoAsistencia.PRESENTE:
                        presentes += 1
                    elif reg.estado == EstadoAsistencia.ATRASO:
                        atrasos += 1
                    elif reg.estado == EstadoAsistencia.FALTA:
                        faltas += 1
                else:
                    # Regla obligatoria: si no tiene asistencia en un domingo pasado de Jesús Obrero, es FALTA
                    if es_pasado:
                        faltas += 1
                    elif es_hoy and datetime.now().time() > time(13, 0):
                        faltas += 1

            asistieron = presentes + atrasos
            porcentaje = round((asistieron / total_catecumenos) * 100, 1)

            # Nivel de actividad para heatmap estilo GitHub commits
            if es_futuro or not es_ciclo_activo:
                nivel = 0
            elif porcentaje >= 85:
                nivel = 4
            elif porcentaje >= 70:
                nivel = 3
            elif porcentaje >= 50:
                nivel = 2
            else:
                nivel = 1  # Baja asistencia o predominio de faltas

            if es_pasado and es_ciclo_activo:
                total_sesiones_pasadas += 1
                suma_porcentajes_pasadas += porcentaje
        else:
            porcentaje = 0.0
            nivel = 0

        domingos_heatmap.append(
            AsistenciaDiaHeatmap(
                fecha=d,
                dia_numero=d.day,
                mes=d.month,
                es_domingo=True,
                numero_sesion=cur_sesion,
                total_esperados=total_catecumenos if es_ciclo_activo else 0,
                total_presentes=presentes,
                total_atrasos=atrasos,
                total_faltas=faltas,
                porcentaje=porcentaje,
                nivel_actividad=nivel,
                es_pasado=es_pasado,
                es_hoy=es_hoy,
                es_futuro=es_futuro,
            )
        )
        d += timedelta(days=7)

    # 5. Resúmenes mensuales
    meses_resumen: List[AsistenciaMesResumen] = []
    for m in range(1, 13):
        domingos_mes = [dia for dia in domingos_heatmap if dia.mes == m and dia.numero_sesion is not None]
        total_ses = len(domingos_mes)
        pres_m = sum(dia.total_presentes for dia in domingos_mes)
        atra_m = sum(dia.total_atrasos for dia in domingos_mes)
        falt_m = sum(dia.total_faltas for dia in domingos_mes)
        
        dias_evaluados = [dia for dia in domingos_mes if dia.es_pasado or dia.es_hoy]
        prom_m = round(
            sum(dia.porcentaje for dia in dias_evaluados) / len(dias_evaluados), 1
        ) if dias_evaluados else 0.0

        meses_resumen.append(
            AsistenciaMesResumen(
                mes=m,
                mes_nombre=MESES_ES[m],
                total_sesiones=total_ses,
                total_presentes=pres_m,
                total_atrasos=atra_m,
                total_faltas=falt_m,
                porcentaje_promedio=prom_m,
            )
        )

    tasa_anual = round(
        suma_porcentajes_pasadas / total_sesiones_pasadas, 1
    ) if total_sesiones_pasadas > 0 else 0.0

    return AsistenciaHeatmapResponse(
        gestion=gestion,
        capilla_id=capilla_id,
        capilla_nombre=capilla_nombre,
        total_catecumenos=total_catecumenos,
        tasa_anual=tasa_anual,
        total_sesiones=numero_sesion,
        meses=meses_resumen,
        domingos=domingos_heatmap,
    )


async def get_asistencias_detalle_fecha(
    db: AsyncSession,
    fecha: date,
    capilla_id: int = 1
) -> AsistenciaDetalleFechaResponse:
    """
    Retorna el listado nominal completo de catecúmenos para una fecha exacta.
    Para catecúmenos que asistieron: muestra su hora exacta (HH:MM:SS), estado y observación.
    Para catecúmenos sin registro en un domingo de Jesús Obrero:
    asigna automáticamente estado FALTA con hora '—' y observación de inasistencia.
    """
    hoy = date.today()
    dia_idx = fecha.weekday()
    dia_nombre = DIAS_ES[dia_idx]
    es_domingo = (dia_idx == 6)

    # 1. Capilla
    capilla_res = await db.execute(select(Capilla).where(Capilla.id == capilla_id))
    capilla = capilla_res.scalar_one_or_none()
    capilla_nombre = capilla.nombre if capilla else "Parroquia Jesús Obrero"

    # 2. Inscripciones activas de la capilla
    insc_query = (
        select(Inscripcion)
        .where(Inscripcion.estado == EstadoInscripcion.ACTIVO)
        .options(
            selectinload(Inscripcion.persona),
            selectinload(Inscripcion.grupo)
        )
    )
    if capilla_id == 1:
        insc_query = insc_query.where(
            (Inscripcion.capilla_id == 1) | (Inscripcion.capilla_id.is_(None))
        )
    else:
        insc_query = insc_query.where(Inscripcion.capilla_id == capilla_id)

    insc_res = await db.execute(insc_query)
    inscripciones = insc_res.scalars().all()
    total_esperados = len(inscripciones)

    # 3. Asistencias registradas en esa fecha
    insc_ids = [i.id for i in inscripciones]
    asist_map = {}
    if insc_ids:
        asist_q = select(Asistencia).where(
            Asistencia.inscripcion_id.in_(insc_ids),
            Asistencia.fecha == fecha
        )
        asist_res = await db.execute(asist_q)
        for a in asist_res.scalars().all():
            asist_map[a.inscripcion_id] = a

    items: List[AsistenciaDetalleItem] = []
    presentes = 0
    atrasos = 0
    faltas = 0

    es_pasado_o_hoy = (fecha <= hoy)

    for insc in inscripciones:
        p = insc.persona
        nombre_completo = f"{p.nombres} {p.primer_apellido} {p.segundo_apellido or ''}".strip()
        grupo_nombre = insc.grupo.nombre_santo if insc.grupo and insc.grupo.nombre_santo else (insc.grupo.nombre if insc.grupo else "Sin subgrupo")
        tipo_sacramento_str = "1ª Comunión" if insc.tipo_sacramento.value == "PRIMERA_COMUNION" else "Confirmación"

        reg = asist_map.get(insc.id)
        if reg:
            if reg.estado == EstadoAsistencia.PRESENTE:
                presentes += 1
            elif reg.estado == EstadoAsistencia.ATRASO:
                atrasos += 1
            elif reg.estado == EstadoAsistencia.FALTA:
                faltas += 1

            hora_formateada = reg.hora.strftime('%H:%M:%S')
            items.append(
                AsistenciaDetalleItem(
                    id=reg.id,
                    persona_id=p.id,
                    inscripcion_id=insc.id,
                    nombre_completo=nombre_completo,
                    tipo_sacramento=tipo_sacramento_str,
                    grupo_nombre=grupo_nombre,
                    fecha=fecha,
                    hora=reg.hora,
                    hora_str=hora_formateada,
                    estado=reg.estado.value,
                    observacion=reg.observacion or ("Puntual (Antes de la Misa)" if reg.estado == EstadoAsistencia.PRESENTE else "Durante la Misa"),
                    es_falta_automatica=False,
                )
            )
        else:
            # Sin marcación en esa fecha
            if es_pasado_o_hoy:
                faltas += 1
                items.append(
                    AsistenciaDetalleItem(
                        id=None,
                        persona_id=p.id,
                        inscripcion_id=insc.id,
                        nombre_completo=nombre_completo,
                        tipo_sacramento=tipo_sacramento_str,
                        grupo_nombre=grupo_nombre,
                        fecha=fecha,
                        hora=None,
                        hora_str="—",
                        estado="FALTA",
                        observacion="Inasistencia no registrada (Falta dominical automática)",
                        es_falta_automatica=True,
                    )
                )
            else:
                items.append(
                    AsistenciaDetalleItem(
                        id=None,
                        persona_id=p.id,
                        inscripcion_id=insc.id,
                        nombre_completo=nombre_completo,
                        tipo_sacramento=tipo_sacramento_str,
                        grupo_nombre=grupo_nombre,
                        fecha=fecha,
                        hora=None,
                        hora_str="—",
                        estado="PENDIENTE",
                        observacion="Sesión dominical futura programada",
                        es_falta_automatica=False,
                    )
                )

    # Ordenar: primero presentes (por hora asc), luego atrasos, luego faltas
    order_priority = {"PRESENTE": 1, "ATRASO": 2, "JUSTIFICADO": 3, "FALTA": 4, "PENDIENTE": 5}
    items.sort(key=lambda x: (order_priority.get(x.estado, 9), x.hora or time(23, 59), x.nombre_completo))

    asistieron = presentes + atrasos
    porcentaje = round((asistieron / total_esperados) * 100, 1) if total_esperados > 0 else 0.0

    fecha_formateada = f"{dia_nombre} {fecha.day} de {MESES_ES[fecha.month]}, {fecha.year}"

    return AsistenciaDetalleFechaResponse(
        fecha=fecha,
        fecha_formateada=fecha_formateada,
        dia_semana=dia_nombre,
        es_domingo=es_domingo,
        capilla_id=capilla_id,
        capilla_nombre=capilla_nombre,
        total_esperados=total_esperados,
        presentes=presentes,
        atrasos=atrasos,
        faltas=faltas,
        porcentaje=porcentaje,
        items=items,
    )
