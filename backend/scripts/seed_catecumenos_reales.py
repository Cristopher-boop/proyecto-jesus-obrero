"""
Script para la carga de datos reales de catecúmenos en la base de datos PostgreSQL.
Incluye creación de catecúmenos, tutores/padres, documentos, código QR único
y registro de tutores como Feligreses (Usuario con rol TUTOR).

Uso:
    python backend/scripts/seed_catecumenos_reales.py
"""

import sys
import os
import asyncio
import uuid
from datetime import date

# Agregar la raíz del backend al sys.path para importar app.*
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import hash_password
from app.modules.personas.models import (
    Persona, Usuario, Rol, NombreRol, EstadoUsuario,
    Inscripcion, RelacionFamiliar,
    Genero, Parentesco, TipoSacramento, EstadoInscripcion
)
from app.modules.feligreses.service import _generate_username

CATECUMENOS_DATA = [
    {
        "nombres": "Keith Arianna",
        "primer_apellido": "Anti",
        "segundo_apellido": "Apaza",
        "fecha_nacimiento": date(2015, 9, 14),
        "genero": Genero.FEMENINO,
        "docs": {
            "doc_formulario_inscripcion": True,
            "doc_fe_bautismo": True,
            "doc_cert_nacimiento": True,
            "doc_cert_matrimonio_padres": False,
            "doc_ci_nino": True,
        },
        "tutores": [
            {
                "nombres": "Gladys Roxana",
                "primer_apellido": "Apaza",
                "segundo_apellido": "Mamani",
                "telefono": "71230259",
                "parentesco": Parentesco.MAMA,
            },
            {
                "nombres": "Luis Fernando",
                "primer_apellido": "Anti",
                "segundo_apellido": "Pongo",
                "telefono": "71230259",
                "parentesco": Parentesco.PAPA,
            },
        ],
    },
    {
        "nombres": "Nathan Samael",
        "primer_apellido": "Canaviri",
        "segundo_apellido": "Zuleta",
        "fecha_nacimiento": date(2014, 9, 20),
        "genero": Genero.MASCULINO,
        "docs": {
            "doc_formulario_inscripcion": True,
            "doc_fe_bautismo": True,
            "doc_cert_nacimiento": True,
            "doc_cert_matrimonio_padres": False,
            "doc_ci_nino": False,
        },
        "tutores": [
            {
                "nombres": "Maria Elena",
                "primer_apellido": "Zuleta",
                "segundo_apellido": "Mamani",
                "telefono": "69852228",
                "parentesco": Parentesco.MAMA,
            },
        ],
    },
    {
        "nombres": "Gabriel Alejandro",
        "primer_apellido": "Condori",
        "segundo_apellido": "Laime",
        "fecha_nacimiento": date(2015, 10, 11),
        "genero": Genero.MASCULINO,
        "docs": {
            "doc_formulario_inscripcion": False,
            "doc_fe_bautismo": True,
            "doc_cert_nacimiento": True,
            "doc_cert_matrimonio_padres": True,
            "doc_ci_nino": True,
        },
        "tutores": [
            {
                "nombres": "Wilson",
                "primer_apellido": "Condori",
                "segundo_apellido": "Portuguez",
                "telefono": "78950522",
                "parentesco": Parentesco.PAPA,
            },
        ],
    },
    {
        "nombres": "Sebastian Kevin",
        "primer_apellido": "Huayna",
        "segundo_apellido": "Fernandez",
        "fecha_nacimiento": date(2016, 6, 15),
        "genero": Genero.MASCULINO,
        "docs": {
            "doc_formulario_inscripcion": False,
            "doc_fe_bautismo": False,
            "doc_cert_nacimiento": False,
            "doc_cert_matrimonio_padres": False,
            "doc_ci_nino": True,
        },
        "tutores": [
            {
                "nombres": "Ana Maria",
                "primer_apellido": "Fernandez",
                "segundo_apellido": None,
                "telefono": "74005076 - 71268888",
                "parentesco": Parentesco.MAMA,
            },
        ],
    },
    {
        "nombres": "Estiben",
        "primer_apellido": "Mamani",
        "segundo_apellido": "Mamani",
        "fecha_nacimiento": date(2016, 2, 12),
        "genero": Genero.MASCULINO,
        "docs": {
            "doc_formulario_inscripcion": True,
            "doc_fe_bautismo": False,
            "doc_cert_nacimiento": True,
            "doc_cert_matrimonio_padres": False,
            "doc_ci_nino": False,
        },
        "tutores": [
            {
                "nombres": "Eddy",
                "primer_apellido": "Mamani",
                "segundo_apellido": "Chirinos",
                "telefono": "79676448",
                "parentesco": Parentesco.PAPA,
            },
        ],
    },
    {
        "nombres": "Joan Matias",
        "primer_apellido": "Mamani",
        "segundo_apellido": "Quispe",
        "fecha_nacimiento": date(2015, 7, 28),
        "genero": Genero.MASCULINO,
        "docs": {
            "doc_formulario_inscripcion": True,
            "doc_fe_bautismo": True,
            "doc_cert_nacimiento": True,
            "doc_cert_matrimonio_padres": True,
            "doc_ci_nino": True,
        },
        "tutores": [
            {
                "nombres": "Diego Armando",
                "primer_apellido": "Mamani",
                "segundo_apellido": None,
                "telefono": "79595664",
                "parentesco": Parentesco.PAPA,
            },
        ],
    },
    {
        "nombres": "Cristhian Jaime",
        "primer_apellido": "Nina",
        "segundo_apellido": "Laura",
        "fecha_nacimiento": date(2014, 4, 30),
        "genero": Genero.MASCULINO,
        "docs": {
            "doc_formulario_inscripcion": True,
            "doc_fe_bautismo": True,
            "doc_cert_nacimiento": True,
            "doc_cert_matrimonio_padres": False,
            "doc_ci_nino": False,
        },
        "tutores": [
            {
                "nombres": "Javier",
                "primer_apellido": "Nina",
                "segundo_apellido": "Vino",
                "telefono": "69809743",
                "parentesco": Parentesco.PAPA,
            },
        ],
    },
    {
        "nombres": "Zaira Olivia",
        "primer_apellido": "Quiroga",
        "segundo_apellido": "Leon",
        "fecha_nacimiento": date(2014, 8, 7),
        "genero": Genero.FEMENINO,
        "docs": {
            "doc_formulario_inscripcion": True,
            "doc_fe_bautismo": False,
            "doc_cert_nacimiento": False,
            "doc_cert_matrimonio_padres": False,
            "doc_ci_nino": False,
        },
        "tutores": [
            {
                "nombres": "Nilton",
                "primer_apellido": "Quiroga",
                "segundo_apellido": "Villca",
                "telefono": "60533985",
                "parentesco": Parentesco.PAPA,
            },
        ],
    },
    {
        "nombres": "Brenda Ivon",
        "primer_apellido": "Quispe",
        "segundo_apellido": "Ibañez",
        "fecha_nacimiento": date(2015, 1, 8),
        "genero": Genero.FEMENINO,
        "docs": {
            "doc_formulario_inscripcion": False,
            "doc_fe_bautismo": True,
            "doc_cert_nacimiento": False,
            "doc_cert_matrimonio_padres": False,
            "doc_ci_nino": True,
        },
        "tutores": [
            {
                "nombres": "*Tutor*",
                "primer_apellido": "*Ficticio*",
                "segundo_apellido": "*",
                "telefono": "*00000000*",
                "parentesco": Parentesco.TUTOR_LEGAL,
            },
        ],
    },
    {
        "nombres": "Robert Matias",
        "primer_apellido": "Rondo",
        "segundo_apellido": "Rivero",
        "fecha_nacimiento": date(2015, 1, 26),
        "genero": Genero.MASCULINO,
        "docs": {
            "doc_formulario_inscripcion": True,
            "doc_fe_bautismo": True,
            "doc_cert_nacimiento": True,
            "doc_cert_matrimonio_padres": True,
            "doc_ci_nino": True,
        },
        "tutores": [
            {
                "nombres": "Efrain",
                "primer_apellido": "Rondo",
                "segundo_apellido": "Guerra",
                "telefono": "65581573",
                "parentesco": Parentesco.PAPA,
            },
            {
                "nombres": "Milenka",
                "primer_apellido": "Rivero",
                "segundo_apellido": "Colquehuanca",
                "telefono": "70525408",
                "parentesco": Parentesco.MAMA,
            },
        ],
    },
    {
        "nombres": "Romina Oriana",
        "primer_apellido": "Ticona",
        "segundo_apellido": "Sallez",
        "fecha_nacimiento": date(2016, 5, 17),
        "genero": Genero.FEMENINO,
        "docs": {
            "doc_formulario_inscripcion": True,
            "doc_fe_bautismo": True,
            "doc_cert_nacimiento": True,
            "doc_cert_matrimonio_padres": True,
            "doc_ci_nino": True,
        },
        "tutores": [
            {
                "nombres": "Franz Cristian",
                "primer_apellido": "Ticona",
                "segundo_apellido": "Maraza",
                "telefono": "72573043 - 65992335",
                "parentesco": Parentesco.PAPA,
            },
        ],
    },
    {
        "nombres": "Yuriana",
        "primer_apellido": "Yugar",
        "segundo_apellido": "Casas",
        "fecha_nacimiento": date(2015, 5, 21),
        "genero": Genero.FEMENINO,
        "docs": {
            "doc_formulario_inscripcion": True,
            "doc_fe_bautismo": True,
            "doc_cert_nacimiento": True,
            "doc_cert_matrimonio_padres": True,
            "doc_ci_nino": True,
        },
        "tutores": [
            {
                "nombres": "Santos",
                "primer_apellido": "Casas",
                "segundo_apellido": "Segundino",
                "telefono": "73209977",
                "parentesco": Parentesco.PAPA,
            },
            {
                "nombres": "Roxana",
                "primer_apellido": "Casas",
                "segundo_apellido": "Segundino",
                "telefono": "73209977",
                "parentesco": Parentesco.MAMA,
            },
        ],
    },
]


