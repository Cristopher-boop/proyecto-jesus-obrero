"""
Script para listar y verificar a los Feligreses (Padres/Tutores) en la base de datos.
"""

import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal
from app.modules.feligreses.service import list_feligreses

async def check():
    async with AsyncSessionLocal() as db:
        res = await list_feligreses(db, limit=50)
        print("=" * 70)
        print(f"Total Feligreses registrados en el sistema: {res.total}")
        print("=" * 70)
        for i, item in enumerate(res.items, 1):
            nom = f"{item.nombres} {item.primer_apellido} {item.segundo_apellido or ''}".strip()
            print(f"{i:2d}. {nom:<35} | Username: {item.username:<15} | Hijos vinculados: {item.total_hijos} | Tel: {item.telefono or 'S/N'}")
        print("=" * 70)

if __name__ == "__main__":
    asyncio.run(check())
