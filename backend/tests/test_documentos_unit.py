"""
Pruebas unitarias para esquemas, tipos y reglas de negocio de Documentos de Catecúmenos.
"""

from datetime import datetime
import pytest
from pydantic import ValidationError

from app.modules.personas.models import (
    TipoDocumento,
    EstadoDocumento,
    EtapaFormacion,
    TipoSacramento,
)
from app.modules.catecumenos.schemas import (
    DocumentoItem,
    DocumentoListResponse,
    VerificarDocumentoPayload,
)
from app.modules.catecumenos.service import DOC_CHECKLIST_MAP


def test_tipo_documento_enum_completo():
    """Verifica que los 8 documentos requeridos existan en el enum."""
    docs_esperados = [
        "FORMULARIO_INSCRIPCION",
        "FE_BAUTISMO",
        "CERT_NACIMIENTO",
        "CERT_MATRIMONIO_PADRES",
        "CI_NINO",
        "CI_PADRE",
        "CI_MADRE",
        "CI_TUTOR",
        "OTRO",
    ]
    for doc_name in docs_esperados:
        assert hasattr(TipoDocumento, doc_name)


def test_doc_checklist_map():
    """Verifica que el mapa de checklist contemple los 8 documentos del formulario."""
    assert len(DOC_CHECKLIST_MAP) == 8
    assert DOC_CHECKLIST_MAP[TipoDocumento.FE_BAUTISMO] == "doc_fe_bautismo"
    assert DOC_CHECKLIST_MAP[TipoDocumento.CERT_NACIMIENTO] == "doc_cert_nacimiento"
    assert DOC_CHECKLIST_MAP[TipoDocumento.FORMULARIO_INSCRIPCION] == "doc_formulario_inscripcion"
    assert DOC_CHECKLIST_MAP[TipoDocumento.CI_NINO] == "doc_ci_nino"


def test_documento_item_schema_valid():
    """Prueba que DocumentoItem serializa y valida correctamente los campos."""
    now = datetime.now()
    doc = DocumentoItem(
        id=1,
        inscripcion_id=10,
        tipo_documento=TipoDocumento.FE_BAUTISMO,
        nombre_archivo="fe_bautismo_juan.pdf",
        ruta_archivo="/uploads/documentos/fe_bautismo_juan.pdf",
        mime_type="application/pdf",
        tamano_bytes=102400,
        estado=EstadoDocumento.ENTREGADO,
        observaciones="Copia legalizada",
        created_at=now,
    )
    assert doc.id == 1
    assert doc.tipo_documento == TipoDocumento.FE_BAUTISMO
    assert doc.estado == EstadoDocumento.ENTREGADO
    assert doc.tamano_bytes == 102400


def test_verificar_documento_payload():
    """Prueba que el payload para verificar o rechazar documentos sea consistente."""
    payload = VerificarDocumentoPayload(
        estado=EstadoDocumento.VERIFICADO,
        observaciones="Sello parroquial legible y verificado.",
    )
    assert payload.estado == EstadoDocumento.VERIFICADO
    assert "Sello" in (payload.observaciones or "")


def test_documento_list_response():
    """Prueba la estructura de respuesta completa para la vista del catecúmeno."""
    now = datetime.now()
    doc1 = DocumentoItem(
        id=1,
        inscripcion_id=5,
        tipo_documento=TipoDocumento.CERT_NACIMIENTO,
        nombre_archivo="cert_nac.pdf",
        ruta_archivo="/uploads/documentos/cert_nac.pdf",
        mime_type="application/pdf",
        tamano_bytes=50000,
        estado=EstadoDocumento.VERIFICADO,
        created_at=now,
    )
    checklist = {
        "doc_formulario_inscripcion": True,
        "doc_fe_bautismo": True,
        "doc_cert_nacimiento": True,
        "doc_cert_matrimonio_padres": False,
        "doc_ci_nino": True,
        "doc_ci_padre": False,
        "doc_ci_madre": False,
        "doc_ci_tutor": False,
    }
    resp = DocumentoListResponse(
        persona_id=12,
        nombre_completo="Matias Mamani Quispe",
        inscripcion_id=5,
        total_subidos=1,
        documentos=[doc1],
        checklist_estado=checklist,
    )
    assert resp.persona_id == 12
    assert resp.total_subidos == 1
    assert resp.checklist_estado["doc_fe_bautismo"] is True
    assert resp.checklist_estado["doc_ci_padre"] is False
