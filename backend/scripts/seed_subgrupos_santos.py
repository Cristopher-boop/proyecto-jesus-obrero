"""
Script para inicializar los 4 subgrupos de Santos de la Capilla Jesús Obrero (2026 - 2do Año)
y distribuir a los catecúmenos por fecha de nacimiento (edad).
Uso:
    python backend/scripts/seed_subgrupos_santos.py
"""

import sys
import os
import asyncio
from datetime import date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal
from app.modules.personas.models import Persona, Inscripcion, EtapaFormacion, TipoSacramento
from app.modules.capillas_grupos.models import Capilla, Grupo
from app.modules.capillas_grupos.schemas import AutoAgruparPayload
from app.modules.capillas_grupos.service import auto_agrupar_por_edad

SANTOS_2026_SEGUNDO_ANO = [
    "Juan Don Bosco",
    "San Nicolás",
    "San Pablo",
    "San Francisco de Asís"
]

async def seed_subgrupos():
    print("=" * 65)
    print("Inicializando Subgrupos de Santos para Jesús Obrero (2026 - 2do Año)...")
    print("=" * 65)

    async with AsyncSessionLocal() as db:
        # 1. Obtener Capilla Jesús Obrero (Sede Central)
        res_jo = await db.execute(
            select(Capilla).where(Capilla.es_sede_principal == True)
        )
        jo = res_jo.scalar_one_or_none()
        if not jo:
            res_any = await db.execute(select(Capilla).where(Capilla.codigo == "JO-CENTRAL"))
            jo = res_any.scalar_one_or_none()

        if not jo:
            print("[ERROR] No se encontró la Capilla Sede Central Jesús Obrero.")
            return

        print(f"[CAPILLA]: {jo.nombre} (ID: {jo.id})")

        # 2. Asegurar que las inscripciones activas tengan etapa SEGUNDO_ANO y gestion 2026 y capilla_id
        res_inscs = await db.execute(
            select(Inscripcion).options(selectinload(Inscripcion.persona))
        )
        inscs = res_inscs.scalars().all()
        print(f"Total inscripciones encontradas en BD: {len(inscs)}")

        for ins in inscs:
            ins.capilla_id = jo.id
            ins.gestion = 2026
            ins.etapa = EtapaFormacion.SEGUNDO_ANO
            ins.tipo_sacramento = TipoSacramento.PRIMERA_COMUNION

        await db.commit()

        # 3. Ejecutar algoritmo pastoral de auto-agrupación por edad
        payload = AutoAgruparPayload(
            gestion=2026,
            etapa=EtapaFormacion.SEGUNDO_ANO,
            tipo_sacramento=TipoSacramento.PRIMERA_COMUNION,
            cantidad_grupos=4,
            nombres_santos=SANTOS_2026_SEGUNDO_ANO
        )

        res_grupos = await auto_agrupar_por_edad(db, jo.id, payload)
        print("\n" + "=" * 65)
        print(f"Subgrupos generados y conformados para {jo.nombre}:")
        print("=" * 65)

        for g in res_grupos.items:
            print(f"\n* Subgrupo: {g.nombre} (Codigo: {g.codigo}) | {g.etapa.value} - Gestion {g.gestion}")
            print(f"  Rango de edad: {g.edad_minima or '—'} a {g.edad_maxima or '—'} años ({g.total_catecumenos} catecúmenos)")
            for c in g.catecumenos:
                fnac = c.fecha_nacimiento.strftime('%d/%m/%Y') if c.fecha_nacimiento else 'S/F'
                print(f"    - {c.nombre_completo:<35} | Nac: {fnac} | Edad: {c.edad or '—'} años")

        print("\n" + "=" * 65)
        print("Subgrupos configurados y asignados exitosamente.")
        print("=" * 65)

if __name__ == "__main__":
    asyncio.run(seed_subgrupos())
