import React, { useState, useRef } from 'react';
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Upload,
  Trash2, ExternalLink, X, ShieldCheck,
  AlertCircle, RefreshCw, FileUp, Sparkles, FolderArchive
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { useDocumentosCatecumeno } from '../hooks/useCatecumenos';
import type { TipoDocumento, EstadoDocumento, DocumentoItem } from '@/types';

interface DocumentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaId: number | null;
  nombreCatecumeno: string;
  onDocumentChange?: () => void;
}

interface DocMeta {
  tipo: TipoDocumento;
  titulo: string;
  subtitulo: string;
  esObligatorio: boolean;
  categoria: 'IDENTIDAD' | 'SACRAMENTAL' | 'PARROQUIAL';
}

const DOCUMENTOS_CONFIG: DocMeta[] = [
  {
    tipo: 'FORMULARIO_INSCRIPCION',
    titulo: 'Formulario de Inscripción',
    subtitulo: 'Ficha oficial firmada por los padres o tutores',
    esObligatorio: true,
    categoria: 'PARROQUIAL',
  },
  {
    tipo: 'FE_BAUTISMO',
    titulo: 'Certificado / Fe de Bautismo',
    subtitulo: 'Legalizada por la parroquia donde fue bautizado/a',
    esObligatorio: true,
    categoria: 'SACRAMENTAL',
  },
  {
    tipo: 'CERT_NACIMIENTO',
    titulo: 'Certificado de Nacimiento',
    subtitulo: 'Fotocopia simple o certificado original SERECI',
    esObligatorio: true,
    categoria: 'IDENTIDAD',
  },
  {
    tipo: 'CERT_MATRIMONIO_PADRES',
    titulo: 'Cert. Matrimonio o Compromiso',
    subtitulo: 'Matrimonio religioso o civil de los padres',
    esObligatorio: false,
    categoria: 'SACRAMENTAL',
  },
  {
    tipo: 'CI_NINO',
    titulo: 'Cédula de Identidad (Niño/a)',
    subtitulo: 'Fotocopia anverso y reverso vigente',
    esObligatorio: true,
    categoria: 'IDENTIDAD',
  },
  {
    tipo: 'CI_PADRE',
    titulo: 'Cédula de Identidad (Padre)',
    subtitulo: 'Fotocopia simple vigente',
    esObligatorio: false,
    categoria: 'IDENTIDAD',
  },
  {
    tipo: 'CI_MADRE',
    titulo: 'Cédula de Identidad (Madre)',
    subtitulo: 'Fotocopia simple vigente',
    esObligatorio: false,
    categoria: 'IDENTIDAD',
  },
  {
    tipo: 'CI_TUTOR',
    titulo: 'Cédula de Identidad (Tutor Legal)',
    subtitulo: 'Obligatorio en caso de no convivir con los padres',
    esObligatorio: false,
    categoria: 'IDENTIDAD',
  },
];

