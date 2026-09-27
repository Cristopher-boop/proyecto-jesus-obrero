import React, { useState } from 'react';
import {
  Users,
  QrCode,
  FileCheck,
  Church,
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Flame,
} from 'lucide-react';
import { useLiturgicalTheme, LITURGICAL_SEASONS, LiturgicalSeason } from '@/core/context/ThemeContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export const DashboardPage: React.FC = () => {
  const { season, seasonInfo, setSeason } = useLiturgicalTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCapilla, setFilterCapilla] = useState('TODAS');
  const [showAlert, setShowAlert] = useState(true);

  // Muestra de datos representativos de la Parroquia Jesús Obrero
  const stats = [
    {
      title: 'Catecúmenos Inscritos',
      value: '248',
      subtitle: 'Comunión (162) · Confirmación (86)',
      icon: Users,
      trend: '+12% vs 2025',
    },
    {
      title: 'Asistencia Último Domingo',
      value: '92.4%',
      subtitle: '229 asistentes registrados por QR',
      icon: QrCode,
      trend: '185 Puntuales · 44 En Misa',
    },
    {
      title: 'Documentos Validados',
      value: '88%',
      subtitle: '218 con Fe de Bautizo aprobada',
      icon: FileCheck,
      trend: '30 pendientes de revisión',
    },
    {
      title: 'Capillas y Subgrupos',
      value: '4 Capillas',
      subtitle: 'Jesús Obrero: San Pablo, San Pedro...',
      icon: Church,
      trend: '8 Grupos de formación',
    },
  ];

  const catecumenosSample = [
    {
      id: 1,
      nombre: 'Mateo Quispe Flores',
      grupo: 'San Pablo (2do Año)',
      capilla: 'Jesús Obrero',
      horario: 'Dom 10:00 - 12:45',
      asistencia: 'PUNTUAL',
      asistenciaHora: '09:48 AM',
      docBautizo: 'APROBADO',
    },
    {
      id: 2,
      nombre: 'Luciana Condori Mamani',
      grupo: 'San Pedro (2do Año)',
      capilla: 'Jesús Obrero',
      horario: 'Dom 10:00 - 12:45',
      asistencia: 'DURANTE_MISA',
      asistenciaHora: '10:25 AM',
      docBautizo: 'APROBADO',
    },
    {
      id: 3,
      nombre: 'Gabriel Choque Ramos',
      grupo: 'Comunión 1er Año',
      capilla: 'San Martín de Porras',
      horario: 'Sáb 15:00 - 17:30',
      asistencia: 'SOLO_CATEQUESIS',
      asistenciaHora: '16:15 PM',
      docBautizo: 'PENDIENTE',
    },
    {
      id: 4,
      nombre: 'Valentina Mendoza Rios',
      grupo: 'Confirmación 2do Año',
      capilla: 'Señor de la Santa Cruz',
      horario: 'Dom 08:00 - 10:30',
      asistencia: 'FALTA',
      asistenciaHora: 'No asistió',
      docBautizo: 'OBSERVADO',
    },
    {
      id: 5,
      nombre: 'Sebastián Alarcón Vargas',
      grupo: 'San Juan (2do Año)',
      capilla: 'Jesús Obrero',
      horario: 'Dom 10:00 - 12:45',
      asistencia: 'PUNTUAL',
      asistenciaHora: '09:52 AM',
      docBautizo: 'APROBADO',
    },
  ];

  const getAsistenciaBadge = (status: string) => {
    switch (status) {
      case 'PUNTUAL':
        return <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>Puntual (Antes de Misa)</Badge>;
      case 'DURANTE_MISA':
        return <Badge variant="warning" icon={<Clock className="w-3 h-3" />}>Durante la Misa</Badge>;
      case 'SOLO_CATEQUESIS':
        return <Badge variant="warning" icon={<Clock className="w-3 h-3" />}>Solo Catequesis</Badge>;
      case 'FALTA':
        return <Badge variant="error" icon={<AlertCircle className="w-3 h-3" />}>Falta</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getDocBadge = (status: string) => {
    switch (status) {
      case 'APROBADO':
        return <Badge variant="success">Fe de Bautizo ✓</Badge>;
      case 'PENDIENTE':
        return <Badge variant="warning">Pendiente Subida</Badge>;
      case 'OBSERVADO':
        return <Badge variant="error">Observado</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const filteredCatecumenos = catecumenosSample.filter((c) => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.grupo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapilla = filterCapilla === 'TODAS' || c.capilla === filterCapilla;
    return matchesSearch && matchesCapilla;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Banner de Tiempo Litúrgico Activo */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-lit-primary via-lit-primary-dark to-lit-primary text-white shadow-md relative overflow-hidden transition-all duration-300">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none text-9xl">
          {seasonInfo.icon}
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">{seasonInfo.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-lit-accent-light">
                Tiempo Litúrgico Activo
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{seasonInfo.name}</h2>
            <p className="text-xs text-white/80 leading-relaxed">
              {seasonInfo.description} La interfaz adapta su colorimetría ({seasonInfo.colorName}) y detalles en oro eclesiástico.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl backdrop-blur-xs border border-white/10 flex-wrap">
            <span className="text-xs font-medium text-white/70 px-2 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-lit-accent" /> Probar tema:
            </span>
            {(['ordinario', 'cuaresma', 'pentecostes', 'pascua'] as LiturgicalSeason[]).map((key) => (
              <button
                key={key}
                onClick={() => setSeason(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  season === key
                    ? 'bg-white text-stone-900 shadow-sm scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {LITURGICAL_SEASONS[key].icon} {LITURGICAL_SEASONS[key].name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Muestra de Alerta Semántica */}
      {showAlert && (
        <Alert
          variant="info"
          title="Próxima Celebración Parroquial"
          onClose={() => setShowAlert(false)}
        >
          Este domingo la Misa de las 10:00 AM en Jesús Obrero contará con la bendición especial de catecúmenos de 2do año. El control de asistencia por QR estará activo desde las 09:30 AM.
        </Alert>
      )}

      {/* 3. Tarjetas de Métricas de la Parroquia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} hoverEffect className="relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-app-muted uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-black text-app-text mt-1.5 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-lit-surface text-lit-primary flex items-center justify-center border border-lit-border/80 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-app-border/70 flex items-center justify-between text-xs">
                <span className="text-app-muted truncate">{stat.subtitle}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 4. Gráfico Visual de Asistencia + Registro Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Desglose de Asistencia */}
        <Card
          title="Desglose de Puntualidad (Misa y Catequesis)"
          subtitle="Distribución del último domingo en Jesús Obrero"
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            {/* Barra de progreso múltiple */}
            <div className="w-full h-5 bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: '65%' }} className="bg-lit-primary h-full transition-all" title="Puntual (65%)" />
              <div style={{ width: '20%' }} className="bg-lit-accent h-full transition-all" title="Durante la Misa (20%)" />
              <div style={{ width: '8%' }} className="bg-amber-400 h-full transition-all" title="Solo Catequesis (8%)" />
              <div style={{ width: '7%' }} className="bg-rose-400 h-full transition-all" title="Faltas (7%)" />
            </div>

            {/* Leyenda del gráfico */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-2.5 rounded-lg bg-lit-surface border border-lit-border/60">
                <div className="flex items-center gap-1.5 font-bold text-lit-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-lit-primary" />
                  <span>Puntual (Misa)</span>
                </div>
                <p className="text-lg font-black text-app-text mt-1">162</p>
                <p className="text-[10px] text-app-muted">Antes de 10:00 AM</p>
              </div>

              <div className="p-2.5 rounded-lg bg-lit-accent-light border border-lit-accent/40">
                <div className="flex items-center gap-1.5 font-bold text-lit-accent-dark">
                  <span className="w-2.5 h-2.5 rounded-full bg-lit-accent" />
                  <span>Durante Misa</span>
                </div>
                <p className="text-lg font-black text-app-text mt-1">48</p>
                <p className="text-[10px] text-app-muted">10:00 a 11:30 AM</p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Solo Catequesis</span>
                </div>
                <p className="text-lg font-black text-app-text mt-1">19</p>
                <p className="text-[10px] text-app-muted">11:30 a 12:45 PM</p>
              </div>

              <div className="p-2.5 rounded-lg bg-semantic-error-bg border border-semantic-error-border">
                <div className="flex items-center gap-1.5 font-bold text-semantic-error-text">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Faltas</span>
                </div>
                <p className="text-lg font-black text-app-text mt-1">19</p>
                <p className="text-[10px] text-app-muted">Inasistencias</p>
              </div>
            </div>

            {/* Asistencia por Subgrupos */}
            <div className="pt-3 border-t border-app-border/70">
              <h4 className="text-xs font-bold text-app-text mb-2">Puntualidad por Subgrupo (Jesús Obrero - 2do Año)</h4>
              <div className="space-y-2">
                {[
                  { name: 'Grupo San Pablo', rate: 96, count: '32/33 catecúmenos' },
                  { name: 'Grupo San Pedro', rate: 91, count: '30/33 catecúmenos' },
                  { name: 'Grupo San Juan', rate: 88, count: '29/33 catecúmenos' },
                ].map((grp, i) => (
                  <div key={i} className="flex items-center justify-between text-xs gap-3">
                    <span className="w-32 font-medium text-app-text truncate">{grp.name}</span>
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lit-primary rounded-full transition-all"
                        style={{ width: `${grp.rate}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-lit-primary w-12 text-right">{grp.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Formulario / Acciones Rápidas */}
        <Card
          title="Acciones Rápidas"
          subtitle="Operaciones pastorales frecuentes"
        >
          <div className="space-y-4">
            <Button
              variant="primary"
              className="w-full justify-start py-3"
              leftIcon={<QrCode className="w-4 h-4" />}
            >
              Iniciar Escáner QR de Misa
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-start py-3"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Inscribir Nuevo Catecúmeno
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start py-3"
              leftIcon={<FileCheck className="w-4 h-4" />}
            >
              Revisar Fe de Bautizos (3)
            </Button>

            {/* Muestra de Alertas Semánticas en Miniatura */}
            <div className="pt-3 border-t border-app-border/70 space-y-2">
              <p className="text-[11px] font-bold text-app-muted uppercase tracking-wider">Estados del Sistema</p>
              <div className="p-2.5 rounded-lg bg-semantic-success-bg border border-semantic-success-border text-semantic-success-text text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Base de Datos PostgreSQL Conectada</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Tabla Principal de Catecúmenos y Asistencias */}
      <Card
        title="Control de Catecúmenos y Asistencia Reciente"
        subtitle="Listado en tiempo real de inscripciones y registro por código QR"
        action={
          <div className="flex items-center gap-2">
            <Button variant="accent" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Nueva Inscripción
            </Button>
          </div>
        }
      >
        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Buscar por nombre o grupo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="w-full sm:w-60">
            <Select
              size="sm"
              leftIcon={<Filter className="w-3.5 h-3.5 text-app-muted" />}
              value={filterCapilla}
              onChange={(val) => setFilterCapilla(val)}
              options={[
                { value: 'TODAS', label: 'Todas las Capillas' },
                { value: 'Jesús Obrero', label: 'Jesús Obrero (Principal)' },
                { value: 'San Martín de Porras', label: 'San Martín de Porras' },
                { value: 'Señor de la Santa Cruz', label: 'Señor de la Santa Cruz' },
              ]}
            />
          </div>
        </div>

        {/* Tabla Responsiva */}
        <div className="overflow-x-auto rounded-xl border border-app-border/80 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-app-muted uppercase text-[10px] tracking-wider border-b border-app-border">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Catecúmeno</th>
                <th className="py-3.5 px-4 font-semibold">Grupo y Capilla</th>
                <th className="py-3.5 px-4 font-semibold">Horario Habitual</th>
                <th className="py-3.5 px-4 font-semibold">Última Asistencia</th>
                <th className="py-3.5 px-4 font-semibold">Documento</th>
                <th className="py-3.5 px-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border/60 bg-white">
              {filteredCatecumenos.length > 0 ? (
                filteredCatecumenos.map((item) => (
                  <tr key={item.id} className="hover:bg-lit-surface/40 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-app-text group-hover:text-lit-primary transition-colors">
                        {item.nombre}
                      </div>
                      <div className="text-[10px] text-app-muted">ID: JO-2026-{String(item.id).padStart(3, '0')}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-app-text">{item.grupo}</div>
                      <div className="text-[10px] text-app-muted">{item.capilla}</div>
                    </td>
                    <td className="py-3.5 px-4 text-app-muted font-medium">
                      {item.horario}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {getAsistenciaBadge(item.asistencia)}
                        <div className="text-[10px] text-app-muted pl-1">{item.asistenciaHora}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getDocBadge(item.docBautizo)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline" size="sm" leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                        Ver QR
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-app-muted">
                    No se encontraron catecúmenos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
