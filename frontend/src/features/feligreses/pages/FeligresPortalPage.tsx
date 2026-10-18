/**
 * FeligresPortalPage — Portal exclusivo para el Padre de Familia / Tutor.
 *
 * Muestra el perfil del feligrés autenticado, sus credenciales y el listado
 * de sus hijos catecúmenos vinculados con su estado de requisitos de ingreso,
 * documentos para la celebración del sacramento y su respectivo Gafete QR.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { useLiturgicalTheme } from '@/core/context/ThemeContext';
import apiClient from '@/core/api/client';
import {
  LogOut, Baby, QrCode,
  ShieldCheck, Phone, User, CheckCircle2, FileText, AlertCircle,
  BookOpen, BookCheck, DollarSign, Info,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { QRGafete } from '@/features/catecumenos/components/QRGafete';
import { ThemeModeToggle } from '@/components/ui/ThemeModeToggle';
import type { FeligresDetalle, CatecumenoDetalle } from '@/types';

export const FeligresPortalPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { seasonInfo } = useLiturgicalTheme();

  const [perfil, setPerfil]               = useState<FeligresDetalle | null>(null);
  const [hijosDetalles, setHijosDetalles] = useState<Record<number, CatecumenoDetalle>>({});
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<CatecumenoDetalle | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<FeligresDetalle>('/feligreses/mi-perfil')
      .then(async res => {
        setPerfil(res.data);
        // Cargar detalles completos de cada hijo vinculado para mostrar sus documentos reales
        const detallesMap: Record<number, CatecumenoDetalle> = {};
        for (const hijo of res.data.hijos) {
          try {
            const hRes = await apiClient.get<CatecumenoDetalle>(`/catecumenos/${hijo.persona_id}`);
            detallesMap[hijo.persona_id] = hRes.data;
          } catch {
            // Ignorar fallo puntual
          }
        }
        setHijosDetalles(detallesMap);
      })
      .catch(err => setError(err?.response?.data?.detail ?? 'No se pudo cargar el perfil del feligrés.'))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenGafete = (personaId: number) => {
    if (hijosDetalles[personaId]) {
      setSelectedChild(hijosDetalles[personaId]);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex flex-col">
      {/* ── Navbar del Portal Feligrés ──────────────────────────────── */}
      <header className="bg-app-card border-b border-app-border shadow-xs px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lit-surface border border-lit-border flex items-center justify-center text-xl shadow-xs">
            ⛪
          </div>
          <div>
            <h1 className="text-base font-bold text-app-text flex items-center gap-2">
              Parroquia Jesús Obrero
              <span className="w-1.5 h-1.5 rounded-full bg-lit-accent inline-block animate-pulse" />
            </h1>
            <p className="text-[11px] text-app-muted font-medium">Portal de Padres de Familia y Tutores</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Conmutador de modo claro / oscuro / sistema */}
          <ThemeModeToggle size="sm" />

          {/* Badge Litúrgico */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-lit-surface border border-lit-border text-xs font-semibold text-lit-primary">
            <span>{seasonInfo.icon}</span>
            <span>{seasonInfo.name}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-app-border">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-app-text">{user?.nombres || user?.username}</p>
              <p className="text-[10px] text-app-muted font-mono">Feligrés</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4 text-semantic-error-text" />}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* ── Contenido Principal ──────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">

        {/* Banner de bienvenida */}
        <div className="rounded-2xl p-6 bg-gradient-to-r from-lit-primary via-lit-primary-dark to-lit-primary text-white shadow-lg space-y-2 relative overflow-hidden">
          <div className="absolute right-[-5%] top-[-20%] text-9xl opacity-10 font-serif select-none pointer-events-none">
            ✝
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-lit-accent">
            <ShieldCheck className="w-3.5 h-3.5" /> Cuenta de Feligrés Activa
          </div>
          <h2 className="text-2xl font-bold tracking-tight font-serif">
            ¡Bienvenido(a), {perfil ? `${perfil.nombres} ${perfil.primer_apellido}` : user?.username}!
          </h2>
          <p className="text-xs text-white/80 max-w-xl leading-relaxed">
            Consulta los requisitos de ingreso de tus hijos, los documentos solicitados para la celebración del Sacramento y obtén su pase de asistencia QR oficial.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lit-primary" />
          </div>
        ) : error ? (
          <Alert variant="error" title="Atención">{error}</Alert>
        ) : perfil && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Ficha del Padre/Madre (1 Col) ────────────────────── */}
            <div className="space-y-4">
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-app-border">
                  <User className="w-4 h-4 text-lit-primary" />
                  <h3 className="text-xs font-bold text-lit-primary uppercase tracking-wide">Mis Datos de Registro</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <p className="text-[10px] text-app-muted">Nombre Completo</p>
                    <p className="font-semibold text-app-text">{perfil.nombres} {perfil.primer_apellido} {perfil.segundo_apellido ?? ''}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-app-muted">Cédula de Identidad (CI)</p>
                    <p className="font-mono font-bold text-app-text">{perfil.ci_dni}</p>
                  </div>
                  {perfil.telefono && (
                    <div>
                      <p className="text-[10px] text-app-muted">Teléfono de contacto</p>
                      <p className="flex items-center gap-1 text-app-text font-medium"><Phone className="w-3 h-3 text-app-muted" />{perfil.telefono}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-app-muted">Nombre de Usuario</p>
                    <code className="bg-app-bg border border-app-border px-2 py-0.5 rounded text-app-text font-mono font-bold">{perfil.username}</code>
                  </div>
                </div>

                <div className="pt-3 border-t border-app-border text-[11px] text-app-muted space-y-1">
                  <p className="flex items-center gap-1 text-lit-primary font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Identidad vinculada por CI
                  </p>
                  <p className="text-[10px]">Si necesitas actualizar tu número de teléfono o datos, solicítalo en secretaría parroquial.</p>
                </div>
              </Card>
            </div>

            {/* ── Mis Hijos / Catecúmenos (2 Cols) ────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-app-text flex items-center gap-2">
                  <Baby className="w-4 h-4 text-lit-primary" /> Mis Hijos Inscritos ({perfil.hijos.length})
                </h3>
              </div>

              {perfil.hijos.length === 0 ? (
                <Card className="p-8 text-center space-y-2">
                  <div className="text-4xl">🕊️</div>
                  <h4 className="text-sm font-bold text-app-text">Aún no tienes hijos vinculados</h4>
                  <p className="text-xs text-app-muted max-w-sm mx-auto">
                    Cuando acudas a la secretaría de la parroquia a inscribir a tu hijo/a, proporciona tu número de CI (<strong>{perfil.ci_dni}</strong>) para que lo vinculen directamente con esta cuenta.
                  </p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {perfil.hijos.map(hijo => {
                    const det = hijosDetalles[hijo.persona_id];
                    const insc = det?.inscripcion;

                    return (
                      <Card key={hijo.persona_id} className="p-5 space-y-5 hover:border-lit-primary/40 transition-all shadow-xs">
                        {/* Cabecera del hijo */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-base font-bold text-app-text">{hijo.nombres} {hijo.primer_apellido}</h4>
                            <p className="text-xs text-app-muted flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-lit-primary">
                                {hijo.tipo_sacramento === 'PRIMERA_COMUNION' ? 'Primera Comunión' : 'Confirmación'}
                              </span>
                              <span>· Sede Parroquia Jesús Obrero</span>
                            </p>
                          </div>
                          <Badge variant={hijo.estado === 'ACTIVO' ? 'success' : hijo.estado === 'BAJA' ? 'warning' : 'neutral'} size="sm">
                            {hijo.estado === 'ACTIVO' ? 'Activo' : hijo.estado === 'BAJA' ? 'Baja' : 'Graduado'}
                          </Badge>
                        </div>

                        {/* 1. Requisitos para Iniciar / Ingreso */}
                        <div className="p-4 rounded-xl bg-lit-surface/50 border border-lit-border space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-lit-primary uppercase tracking-wide flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> 1. Requisitos para Iniciar (Ingreso)
                            </p>
                            <span className="text-[10px] text-lit-primary font-bold">Materiales & Cuota</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {/* Cuadernillo */}
                            <div className="p-3 rounded-lg bg-app-card border border-app-border flex items-center justify-between gap-2 shadow-2xs">
                              <div className="flex items-center gap-2">
                                <BookCheck className="w-4 h-4 text-lit-primary flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-app-text">Cuadernillo</p>
                                  <p className="text-[10px] text-app-muted">Asistencia</p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                insc?.cuadernillo_comprado ? 'bg-semantic-success-bg text-semantic-success-text border-semantic-success-border' : 'bg-semantic-warning-bg text-semantic-warning-text border-semantic-warning-border'
                              }`}>
                                {insc?.cuadernillo_comprado ? 'Entregado ✓' : 'Falta ⚠️'}
                              </span>
                            </div>

                            {/* Libro */}
                            <div className="p-3 rounded-lg bg-app-card border border-app-border flex items-center justify-between gap-2 shadow-2xs">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-lit-primary flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-app-text">Libro Oficial</p>
                                  <p className="text-[10px] text-app-muted">Catequesis</p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                insc?.libro_comprado ? 'bg-semantic-success-bg text-semantic-success-text border-semantic-success-border' : 'bg-semantic-warning-bg text-semantic-warning-text border-semantic-warning-border'
                              }`}>
                                {insc?.libro_comprado ? 'Entregado ✓' : 'Falta ⚠️'}
                              </span>
                            </div>

                            {/* Cuota inicial 20 Bs */}
                            <div className="p-3 rounded-lg bg-app-card border border-app-border flex items-center justify-between gap-2 shadow-2xs">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-lit-primary flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-app-text">Cuota Inicial</p>
                                  <p className="text-[10px] text-app-muted">Aporte 20 Bs</p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                insc?.pago_cuota_inicial ? 'bg-semantic-success-bg text-semantic-success-text border-semantic-success-border' : 'bg-semantic-warning-bg text-semantic-warning-text border-semantic-warning-border'
                              }`}>
                                {insc?.pago_cuota_inicial ? 'Pagado ✓' : 'Pendiente ⚠️'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Documentación Requerida para Salida / Celebración del Sacramento */}
                        <div className="p-4 rounded-xl bg-app-bg border border-app-border space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <p className="text-xs font-bold text-app-text uppercase tracking-wide flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-lit-primary" /> 2. Documentos para el Sacramento (Salida)
                            </p>
                            <span className="text-[10px] font-semibold text-app-muted bg-app-card border border-app-border px-2 py-0.5 rounded-full">
                              📄 Solo Fotocopias (Nada original)
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            {/* 1. Formulario */}
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-app-card border border-app-border shadow-2xs">
                              <span className="font-semibold text-app-text">1. Formulario de Inscripción firmado</span>
                              <span className={`text-[10px] font-bold ${insc?.doc_formulario_inscripcion ? 'text-semantic-success-text' : 'text-semantic-warning-text'}`}>
                                {insc?.doc_formulario_inscripcion ? 'Presentado ✓' : 'Pendiente ⚠️'}
                              </span>
                            </div>

                            {/* 2. Certificado de Bautismo */}
                            <div className="p-2.5 rounded-lg bg-app-card border border-app-border space-y-1.5 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-app-text">2. Certificado de Bautismo / Fe de Bautizo</span>
                                <span className={`text-[10px] font-bold ${insc?.doc_fe_bautismo ? 'text-semantic-success-text' : 'text-semantic-warning-text'}`}>
                                  {insc?.doc_fe_bautismo ? 'Presentado ✓' : 'Pendiente ⚠️'}
                                </span>
                              </div>
                              {det && !det.es_bautizado && (
                                <div className="p-2 rounded-md bg-semantic-warning-bg border border-semantic-warning-border text-[10px] text-semantic-warning-text flex items-start gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-semantic-warning-text" />
                                  <span>
                                    <strong>Aviso pastoral importante:</strong> Si tu hijo/a aún no ha realizado su Bautismo, debe recibirlo antes de 2º año en la Vigilia Pascual.
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* 3. Certificado de Nacimiento */}
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-app-card border border-app-border shadow-2xs">
                              <span className="font-semibold text-app-text">3. Certificado de Nacimiento</span>
                              <span className={`text-[10px] font-bold ${insc?.doc_cert_nacimiento ? 'text-semantic-success-text' : 'text-semantic-warning-text'}`}>
                                {insc?.doc_cert_nacimiento ? 'Presentado ✓' : 'Pendiente ⚠️'}
                              </span>
                            </div>

                            {/* 4. Certificado de Matrimonio Religioso o Compromiso */}
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-app-card border border-app-border shadow-2xs">
                              <span className="font-semibold text-app-text">4. Certificado de Matrimonio Religioso o Compromiso de Matrimonio</span>
                              <span className={`text-[10px] font-bold ${insc?.doc_cert_matrimonio_padres ? 'text-semantic-success-text' : 'text-semantic-warning-text'}`}>
                                {insc?.doc_cert_matrimonio_padres ? 'Presentado ✓' : 'Pendiente ⚠️'}
                              </span>
                            </div>

                            {/* 5. Fotocopias de CIs */}
                            <div className="p-2.5 rounded-lg bg-app-card border border-app-border space-y-1.5 shadow-2xs">
                              <span className="font-semibold text-app-text block">5. Fotocopias de Cédulas de Identidad (CIs):</span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-1">
                                <div className={`p-1.5 rounded border text-center font-bold ${insc?.doc_ci_nino ? 'bg-semantic-success-bg border-semantic-success-border text-semantic-success-text' : 'bg-app-bg border-app-border text-app-muted'}`}>
                                  CI Catecúmeno {insc?.doc_ci_nino ? '✓' : '⚠️'}
                                </div>
                                <div className={`p-1.5 rounded border text-center font-bold ${insc?.doc_ci_padre ? 'bg-semantic-success-bg border-semantic-success-border text-semantic-success-text' : 'bg-app-bg border-app-border text-app-muted'}`}>
                                  CI Padre {insc?.doc_ci_padre ? '✓' : '⚠️'}
                                </div>
                                <div className={`p-1.5 rounded border text-center font-bold ${insc?.doc_ci_madre ? 'bg-semantic-success-bg border-semantic-success-border text-semantic-success-text' : 'bg-app-bg border-app-border text-app-muted'}`}>
                                  CI Madre {insc?.doc_ci_madre ? '✓' : '⚠️'}
                                </div>
                                <div className={`p-1.5 rounded border text-center font-bold ${insc?.doc_ci_tutor ? 'bg-semantic-success-bg border-semantic-success-border text-semantic-success-text' : 'bg-app-bg border-app-border text-app-muted'}`}>
                                  CI Tutor {insc?.doc_ci_tutor ? '✓' : '⚠️'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] text-app-muted flex items-center gap-1 pt-1">
                            <Info className="w-3.5 h-3.5" /> Entrega los documentos pendientes en secretaría parroquial para la habilitación sacramental.
                          </p>
                        </div>

                        {/* Botón para ver Gafete QR */}
                        <div className="flex items-center justify-between pt-2 border-t border-app-border text-xs flex-wrap gap-2">
                          <span className="flex items-center gap-1 text-lit-primary font-medium">
                            <QrCode className="w-3.5 h-3.5" /> Gafete Oficial de Asistencia
                          </span>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<QrCode className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenGafete(hijo.persona_id)}
                          >
                            Ver / Imprimir Gafete QR
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Modal de Gafete QR del hijo seleccionado */}
              {selectedChild && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                  <div className="bg-app-card rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-app-border animate-slide-in-right">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-app-text flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-lit-primary" /> Gafete Oficial de Asistencia
                      </h4>
                      <button
                        onClick={() => setSelectedChild(null)}
                        className="w-7 h-7 rounded-lg hover:bg-lit-surface flex items-center justify-center text-app-muted transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <QRGafete catecumeno={selectedChild} />

                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelectedChild(null)}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default FeligresPortalPage;
