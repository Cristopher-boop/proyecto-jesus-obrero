import React from 'react';
import { COMUNIDADES_ADULTOS } from '../data/landingData';
import { CheckCircle2, Heart, Sparkles } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const ComunidadesVidaSection: React.FC = () => {
  return (
    <section id="comunidades" className="py-20 bg-app-bg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lit-surface border border-lit-border text-lit-primary text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 text-lit-accent" />
            <span>Comunidades de Vida & Fraternidad</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-app-text tracking-tight">
            Un Hogar Espiritual para Cada Etapa de la Vida
          </h2>

          <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
            La fe no termina con la juventud: madura y se profundiza a lo largo de los años.
            Nuestras comunidades brindan espacios fraternos de encuentro, oración y servicio adaptados
            a los desafíos de la madurez y la riqueza de la tercera edad.
          </p>
        </div>

        {/* Mosaico de las Comunidades de Vida */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {COMUNIDADES_ADULTOS.map((comu) => (
            <div
              key={comu.id}
              className="bg-app-card rounded-3xl border border-app-border shadow-md overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300"
            >
              <div>
                {/* Cabecera con Imagen */}
                <div className="relative h-60 w-full overflow-hidden bg-lit-surface border-b border-app-border">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${comu.imagenUrl}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  </div>

                  <div className="absolute top-4 left-4">
                    <Badge variant="gold" size="sm">
                      {comu.rangoEdad}
                    </Badge>
                  </div>

                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] text-white/95 border border-white/20 flex items-center gap-1">
                    <span>📸</span>
                    <span>Espacio Foto Real</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <span className="text-xs font-semibold text-lit-accent block">
                      {comu.frecuencia}
                    </span>
                    <h3 className="font-serif text-2xl font-bold leading-tight">
                      {comu.nombre}
                    </h3>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="p-3 rounded-2xl bg-lit-surface/40 border border-lit-border/80">
                    <span className="text-[10px] text-lit-primary uppercase font-bold tracking-wider block">
                      Misión y Propósito:
                    </span>
                    <p className="text-xs text-app-text font-serif italic mt-0.5">
                      "{comu.mision}"
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                    {comu.descripcion}
                  </p>

                  <div className="pt-3 border-t border-app-border space-y-2">
                    <span className="text-xs font-bold text-app-text flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-lit-accent" />
                      Actividades y Encuentros Principales:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {comu.actividades.map((act, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-app-text/90">
                          <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0 border-t border-app-border/60 flex items-center justify-between text-xs text-app-muted">
                <span>Inscripciones y participación abierta</span>
                <span className="font-semibold text-lit-primary">Acércate a Despacho</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComunidadesVidaSection;
