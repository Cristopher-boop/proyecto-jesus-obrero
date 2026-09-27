"""
Punto de entrada de la aplicación FastAPI.
Registra todos los routers de módulos y configura middlewares globales.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from contextlib import asynccontextmanager
from app.modules.auth.router import router as auth_router
from app.modules.catecumenos.router import router as catecumenos_router
from app.modules.feligreses.router import router as feligreses_router
from app.modules.asistencias.router import router as asistencias_router
from app.modules.capillas_grupos.router import router as capillas_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas en PostgreSQL e inicializar superadmin al arrancar la app
    from app.core.database import engine, Base
    from app.modules.personas.service import create_superadmin_if_not_exists
    from app.core.database import AsyncSessionLocal
    
    # Crear tablas si no existen
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Migraciones seguras para columnas añadidas a tablas existentes
        from sqlalchemy import text
        migrations = [
            'ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS pago_cuota_inicial BOOLEAN NOT NULL DEFAULT FALSE;',
            'ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS doc_formulario_inscripcion BOOLEAN NOT NULL DEFAULT FALSE;',
            'ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS doc_fe_bautismo BOOLEAN NOT NULL DEFAULT FALSE;',
            'ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS doc_cert_nacimiento BOOLEAN NOT NULL DEFAULT FALSE;',
            'ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS doc_cert_matrimonio_padres BOOLEAN NOT NULL DEFAULT FALSE;',
            'ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS doc_ci_nino BOOLEAN NOT NULL DEFAULT FALSE;',
            'ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS doc_ci_padre BOOLEAN NOT NULL DEFAULT FALSE;',
            'ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS doc_ci_madre BOOLEAN NOT NULL DEFAULT FALSE;',
            'ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS doc_ci_tutor BOOLEAN NOT NULL DEFAULT FALSE;'
        ]
        for stmt in migrations:
            await conn.execute(text(stmt))
        
    # Inicializar datos iniciales (roles y superadmin)
    async with AsyncSessionLocal() as db:
        await create_superadmin_if_not_exists(db)
        
    yield

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="API REST para la gestión pastoral de la Parroquia Jesús Obrero.",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )

    # ── CORS ────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Archivos Estáticos / Uploads ──────────────────────────
    import os
    from fastapi.staticfiles import StaticFiles
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # ── Registrar routers ────────────────────────────────────
    app.include_router(auth_router,        prefix="/api/v1/auth",        tags=["Auth"])
    app.include_router(catecumenos_router, prefix="/api/v1/catecumenos", tags=["Catecúmenos"])
    app.include_router(feligreses_router,  prefix="/api/v1/feligreses",  tags=["Feligreses"])
    app.include_router(asistencias_router, prefix="/api/v1/asistencias", tags=["Asistencias"])
    app.include_router(capillas_router,    prefix="/api/v1/capillas",    tags=["Capillas y Horarios"])

    @app.get("/", tags=["Health"])
    async def health_check():
        return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

    return app


app = create_app()
