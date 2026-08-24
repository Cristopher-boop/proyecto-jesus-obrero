"""
Dependencias de seguridad reutilizables para FastAPI (Depends).
Permiten proteger endpoints verificando el JWT del request.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token

# El endpoint de login que emite tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    Dependencia que extrae y valida el usuario autenticado desde el JWT.

    Uso en router:
        async def mi_endpoint(current_user = Depends(get_current_user)):
            ...
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    usuario_id: str | None = payload.get("sub")
    if usuario_id is None:
        raise credentials_exception

    # TODO: Importar el servicio de usuarios cuando esté creado
    # usuario = await usuarios_service.get_by_id(db, int(usuario_id))
    # if usuario is None:
    #     raise credentials_exception
    # return usuario

    return {"usuario_id": int(usuario_id), "rol": payload.get("rol")}


def require_roles(*roles: str):
    """
    Dependencia factory que restringe un endpoint a ciertos roles.

    Uso en router:
        async def mi_endpoint(
            current_user = Depends(require_roles("ADMIN", "SECRETARIA"))
        ):
            ...
    """
    async def role_checker(current_user=Depends(get_current_user)):
        if current_user["rol"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para acceder a este recurso.",
            )
        return current_user

    return role_checker
