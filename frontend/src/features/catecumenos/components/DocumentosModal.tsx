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
        className="bg-white rounded-2xl shadow-2xl border border-app-border w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera Estilo Litúrgico */}
        <div className="px-6 py-5 border-b border-app-border bg-stone-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-lit-accent/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shadow-inner">
                📁
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-lit-accent flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Expediente Digital
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white font-serif tracking-tight">
                  Documentación Sacramental · {nombreCatecumeno}
                </h2>
                <p className="text-xs text-stone-300">
                  Carga, verificación y validación digital de las 8 fotocopias requeridas para el sacramento.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                disabled={loading}
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Actualizar documentos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barra de Progreso de Documentación */}
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-lit-accent">{porcentaje}%</span>
            </div>

            <div className="flex items-center gap-4 sm:justify-center text-xs">
              <span className="text-stone-300">
                <strong className="text-white">{docsSubidosCount}</strong> de {totalDocs} archivos
              </span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {docsVerificadosCount} verificados
              </span>
            </div>

            <div className="text-right text-[11px] text-stone-400">
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
          <div className="mx-6 mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileUp className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-900">
                  Subiendo a: {DOCUMENTOS_CONFIG.find(d => d.tipo === activeUploadTipo)?.titulo}
                </span>
              </div>
              <button
                onClick={() => { setActiveUploadTipo(null); setSelectedFile(null); }}
                className="text-stone-500 hover:text-stone-800 text-xs"
              >
                Cancelar
              </button>
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200 text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-stone-400 flex-shrink-0" />
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
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-lit-primary"
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
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-amber-200 bg-amber-50/15'
                        : 'border-dashed border-stone-300 bg-stone-50/50 hover:bg-stone-50'
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
                              <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                Requerido
                              </span>
                            ) : (
                              <span className="text-[9px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
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
                                <AlertCircle className="w-3 h-3 text-stone-400" />
                                Pendiente
                              </span>
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Detalles si ya está subido */}
                      {hasDoc && uploadedDoc && (
                        <div className="mt-3 p-2.5 rounded-lg bg-white border border-app-border/80 text-xs space-y-1">
                          <div className="flex items-center justify-between text-stone-700">
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
                            <p className="text-[11px] text-stone-600 italic border-l-2 border-lit-primary/40 pl-2 mt-1">
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
                                  ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
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
                                  className="px-2 py-0.5 rounded text-[11px] bg-rose-600 text-white font-bold hover:bg-rose-700"
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-1.5 py-0.5 text-[11px] text-stone-500 hover:text-stone-800"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(uploadedDoc.id)}
                                className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Eliminar archivo adjunto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[11px] text-stone-400 italic">
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
        <div className="px-6 py-4 bg-stone-50 border-t border-app-border flex items-center justify-between">
          <div className="text-xs text-app-muted flex items-center gap-1.5">
            <FolderArchive className="w-4 h-4 text-stone-400" />
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
