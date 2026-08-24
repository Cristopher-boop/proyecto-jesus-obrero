import React, { useState } from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { useLiturgicalTheme, LITURGICAL_SEASONS, LiturgicalSeason } from '@/core/context/ThemeContext';
import apiClient from '@/core/api/client';
import { Church, Lock, User, Sparkles, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

const ACTIVE_BG_IMAGE: string | null = '/fondo_login_5.webp';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { season, seasonInfo, setSeason } = useLiturgicalTheme();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });

      const { access_token, rol } = response.data;

      // Guardar sesión en el contexto global
      login(access_token, {
        id: 1,
        username,
        rol,
        nombres: 'Super Usuario Administrador',
      });
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('No se pudo conectar con el servidor. Verifica que uvicorn esté corriendo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const seasonKeys: LiturgicalSeason[] = ['ordinario', 'cuaresma', 'pentecostes', 'pascua'];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-app-bg">
      {/* ──────────────────────────────────────────────────────────────────
          LADO IZQUIERDO: Panel Visual / Imagen Parroquial Adaptativa
          ────────────────────────────────────────────────────────────────── */}
      <div className="lg:w-1/2 xl:w-7/12 relative flex flex-col justify-between p-8 sm:p-12 overflow-hidden min-h-[380px] lg:min-h-screen text-white bg-lit-primary-dark transition-all duration-500">
        {/* Imagen de fondo si existe, o gradiente dinámico litúrgico */}
        {ACTIVE_BG_IMAGE ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
            style={{ backgroundImage: `url(${ACTIVE_BG_IMAGE})` }}
          >
            {/* Capa de tinte litúrgico sobre la foto para garantizar contraste y armonía */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-lit-primary-dark/60 to-black/40 backdrop-blur-[1px]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-lit-primary via-lit-primary-dark to-stone-900">
            {/* Textura eclesiástica de fondo con cruz solemne en transparencia */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-black" />
            <div className="absolute right-[-8%] top-[15%] text-[22rem] opacity-5 pointer-events-none select-none font-serif leading-none">
              ✝
            </div>
          </div>
        )}

        {/* Cabecera Superior Izquierda */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-sm">
              ⛪
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Parroquia Jesús Obrero
                <span className="w-2 h-2 rounded-full bg-lit-accent animate-pulse" />
              </h1>
              <p className="text-xs text-white/70">Diócesis de El Alto · Bolivia</p>
            </div>
          </div>

          {/* Badge del tiempo litúrgico */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/15 text-xs font-semibold text-lit-accent-light">
            <span>{seasonInfo.icon}</span>
            <span className="hidden sm:inline">{seasonInfo.name}</span>
          </div>
        </div>

        {/* Mensaje Central de Bienvenida */}
        <div className="relative z-10 my-auto py-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lit-accent/20 border border-lit-accent/40 text-lit-accent text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Sistema de Gestión Pastoral
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-serif">
            Formando en la fe y en comunidad.
          </h2>

          <p className="text-sm text-white/80 leading-relaxed">
            Plataforma integral para el control de asistencia mediante código QR, seguimiento sacramental de catecúmenos y validación de expedientes en todas las capillas.
          </p>

          <div className="pt-2 flex items-center gap-6 text-xs text-white/70">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-lit-accent" />
              <span>Acceso Seguro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Church className="w-4 h-4 text-lit-accent" />
              <span>4 Capillas Filiales</span>
            </div>
          </div>
        </div>

        {/* Pie Inferior Izquierdo: Selector de Tiempos Litúrgicos para prueba interactiva */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/80">
            <Flame className="w-3.5 h-3.5 text-lit-accent" />
            <span className="font-medium">Probar tiempo litúrgico:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/15">
            {seasonKeys.map((key) => {
              const item = LITURGICAL_SEASONS[key];
              const isSelected = season === key;
              return (
                <button
                  key={key}
                  onClick={() => setSeason(key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${isSelected
                    ? 'bg-white text-stone-900 font-bold shadow-xs'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  title={`Cambiar a ${item.name}`}
                >
                  <span>{item.icon}</span>
                  <span className="text-[11px] hidden sm:inline">{item.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          LADO DERECHO: Formulario de Inicio de Sesión
          ────────────────────────────────────────────────────────────────── */}
      <div className="lg:w-1/2 xl:w-5/12 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-app-border shadow-ecclesiastical transition-all">
          {/* Encabezado del Formulario */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-app-text">
              Iniciar Sesión
            </h3>
            <p className="text-xs text-app-muted leading-relaxed">
              Ingresa tus credenciales autorizadas de secretaría, catequista o administrador.
            </p>
          </div>

          {/* Mensaje de Error si las credenciales fallan */}
          {error && (
            <Alert variant="error" title="Error de autenticación">
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Nombre de Usuario"
              type="text"
              required
              placeholder="Ej: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Contraseña"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md hover:shadow-lg transition-all"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ingresar al Sistema
            </Button>
          </form>

          {/* Indicador de credenciales de prueba para el Superadmin */}
          <div className="p-3.5 rounded-xl bg-lit-surface border border-lit-border/80 text-center space-y-1">
            <p className="text-[11px] font-bold text-lit-primary">
              🔑 Acceso Rápido de Superadmin
            </p>
            <p className="text-[11px] text-app-muted">
              Usuario: <code className="font-mono font-bold text-lit-primary">admin</code> · Contraseña: <code className="font-mono font-bold text-lit-primary">admin</code>
            </p>
          </div>

          {/* Pie de página institucional */}
          <div className="text-center pt-2 border-t border-app-border/70">
            <p className="text-[11px] text-app-muted">
              © 2026 Parroquia Jesús Obrero. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
