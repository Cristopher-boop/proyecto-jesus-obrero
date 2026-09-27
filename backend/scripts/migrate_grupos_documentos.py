"""
Script para sincronizar y migrar las tablas de Grupos, Documentos y nuevos campos en PostgreSQL.
Uso:
    python backend/scripts/migrate_grupos_documentos.py
"""

import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from app.core.database import engine, Base
from app.modules.personas.models import Persona, Inscripcion, DocumentoCatecumeno
from app.modules.capillas_grupos.models import Capilla, HorarioAsistencia, Grupo

async def migrate():
    print("=" * 65)
    print("Sincronizando esquema de base de datos para Grupos y Documentos...")
    print("=" * 65)

    async with engine.begin() as conn:
        # 1. Crear tipos enum si no existen en PostgreSQL
        enum_sqls = [
            """
            DO $$ BEGIN
                CREATE TYPE etapaformacion AS ENUM ('PRIMER_ANO', 'SEGUNDO_ANO');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            """,
            """
            DO $$ BEGIN
                CREATE TYPE tipodocumento AS ENUM (
                    'FORMULARIO_INSCRIPCION', 'FE_BAUTISMO', 'CERT_NACIMIENTO',
                    'CERT_MATRIMONIO_PADRES', 'CI_NINO', 'CI_PADRE', 'CI_MADRE',
                    'CI_TUTOR', 'OTRO'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            """,
            """
            DO $$ BEGIN
                CREATE TYPE estadodocumento AS ENUM ('PENDIENTE', 'ENTREGADO', 'VERIFICADO', 'RECHAZADO');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            """
        ]
        for sql in enum_sqls:
            await conn.execute(text(sql))

        # 2. Crear tablas nuevas si no existen
        await conn.run_sync(Base.metadata.create_all)

        # 3. Añadir columnas a inscripciones si faltan
        alter_cols = [
            "ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS etapa etapaformacion DEFAULT 'PRIMER_ANO' NOT NULL;",
            "ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS gestion INTEGER DEFAULT 2026 NOT NULL;",
            "ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS grupo_id INTEGER REFERENCES grupos(id) ON DELETE SET NULL;",
            "CREATE INDEX IF NOT EXISTS ix_inscripciones_gestion ON inscripciones(gestion);",
            "CREATE INDEX IF NOT EXISTS ix_inscripciones_etapa ON inscripciones(etapa);"
        ]
        for col_sql in alter_cols:
            try:
                await conn.execute(text(col_sql))
            except Exception as e:
                print(f"Info en columna: {e}")

    print("[OK] Tablas y columnas sincronizadas correctamente en PostgreSQL.")

if __name__ == "__main__":
    asyncio.run(migrate())