const ESTADO_BADGE_CONFIG: Record<EstadoDocumento, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral'; icon: React.ReactNode }> = {
  VERIFICADO: {
    label: 'Verificado',
    variant: 'success',
    icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
  },
  ENTREGADO: {
    label: 'Entregado (Por Revisar)',
    variant: 'warning',
    icon: <Clock className="w-3 h-3 text-amber-600" />,
  },
  RECHAZADO: {
    label: 'Observado / Rechazado',
    variant: 'error',
    icon: <AlertTriangle className="w-3 h-3 text-rose-600" />,
  },
  PENDIENTE: {
    label: 'Pendiente',
    variant: 'neutral',
    icon: <AlertCircle className="w-3 h-3 text-stone-400" />,
  },
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const DocumentosModal: React.FC<DocumentosModalProps> = ({
  isOpen,
  onClose,
  personaId,
  nombreCatecumeno,
  onDocumentChange,
}) => {
  const {
    data,
    loading,
    actionLoading,
    error,
    refetch,
    subirDocumento,
    verificarDocumento,
    eliminarDocumento,
  } = useDocumentosCatecumeno(isOpen ? personaId : null);

  const [activeUploadTipo, setActiveUploadTipo] = useState<TipoDocumento | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const backendBaseUrl = (import.meta as any).env?.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8000';

  const handleStartUpload = (tipo: TipoDocumento) => {
    setActiveUploadTipo(tipo);
    setSelectedFile(null);
    setObservaciones('');
    setModalFeedback(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleConfirmUpload = async () => {
    if (!activeUploadTipo || !selectedFile) return;

    const res = await subirDocumento(activeUploadTipo, selectedFile, observaciones);
    if (res.success) {
      setModalFeedback({ type: 'success', message: 'Documento subido y registrado con éxito.' });
      setActiveUploadTipo(null);
      setSelectedFile(null);
      setObservaciones('');
      if (onDocumentChange) onDocumentChange();
      setTimeout(() => setModalFeedback(null), 3500);
    } else {
      setModalFeedback({ type: 'error', message: res.error || 'Error al subir el archivo.' });
    }
  };

  const handleToggleVerificado = async (doc: DocumentoItem) => {
    const nuevoEstado: EstadoDocumento = doc.estado === 'VERIFICADO' ? 'ENTREGADO' : 'VERIFICADO';
    const res = await verificarDocumento(
      doc.id,
      nuevoEstado,
      nuevoEstado === 'VERIFICADO' ? 'Documento revisado y cotejado' : undefined
    );
    if (res.success) {
      if (onDocumentChange) onDocumentChange();
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    const res = await eliminarDocumento(docId);
    if (res.success) {
      setConfirmDeleteId(null);
      setModalFeedback({ type: 'success', message: 'Documento eliminado correctamente.' });
      if (onDocumentChange) onDocumentChange();
      setTimeout(() => setModalFeedback(null), 3000);
    } else {
      setModalFeedback({ type: 'error', message: res.error || 'Error al eliminar documento.' });
    }
  };

  // Cálculos estadísticos
  const totalDocs = DOCUMENTOS_CONFIG.length;
  const docsSubidosCount = data?.documentos?.length ?? 0;
  const docsVerificadosCount = data?.documentos?.filter(d => d.estado === 'VERIFICADO').length ?? 0;
  const porcentaje = Math.round((docsSubidosCount / totalDocs) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-app-card rounded-2xl shadow-2xl border border-app-border w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera Estilo Litúrgico */}
        <div className="px-6 py-5 border-b border-lit-border bg-lit-surface text-app-text relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-80 h-80 bg-lit-accent/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-app-card border border-app-border flex items-center justify-center text-2xl shadow-2xs">
                📁
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-lit-primary flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-lit-accent" /> Expediente Digital
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-lit-primary font-serif tracking-tight">
                  Documentación Sacramental · {nombreCatecumeno}
                </h2>
                <p className="text-xs text-app-muted">
                  Carga, verificación y validación digital de las 8 fotocopias requeridas para el sacramento.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                disabled={loading}
                className="p-2 rounded-xl text-app-muted hover:text-app-text hover:bg-lit-surface transition-colors"
                title="Actualizar documentos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-app-muted hover:text-app-text hover:bg-lit-surface transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barra de Progreso de Documentación */}
          <div className="mt-4 pt-4 border-t border-lit-border grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-app-bg border border-app-border rounded-full h-2 overflow-hidden">
                <div
                  className="bg-lit-primary h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-lit-primary">{porcentaje}%</span>
            </div>

            <div className="flex items-center gap-4 sm:justify-center text-xs">
              <span className="text-app-muted">
                <strong className="text-app-text">{docsSubidosCount}</strong> de {totalDocs} archivos
              </span>
              <span className="text-semantic-success-text flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {docsVerificadosCount} verificados
              </span>
            </div>

            <div className="text-right text-[11px] text-app-muted">
              Formatos: PDF, JPG, PNG, WEBP (máx. 10MB)
            </div>
          </div>
        </div>

        {/* Input Oculto de Archivos */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
        />

        {/* Notificaciones y Alertas */}
        {modalFeedback && (
          <div className="px-6 pt-4">
            <Alert
              variant={modalFeedback.type === 'success' ? 'success' : 'error'}
              title={modalFeedback.type === 'success' ? 'Operación exitosa' : 'Atención'}
            >
              {modalFeedback.message}
            </Alert>
          </div>
        )}

        {error && (
          <div className="px-6 pt-4">
            <Alert variant="error" title="Error">{error}</Alert>
          </div>
        )}

        {/* Área de Confirmación de Carga Activa */}
        {activeUploadTipo && selectedFile && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-semantic-warning-bg border border-semantic-warning/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileUp className="w-4 h-4 text-semantic-warning-text" />
                <span className="text-xs font-bold text-semantic-warning-text">
                  Subiendo a: {DOCUMENTOS_CONFIG.find(d => d.tipo === activeUploadTipo)?.titulo}
                </span>
              </div>
              <button
                onClick={() => { setActiveUploadTipo(null); setSelectedFile(null); }}
                className="text-app-muted hover:text-app-text text-xs"
              >
                Cancelar
              </button>
            </div>

            <div className="flex items-center justify-between bg-app-card p-2.5 rounded-lg border border-app-border text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-app-muted flex-shrink-0" />
                <span className="font-medium text-app-text truncate">{selectedFile.name}</span>
                <span className="text-[10px] text-app-muted">({formatFileSize(selectedFile.size)})</span>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-lit-primary font-semibold hover:underline flex-shrink-0 ml-2"
              >
                Cambiar
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                placeholder="Observaciones opcionales (ej: Original verificado, copia legalizada)..."
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-app-border bg-app-bg text-app-text focus:outline-none focus:ring-1 focus:ring-lit-primary"
              />
              <Button
                variant="primary"
                size="sm"
                className="w-full sm:w-auto flex-shrink-0"
                isLoading={actionLoading}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                onClick={handleConfirmUpload}
              >
                Confirmar y Guardar
              </Button>
            </div>
          </div>
        )}

        {/* Lista / Cuadrícula de Documentos */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-app-border/40">
          {loading && !data ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lit-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DOCUMENTOS_CONFIG.map((docConfig) => {
                const uploadedDoc = data?.documentos?.find(d => d.tipo_documento === docConfig.tipo);
                const hasDoc = Boolean(uploadedDoc);
                const isDeleting = confirmDeleteId === uploadedDoc?.id;

                const fileUrl = uploadedDoc?.ruta_archivo
                  ? `${backendBaseUrl}${uploadedDoc.ruta_archivo}`
                  : null;

                return (
                  <div
                    key={docConfig.tipo}
                    className={`rounded-xl border p-4 transition-all duration-150 flex flex-col justify-between ${
                      hasDoc
                        ? uploadedDoc?.estado === 'VERIFICADO'
                          ? 'border-semantic-success/40 bg-semantic-success-bg/30'
                          : 'border-semantic-warning/40 bg-semantic-warning-bg/30'
                        : 'border-dashed border-app-border bg-app-bg/50 hover:bg-app-bg'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-app-text">
                              {docConfig.titulo}
                            </h4>
                            {docConfig.esObligatorio ? (
                              <span className="text-[9px] font-semibold text-semantic-error-text bg-semantic-error-bg px-1.5 py-0.5 rounded border border-semantic-error/20">
                                Requerido
                              </span>
                            ) : (
                              <span className="text-[9px] text-app-muted bg-app-bg px-1.5 py-0.5 rounded border border-app-border">
                                Opcional
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-app-muted mt-0.5 leading-snug">
                            {docConfig.subtitulo}
                          </p>
                        </div>

                        {/* Estado Badge */}
                        <div className="flex-shrink-0">
                          {hasDoc ? (
                            <Badge variant={ESTADO_BADGE_CONFIG[uploadedDoc!.estado].variant} size="sm">
                              <span className="flex items-center gap-1">
                                {ESTADO_BADGE_CONFIG[uploadedDoc!.estado].icon}
                                {ESTADO_BADGE_CONFIG[uploadedDoc!.estado].label}
                              </span>
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              <span className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-app-muted" />
                                Pendiente
                              </span>
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Detalles si ya está subido */}
                      {hasDoc && uploadedDoc && (
                        <div className="mt-3 p-2.5 rounded-lg bg-app-card border border-app-border/80 text-xs space-y-1">
                          <div className="flex items-center justify-between text-app-text">
                            <span className="truncate font-medium flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-lit-primary flex-shrink-0" />
                              <span className="truncate max-w-[200px]" title={uploadedDoc.nombre_archivo}>
                                {uploadedDoc.nombre_archivo}
                              </span>
                            </span>
                            <span className="text-[10px] text-app-muted flex-shrink-0">
                              {formatFileSize(uploadedDoc.tamano_bytes)}
                            </span>
                          </div>

                          {uploadedDoc.observaciones && (
                            <p className="text-[11px] text-app-muted italic border-l-2 border-lit-primary/40 pl-2 mt-1">
                              "{uploadedDoc.observaciones}"
                            </p>
                          )}

                          <p className="text-[10px] text-app-muted mt-1">
                            Subido el {new Date(uploadedDoc.created_at).toLocaleDateString('es-BO', {
                              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="mt-3 pt-3 border-t border-app-border/50 flex items-center justify-between gap-2">
                      {hasDoc && uploadedDoc ? (
                        <>
                          <div className="flex items-center gap-2">
                            {fileUrl && (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-lit-primary hover:bg-lit-surface border border-lit-border transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Ver / Abrir
                              </a>
                            )}

                            <button
                              onClick={() => handleToggleVerificado(uploadedDoc)}
                              disabled={actionLoading}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                uploadedDoc.estado === 'VERIFICADO'
                                  ? 'text-semantic-warning-text bg-semantic-warning-bg hover:bg-semantic-warning-bg/80 border border-semantic-warning/30'
                                  : 'text-semantic-success-text bg-semantic-success-bg hover:bg-semantic-success-bg/80 border border-semantic-success/30'
                              }`}
                              title={uploadedDoc.estado === 'VERIFICADO' ? 'Marcar como pendiente de revisión' : 'Validar autenticidad del documento'}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              {uploadedDoc.estado === 'VERIFICADO' ? 'Desmarcar' : 'Verificar'}
                            </button>
                          </div>

                          <div>
                            {isDeleting ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteDoc(uploadedDoc.id)}
                                  disabled={actionLoading}
                                  className="px-2 py-0.5 rounded text-[11px] bg-semantic-error-bg text-semantic-error-text border border-semantic-error/40 font-bold hover:bg-semantic-error/20"
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-1.5 py-0.5 text-[11px] text-app-muted hover:text-app-text"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(uploadedDoc.id)}
                                className="p-1 rounded-md text-app-muted hover:text-semantic-error-text hover:bg-semantic-error-bg/30 transition-colors"
                                title="Eliminar archivo adjunto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[11px] text-app-muted italic">
                            Sin archivo adjunto
                          </span>
                          <button
                            onClick={() => handleStartUpload(docConfig.tipo)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-lit-primary bg-lit-surface hover:bg-lit-border border border-lit-border transition-colors shadow-2xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Subir Archivo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-app-bg border-t border-app-border flex items-center justify-between">
          <div className="text-xs text-app-muted flex items-center gap-1.5">
            <FolderArchive className="w-4 h-4 text-app-muted" />
            <span>Almacenamiento seguro Parroquia Jesús Obrero</span>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar Expediente
          </Button>
        </div>
      </div>
    </div>
  );
};
