import React from 'react';
import { CIFRAS_DESTACADAS } from '../data/landingData';

export const StatsBar: React.FC = () => {
  return (
    <section className="border-y border-app-border bg-lit-surface/40 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {CIFRAS_DESTACADAS.map((item, index) => (
            <div
              key={index}
              className="text-center p-4 sm:p-5 rounded-2xl bg-app-card border border-app-border shadow-2xs hover:shadow-sm transition-all"
            >
              <span className="font-serif text-3xl sm:text-4xl font-bold text-lit-primary block tracking-tight">
                {item.valor}
              </span>
              <span className="text-xs sm:text-sm font-bold text-app-text block mt-1">
                {item.etiqueta}
              </span>
              <span className="text-[11px] text-app-muted block mt-0.5 leading-snug">
                {item.detalle}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
