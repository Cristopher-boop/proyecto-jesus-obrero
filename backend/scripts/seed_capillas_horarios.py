"""
Script Maestro Definitivo para inicializar Capillas, Horarios Reales y Grupos Parroquiales con Catequistas.
Uso:
    python backend/scripts/seed_capillas_horarios.py
"""

import sys
import os
import asyncio
from datetime import time, date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal, engine, Base
from app.modules.personas.models import Persona, Inscripcion, EtapaFormacion, TipoSacramento, EstadoInscripcion
from app.modules.capillas_grupos.models import Capilla, HorarioAsistencia, Grupo, DiaSemana

CAPILLAS_DATA = [
    {
        "nombre": "Parroquia Jesús Obrero",
        "codigo": "JO-CENTRAL",
        "direccion": "Plaza Principal Jesús Obrero, Av. 16 de Julio",
        "es_sede_principal": True,
        "descripcion": "Sede principal y parroquia central de la comunidad.",
    },
    {
        "nombre": "Capilla Santa Teresa",
        "codigo": "CAP-STE",
        "direccion": "Zona Santa Teresa, Calle Principal",
        "es_sede_principal": False,
        "descripcion": "Capilla filial de Santa Teresa.",
    },
    {
        "nombre": "Capilla Señor de la Santa Cruz",
        "codigo": "CAP-SSC",
        "direccion": "Zona Santa Cruz, Av. Cívica",
        "es_sede_principal": False,
        "descripcion": "Capilla filial del Señor de la Santa Cruz.",
    },
    {
        "nombre": "Capilla San Pablo",
        "codigo": "CAP-SPB",
        "direccion": "Zona San Pablo, Calle 2",
        "es_sede_principal": False,
        "descripcion": "Capilla filial de San Pablo.",
    },
    {
        "nombre": "Capilla Santa María Magdalena",
        "codigo": "CAP-SMM",
        "direccion": "Zona San Juan, Calle Magisterio",
        "es_sede_principal": False,
        "descripcion": "Capilla filial de Santa María Magdalena.",
    },
    {
        "nombre": "Capilla San Martín de Porres",
        "codigo": "CAP-SMP",
        "direccion": "Zona Villa Esperanza, Calle 4",
        "es_sede_principal": False,
        "descripcion": "Capilla filial de San Martín de Porres.",
    },
]

# ─── HORARIOS REALES EXACTOS ──────────────────────────────────────────────────
# Reglas:
# Caso Encuentro antes de Misa (Confirmación JO, Confirmación SMM, Comunión SMM):
#   - Franja 1: Puntual antes del encuentro -> PRESENTE
#   - Franja 2: Durante el encuentro (hora_inicio_catequesis a hora_fin_catequesis) -> PRESENTE
#   - Franja 3: Durante la misa (hora_inicio_misa a hora_fin_misa) -> ATRASO
# Caso Misa antes del Encuentro (Todos los demás):
#   - Franja 1: Puntual antes de la misa -> PRESENTE
#   - Franja 2: Durante la misa (hora_inicio_misa a hora_fin_misa) -> PRESENTE
#   - Franja 3: Durante el encuentro (hora_inicio_catequesis a hora_fin_catequesis) -> ATRASO

