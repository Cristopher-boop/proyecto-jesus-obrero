"""
Utilidades de seguridad:
 - Hashing y verificación de contraseñas utilizando bcrypt directamente (compatible con Python 3.13+)
 - Generación y decodificación de tokens JWT (python-jose)
"""

from datetime import datetime, timedelta, timezone
import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

# ── HASHING DE CONTRASEÑAS (BCRYPT DIRECTO) ──────────────────────────────────
def hash_password(plain_password: str) -> str:
    """
    Genera el hash bcrypt de una contraseña en texto plano.
    Utiliza bcrypt directamente para evitar incompatibilidades de passlib en Python 3.13+.
    """
    # bcrypt requiere bytes como entrada
    password_bytes = plain_password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compara una contraseña en texto plano con su hash almacenado.
    """
    try:
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False


# ── JWT ──────────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Genera un JWT firmado con la SECRET_KEY.

    Args:
        data: Payload del token (ej. {"sub": str(usuario_id), "rol": "CATEQUISTA"})
        expires_delta: Tiempo de expiración personalizado (por defecto usa el del .env)

    Returns:
        Token JWT como string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """
    Decodifica y valida un JWT.

    Returns:
        El payload del token si es válido, None si está expirado o es inválido.
    """
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
