"""
Configuración de la conexión asíncrona a PostgreSQL con SQLAlchemy 2.0.
Provee el engine, la sesión async y una dependencia inyectable para FastAPI.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# ── Engine async ─────────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,       # Imprime SQL en consola solo en modo DEBUG
    pool_pre_ping=True,        # Verifica la conexión antes de usarla
    pool_size=10,
    max_overflow=20,
)

# ── Fábrica de sesiones ──────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,    # Evita lazy-load tras commit en contextos async
)


# ── Base declarativa para los modelos SQLAlchemy ─────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependencia inyectable para los routers de FastAPI ───────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Genera una sesión de base de datos por request.
    Se cierra automáticamente al terminar (patrón context manager).

    Uso en router:
        async def mi_endpoint(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        yield session
