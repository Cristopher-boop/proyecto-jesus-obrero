"""
Script para registrar a todos los tutores/padres existentes en la base de datos como Feligreses (con cuenta de Usuario y Rol TUTOR).
Uso:
    python scripts/seed_tutores_feligreses.py
"""

import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.modules.personas.models import (
    Persona, Usuario, Rol, NombreRol, EstadoUsuario, RelacionFamiliar
)
from app.modules.feligreses.service import _generate_username


async def seed_tutores_feligreses():
    print("=" * 60)
    print("Sincronizando Padres/Tutores como Feligreses (Usuarios con Rol TUTOR)...")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        # 1. Asegurar que existe el Rol TUTOR
        res = await db.execute(select(Rol).where(Rol.nombre == NombreRol.TUTOR))
        rol_tutor = res.scalar_one_or_none()
        if not rol_tutor:
            rol_tutor = Rol(nombre=NombreRol.TUTOR, descripcion="Padre, madre o tutor con acceso al portal")
            db.add(rol_tutor)
            await db.flush()

        # 2. Obtener todos los tutores vinculados en RelacionFamiliar
        res = await db.execute(
            select(Persona)
            .join(RelacionFamiliar, RelacionFamiliar.tutor_persona_id == Persona.id)
            .options(selectinload(Persona.usuario).selectinload(Usuario.roles))
            .distinct()
        )
        tutores = res.scalars().all()

        creados = 0
        ya_existian = 0

        for tutor in tutores:
            if not tutor.usuario:
                # Generar username
                username = await _generate_username(db, tutor.nombres, tutor.primer_apellido or "Tutor")
                # Contraseña temporal
                temp_password = f"JO-{tutor.ci_dni}" if tutor.ci_dni else f"JO-tutor{tutor.id}"
                
                usuario = Usuario(
                    persona_id=tutor.id,
                    username=username,
                    email=None,
                    password_hash=hash_password(temp_password),
                    estado=EstadoUsuario.ACTIVO,
                )
                usuario.roles.append(rol_tutor)
                db.add(usuario)
                await db.flush()
                creados += 1
                print(f"[FELIGRÉS CREADO] {tutor.nombres} {tutor.primer_apellido or ''} -> Usuario: '{username}', Clave temp: '{temp_password}'")
            else:
                # Asegurar que tenga el rol TUTOR
                if rol_tutor not in tutor.usuario.roles:
                    tutor.usuario.roles.append(rol_tutor)
                ya_existian += 1
                print(f"[YA EXISTÍA] {tutor.nombres} {tutor.primer_apellido or ''} -> Usuario: '{tutor.usuario.username}'")

        await db.commit()
        print("=" * 60)
        print(f"Sincronización completada: {creados} nuevos usuarios feligreses creados, {ya_existian} ya contaban con usuario.")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_tutores_feligreses())
