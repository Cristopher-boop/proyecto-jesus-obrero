"""
Script de verificación de datos de catecúmenos.
"""

import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal
from app.modules.catecumenos.service import list_catecumenos

async def check():
    async with AsyncSessionLocal() as db:
        res = await list_catecumenos(db, limit=50)
        print(f"Total catecúmenos en BD: {res.total}")
        for i, item in enumerate(res.items, 1):
            nom = f"{item.nombres} {item.primer_apellido} {item.segundo_apellido or ''}".strip()
            docs = f"Form:{item.doc_formulario_inscripcion} Baut:{item.doc_fe_bautismo} Nac:{item.doc_cert_nacimiento} Mat:{item.doc_cert_matrimonio_padres} CI:{item.doc_ci_nino}"
            print(f"{i:2d}. {nom:<35} | Baut:{str(item.es_bautizado):<5} | Lib/Cuad:{item.libro_comprado}/{item.cuadernillo_comprado} | {docs} | Tutor: {item.tutor_nombre} ({item.tutor_telefono}) | QR: {item.token_qr}")

if __name__ == "__main__":
    asyncio.run(check())
