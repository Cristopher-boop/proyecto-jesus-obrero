# ⛪ Parroquia Jesús Obrero — Sistema de Gestión Pastoral

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_18_--_TypeScript-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3.4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

Sistema integral de gestión parroquial diseñado para la **Parroquia Jesús Obrero** (El Alto, Bolivia) y sus capillas filiales (*San Martín de Porras*, *Señor de la Santa Cruz*, *María Magdalena*).

Permite el control automatizado de asistencia a Misa y Catequesis mediante escaneo de **código QR**, gestión de expedientes sacramentales (Fe de Bautismo, Comunión, Confirmación), asignación de catequistas y adaptabilidad visual en tiempo real según el **Tiempo Litúrgico** de la Iglesia Católica.

---

## 🏛️ Arquitectura del Sistema

El proyecto sigue una **Arquitectura Modular Basada en Dominios (Feature-Based Architecture)** tanto en el Backend como en el Frontend, priorizando el bajo acoplamiento, la mantenibilidad y la escalabilidad por módulos de negocio.

```text
proyecto-jesus-obrero/
├── backend/                  # Monolito Modular en FastAPI (Python 3.11+)
│   ├── app/
│   │   ├── core/             # Configuración global, DB Async, JWT, Seguridad
│   │   └── modules/          # Módulos autónomos de negocio
│   │       ├── auth/         # Autenticación, JWT y permisos por rol
│   │       ├── personas/     # Personas, Catecúmenos, Tutores, Usuarios y Roles
│   │       ├── capillas_grupos/ # Capillas, Horarios Base y Subgrupos (San Pablo, etc.)
│   │       ├── asistencias/  # Motor de cálculo de puntualidad por QR
│   │       └── documentos/   # Carga y validación de fe de bautizo y certificados
│   └── main.py               # Punto de entrada raíz para Uvicorn
│
├── frontend/                 # Aplicación SPA en React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── core/             # API Client (Axios + JWT), AuthContext, ThemeContext
│   │   ├── components/ui/    # Primitivas UI reutilizables (Button, Badge, Card, Alert...)
│   │   ├── features/         # Módulos de interfaz aislados
│   │   │   ├── auth/         # Pantalla de Login Split-Screen adaptativa
│   │   │   ├── dashboard/    # Panel principal, métricas y desglose de puntualidad
│   │   │   ├── asistencia/   # Lector de cámara QR móvil para catequistas
│   │   │   └── documentos/   # Visor de revisión de expedientes para secretaría
│   │   ├── layouts/          # Sidebar, Navbar e integración de AdminLayout
│   │   └── index.css         # Tokens de color HSL del Sistema Litúrgico
│
└── database/
    └── schema.sql            # Script DDL PostgreSQL (Enums, Tablas, FKs y Triggers)
```

---

## 🎨 Sistema de Color Litúrgico Adaptativo

La interfaz cuenta con un sistema de tokens CSS en **HSL** que adapta la colorimetría de la aplicación según el tiempo litúrgico eclesiástico:

| Tiempo Litúrgico | Tono Principal | HEX | Significado Teológico |
|---|---|---|---|
| 🌿 **Tiempo Ordinario** | Verde Sacro | `#1E4D38` | Esperanza y crecimiento espiritual cotidiano |
| 🕯️ **Cuaresma / Adviento** | Morado Penitencial | `#4A2040` | Conversión, penitencia y espera reverente |
| 🍷 **Pentecostés / Mártires** | Rojo Carmesí | `#721C24` | Fuego del Espíritu Santo y Pasión |
| 🕊️ **Pascua / Navidad** | Blanco y Oro Viejo | `#916B1E` / `#C5A059` | Gozo pascual, victoria y máxima solemnidad |

*Las alertas semánticas del sistema (Éxito, Advertencia, Error, Info) se mantienen estables para garantizar la claridad cognitiva.*

---

## 🚀 Requisitos Previos

- **Python 3.11+**
- **Node.js 18+** y `npm`
- **PostgreSQL 14+** (pgAdmin)

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/proyecto-jesus-obrero.git
cd proyecto-jesus-obrero
```

---

### 2. Configurar y Levantar el Backend (FastAPI)

```bash
# Entrar a la carpeta del backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# En Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
```

Edita el archivo `backend/.env` con tus credenciales de PostgreSQL:
```env
APP_NAME="Jesus Obrero API"
DEBUG=True
DATABASE_URL=postgresql+asyncpg://postgres:TU_CONTRASEÑA@localhost:5432/postgres
SECRET_KEY=clave_secreta_generada_aleatoriamente
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:5174"]
```

Ejecutar el servidor en modo desarrollo:
```bash
uvicorn main:app --reload
```
* La API estará disponible en `http://127.0.0.1:8000`
* Documentación Swagger interactiva en `http://127.0.0.1:8000/docs`

---

### 3. Configurar y Levantar el Frontend (React + Vite)

```bash
# Entrar a la carpeta del frontend (desde la raíz)
cd frontend

# Instalar dependencias de Node
npm install

# Configurar variables de entorno
cp .env.example .env
```

Edita `frontend/.env` (si es necesario):
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Ejecutar el servidor de desarrollo:
```bash
npm run dev
```
* La aplicación abrirá en `http://localhost:5173` (o `http://localhost:5174`).

---

## 🔑 Credenciales Iniciales de Prueba

El sistema cuenta con un inicializador automático que crea las tablas en PostgreSQL e inserta el superusuario inicial al arrancar el backend por primera vez:

- **Usuario:** `admin`
- **Contraseña:** `admin`

---

## 🔒 Seguridad y Buenas Prácticas

- Hashing seguro de contraseñas con **`bcrypt`** directo (compatible con Python 3.13+).
- Autenticación mediante **JWT (JSON Web Tokens)** con expiración y verificación de roles.
- Interceptores HTTP automáticos en Axios para renovar/expirar sesiones (401 Unauthorized).
- Exclusión estricta en `.gitignore` de llaves secretas, credenciales de BD y archivos subidos.

---

## 📜 Licencia y Propiedad

Desarrollado para la **Parroquia Jesús Obrero** — Diócesis de El Alto. Todos los derechos reservados.
