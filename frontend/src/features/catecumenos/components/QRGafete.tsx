/**
 * QRGafete — Componente de gafete imprimible para catecúmenos.
 *
 * Diseño tipo carnet/gafete parroquial con código QR, nombre completo,
 * tipo de sacramento y branding institucional.
 * Se imprime en tamaño aproximado 9 × 6 cm (similar a una tarjeta de crédito apaisada).
 *
 * Uso:
 *   import QRGafete from '@/features/catecumenos/components/QRGafete';
 *   <QRGafete catecumeno={detalle} />
 */

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import type { CatecumenoDetalle } from '@/types';
import Button from '@/components/ui/Button';
import { useLiturgicalTheme } from '@/core/context/ThemeContext';

interface QRGafeteProps {
  catecumeno: CatecumenoDetalle;
}

const TIPO_LABEL: Record<string, string> = {
  PRIMERA_COMUNION: '1ª Comunión',
  CONFIRMACION:     'Confirmación',
};

export const QRGafete: React.FC<QRGafeteProps> = ({ catecumeno }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { seasonInfo } = useLiturgicalTheme();
  const { inscripcion } = catecumeno;

  const nombreCompleto = [
    catecumeno.nombres,
    catecumeno.primer_apellido,
    catecumeno.segundo_apellido,
  ].filter(Boolean).join(' ');

  const qrValue = `PARROQUIA-JO:${inscripcion.token_qr}`;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=900,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Gafete — ${nombreCompleto}</title>
        <style>
          @page {
            size: 9cm 6cm;
            margin: 0;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 9cm;
            height: 6cm;
            font-family: 'Georgia', 'Times New Roman', serif;
            background: #fff;
            display: flex;
            align-items: stretch;
          }

          /* Franja lateral izquierda — color litúrgico */
          .sidebar {
            width: 1.1cm;
            background: #1E4D38;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 0;
          }
          .sidebar .cross {
            font-size: 18px;
            color: #C5A059;
            line-height: 1;
          }
          .sidebar .vertical-text {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            font-size: 5.5px;
            color: rgba(255,255,255,0.7);
            letter-spacing: 1.5px;
            text-transform: uppercase;
            font-family: Arial, sans-serif;
          }

          /* Cuerpo principal */
          .body {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 8px 10px 6px 10px;
          }

          /* Cabecera */
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 0.5px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 5px;
          }
          .header .parish-name {
            font-size: 7px;
            font-weight: bold;
            color: #1E4D38;
            letter-spacing: 0.3px;
            line-height: 1.3;
          }
          .header .diocese {
            font-size: 5.5px;
            color: #888;
            margin-top: 1px;
          }
          .header .icon {
            font-size: 18px;
          }

          /* Bloque central */
          .center {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
          }
          .qr-block {
            border: 1.5px solid #1E4D38;
            border-radius: 4px;
            padding: 3px;
            background: #fff;
          }
          .info {
            flex: 1;
          }
          .sacramento-badge {
            display: inline-block;
            background: #1E4D38;
            color: #fff;
            font-size: 5.5px;
            padding: 1.5px 6px;
            border-radius: 20px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .nombre {
            font-size: 10px;
            font-weight: bold;
            color: #1a1a1a;
            line-height: 1.2;
            margin-bottom: 4px;
          }
          .bautizado {
            font-size: 5.5px;
            color: #666;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            gap: 3px;
          }
          .bautizado .dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #C5A059;
            display: inline-block;
          }

          /* Pie */
          .footer {
            border-top: 0.5px solid #eee;
            padding-top: 5px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .token {
            font-family: 'Courier New', monospace;
            font-size: 5px;
            color: #bbb;
          }
          .year {
            font-size: 5.5px;
            color: #aaa;
            font-family: Arial, sans-serif;
          }
          .gold-bar {
            height: 2px;
            background: linear-gradient(to right, #C5A059, #E8D5A3, #C5A059);
            margin-top: 5px;
            border-radius: 1px;
          }

          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 350);
  };

  return (
    <div className="space-y-4">
      {/* Vista previa del gafete */}
      <div
        ref={printRef}
        className="flex border border-gray-200 rounded-xl overflow-hidden shadow-md"
        style={{ width: '340px', height: '226px', fontFamily: 'Georgia, serif' }}
      >
        {/* Franja lateral litúrgica */}
        <div
          className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 flex-shrink-0"
          style={{ width: '42px', backgroundColor: 'var(--lit-primary, #1E4D38)' }}
        >
          <span className="text-xl" style={{ color: '#C5A059' }}>✝</span>
          <span
            className="text-white/60 font-sans tracking-widest"
            style={{ writingMode: 'vertical-rl', fontSize: '6px', textTransform: 'uppercase' }}
          >
            Jesús Obrero
          </span>
        </div>

        {/* Cuerpo */}
        <div className="flex flex-col justify-between flex-1 p-3 bg-white">
          {/* Cabecera */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-2">
            <div>
              <p className="font-bold text-[9px] leading-tight" style={{ color: '#1E4D38' }}>
                Parroquia Jesús Obrero
              </p>
              <p className="text-[7px] text-gray-400 font-sans mt-0.5">
                Diócesis de El Alto · Bolivia
              </p>
            </div>
            <span className="text-2xl">⛪</span>
          </div>

          {/* Centro: QR + Datos */}
          <div className="flex items-center gap-3 flex-1 py-2">
            {/* QR */}
            <div
              className="rounded-md p-1 flex-shrink-0"
              style={{ border: '1.5px solid #1E4D38' }}
            >
              <QRCodeSVG
                value={qrValue}
                size={72}
                bgColor="#FFFFFF"
                fgColor="#1a1a1a"
                level="M"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span
                className="inline-block font-sans font-bold text-white rounded-full mb-1.5"
                style={{
                  backgroundColor: 'var(--lit-primary, #1E4D38)',
                  fontSize: '6.5px',
                  padding: '2px 7px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {TIPO_LABEL[inscripcion.tipo_sacramento] ?? inscripcion.tipo_sacramento}
              </span>

              <p className="font-bold leading-tight text-gray-900" style={{ fontSize: '10.5px' }}>
                {nombreCompleto}
              </p>

              {catecumeno.fecha_nacimiento && (
                <p className="font-sans text-gray-500 mt-0.5" style={{ fontSize: '6.5px' }}>
                  F. Nac.: {new Date(catecumeno.fecha_nacimiento + 'T12:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              )}

              <div className="flex items-center gap-1 mt-1">
                <span
                  className="rounded-full flex-shrink-0"
                  style={{ width: '6px', height: '6px', backgroundColor: '#C5A059' }}
                />
                <span className="font-sans text-gray-500" style={{ fontSize: '6px' }}>
                  {catecumeno.es_bautizado ? 'Bautizado/a ✓' : 'Sin registro de Bautismo'}
                </span>
              </div>
            </div>
          </div>

          {/* Pie */}
          <div>
            <div style={{ height: '1.5px', background: 'linear-gradient(to right, #C5A059, #E8D5A3, #C5A059)', borderRadius: '1px', marginBottom: '4px' }} />
            <div className="flex items-center justify-between">
              <p className="font-sans text-gray-400 font-semibold" style={{ fontSize: '6px' }}>
                Gafete Oficial de Asistencia
              </p>
              <p className="font-sans text-gray-400" style={{ fontSize: '6px' }}>
                {seasonInfo.icon} {new Date(inscripcion.fecha_inscripcion + 'T12:00:00').getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón imprimir */}
      <Button
        variant="primary"
        size="sm"
        leftIcon={<Printer className="w-3.5 h-3.5" />}
        onClick={handlePrint}
        className="w-full"
      >
        Imprimir Gafete (9 × 6 cm)
      </Button>

      <p className="text-[10px] text-app-muted text-center">
        💡 Lamínalo y añade un cordón para que el niño lo cuelgue.
      </p>
    </div>
  );
};

export default QRGafete;
