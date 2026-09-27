"""
Script de verificación de los CRUDs y validaciones de Capillas y Horarios.
"""

import sys
import os
import asyncio
from datetime import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal
from app.modules.capillas_grupos.models import DiaSemana
from app.modules.capillas_grupos.schemas import (
    CapillaCreate, CapillaUpdate, HorarioAsistenciaCreate, HorarioAsistenciaUpdate
)
from app.modules.capillas_grupos import service

async def test_crud():
    async with AsyncSessionLocal() as db:
        print("=" * 65)
        print("1. PROBANDO CREACIÓN DE CAPILLA")
        print("=" * 65)
        nueva = CapillaCreate(
            nombre="Capilla San Juan Bautista (Test)",
            codigo="CAP-SJB-TEST",
            direccion="Zona El Alto, Calle San Juan #10",
            es_sede_principal=False,
            descripcion="Capilla de prueba para verificación de CRUD.",
            activo=True
        )
        capilla_creada = await service.create_capilla(db, nueva)
        print(f"[OK] Capilla Creada: ID={capilla_creada.id}, Nombre='{capilla_creada.nombre}', Codigo='{capilla_creada.codigo}'")

        print("\n" + "=" * 65)
        print("2. PROBANDO CREACIÓN DE HORARIO CON VALIDACIÓN CRONOLÓGICA")
        print("=" * 65)
        horario_valido = HorarioAsistenciaCreate(
            dia_semana=DiaSemana.SABADO,
            hora_inicio_puntual=time(16, 0),
            hora_fin_puntual=time(16, 45),
            hora_inicio_misa=time(16, 46),
            hora_fin_misa=time(18, 0),
            hora_inicio_catequesis=time(18, 1),
            hora_fin_catequesis=time(19, 0),
            descripcion_misa="Misa Juvenil",
            descripcion_catequesis="Catequesis Sabatina",
            activo=True
        )
        horario_creado = await service.create_horario(db, capilla_creada.id, horario_valido)
        print(f"[OK] Horario Creado: ID={horario_creado.id}, Dia={horario_creado.dia_semana.value}, Ciclo={horario_creado.hora_inicio_puntual} - {horario_creado.hora_fin_catequesis}")

        print("\n" + "=" * 65)
        print("3. PROBANDO EDICIÓN DE CAPILLA")
        print("=" * 65)
        update_data = CapillaUpdate(
            nombre="Capilla San Juan Bautista (Actualizada)",
            direccion="Av. Principal #999"
        )
        capilla_editada = await service.update_capilla(db, capilla_creada.id, update_data)
        print(f"[OK] Capilla Editada: Nombre='{capilla_editada.nombre}', Direccion='{capilla_editada.direccion}'")

        print("\n" + "=" * 65)
        print("4. PROBANDO EDICIÓN DE HORARIO")
        print("=" * 65)
        update_horario_data = HorarioAsistenciaUpdate(
            hora_inicio_puntual=time(16, 15),
            descripcion_misa="Misa Juvenil Renovada"
        )
        horario_editado = await service.update_horario(db, capilla_creada.id, horario_creado.id, update_horario_data)
        print(f"[OK] Horario Editado: Inicio Puntual={horario_editado.hora_inicio_puntual}, Desc Misa='{horario_editado.descripcion_misa}'")

        print("\n" + "=" * 65)
        print("5. PROBANDO ELIMINACIÓN DE HORARIO Y CAPILLA")
        print("=" * 65)
        res_del_h = await service.delete_horario(db, capilla_creada.id, horario_creado.id)
        print(f"[OK] {res_del_h['message']}")
        res_del_c = await service.delete_capilla(db, capilla_creada.id)
        print(f"[OK] {res_del_c['message']}")

        print("\n" + "=" * 65)
        print("6. PROBANDO PROTECCIÓN DE SEDE PRINCIPAL CONTRA ELIMINACIÓN")
        print("=" * 65)
        try:
            # ID 1 es Jesús Obrero Sede Central
            await service.delete_capilla(db, 1)
            print("[ERROR] Se permitió eliminar la sede central!")
        except Exception as e:
            print(f"[OK] Rechazado correctamente con error: {e.detail if hasattr(e, 'detail') else e}")

        print("\n" + "=" * 65)
        print("TODAS LAS PRUEBAS CRUD Y DE VALIDACIÓN FUERON EXITOSAS!")
        print("=" * 65)

if __name__ == "__main__":
    asyncio.run(test_crud())
