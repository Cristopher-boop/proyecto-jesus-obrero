"""
Script para registrar a los 9 catequistas como niños catecúmenos de Primera Comunión
en la sede principal Parroquia Jesús Obrero (JO-CENTRAL).

Catequistas a registrar como catecúmenos:
1. Daniela
2. Adriana
3. Carmen
4. Masciely
5. Juana
6. Rosario
7. Luz
8. Cristopher
9. Marcel

Uso:
    python backend/scripts/seed_catequistas_comunion.py
"""

import sys
import os
import asyncio
import uuid
from datetime import date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal
from app.modules.personas.models import (
    Persona, Inscripcion, Genero, TipoSacramento,
    EstadoInscripcion, EtapaFormacion
)
from app.modules.capillas_grupos.models import Capilla, Grupo

CATEQUISTAS_COMUNION = [
    {
        "nombres": "Daniela",
        "primer_apellido": "Quispe",
        "segundo_apellido": "Mamani",
        "fecha_nacimiento": date(2015, 4, 12),
        "genero": Genero.FEMENINO,
        "ci_dni": "10492811",
        "telefono_principal": "71542011",
    },
    {
        "nombres": "Adriana",
        "primer_apellido": "Flores",
        "segundo_apellido": "Condori",
        "fecha_nacimiento": date(2015, 6, 25),
        "genero": Genero.FEMENINO,
        "ci_dni": "10492812",
        "telefono_principal": "72019482",
    },
    {
        "nombres": "Carmen",
        "primer_apellido": "Ramos",
        "segundo_apellido": "Choque",
        "fecha_nacimiento": date(2015, 8, 30),
        "genero": Genero.FEMENINO,
        "ci_dni": "10492813",
        "telefono_principal": "68102938",
    },
    {
        "nombres": "Masciely",
        "primer_apellido": "Ticona",
        "segundo_apellido": "Vargas",
        "fecha_nacimiento": date(2015, 2, 14),
        "genero": Genero.FEMENINO,
        "ci_dni": "10492814",
        "telefono_principal": "73091823",
    },
    {
        "nombres": "Juana",
        "primer_apellido": "Mendoza",
        "segundo_apellido": "Lopez",
        "fecha_nacimiento": date(2015, 11, 5),
        "genero": Genero.FEMENINO,
        "ci_dni": "10492815",
        "telefono_principal": "67019284",
    },
    {
        "nombres": "Rosario",
        "primer_apellido": "Gutierrez",
        "segundo_apellido": "Callisaya",
        "fecha_nacimiento": date(2015, 10, 19),
        "genero": Genero.FEMENINO,
        "ci_dni": "10492816",
        "telefono_principal": "76501928",
    },
    {
        "nombres": "Luz",
        "primer_apellido": "Apaza",
        "segundo_apellido": "Alvarez",
        "fecha_nacimiento": date(2015, 7, 8),
        "genero": Genero.FEMENINO,
        "ci_dni": "10492817",
        "telefono_principal": "71982736",
    },
    {
        "nombres": "Cristopher",
        "primer_apellido": "Rodriguez",
        "segundo_apellido": "Boop",
        "fecha_nacimiento": date(2015, 3, 22),
        "genero": Genero.MASCULINO,
        "ci_dni": "10492818",
        "telefono_principal": "72518294",
    },
    {
        "nombres": "Marcel",
        "primer_apellido": "Fernandez",
        "segundo_apellido": "Castro",
        "fecha_nacimiento": date(2015, 9, 17),
        "genero": Genero.MASCULINO,
        "ci_dni": "10492819",
        "telefono_principal": "69018274",
    },
]