HORARIOS_DATA = [
    # ── CONFIRMACIÓN ──
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": True,
        "hora_inicio_puntual": time(15, 40),
        "hora_fin_puntual": time(16, 10),
        "hora_inicio_catequesis": time(16, 11),
        "hora_fin_catequesis": time(18, 10),
        "hora_inicio_misa": time(18, 11),
        "hora_fin_misa": time(19, 0),
        "descripcion_catequesis": "Encuentro de Confirmación (1er y 2do año)",
        "descripcion_misa": "Eucaristía de Jóvenes de Confirmación",
    },
    {
        "capilla_codigo": "CAP-STE",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": False,
        "hora_inicio_puntual": time(9, 40),
        "hora_fin_puntual": time(10, 10),
        "hora_inicio_misa": time(10, 11),
        "hora_fin_misa": time(11, 10),
        "hora_inicio_catequesis": time(11, 11),
        "hora_fin_catequesis": time(13, 0),
        "descripcion_misa": "Eucaristía Comunitaria",
        "descripcion_catequesis": "Encuentro de Confirmación (1er y 2do año)",
    },
    {
        "capilla_codigo": "CAP-SSC",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": False,
        "hora_inicio_puntual": time(7, 40),
        "hora_fin_puntual": time(8, 10),
        "hora_inicio_misa": time(8, 11),
        "hora_fin_misa": time(9, 10),
        "hora_inicio_catequesis": time(9, 11),
        "hora_fin_catequesis": time(11, 0),
        "descripcion_misa": "Eucaristía Dominical",
        "descripcion_catequesis": "Encuentro de Confirmación (1er y 2do año)",
    },
    {
        "capilla_codigo": "CAP-SPB",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": False,
        "hora_inicio_puntual": time(7, 40),
        "hora_fin_puntual": time(8, 10),
        "hora_inicio_misa": time(8, 11),
        "hora_fin_misa": time(9, 10),
        "hora_inicio_catequesis": time(9, 11),
        "hora_fin_catequesis": time(11, 0),
        "descripcion_misa": "Eucaristía Dominical",
        "descripcion_catequesis": "Encuentro de Confirmación (1er y 2do año)",
    },
    {
        "capilla_codigo": "CAP-SMM",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": True,
        "hora_inicio_puntual": time(9, 0),
        "hora_fin_puntual": time(9, 40),
        "hora_inicio_catequesis": time(9, 41),
        "hora_fin_catequesis": time(11, 40),
        "hora_inicio_misa": time(11, 41),
        "hora_fin_misa": time(12, 30),
        "descripcion_catequesis": "Encuentro de Confirmación (1er y 2do año)",
        "descripcion_misa": "Eucaristía de la Comunidad",
    },
    {
        "capilla_codigo": "CAP-SMP",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": False,
        "hora_inicio_puntual": time(7, 40),
        "hora_fin_puntual": time(8, 10),
        "hora_inicio_misa": time(8, 11),
        "hora_fin_misa": time(9, 10),
        "hora_inicio_catequesis": time(9, 11),
        "hora_fin_catequesis": time(11, 0),
        "descripcion_misa": "Eucaristía Dominical",
        "descripcion_catequesis": "Encuentro de Confirmación (1er y 2do año)",
    },

    # ── PRIMERA COMUNIÓN ──
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": False,
        "hora_inicio_puntual": time(9, 20),
        "hora_fin_puntual": time(10, 10),
        "hora_inicio_misa": time(10, 11),
        "hora_fin_misa": time(11, 10),
        "hora_inicio_catequesis": time(11, 11),
        "hora_fin_catequesis": time(13, 0),
        "descripcion_misa": "Eucaristía Familiar y de Niños",
        "descripcion_catequesis": "Encuentro de Primera Comunión (1er y 2do año)",
    },
    {
        "capilla_codigo": "CAP-STE",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": False,
        "hora_inicio_puntual": time(9, 40),
        "hora_fin_puntual": time(10, 10),
        "hora_inicio_misa": time(10, 11),
        "hora_fin_misa": time(11, 10),
        "hora_inicio_catequesis": time(11, 11),
        "hora_fin_catequesis": time(13, 0),
        "descripcion_misa": "Eucaristía de la Comunidad",
        "descripcion_catequesis": "Encuentro de Primera Comunión (1er y 2do año)",
    },
    {
        "capilla_codigo": "CAP-SSC",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": False,
        "hora_inicio_puntual": time(7, 40),
        "hora_fin_puntual": time(8, 10),
        "hora_inicio_misa": time(8, 11),
        "hora_fin_misa": time(9, 10),
        "hora_inicio_catequesis": time(9, 11),
        "hora_fin_catequesis": time(11, 0),
        "descripcion_misa": "Eucaristía Dominical",
        "descripcion_catequesis": "Encuentro de Primera Comunión (1er y 2do año)",
    },
    {
        "capilla_codigo": "CAP-SPB",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": False,
        "hora_inicio_puntual": time(7, 40),
        "hora_fin_puntual": time(8, 10),
        "hora_inicio_misa": time(8, 11),
        "hora_fin_misa": time(9, 10),
        "hora_inicio_catequesis": time(9, 11),
        "hora_fin_catequesis": time(11, 0),
        "descripcion_misa": "Eucaristía Dominical",
        "descripcion_catequesis": "Encuentro de Primera Comunión (1er y 2do año)",
    },
    {
        "capilla_codigo": "CAP-SMM",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": True,
        "hora_inicio_puntual": time(9, 0),
        "hora_fin_puntual": time(9, 40),
        "hora_inicio_catequesis": time(9, 41),
        "hora_fin_catequesis": time(11, 40),
        "hora_inicio_misa": time(11, 41),
        "hora_fin_misa": time(12, 30),
        "descripcion_catequesis": "Encuentro de Primera Comunión (1er y 2do año)",
        "descripcion_misa": "Eucaristía de la Comunidad",
    },
    {
        "capilla_codigo": "CAP-SMP",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "dia_semana": DiaSemana.DOMINGO,
        "encuentro_antes_de_misa": False,
        "hora_inicio_puntual": time(7, 40),
        "hora_fin_puntual": time(8, 10),
        "hora_inicio_misa": time(8, 11),
        "hora_fin_misa": time(9, 10),
        "hora_inicio_catequesis": time(9, 11),
        "hora_fin_catequesis": time(11, 0),
        "descripcion_misa": "Eucaristía Dominical",
        "descripcion_catequesis": "Encuentro de Primera Comunión (1er y 2do año)",
    },
]

