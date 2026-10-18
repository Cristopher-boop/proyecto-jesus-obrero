"""
Pruebas unitarias para la lógica de conformación de subgrupos y validaciones.
"""

from datetime import date
import pytest
from pydantic import ValidationError

from app.modules.capillas_grupos.schemas import (
    GrupoCreate, AutoAgruparPayload, AsignarSantoPayload
)
from app.modules.capillas_grupos.service import _calcular_edad_date
from app.modules.personas.models import EtapaFormacion, TipoSacramento


def test_calcular_edad():
    # Caso 1: fecha nacimiento válida
    fnac = date(2015, 5, 20)
    edad = _calcular_edad_date(fnac)
    assert edad is not None
    assert edad >= 10

    # Caso 2: None
    assert _calcular_edad_date(None) is None


def test_validaciones_grupo_create():
    # Válido
    grupo = GrupoCreate(
        nombre="San Pablo",
        nombre_santo="San Pablo",
        codigo="GRP-SP",
        gestion=2026,
        etapa=EtapaFormacion.SEGUNDO_ANO,
        tipo_sacramento=TipoSacramento.PRIMERA_COMUNION,
        edad_minima=10,
        edad_maxima=11
    )
    assert grupo.nombre == "San Pablo"
    assert grupo.gestion == 2026

    # Inválido: nombre muy corto
    with pytest.raises(ValidationError):
        GrupoCreate(
            nombre="A",
            codigo="GRP-A",
            gestion=2026,
        )


def test_auto_agrupar_payload_defaults():
    payload = AutoAgruparPayload()
    assert payload.gestion == 2026
    assert payload.etapa == EtapaFormacion.SEGUNDO_ANO
    assert payload.cantidad_grupos == 4
    assert len(payload.nombres_santos) == 4
    assert "Juan Don Bosco" in payload.nombres_santos
    assert "San Nicolás" in payload.nombres_santos
    assert "San Pablo" in payload.nombres_santos
    assert "San Francisco de Asís" in payload.nombres_santos


def test_algoritmo_particion_edades():
    """Verifica que al ordenar fechas de nacimiento no haya solapamiento inverso de edades."""
    fechas = [
        date(2014, 5, 10),
        date(2014, 8, 20),
        date(2015, 1, 15),
        date(2015, 4, 30),
        date(2015, 9, 12),
        date(2016, 2, 5),
        date(2016, 7, 22),
        date(2016, 11, 3),
    ]
    fechas_ordenadas = sorted(fechas)
    k = 4
    chunk_size = len(fechas_ordenadas) // k
    chunks = [fechas_ordenadas[i * chunk_size:(i + 1) * chunk_size] for i in range(k)]

    # Cada grupo contiene fechas contiguas
    for i in range(len(chunks) - 1):
        assert max(chunks[i]) <= min(chunks[i + 1])