async def seed_catequistas_comunion():
    """Registra los catequistas como niños de Primera Comunión en Parroquia Jesús Obrero."""
    print("\n--- REGISTRANDO CATEQUISTAS COMO NIÑOS DE PRIMERA COMUNIÓN (JESÚS OBRERO) ---")
    async with AsyncSessionLocal() as db:
        # 1. Obtener o crear Parroquia Jesús Obrero (Sede principal)
        res_cap = await db.execute(select(Capilla).where(Capilla.codigo == "JO-CENTRAL"))
        jo_capilla = res_cap.scalar_one_or_none()

        if not jo_capilla:
            res_cap_alt = await db.execute(select(Capilla).where(Capilla.es_sede_principal == True))
            jo_capilla = res_cap_alt.scalars().first()

        if not jo_capilla:
            jo_capilla = Capilla(
                nombre="Parroquia Jesús Obrero",
                codigo="JO-CENTRAL",
                direccion="Plaza Principal Jesús Obrero, Av. 16 de Julio",
                es_sede_principal=True,
                descripcion="Sede central de la Parroquia Jesús Obrero.",
            )
            db.add(jo_capilla)
            await db.flush()
            print(f"[CAPILLA] Sede Jesús Obrero creada (ID: {jo_capilla.id})")

        # 2. Obtener o crear grupo de Primera Comunión en Jesús Obrero
        res_grupo = await db.execute(
            select(Grupo).where(
                Grupo.capilla_id == jo_capilla.id,
                Grupo.tipo_sacramento == TipoSacramento.PRIMERA_COMUNION
            )
        )
        grupo_comunion = res_grupo.scalars().first()

        if not grupo_comunion:
            grupo_comunion = Grupo(
                capilla_id=jo_capilla.id,
                nombre="San José Obrero - 1er Año",
                nombre_santo="San José Obrero",
                tipo_sacramento=TipoSacramento.PRIMERA_COMUNION,
                etapa=EtapaFormacion.PRIMER_ANO,
                gestion=2026,
                cupo_maximo=30,
                color_identificador="#1E4D38",
                activo=True
            )
            db.add(grupo_comunion)
            await db.flush()
            print(f"[GRUPO] Grupo de 1ª Comunión creado (ID: {grupo_comunion.id})")

        creados = 0
        actualizados = 0

        for item in CATEQUISTAS_COMUNION:
            # Buscar si ya existe la persona por nombre y apellido
            res = await db.execute(
                select(Persona)
                .options(selectinload(Persona.inscripciones))
                .where(
                    Persona.nombres == item["nombres"],
                    Persona.primer_apellido == item["primer_apellido"]
                )
            )
            persona = res.scalar_one_or_none()

            if not persona:
                persona = Persona(
                    nombres=item["nombres"],
                    primer_apellido=item["primer_apellido"],
                    segundo_apellido=item["segundo_apellido"],
                    fecha_nacimiento=item["fecha_nacimiento"],
                    genero=item["genero"],
                    ci_dni=item["ci_dni"],
                    telefono_principal=item["telefono_principal"],
                    es_bautizado=True,
                    es_primera_comunion=False,
                )
                db.add(persona)
                await db.flush()

                token_qr = f"JO-CAT-{uuid.uuid4().hex[:12].upper()}"

                inscripcion = Inscripcion(
                    persona_id=persona.id,
                    tipo_sacramento=TipoSacramento.PRIMERA_COMUNION,
                    estado=EstadoInscripcion.ACTIVO,
                    etapa=EtapaFormacion.PRIMER_ANO,
                    gestion=2026,
                    capilla_id=jo_capilla.id,
                    grupo_id=grupo_comunion.id,
                    token_qr=token_qr,
                    fecha_inscripcion=date.today(),
                    # Requisitos y documentos completos
                    cuadernillo_comprado=True,
                    libro_comprado=True,
                    pago_cuota_inicial=True,
                    doc_formulario_inscripcion=True,
                    doc_fe_bautismo=True,
                    doc_cert_nacimiento=True,
                    doc_ci_nino=True,
                )
                db.add(inscripcion)
                creados += 1
                print(f"[NUEVO] Catequista como catecúmeno: {persona.nombres} {persona.primer_apellido} -> QR: {token_qr}")
            else:
                # Asegurar que esté inscrito en Primera Comunión en Jesús Obrero
                if not persona.inscripciones:
                    token_qr = f"JO-CAT-{uuid.uuid4().hex[:12].upper()}"
                    inscripcion = Inscripcion(
                        persona_id=persona.id,
                        tipo_sacramento=TipoSacramento.PRIMERA_COMUNION,
                        estado=EstadoInscripcion.ACTIVO,
                        etapa=EtapaFormacion.PRIMER_ANO,
                        gestion=2026,
                        capilla_id=jo_capilla.id,
                        grupo_id=grupo_comunion.id,
                        token_qr=token_qr,
                        fecha_inscripcion=date.today(),
                        cuadernillo_comprado=True,
                        libro_comprado=True,
                        pago_cuota_inicial=True,
                        doc_formulario_inscripcion=True,
                        doc_fe_bautismo=True,
                        doc_cert_nacimiento=True,
                        doc_ci_nino=True,
                    )
                    db.add(inscripcion)
                else:
                    insc = persona.inscripciones[0]
                    insc.capilla_id = jo_capilla.id
                    insc.grupo_id = grupo_comunion.id
                    insc.tipo_sacramento = TipoSacramento.PRIMERA_COMUNION
                    insc.cuadernillo_comprado = True
                    insc.libro_comprado = True
                    insc.pago_cuota_inicial = True
                    insc.doc_formulario_inscripcion = True
                    insc.doc_fe_bautismo = True
                    insc.doc_cert_nacimiento = True
                    insc.doc_ci_nino = True

                actualizados += 1
                print(f"[EXISTE] Actualizado: {persona.nombres} {persona.primer_apellido}")

        await db.commit()
        print(f"--- LISTO: {creados} nuevos creados, {actualizados} actualizados ---")


if __name__ == "__main__":
    asyncio.run(seed_catequistas_comunion())