# ─── SUBGRUPOS Y CATEQUISTAS SEGÚN LA TABLA PASTORAL OFICIAL ──────────────────
GRUPOS_DATA = [
    # ── JÓVENES DE CONFIRMACIÓN ──
    # Jesús Obrero
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 1",
        "codigo": "CONF-JO-2A-G1",
        "descripcion": "Catequistas: Beymar, Lili, Santi",
    },
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 2",
        "codigo": "CONF-JO-2A-G2",
        "descripcion": "Catequistas: Marcel, Lidia, Cesar, Yamilka",
    },
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 1",
        "codigo": "CONF-JO-1A-G1",
        "descripcion": "Catequistas: Reynaldo, Lizz, Luz",
    },
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 2",
        "codigo": "CONF-JO-1A-G2",
        "descripcion": "Catequistas: Mira, Margarita",
    },
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 3",
        "codigo": "CONF-JO-1A-G3",
        "descripcion": "Catequistas: Ghilda, Vihanca",
    },
    # Santa Teresa
    {
        "capilla_codigo": "CAP-STE",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 3",
        "codigo": "CONF-STE-2A-G3",
        "descripcion": "Catequista: Marlon",
    },
    {
        "capilla_codigo": "CAP-STE",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 4",
        "codigo": "CONF-STE-1A-G4",
        "descripcion": "Catequista: Patricia",
    },
    # Señor de la Santa Cruz
    {
        "capilla_codigo": "CAP-SSC",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 4",
        "codigo": "CONF-SSC-2A-G4",
        "descripcion": "Catequistas: Danilo, Hna Esther, Pablo",
    },
    {
        "capilla_codigo": "CAP-SSC",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 5",
        "codigo": "CONF-SSC-1A-G5",
        "descripcion": "Catequistas: Lizz, Esmeralda",
    },
    # San Pablo
    {
        "capilla_codigo": "CAP-SPB",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 5",
        "codigo": "CONF-SPB-2A-G5",
        "descripcion": "Catequista: Eddy",
    },
    {
        "capilla_codigo": "CAP-SPB",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 6",
        "codigo": "CONF-SPB-1A-G6",
        "descripcion": "Catequistas: Vihanca, Ruth",
    },
    # Santa María Magdalena
    {
        "capilla_codigo": "CAP-SMM",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 6",
        "codigo": "CONF-SMM-2A-G6",
        "descripcion": "Catequistas: Hna. Ximena, Tabata",
    },
    {
        "capilla_codigo": "CAP-SMM",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 7",
        "codigo": "CONF-SMM-1A-G7",
        "descripcion": "Catequistas: Mira, Beymar",
    },
    # San Martín de Porres
    {
        "capilla_codigo": "CAP-SMP",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 7",
        "codigo": "CONF-SMP-2A-G7",
        "descripcion": "Catequistas: Magali, Sabedio",
    },
    {
        "capilla_codigo": "CAP-SMP",
        "tipo_sacramento": TipoSacramento.CONFIRMACION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 8",
        "codigo": "CONF-SMP-1A-G8",
        "descripcion": "Catequistas: Cesar, Rocio, Neyda, Jhosmar",
    },

    # ── NIÑOS PARA LA 1RA COMUNIÓN ──
    # Jesús Obrero
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 1",
        "nombre_santo": "Juan Don Bosco",
        "codigo": "COM-JO-2A-G1",
        "descripcion": "Catequistas: Adriana, Carmen",
    },
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 2",
        "nombre_santo": "San Nicolás",
        "codigo": "COM-JO-2A-G2",
        "descripcion": "Catequistas: Luz, Angel",
    },
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 3",
        "nombre_santo": "San Pablo",
        "codigo": "COM-JO-2A-G3",
        "descripcion": "Catequistas: Masciely, Cristopher",
    },
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 4",
        "nombre_santo": "San Francisco de Asís",
        "codigo": "COM-JO-2A-G4",
        "descripcion": "Catequistas: Rosario, Juana",
    },
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 1",
        "codigo": "COM-JO-1A-G1",
        "descripcion": "Catequistas: Massiel, Jose",
    },
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 2",
        "codigo": "COM-JO-1A-G2",
        "descripcion": "Catequistas: Rayza, Maya",
    },
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 3",
        "codigo": "COM-JO-1A-G3",
        "descripcion": "Catequistas: Marina, Gabriel, Alejandra",
    },
    {
        "capilla_codigo": "JO-CENTRAL",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 4",
        "codigo": "COM-JO-1A-G4",
        "descripcion": "Catequistas: Luz, Abad",
    },
    # Santa Teresa
    {
        "capilla_codigo": "CAP-STE",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 5",
        "codigo": "COM-STE-2A-G5",
        "descripcion": "Catequista: Silvia",
    },
    {
        "capilla_codigo": "CAP-STE",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 5",
        "codigo": "COM-STE-1A-G5",
        "descripcion": "Catequistas: Gisele, Lidia",
    },
    # Señor de la Santa Cruz
    {
        "capilla_codigo": "CAP-SSC",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 6",
        "codigo": "COM-SSC-2A-G6",
        "descripcion": "Catequistas: Gladys, Jhasson, Naomi",
    },
    {
        "capilla_codigo": "CAP-SSC",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 6",
        "codigo": "COM-SSC-1A-G6",
        "descripcion": "Catequistas: Arminda, Lorena",
    },
    # San Pablo
    {
        "capilla_codigo": "CAP-SPB",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 7",
        "codigo": "COM-SPB-2A-G7",
        "descripcion": "Catequista: Ruth",
    },
    {
        "capilla_codigo": "CAP-SPB",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 7",
        "codigo": "COM-SPB-1A-G7",
        "descripcion": "Catequistas: Hna Vihanca, Alejandra",
    },
    # Santa María Magdalena
    {
        "capilla_codigo": "CAP-SMM",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 8",
        "codigo": "COM-SMM-2A-G8",
        "descripcion": "Catequistas: Camila, Mayte, Maite",
    },
    {
        "capilla_codigo": "CAP-SMM",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 8",
        "codigo": "COM-SMM-1A-G8",
        "descripcion": "Catequista: Jose Ortiz",
    },
    # San Martín de Porres
    {
        "capilla_codigo": "CAP-SMP",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.SEGUNDO_ANO,
        "nombre": "Grupo 9",
        "codigo": "COM-SMP-2A-G9",
        "descripcion": "Catequistas: Ximena, Carlos",
    },
    {
        "capilla_codigo": "CAP-SMP",
        "tipo_sacramento": TipoSacramento.PRIMERA_COMUNION,
        "etapa": EtapaFormacion.PRIMER_ANO,
        "nombre": "Grupo 9",
        "codigo": "COM-SMP-1A-G9",
        "descripcion": "Catequistas: Federico, Mayte, Kenia, Anahi",
    },
]


