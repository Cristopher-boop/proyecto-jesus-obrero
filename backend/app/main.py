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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas en PostgreSQL e inicializar superadmin al arrancar la app
    from app.core.database import engine, Base
    from app.modules.personas.service import create_superadmin_if_not_exists
    from app.core.database import AsyncSessionLocal
    
    # Crear tablas si no existen
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
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

    # ── Registrar routers ────────────────────────────────────
    app.include_router(auth_router,        prefix="/api/v1/auth",        tags=["Auth"])
    app.include_router(catecumenos_router, prefix="/api/v1/catecumenos", tags=["Catecúmenos"])
    app.include_router(feligreses_router,  prefix="/api/v1/feligreses",  tags=["Feligreses"])

    @app.get("/", tags=["Health"])
    async def health_check():
        return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

    return app


app = create_app()
