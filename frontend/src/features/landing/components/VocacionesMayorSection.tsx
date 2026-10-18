import React from 'react';
import { VOCACIONES_MAYOR } from '../data/landingData';
import { Sparkles, MapPin, CheckCircle2, Award } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const VocacionesMayorSection: React.FC = () => {
  return (
    <section id="vocaciones" className="py-20 bg-lit-surface/30 border-t border-app-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lit-surface border border-lit-border text-lit-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-lit-accent" />
            <span>Consagración Total & Vida Religiosa</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-app-text tracking-tight">
            Formaciones a un Nivel Mayor: Responder al Llamado
          </h2>

          <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
            Nuestra comunidad es fecunda en vocaciones de consagración total. Acompañamos con oración y orgullo
            a los jóvenes y señoritas que han partido a casas de formación para entregar su vida a Dios y a la Iglesia.
          </p>
        </div>

        {/* Tarjetas de las 2 Grandes Vocaciones Consagradas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {VOCACIONES_MAYOR.map((voc) => (
            <div
              key={voc.id}
              className="bg-app-card rounded-3xl border border-app-border shadow-md overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300"
            >
              <div>
                {/* Cabecera con Imagen */}
                <div className="relative h-64 w-full overflow-hidden bg-lit-surface border-b border-app-border">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${voc.imagenUrl}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                  </div>

                  <div className="absolute top-4 left-4">
                    <Badge variant="gold" size="sm">
                      {voc.vocacion}
                    </Badge>
                  </div>

                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] text-white/95 border border-white/20 flex items-center gap-1">
                    <span>📸</span>
                    <span>Espacio Foto Vocacional</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <span className="text-xs font-semibold text-lit-accent flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Destino de Formación: {voc.destino}
                    </span>
                    <h3 className="font-serif text-2xl font-bold leading-tight">
                      {voc.titulo}
                    </h3>
                  </div>
                </div>

                {/* Contenido Editorial */}
                <div className="p-6 sm:p-8 space-y-4">
                  {/* Destacado de Hermandad */}
                  <div className="p-3.5 rounded-2xl bg-lit-surface/50 border border-lit-border flex items-center gap-3">
                    <span className="text-2xl">{voc.icono}</span>
                    <div>
                      <span className="text-[10px] text-lit-primary uppercase font-bold tracking-wider block">
                        Título de Hermandad:
                      </span>
                      <strong className="text-xs text-app-text font-serif">
                        {voc.nombreHermandad}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                    {voc.descripcion}
                  </p>

                  {/* Etapas del Camino */}
                  <div className="pt-3 border-t border-app-border space-y-2">
                    <span className="text-xs font-bold text-app-text flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-lit-accent" />
                      Etapas de la Formación Consagrada:
                    </span>
                    <div className="space-y-1.5 pt-1">
                      {voc.etapas.map((etapa, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-app-text/90">
                          <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{etapa}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie de Tarjeta */}
              <div className="p-6 sm:p-8 pt-0 border-t border-app-border/60 flex items-center justify-between text-xs text-app-muted">
                <span>¿Sientes la inquietud vocacional?</span>
                <span className="font-bold text-lit-primary">Habla con nuestro Párroco</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VocacionesMayorSection;
