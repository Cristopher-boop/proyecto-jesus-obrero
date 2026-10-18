"""
Manejo centralizado de zona horaria para la Parroquia Jesús Obrero (El Alto, Bolivia).
Zona Horaria Oficial: America/La_Paz (UTC-4 todo el año, sin cambio de horario de verano).
Garantiza que en servidores en la nube (Render, AWS, etc.) las marcaciones y fechas
se registren exactamente en la hora oficial de Bolivia.
"""

from datetime import datetime, date, time
from zoneinfo import ZoneInfo

# Zona horaria oficial del Estado Plurinacional de Bolivia
BOLIVIA_TZ = ZoneInfo("America/La_Paz")


def now_bolivia() -> datetime:
    """Retorna el datetime actual en la zona horaria de Bolivia (UTC-4)."""
    return datetime.now(BOLIVIA_TZ)


def today_bolivia() -> date:
    """Retorna la fecha actual en Bolivia (evita discrepancias con la fecha UTC)."""
    return now_bolivia().date()


def time_bolivia() -> time:
    """Retorna la hora actual en Bolivia sin información de zona horaria (para Column(Time))."""
    now = now_bolivia()
    return time(hour=now.hour, minute=now.minute, second=now.second, microsecond=now.microsecond)
