"""
Script para poblar asistencias dominicales realistas para la gestión 2026 en Jesús Obrero.
Genera registros de domingos pasados (Marzo 2026 a Septiembre 2026)
con horas exactas de escaneo QR (09:20 a 10:30), estados PRESENTE, ATRASO y FALTAS.
"""

import sys
import os
import random
import asyncio
from datetime import date, time, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.modules.personas.models import Inscripcion, EstadoInscripcion
from app.modules.asistencias.models import Asistencia, EstadoAsistencia
import app.modules.capillas_grupos.models


async def seed_asistencias():
    async with AsyncSessionLocal() as db:
        # 1. Obtener catecúmenos activos de Jesús Obrero
        q = (
            select(Inscripcion)
            .where(
                Inscripcion.gestion == 2026,
                Inscripcion.estado == EstadoInscripcion.ACTIVO
            )
            .options(selectinload(Inscripcion.persona))
        )
        res = await db.execute(q)
        inscripciones = res.scalars().all()

        if not inscripciones:
            print("No se encontraron inscripciones activas.")
            return

        print(f"Poblando asistencias para {len(inscripciones)} catecúmenos...")

        # 2. Generar todos los domingos pasados desde 1 de marzo 2026 hasta 27 de septiembre 2026
        hoy = date(2026, 9, 28)
        domingo_actual = date(2026, 3, 1)
        domingos_pasados = []

        while domingo_actual < hoy:
            domingos_pasados.append(domingo_actual)
            domingo_actual += timedelta(days=7)

        print(f"Total de domingos evaluados en el ciclo: {len(domingos_pasados)}")

        # 3. Obtener asistencias ya existentes para no duplicar
        existentes_res = await db.execute(select(Asistencia.inscripcion_id, Asistencia.fecha))
        existentes = set(existentes_res.all())

        nuevas_asistencias = 0

        # Para que los datos sean reproducibles y coherentes
        random.seed(42)

        for d in domingos_pasados:
            # Determinamos tasa de asistencia general del domingo (entre 80% y 95%)
            # Excepto en vacaciones de invierno (julio) donde baja un poco (73%)
            if d.month == 7:
                prob_asistencia = 0.75
            elif d.month == 4 and d.day == 5: # Pascua de Resurrección
                prob_asistencia = 1.00 # Quorum completo
            else:
                prob_asistencia = 0.88

            for insc in inscripciones:
                if (insc.id, d) in existentes:
                    continue

                # Determinar si asistió o faltó
                r = random.random()
                if r <= prob_asistencia:
                    # Asistió: 85% puntual, 15% con atraso
                    es_puntual = (random.random() < 0.86)
                    if es_puntual:
                        # Hora entre 09:22:15 y 09:56:45
                        h = 9
                        m = random.randint(22, 56)
                        s = random.randint(0, 59)
                        estado = EstadoAsistencia.PRESENTE
                        obs = "Puntual (Antes de la Misa)"
                    else:
                        # Hora entre 10:12:00 y 10:48:30 (Durante la Misa)
                        h = 10
                        m = random.randint(12, 48)
                        s = random.randint(0, 59)
                        estado = EstadoAsistencia.ATRASO
                        obs = "Durante la Misa dominical (Atraso)"

                    asist = Asistencia(
                        inscripcion_id=insc.id,
                        fecha=d,
                        hora=time(h, m, s),
                        estado=estado,
                        observacion=obs,
                    )
                    db.add(asist)
                    nuevas_asistencias += 1
                else:
                    # Falta: en la BD no necesariamente se inserta o se inserta FALTA
                    # Para dejar constancia en algunos casos con observación de falta justificada o falta
                    if random.random() < 0.30: # 30% de faltas justificadas
                        asist = Asistencia(
                            inscripcion_id=insc.id,
                            fecha=d,
                            hora=time(9, 30, 0),
                            estado=EstadoAsistencia.JUSTIFICADO,
                            observacion="Permiso de viaje o salud comunicado por el tutor",
                        )
                        db.add(asist)
                        nuevas_asistencias += 1
                    # Las demás quedan sin registro en la tabla, y el servicio las computa automáticamente como FALTA

        await db.commit()
        print(f"✓ Éxito: Se crearon {nuevas_asistencias} registros históricos de asistencia dominical.")


if __name__ == "__main__":
    asyncio.run(seed_asistencias())
