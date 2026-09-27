"""
Script para inicializar las Capillas y sus Horarios de Asistencia (Sede Central y Filiales).
Uso:
    python backend/scripts/seed_capillas_horarios.py
"""

import sys
import os
import asyncio
from datetime import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal, engine, Base
from app.modules.capillas_grupos.models import Capilla, HorarioAsistencia, DiaSemana

CAPILLAS_DATA = [
    {
        "nombre": "Parroquia Jesús Obrero (Sede Central)",
        "codigo": "JO-CENTRAL",
        "direccion": "Plaza Principal Jesús Obrero, Av. 16 de Julio",
        "es_sede_principal": True,
        "descripcion": "Sede principal y parroquia central de la comunidad.",
        "horarios": [
            {
                "dia_semana": DiaSemana.DOMINGO,
                "hora_inicio_puntual": time(9, 20),
                "hora_fin_puntual": time(10, 10),
                "hora_inicio_misa": time(10, 11),
                "hora_fin_misa": time(12, 0),
                "hora_inicio_catequesis": time(12, 1),
                "hora_fin_catequesis": time(13, 0),
                "descripcion_misa": "Misa Dominical Comunitaria y de Familias",
                "descripcion_catequesis": "Encuentro de Formación y Catequesis",
            }
        ]
    },
    {
        "nombre": "Capilla San Martín de Porres",
        "codigo": "CAP-SMP",
        "direccion": "Zona Villa Esperanza, Calle 4",
        "es_sede_principal": False,
        "descripcion": "Capilla filial de San Martín de Porres.",
        "horarios": [
            {
                "dia_semana": DiaSemana.SABADO,
                "hora_inicio_puntual": time(15, 0),
                "hora_fin_puntual": time(15, 45),
                "hora_inicio_misa": time(15, 46),
                "hora_fin_misa": time(17, 0),
                "hora_inicio_catequesis": time(17, 1),
                "hora_fin_catequesis": time(18, 0),
                "descripcion_misa": "Misa Sabatina de Jóvenes y Familias",
                "descripcion_catequesis": "Catequesis de Primera Comunión y Confirmación",
            }
        ]
    },
    {
        "nombre": "Capilla Señor de la Santa Cruz",
        "codigo": "CAP-SSC",
        "direccion": "Zona Santa Cruz, Av. Cívica",
        "es_sede_principal": False,
        "descripcion": "Capilla filial del Señor de la Santa Cruz.",
        "horarios": [
            {
                "dia_semana": DiaSemana.DOMINGO,
                "hora_inicio_puntual": time(7, 30),
                "hora_fin_puntual": time(8, 15),
                "hora_inicio_misa": time(8, 16),
                "hora_fin_misa": time(9, 30),
                "hora_inicio_catequesis": time(9, 31),
                "hora_fin_catequesis": time(10, 30),
                "descripcion_misa": "Misa Matutina de la Aurora",
                "descripcion_catequesis": "Catequesis Parroquial Dominical",
            }
        ]
    },
    {
        "nombre": "Capilla Santa María Magdalena",
        "codigo": "CAP-SMM",
        "direccion": "Zona San Juan, Calle Magisterio",
        "es_sede_principal": False,
        "descripcion": "Capilla filial de Santa María Magdalena.",
        "horarios": [
            {
                "dia_semana": DiaSemana.SABADO,
                "hora_inicio_puntual": time(9, 0),
                "hora_fin_puntual": time(9, 50),
                "hora_inicio_misa": time(9, 51),
                "hora_fin_misa": time(11, 15),
                "hora_inicio_catequesis": time(11, 16),
                "hora_fin_catequesis": time(12, 15),
                "descripcion_misa": "Misa Comunitaria Sabatina",
                "descripcion_catequesis": "Catequesis Familiar",
            }
        ]
    },
]


async def seed_capillas_horarios():
    print("=" * 65)
    print("Inicializando Capillas y Horarios de Asistencia...")
    print("=" * 65)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        for item in CAPILLAS_DATA:
            res = await db.execute(
                select(Capilla).where(Capilla.codigo == item["codigo"]).options(selectinload(Capilla.horarios))
            )
            capilla = res.scalar_one_or_none()

            if not capilla:
                capilla = Capilla(
                    nombre=item["nombre"],
                    codigo=item["codigo"],
                    direccion=item["direccion"],
                    es_sede_principal=item["es_sede_principal"],
                    descripcion=item["descripcion"],
                    activo=True,
                )
                db.add(capilla)
                await db.flush()

                for h_data in item["horarios"]:
                    horario = HorarioAsistencia(
                        capilla_id=capilla.id,
                        dia_semana=h_data["dia_semana"],
                        hora_inicio_puntual=h_data["hora_inicio_puntual"],
                        hora_fin_puntual=h_data["hora_fin_puntual"],
                        hora_inicio_misa=h_data["hora_inicio_misa"],
                        hora_fin_misa=h_data["hora_fin_misa"],
                        hora_inicio_catequesis=h_data["hora_inicio_catequesis"],
                        hora_fin_catequesis=h_data["hora_fin_catequesis"],
                        descripcion_misa=h_data["descripcion_misa"],
                        descripcion_catequesis=h_data["descripcion_catequesis"],
                        activo=True,
                    )
                    db.add(horario)

                print(f"[NUEVA CAPILLA] {capilla.nombre} ({capilla.codigo}) creada con {len(item['horarios'])} horario(s).")
            else:
                capilla.nombre = item["nombre"]
                capilla.direccion = item["direccion"]
                capilla.es_sede_principal = item["es_sede_principal"]
                capilla.descripcion = item["descripcion"]
                print(f"[CAPILLA EXISTENTE] {capilla.nombre} ({capilla.codigo}) actualizada.")

        await db.commit()
        print("=" * 65)
        print("Capillas y Horarios sincronizados con éxito.")
        print("=" * 65)


if __name__ == "__main__":
    asyncio.run(seed_capillas_horarios())
