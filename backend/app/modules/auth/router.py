from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.auth.schemas import LoginRequest, TokenResponse
from app.modules.auth.service import authenticate_user
from app.core.security import create_access_token

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Endpoint de inicio de sesión JSON.
    Recibe username y password, retorna el JWT y el rol del usuario.
    """
    usuario = await authenticate_user(db, payload.username, payload.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Determinar el rol principal del usuario (ej. ADMIN, CATEQUISTA)
    rol_nombre = "TUTOR" # Rol por defecto
    if usuario.roles:
        # Tomamos el primer rol asignado
        rol_nombre = usuario.roles[0].nombre.value

    # Generar JWT con id y rol
    access_token = create_access_token(
        data={"sub": str(usuario.id), "rol": rol_nombre}
    )

    return TokenResponse(
        access_token=access_token,
        rol=rol_nombre
    )
