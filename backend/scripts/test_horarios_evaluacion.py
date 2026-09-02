"""
Prueba unitaria rápida de la evaluación de horarios por Capilla.
"""

import sys
import os
import asyncio
from datetime import time, date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal
from app.modules.capillas_grupos.service import evaluar_horario_marcado, list_capillas

async def test():
    async with AsyncSessionLocal() as db:
        capillas_res = await list_capillas(db)
        print("=" * 65)
        print(f"Total Capillas en Sistema: {capillas_res.total}")
        for c in capillas_res.items:
            print(f"- {c.nombre} (Principal={c.es_sede_principal}) | Horarios activos: {len(c.horarios)}")
            for h in c.horarios:
                print(f"    * {h.dia_semana.value}: Puntual[{h.hora_inicio_puntual}-{h.hora_fin_puntual}] | Misa[{h.hora_inicio_misa}-{h.hora_fin_misa}] | Catequesis[{h.hora_inicio_catequesis}-{h.hora_fin_catequesis}]")
        print("=" * 65)

        # Prueba con Jesús Obrero (Sede Central)
        jo_id = capillas_res.items[0].id
        domingo = date(2026, 8, 30) # Domingo

        horas_prueba = [
            (time(9, 35), "Puntual esperada"),
            (time(10, 45), "Durante Misa esperada"),
            (time(12, 15), "Atraso Catequesis esperada"),
            (time(14, 0), "Falta esperada"),
        ]

        print(f"\n--- Pruebas de Evaluación de Horarios para {capillas_res.items[0].nombre} ---")
        for h, exp in horas_prueba:
            estado, obs, msg = await evaluar_horario_marcado(db, jo_id, h, domingo)
            print(f"Hora {h.strftime('%H:%M')} [{exp}] -> Estado: {estado.value:<10} | Obs: {obs:<32} | Detalle: {msg}")

if __name__ == "__main__":
    asyncio.run(test())