async def seed_catecumenos():
    print("=" * 60)
    print("Iniciando carga de 12 catecúmenos reales...")
    print("=" * 60)

    # Asegurar que las tablas existan
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Rol TUTOR
        res = await db.execute(select(Rol).where(Rol.nombre == NombreRol.TUTOR))
        rol_tutor = res.scalar_one_or_none()
        if not rol_tutor:
            rol_tutor = Rol(nombre=NombreRol.TUTOR, descripcion="Padre, madre o tutor con acceso al portal")
            db.add(rol_tutor)
            await db.flush()

        registrados = 0
        actualizados = 0

        for item in CATECUMENOS_DATA:
            # 1. Verificar si ya existe por nombre y apellidos
            q = select(Persona).where(
                Persona.nombres == item["nombres"],
                Persona.primer_apellido == item["primer_apellido"],
                Persona.segundo_apellido == item["segundo_apellido"]
            ).options(
                selectinload(Persona.inscripciones),
                selectinload(Persona.como_catecumeno).selectinload(RelacionFamiliar.tutor).selectinload(Persona.usuario)
            )
            res = await db.execute(q)
            persona = res.scalar_one_or_none()

            if not persona:
                persona = Persona(
                    nombres=item["nombres"],
                    primer_apellido=item["primer_apellido"],
                    segundo_apellido=item["segundo_apellido"],
                    fecha_nacimiento=item["fecha_nacimiento"],
                    genero=item["genero"],
                    es_bautizado=True,
                    es_primera_comunion=True,
                )
                db.add(persona)
                await db.flush()

                # Crear Inscripción
                inscripcion = Inscripcion(
                    persona_id=persona.id,
                    tipo_sacramento=TipoSacramento.PRIMERA_COMUNION,
                    estado=EstadoInscripcion.ACTIVO,
                    cuadernillo_comprado=True,
                    libro_comprado=True,
                    pago_cuota_inicial=True,
                    doc_formulario_inscripcion=item["docs"]["doc_formulario_inscripcion"],
                    doc_fe_bautismo=item["docs"]["doc_fe_bautismo"],
                    doc_cert_nacimiento=item["docs"]["doc_cert_nacimiento"],
                    doc_cert_matrimonio_padres=item["docs"]["doc_cert_matrimonio_padres"],
                    doc_ci_nino=item["docs"]["doc_ci_nino"],
                    token_qr=str(uuid.uuid4()),
                    fecha_inscripcion=date.today(),
                )
                db.add(inscripcion)
                await db.flush()

                # Crear tutores, relaciones familiares y cuentas de feligrés
                for t_data in item["tutores"]:
                    tutor = Persona(
                        nombres=t_data["nombres"],
                        primer_apellido=t_data["primer_apellido"],
                        segundo_apellido=t_data["segundo_apellido"],
                        telefono_principal=t_data["telefono"],
                    )
                    db.add(tutor)
                    await db.flush()

                    rel = RelacionFamiliar(
                        catecumeno_persona_id=persona.id,
                        tutor_persona_id=tutor.id,
                        parentesco=t_data["parentesco"],
                        es_contacto_emergencia=True,
                    )
                    db.add(rel)

                    # Crear usuario feligrés
                    username = await _generate_username(db, tutor.nombres, tutor.primer_apellido or "Tutor")
                    temp_pwd = f"JO-tutor{tutor.id}"
                    tutor_user = Usuario(
                        persona_id=tutor.id,
                        username=username,
                        password_hash=hash_password(temp_pwd),
                        estado=EstadoUsuario.ACTIVO,
                    )
                    tutor_user.roles.append(rol_tutor)
                    db.add(tutor_user)

                registrados += 1
                print(f"[NUEVO] Registrado: {persona.nombres} {persona.primer_apellido} {persona.segundo_apellido} (QR: {inscripcion.token_qr})")

            else:
                # Si ya existía, actualizar documentos, libros y verificar tutores
                if persona.inscripciones:
                    insc = persona.inscripciones[0]
                    insc.cuadernillo_comprado = True
                    insc.libro_comprado = True
                    insc.es_bautizado = True
                    for k, v in item["docs"].items():
                        setattr(insc, k, v)
                persona.es_bautizado = True
                persona.fecha_nacimiento = item["fecha_nacimiento"]
                persona.genero = item["genero"]
                actualizados += 1
                print(f"[EXISTE] Actualizado: {persona.nombres} {persona.primer_apellido} {persona.segundo_apellido}")

        await db.commit()
        print("=" * 60)
        print(f"Carga completada con éxito: {registrados} nuevos registrados, {actualizados} actualizados.")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_catecumenos())
