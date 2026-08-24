from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.modules.personas.models import Persona, Usuario, Rol, NombreRol, EstadoUsuario
from app.core.security import hash_password

async def get_usuario_by_username(db: AsyncSession, username: str) -> Usuario | None:
    """
    Busca un usuario por su nombre de usuario e incluye sus roles y persona.
    """
    result = await db.execute(
        select(Usuario)
        .where(Usuario.username == username)
        .options(selectinload(Usuario.roles), selectinload(Usuario.persona))
    )
    return result.scalar_one_or_none()

async def create_superadmin_if_not_exists(db: AsyncSession):
    """
    Crea un usuario superadministrador inicial si la tabla de usuarios está vacía.
    Usuario: admin
    Contraseña: admin
    """
    # 1. Verificar si ya existe el rol ADMIN
    result = await db.execute(select(Rol).where(Rol.nombre == NombreRol.ADMIN))
    admin_rol = result.scalar_one_or_none()
    
    if not admin_rol:
        admin_rol = Rol(nombre=NombreRol.ADMIN, descripcion="Administrador total del sistema")
        db.add(admin_rol)
        await db.flush()

    # 2. Verificar si ya hay algún usuario administrador
    result = await db.execute(select(Usuario).where(Usuario.username == 'admin'))
    admin_user = result.scalar_one_or_none()

    if not admin_user:
        # Crear Persona
        admin_persona = Persona(
            nombres="Administrador",
            primer_apellido="General",
            segundo_apellido="Parroquia",
            es_bautizado=True,
            es_primera_comunion=True
        )
        db.add(admin_persona)
        await db.flush()

        # Crear Usuario
        admin_user = Usuario(
            persona_id=admin_persona.id,
            username="admin",
            email="admin@parroquia.org",
            password_hash=hash_password("admin"), # Contraseña inicial: admin
            estado=EstadoUsuario.ACTIVO
        )
        admin_user.roles.append(admin_rol)
        db.add(admin_user)
        await db.commit()
        print("Superadministrador inicial creado (admin / admin).")
    else:
        await db.commit()
