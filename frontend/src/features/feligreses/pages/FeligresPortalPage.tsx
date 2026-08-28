/**
 * FeligresPortalPage — Portal exclusivo para el Padre de Familia / Tutor.
 *
 * Muestra el perfil del feligrés autenticado, sus credenciales y el listado
 * de sus hijos catecúmenos vinculados con su respectivo Gafete QR de Asistencia.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { useLiturgicalTheme } from '@/core/context/ThemeContext';
import apiClient from '@/core/api/client';
import {
  LogOut, Baby, QrCode,
  ShieldCheck, Phone, User, CheckCircle2, FileText, AlertCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { QRGafete } from '@/features/catecumenos/components/QRGafete';
import type { FeligresDetalle, CatecumenoDetalle } from '@/types';

export const FeligresPortalPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { seasonInfo } = useLiturgicalTheme();

  const [perfil, setPerfil]   = useState<FeligresDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<CatecumenoDetalle | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<FeligresDetalle>('/feligreses/mi-perfil')
      .then(res => setPerfil(res.data))
      .catch(err => setError(err?.response?.data?.detail ?? 'No se pudo cargar el perfil del feligrés.'))
      .finally(() => setLoading(false));
  }, []);

  // Cargar detalle completo del catecúmeno seleccionado para mostrar su QR Gafete oficial
  const handleSelectHijo = async (personaId: number) => {
    try {
      const res = await apiClient.get<CatecumenoDetalle>(`/catecumenos/${personaId}`);
      setSelectedChild(res.data);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex flex-col">
      {/* ── Navbar del Portal Feligrés ──────────────────────────────── */}
      <header className="bg-white border-b border-app-border shadow-xs px-6 py-4 flex items-center justify-between sticky top-0 z-30">
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

        <div className="flex items-center gap-4">
          {/* Badge Litúrgico */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-lit-surface border border-lit-border text-xs font-semibold text-lit-primary">
            <span>{seasonInfo.icon}</span>
            <span>{seasonInfo.name}</span>
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-app-border">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-app-text">{user?.nombres || user?.username}</p>
              <p className="text-[10px] text-app-muted font-mono">Feligrés</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4 text-semantic-error" />}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* ── Contenido Principal ──────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">

        {/* Banner de bienvenida */}
        <div className="rounded-2xl p-6 bg-gradient-to-r from-lit-primary via-lit-primary-dark to-stone-900 text-white shadow-lg space-y-2 relative overflow-hidden">
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
            Desde este portal puedes consultar la información de tus hijos inscritos en la catequesis, revisar la compra de sus materiales y obtener su pase de asistencia QR oficial.
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
                    <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 font-mono font-bold">{perfil.username}</code>
                  </div>
                </div>

                <div className="pt-3 border-t border-app-border text-[11px] text-app-muted space-y-1">
                  <p className="flex items-center gap-1 text-lit-primary font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Identidad vinculada por CI
                  </p>
                  <p className="text-[10px]">Si necesitas actualizar tu número de teléfono o datos, solicítalo en secretaría.</p>
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
                <div className="space-y-4">
                  {perfil.hijos.map(hijo => (
                    <Card key={hijo.persona_id} className="p-5 space-y-4 hover:border-lit-primary/40 transition-all">
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

                      {/* Panel Provisional de Estado Documental y Requisitos */}
                      <div className="p-3.5 rounded-xl bg-stone-50 border border-app-border space-y-2">
                        <p className="text-[11px] font-bold text-lit-primary uppercase tracking-wide flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Requisitos y Estado Documental (Provisional)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-app-border">
                            <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-app-text">Fe de Bautismo</p>
                              <p className="text-[9px] text-semantic-success font-bold">Presentado ✓</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-app-border">
                            <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-app-text">Cert. Nacimiento</p>
                              <p className="text-[9px] text-semantic-success font-bold">Presentado ✓</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-app-border">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-app-text">Fotocopia CI Niño</p>
                              <p className="text-[9px] text-amber-600 font-bold">Pendiente ⚠️</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-app-border">
                            <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-app-text">Fotocopia CI Tutor</p>
                              <p className="text-[9px] text-semantic-success font-bold">Presentado ✓</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-app-border text-xs flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-lit-primary font-medium">
                            <QrCode className="w-3.5 h-3.5" /> Gafete QR de Asistencia del Niño
                          </span>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<QrCode className="w-3.5 h-3.5" />}
                          onClick={() => handleSelectHijo(hijo.persona_id)}
                        >
                          Ver Gafete QR
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Modal / Vista de Gafete QR del hijo seleccionado */}
              {selectedChild && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-app-border">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-app-text flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-lit-primary" /> Gafete Oficial de Asistencia
                      </h4>
                      <button
                        onClick={() => setSelectedChild(null)}
                        className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-app-muted"
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
