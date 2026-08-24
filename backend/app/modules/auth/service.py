from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.personas.service import get_usuario_by_username
from app.core.security import verify_password
from app.modules.personas.models import Usuario, EstadoUsuario

async def authenticate_user(db: AsyncSession, username: str, password: str) -> Usuario | None:
    """
    Valida las credenciales de un usuario.
    Retorna el usuario (con roles y persona cargados) si son válidos y está ACTIVO.
    """
    usuario = await get_usuario_by_username(db, username)
    if not usuario:
        return None
        
    if usuario.estado != EstadoUsuario.ACTIVO:
        return None

    if not verify_password(password, usuario.password_hash):
        return None

    return usuario