async def seed():
    print("=" * 70)
    print("EJECUTANDO SEED MAESTRO DE CAPILLAS, HORARIOS Y GRUPOS REALES")
    print("=" * 70)

    # 1. Migración y sincronización de columnas en PostgreSQL
    async with engine.begin() as conn:
        print("[MIGRACIÓN]: Asegurando columnas de horarios_asistencia...")
        alter_sqls = [
            """
            DO $$ BEGIN
                CREATE TYPE tiposacramento AS ENUM ('PRIMERA_COMUNION', 'CONFIRMACION');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            """,
            "ALTER TABLE horarios_asistencia ADD COLUMN IF NOT EXISTS tipo_sacramento tiposacramento DEFAULT 'PRIMERA_COMUNION' NOT NULL;",
            "ALTER TABLE horarios_asistencia ADD COLUMN IF NOT EXISTS encuentro_antes_de_misa BOOLEAN DEFAULT FALSE NOT NULL;",
            "ALTER TABLE grupos ADD COLUMN IF NOT EXISTS descripcion TEXT;",
            "ALTER TABLE grupos ADD COLUMN IF NOT EXISTS tipo_sacramento tiposacramento DEFAULT 'PRIMERA_COMUNION' NOT NULL;",
            "ALTER TABLE grupos ADD COLUMN IF NOT EXISTS etapa etapaformacion DEFAULT 'SEGUNDO_ANO' NOT NULL;",
        ]
        for sql in alter_sqls:
            try:
                await conn.execute(text(sql))
            except Exception as e:
                print(f"Info en migración: {e}")

    async with AsyncSessionLocal() as db:
        # 2. Upsert Capillas
        print("\n[CAPILLAS]: Registrando/actualizando las 6 capillas...")
        capillas_map = {}  # codigo -> Capilla
        for c_data in CAPILLAS_DATA:
            res = await db.execute(select(Capilla).where(Capilla.codigo == c_data["codigo"]))
            capilla = res.scalar_one_or_none()
            if not capilla:
                # Buscar por nombre si cambió de código
                res_nom = await db.execute(select(Capilla).where(Capilla.nombre == c_data["nombre"]))
                capilla = res_nom.scalar_one_or_none()

            if not capilla:
                capilla = Capilla(
                    nombre=c_data["nombre"],
                    codigo=c_data["codigo"],
                    direccion=c_data["direccion"],
                    es_sede_principal=c_data["es_sede_principal"],
                    descripcion=c_data["descripcion"],
                    activo=True,
                )
                db.add(capilla)
                await db.flush()
                print(f"  + Creada: {capilla.nombre} ({capilla.codigo})")
            else:
                capilla.nombre = c_data["nombre"]
                capilla.codigo = c_data["codigo"]
                capilla.direccion = c_data["direccion"]
                capilla.es_sede_principal = c_data["es_sede_principal"]
                capilla.descripcion = c_data["descripcion"]
                capilla.activo = True
                print(f"  * Actualizada: {capilla.nombre} ({capilla.codigo})")

            capillas_map[c_data["codigo"]] = capilla

        await db.commit()

        # 3. Limpiar y recrear Horarios Asistencia
        print("\n[HORARIOS]: Limpiando y creando los 12 horarios reales exactos...")
        # Eliminar horarios existentes para cargar la matriz limpia y exacta
        await db.execute(text("DELETE FROM horarios_asistencia;"))
        await db.commit()

        for h_data in HORARIOS_DATA:
            capilla = capillas_map.get(h_data["capilla_codigo"])
            if not capilla:
                continue

            nuevo_horario = HorarioAsistencia(
                capilla_id=capilla.id,
                dia_semana=h_data["dia_semana"],
                tipo_sacramento=h_data["tipo_sacramento"],
                encuentro_antes_de_misa=h_data["encuentro_antes_de_misa"],
                hora_inicio_puntual=h_data["hora_inicio_puntual"],
                hora_fin_puntual=h_data["hora_fin_puntual"],
                hora_inicio_misa=h_data["hora_inicio_misa"],
                hora_fin_misa=h_data["hora_fin_misa"],
                hora_inicio_catequesis=h_data["hora_inicio_catequesis"],
                hora_fin_catequesis=h_data["hora_fin_catequesis"],
                descripcion_misa=h_data.get("descripcion_misa"),
                descripcion_catequesis=h_data.get("descripcion_catequesis"),
                activo=True,
            )
            db.add(nuevo_horario)
            orden_txt = "Encuentro antes que Misa" if h_data["encuentro_antes_de_misa"] else "Misa antes que Encuentro"
            print(f"  + Horario {h_data['tipo_sacramento'].value} para {capilla.nombre}: {orden_txt}")

        await db.commit()

        # 4. Sincronizar Subgrupos de Catequesis
        print("\n[SUBGRUPOS]: Sincronizando los grupos y catequistas según nómina pastoral...")
        grupos_creados = {}
        for g_data in GRUPOS_DATA:
            capilla = capillas_map.get(g_data["capilla_codigo"])
            if not capilla:
                continue

            res_g = await db.execute(
                select(Grupo).where(
                    Grupo.capilla_id == capilla.id,
                    Grupo.codigo == g_data["codigo"]
                )
            )
            grupo = res_g.scalar_one_or_none()

            if not grupo:
                grupo = Grupo(
                    capilla_id=capilla.id,
                    nombre=g_data["nombre"],
                    nombre_santo=g_data.get("nombre_santo"),
                    codigo=g_data["codigo"],
                    gestion=2026,
                    etapa=g_data["etapa"],
                    tipo_sacramento=g_data["tipo_sacramento"],
                    descripcion=g_data["descripcion"],
                    activo=True,
                )
                db.add(grupo)
                await db.flush()
                print(f"  + Grupo creado: {capilla.nombre} · {g_data['tipo_sacramento'].value} · {g_data['etapa'].value} · {grupo.nombre} ({g_data['descripcion']})")
            else:
                grupo.nombre = g_data["nombre"]
                grupo.nombre_santo = g_data.get("nombre_santo")
                grupo.etapa = g_data["etapa"]
                grupo.tipo_sacramento = g_data["tipo_sacramento"]
                grupo.descripcion = g_data["descripcion"]
                grupo.activo = True
                print(f"  * Grupo actualizado: {capilla.nombre} · {grupo.nombre} ({g_data['descripcion']})")

            grupos_creados[g_data["codigo"]] = grupo

        await db.commit()

        # 5. Distribuir catecúmenos registrados de Jesús Obrero (2do Año Comunión)
        print("\n[CATECÚMENOS]: Asignando catecúmenos de Jesús Obrero a sus 4 grupos patronales...")
        jo_capilla = capillas_map.get("JO-CENTRAL")
        if jo_capilla:
            grupos_jo_2a = [
                grupos_creados.get("COM-JO-2A-G1"),
                grupos_creados.get("COM-JO-2A-G2"),
                grupos_creados.get("COM-JO-2A-G3"),
                grupos_creados.get("COM-JO-2A-G4"),
            ]
            grupos_jo_2a = [g for g in grupos_jo_2a if g is not None]

            if grupos_jo_2a:
                res_insc = await db.execute(
                    select(Inscripcion)
                    .options(selectinload(Inscripcion.persona))
                    .where(Inscripcion.estado == EstadoInscripcion.ACTIVO)
                    .order_by(Inscripcion.id)
                )
                inscripciones = res_insc.scalars().all()
                print(f"  Total catecúmenos a distribuir: {len(inscripciones)}")

                # Ordenar por fecha de nacimiento para balancear edades
                def sort_key(ins):
                    if ins.persona and ins.persona.fecha_nacimiento:
                        return ins.persona.fecha_nacimiento
                    return date(2015, 1, 1)

                insc_sorted = sorted(inscripciones, key=sort_key)
                for idx, ins in enumerate(insc_sorted):
                    target_grupo = grupos_jo_2a[idx % len(grupos_jo_2a)]
                    ins.capilla_id = jo_capilla.id
                    ins.grupo_id = target_grupo.id
                    ins.gestion = 2026
                    ins.etapa = EtapaFormacion.SEGUNDO_ANO
                    ins.tipo_sacramento = TipoSacramento.PRIMERA_COMUNION

                await db.commit()

                # Actualizar rangos de edad en cada grupo
                for g in grupos_jo_2a:
                    res_m = await db.execute(
                        select(Inscripcion)
                        .options(selectinload(Inscripcion.persona))
                        .where(Inscripcion.grupo_id == g.id)
                    )
                    g_inscs = res_m.scalars().all()
                    hoy = date.today()
                    edades = [
                        (hoy.year - ins.persona.fecha_nacimiento.year - ((hoy.month, hoy.day) < (ins.persona.fecha_nacimiento.month, ins.persona.fecha_nacimiento.day)))
                        for ins in g_inscs
                        if ins.persona and ins.persona.fecha_nacimiento
                    ]
                    if edades:
                        g.edad_minima = min(edades)
                        g.edad_maxima = max(edades)
                    print(f"  -> {g.nombre} ({g.nombre_santo}): {len(g_inscs)} catecúmenos (edades {g.edad_minima}-{g.edad_maxima})")

                await db.commit()

        print("\n" + "=" * 70)
        print("SEED COMPLETADO CON ÉXITO: 6 CAPILLAS, 12 HORARIOS Y 26 SUBGRUPOS REGISTRADOS.")
        print("=" * 70)

if __name__ == "__main__":
    asyncio.run(seed())
