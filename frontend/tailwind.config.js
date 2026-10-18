/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores Litúrgicos Dinámicos (Responden a data-theme)
        lit: {
          primary: 'hsl(var(--lit-primary) / <alpha-value>)',
          'primary-dark': 'hsl(var(--lit-primary-dark) / <alpha-value>)',
          'primary-light': 'hsl(var(--lit-primary-light) / <alpha-value>)',
          surface: 'hsl(var(--lit-surface) / <alpha-value>)',
          accent: 'hsl(var(--lit-accent) / <alpha-value>)',
          'accent-dark': 'hsl(var(--lit-accent-dark) / <alpha-value>)',
          'accent-light': 'hsl(var(--lit-accent-light) / <alpha-value>)',
          border: 'hsl(var(--lit-border) / <alpha-value>)',
        },
        // Fondos y textos neutros cálidos
        app: {
          bg: 'hsl(var(--bg-app) / <alpha-value>)',
          card: 'hsl(var(--bg-card) / <alpha-value>)',
          text: 'hsl(var(--text-main) / <alpha-value>)',
          muted: 'hsl(var(--text-muted) / <alpha-value>)',
          border: 'hsl(var(--border-subtle) / <alpha-value>)',
        },
        // Alertas Semánticas Estables
        semantic: {
          success: {
            bg: 'hsl(var(--alert-success-bg) / <alpha-value>)',
            border: 'hsl(var(--alert-success-border) / <alpha-value>)',
            text: 'hsl(var(--alert-success-text) / <alpha-value>)',
          },
          warning: {
            bg: 'hsl(var(--alert-warning-bg) / <alpha-value>)',
            border: 'hsl(var(--alert-warning-border) / <alpha-value>)',
            text: 'hsl(var(--alert-warning-text) / <alpha-value>)',
          },
          error: {
            bg: 'hsl(var(--alert-error-bg) / <alpha-value>)',
            border: 'hsl(var(--alert-error-border) / <alpha-value>)',
            text: 'hsl(var(--alert-error-text) / <alpha-value>)',
          },
          info: {
            bg: 'hsl(var(--alert-info-bg) / <alpha-value>)',
            border: 'hsl(var(--alert-info-border) / <alpha-value>)',
            text: 'hsl(var(--alert-info-text) / <alpha-value>)',
          },
        }
      },
      boxShadow: {
        'ecclesiastical': '0 4px 20px -2px rgba(28, 25, 23, 0.05), 0 2px 6px -1px rgba(28, 25, 23, 0.03)',
        'sacred-glow': '0 0 15px -3px hsl(var(--lit-accent) / 0.25)',
      }
    },
  },
  plugins: [],
}
