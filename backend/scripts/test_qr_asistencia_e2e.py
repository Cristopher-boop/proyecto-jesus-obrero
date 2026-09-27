"""
Prueba E2E del escaneo QR con evaluación de horarios de asistencia.
"""

import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal
from app.modules.catecumenos.service import list_catecumenos
from app.modules.asistencias.service import registrar_asistencia_qr
from app.modules.capillas_grupos.service import list_capillas

async def test_e2e():
    async with AsyncSessionLocal() as db:
        # 1. Obtener un catecúmeno de prueba
        cats = await list_catecumenos(db, limit=1)
        if not cats.items:
            print("No hay catecúmenos en BD.")
            return

        cat = cats.items[0]
        token = cat.token_qr
        print(f"Probando escaneo QR con catecúmeno: {cat.nombres} {cat.primer_apellido} (Token: {token})")

        # 2. Obtener Capilla Jesús Obrero
        capillas = await list_capillas(db)
        jo = capillas.items[0]

        # 3. Probar registro simulado en franja Puntual (09:35)
        res = await registrar_asistencia_qr(
            db,
            token_qr=token,
            capilla_id=jo.id,
            hora_simulada="09:35"
        )
        print(f"\n[RESULTADO ESCANEO QR]:")
        print(f"- Catecúmeno: {res.nombre_completo}")
        print(f"- Hora: {res.hora.strftime('%H:%M')}")
        print(f"- Estado: {res.estado.value}")
        print(f"- Mensaje: {res.mensaje}")
        print(f"- Ya registrado?: {res.ya_registrado}")

if __name__ == "__main__":
    asyncio.run(test_e2e())
