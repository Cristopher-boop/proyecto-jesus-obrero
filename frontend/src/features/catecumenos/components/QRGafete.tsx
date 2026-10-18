/**
 * QRGafete — Componente de gafete imprimible para catecúmenos.
 *
 * Diseño tipo carnet/gafete parroquial con código QR, nombre completo,
 * tipo de sacramento y branding institucional.
 * Se imprime en tamaño estándar 9 × 6 cm (apaisado, tamaño carnet).
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
  const sacramentoLabel = TIPO_LABEL[inscripcion.tipo_sacramento] ?? inscripcion.tipo_sacramento;
  const primaryColor = seasonInfo?.badgeBg || '#1E4D38';

  const fechaNacFormatted = catecumeno.fecha_nacimiento
    ? new Date(catecumeno.fecha_nacimiento + 'T12:00:00').toLocaleDateString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const gestionYear = new Date(inscripcion.fecha_inscripcion + 'T12:00:00').getFullYear() || 2026;

  const handlePrint = () => {
    const qrSvg = printRef.current?.querySelector('svg')?.outerHTML || '';

    const printWindow = window.open('', '_blank', 'width=950,height=750');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Gafete — ${nombreCompleto}</title>
        <style>
          @page {
            size: letter;
            margin: 12mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-top: 15px;
          }
          .guide-text {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #666;
            margin-bottom: 12px;
            text-align: center;
          }
          .gafete-card {
            width: 90mm;
            height: 60mm;
            border: 1.5px dashed #b0b0b0;
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            background: #ffffff;
            page-break-inside: avoid;
            box-shadow: none;
          }
          .sidebar {
            width: 12mm;
            background-color: ${primaryColor} !important;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px 2px;
            flex-shrink: 0;
          }
          .sidebar .cross {
            font-size: 18px;
            color: #C5A059;
            line-height: 1;
          }
          .sidebar .vertical-text {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 6.5px;
            font-weight: bold;
            color: rgba(255, 255, 255, 0.85);
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 8px 12px 6px 12px;
            background: #ffffff;
          }
          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            border-bottom: 1px solid #eee;
            padding-bottom: 4px;
          }
          .header .parish-title {
            font-size: 9.5px;
            font-weight: bold;
            color: ${primaryColor};
            line-height: 1.2;
          }
          .header .diocese-text {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 7px;
            color: #777;
            margin-top: 1px;
          }
          .header .church-icon {
            font-size: 18px;
            line-height: 1;
          }
          .center-row {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            padding: 3px 0;
          }
          .qr-wrapper {
            border: 1.5px solid ${primaryColor};
            border-radius: 6px;
            padding: 3px;
            background: #ffffff;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .qr-wrapper svg {
            width: 66px !important;
            height: 66px !important;
            display: block;
          }
          .info-col {
            flex: 1;
            min-width: 0;
          }
          .badge-sacramento {
            display: inline-block;
            background-color: ${primaryColor} !important;
            color: #ffffff !important;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 6.5px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            padding: 2px 7px;
            border-radius: 12px;
            margin-bottom: 3.5px;
          }
          .student-name {
            font-size: 10.5px;
            font-weight: bold;
            color: #111;
            line-height: 1.25;
            margin-bottom: 3px;
          }
          .birth-info {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 7px;
            color: #666;
            margin-bottom: 2.5px;
          }
          .bautismo-tag {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 6.5px;
            color: #555;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .gold-circle {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background-color: #C5A059 !important;
            display: inline-block;
            flex-shrink: 0;
          }
          .gold-divider {
            height: 1.8px;
            background: linear-gradient(to right, #C5A059, #E8D5A3, #C5A059) !important;
            border-radius: 1px;
            margin-bottom: 3px;
          }
          .footer-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 6.5px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="guide-text">
          ✂️ <strong>Gafete Oficial de Asistencia</strong> · Imprime en hoja tamaño carta, recorta por la línea punteada (9 × 6 cm) y plastifica.
        </div>
        <div class="gafete-card">
          <div class="sidebar">
            <span class="cross">✝</span>
            <span class="vertical-text">Jesús Obrero</span>
          </div>
          <div class="main-content">
            <div class="header">
              <div>
                <div class="parish-title">Parroquia Jesús Obrero</div>
                <div class="diocese-text">Diócesis de El Alto · Bolivia</div>
              </div>
              <div class="church-icon">⛪</div>
            </div>
            <div class="center-row">
              <div class="qr-wrapper">
                ${qrSvg}
              </div>
              <div class="info-col">
                <div class="badge-sacramento">${sacramentoLabel}</div>
                <div class="student-name">${nombreCompleto}</div>
                ${fechaNacFormatted ? `<div class="birth-info">F. Nac.: ${fechaNacFormatted}</div>` : ''}
                <div class="bautismo-tag">
                  <span class="gold-circle"></span>
                  <span>${catecumeno.es_bautizado ? 'Bautizado/a ✓' : 'Sin registro de Bautismo'}</span>
                </div>
              </div>
            </div>
            <div>
              <div class="gold-divider"></div>
              <div class="footer-row">
                <div>Gafete Oficial de Asistencia</div>
                <div>${seasonInfo?.icon || '🌿'} ${gestionYear}</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 450);
  };

  return (
    <div className="space-y-4">
      {/* Vista previa del gafete */}
      <div
        ref={printRef}
        className="flex border border-gray-200 rounded-xl overflow-hidden shadow-md mx-auto"
        style={{ width: '340px', height: '226px', fontFamily: 'Georgia, serif' }}
      >
        {/* Franja lateral litúrgica */}
        <div
          className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 flex-shrink-0"
          style={{ width: '42px', backgroundColor: primaryColor }}
        >
          <span className="text-xl" style={{ color: '#C5A059' }}>✝</span>
          <span
            className="text-white/80 font-sans tracking-widest font-bold"
            style={{ writingMode: 'vertical-rl', fontSize: '6.5px', textTransform: 'uppercase' }}
          >
            Jesús Obrero
          </span>
        </div>

        {/* Cuerpo */}
        <div className="flex flex-col justify-between flex-1 p-3 bg-white">
          {/* Cabecera */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-2">
            <div>
              <p className="font-bold text-[9.5px] leading-tight" style={{ color: primaryColor }}>
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
              className="rounded-md p-1 flex-shrink-0 flex items-center justify-center bg-white"
              style={{ border: `1.5px solid ${primaryColor}` }}
            >
              <QRCodeSVG
                value={qrValue}
                size={70}
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
                  backgroundColor: primaryColor,
                  fontSize: '6.5px',
                  padding: '2px 7px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {sacramentoLabel}
              </span>

              <p className="font-bold leading-tight text-gray-900" style={{ fontSize: '10.5px' }}>
                {nombreCompleto}
              </p>

              {fechaNacFormatted && (
                <p className="font-sans text-gray-500 mt-0.5" style={{ fontSize: '6.5px' }}>
                  F. Nac.: {fechaNacFormatted}
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
                {seasonInfo?.icon || '🌿'} {gestionYear}
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
