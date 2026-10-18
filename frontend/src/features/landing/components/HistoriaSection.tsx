import React from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

export const HistoriaSection: React.FC = () => {
  return (
    <section id="historia" className="py-20 bg-lit-surface/40 border-t border-app-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lado Izquierdo: Marco para Fotografía Histórica */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-lit-border shadow-xl bg-app-card p-4 sm:p-6 space-y-4">
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-lit-surface via-app-card to-lit-surface/80 flex flex-col items-center justify-center text-center p-6 border border-app-border">
                <span className="text-4xl mb-2">📜</span>
                <div className="flex items-center gap-1.5 text-lit-primary text-xs font-bold mb-1">
                  <ImageIcon className="w-4 h-4" />
                  <span>Espacio para Fotografía Histórica</span>
                </div>
                <p className="text-[11px] text-app-muted italic max-w-xs leading-relaxed">
                  "Pioneros misioneros y primeros fieles levantando los cimientos del templo parroquial Jesús Obrero"
                </p>
                <span className="absolute bottom-3 right-3 text-[10px] text-app-muted bg-app-card px-2.5 py-0.5 rounded border border-app-border">
                  Archivo Parroquial · Década 1970
                </span>
              </div>

              <div className="p-3 rounded-xl bg-lit-surface border border-lit-border text-center">
                <span className="font-serif text-sm font-bold text-lit-primary block">
                  "Una Iglesia encarnada en el pueblo trabajador"
                </span>
                <span className="text-[11px] text-app-muted">
                  Medio siglo de fidelidad al Evangelio de Jesús Obrero
                </span>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Relato y Carisma Pastoral */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lit-surface border border-lit-border text-lit-primary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-lit-accent" />
                <span>Nuestra Memoria y Raíces</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-app-text tracking-tight">
                Medio Siglo de Amor, Fe y Servicio Obrero
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-app-muted leading-relaxed">
              <p>
                En los años 70, con el esfuerzo incansable de familias trabajadoras, mineros y obreros artesanos,
                nació la <strong>Parroquia Jesús Obrero</strong>. Con la entrega pastoral del <strong>Padre José Fuentes Cano ("Padre Pepe")</strong>
                y un grupo comprometido de misioneros y laicos, la fe se convirtió en motor de dignidad humana, educación y fraternidad.
              </p>

              <p>
                Bajo el patrocinio de <strong>Jesús Obrero</strong>, el Señor que dignificó el trabajo humano en el taller de Nazaret,
                la comunidad no solo construyó templos y capillas filiales, sino también redes de amor fraterno:
                las históricas <em>Colonias de Verano "Mis Felices Vacaciones"</em> para los más pequeños,
                las <em>Kermeses solidarias</em> y los movimientos juveniles <em>Sicar</em>, <em>E.J.E.</em> y la <em>Comunidad Juvenil</em>.
              </p>

              <p>
                Hoy, nuestra parroquia y sus <strong>6 capillas hermanas</strong> siguen siendo un faro de esperanza,
                renovando su compromiso evangélico con herramientas modernas y el mismo corazón generoso de siempre.
              </p>
            </div>

            {/* Cita / Lema */}
            <div className="p-4 rounded-2xl bg-app-card border-l-4 border-lit-primary border border-app-border space-y-1">
              <p className="text-xs italic text-app-text font-serif">
                «Donde hay un hermano necesitado, un niño sin vacación o un joven buscando rumbo,
                allí está Jesús Obrero con sus brazos abiertos para acoger y amar.»
              </p>
              <span className="text-[11px] text-app-muted block font-semibold">
                — Consejo Pastoral Parroquial
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistoriaSection;
