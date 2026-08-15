'use client';

import { useRef, useState } from 'react';
import { SparkIcon } from './Icons';

interface A5QrPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  logoUrl?: string | null;
  tagline?: string;
  primaryColor?: string;
  publicUrl: string;
  slug: string;
}

export default function A5QrPosterModal({
  isOpen,
  onClose,
  restaurantName,
  logoUrl,
  tagline,
  primaryColor = '#ea580c',
  publicUrl,
  slug,
}: A5QrPosterModalProps) {
  const [downloading, setDownloading] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(
    publicUrl
  )}`;

  // Generator for 1414 x 2000 px HD PNG Canvas (300 DPI A5 print format)
  const handleDownloadHD = async () => {
    try {
      setDownloading(true);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // A5 @ 240 DPI -> 1414 x 2000 pixels
      canvas.width = 1414;
      canvas.height = 2000;

      // 1. Background Fill
      ctx.fillStyle = '#f8f8f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Top Primary Color Header Banner
      const grad = ctx.createLinearGradient(0, 0, 0, 500);
      grad.addColorStop(0, primaryColor);
      grad.addColorStop(1, adjustColor(primaryColor, -25));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, 500);

      // Decorative curve pattern at bottom of header
      ctx.fillStyle = '#f8f8f6';
      ctx.beginPath();
      ctx.moveTo(0, 500);
      ctx.quadraticCurveTo(707, 560, 1414, 500);
      ctx.lineTo(1414, 560);
      ctx.lineTo(0, 560);
      ctx.fill();

      // 3. Draw Logo or Restaurant Initials in Header
      if (logoUrl) {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
            logoImg.src = logoUrl;
          });

          // Maintain aspect ratio, max height 160px
          const maxH = 160;
          const scale = maxH / logoImg.height;
          const drawW = Math.min(logoImg.width * scale, 600);
          const drawH = logoImg.height * (drawW / logoImg.width);
          ctx.drawImage(logoImg, (1414 - drawW) / 2, 100, drawW, drawH);
        } catch {
          drawDefaultTextLogo(ctx, restaurantName);
        }
      } else {
        drawDefaultTextLogo(ctx, restaurantName);
      }

      // Restaurant Name & Tagline Text in Header
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
      ctx.fillText(truncateText(restaurantName, 26), 707, 340);

      if (tagline) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '500 28px system-ui, -apple-system, sans-serif';
        ctx.fillText(truncateText(tagline, 45), 707, 395);
      }

      // 4. CTA Box & Title
      ctx.fillStyle = '#18181b';
      ctx.font = '900 48px system-ui, -apple-system, sans-serif';
      ctx.fillText('ESCANEA PARA VER LA CARTA', 707, 680);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 28px system-ui, -apple-system, sans-serif';
      ctx.fillText('Apunta con la cámara de tu teléfono móvil', 707, 730);

      // 5. White QR Card Container (Shadow Card)
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 257, 800, 900, 900, 40);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Load and Draw QR Code Image
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrImageUrl;
      });

      ctx.drawImage(qrImg, 307, 850, 800, 800);

      // Badge beneath QR
      ctx.fillStyle = `${primaryColor}15`;
      roundRect(ctx, 357, 1720, 700, 70, 35);
      ctx.fill();
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.fillText('✨ Menú Digital 100% Actualizado • 6 Idiomas', 707, 1765);

      // 6. Footer Branding (Kitcho Menu)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(257, 1850);
      ctx.lineTo(1157, 1850);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.fillText('Powered by Kitcho Menu — Tu carta digital rápida y segura', 707, 1915);

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `cartel-A5-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al generar cartel A5:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Browser Print Trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="card max-h-[95vh] w-full max-w-4xl overflow-hidden flex flex-col bg-white text-slate-900 border-slate-200 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900 text-white">
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Diseñador de Cartel de Mesa A5 (Impresión)
            </h2>
            <p className="text-xs text-slate-300">
              Formato A5 profesional (148 x 210 mm) listo para imprimir o enviar a imprenta.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white font-bold text-xl px-2"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Live A5 Preview & Action Panel */}
        <div className="p-6 overflow-y-auto flex-1 grid gap-8 md:grid-cols-[1fr_280px] items-start">
          {/* Printable A5 Live Preview Card Container */}
          <div className="flex justify-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <div
              ref={printAreaRef}
              id="a5-print-area"
              className="relative w-full max-w-[360px] aspect-[1/1.414] bg-[#f8f8f6] text-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex flex-col justify-between"
            >
              {/* Header Banner */}
              <div
                className="relative px-6 pt-6 pb-10 text-white text-center flex flex-col items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(
                    primaryColor,
                    -25
                  )})`,
                }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={restaurantName}
                    className="max-h-14 w-auto object-contain drop-shadow-md mb-2"
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-white font-black text-xl mb-2">
                    {restaurantName.charAt(0).toUpperCase()}
                  </span>
                )}

                <h3 className="text-xl font-extrabold tracking-tight leading-snug drop-shadow-sm">
                  {restaurantName}
                </h3>
                {tagline && (
                  <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{tagline}</p>
                )}

                {/* Curved SVG divider at bottom of header */}
                <svg
                  className="absolute bottom-0 left-0 w-full h-5 text-[#f8f8f6]"
                  viewBox="0 0 1440 56"
                  preserveAspectRatio="none"
                >
                  <path d="M0 56V27c200-16 320-16 480 0s320 16 480 0 320-16 480 0v29H0Z" fill="currentColor" />
                </svg>
              </div>

              {/* QR Centerpiece Box */}
              <div className="px-6 py-2 text-center flex flex-col items-center flex-1 justify-center">
                <p className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                  Escanea para ver la carta
                </p>
                <p className="text-[11px] text-slate-500 mb-4">
                  Apunta con la cámara de tu teléfono
                </p>

                {/* QR Code Container */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200">
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    className="h-44 w-44 object-contain mx-auto"
                  />
                </div>

                <div
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: `${primaryColor}18`,
                    color: primaryColor,
                  }}
                >
                  <SparkIcon className="h-3 w-3" />
                  <span>Carta Digital 100% Actualizada • 6 Idiomas</span>
                </div>
              </div>

              {/* Footer Kitcho Menu Branding */}
              <div className="px-6 py-4 border-t border-slate-200 text-center bg-white/60">
                <p className="text-[10px] font-semibold text-slate-500">
                  Powered by <span className="font-extrabold text-[var(--kitcho-charcoal)]">Kitcho Menu</span> — Tu carta digital rápida y segura
                </p>
              </div>
            </div>
          </div>

          {/* Side Controls / Export Buttons */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                Opciones de Impresión
              </h4>
              <p className="text-xs text-slate-600 leading-5">
                Diseñado en **formato A5** ideal para portamenús de madera, soportes de metacrilato en mesas o servilleteros.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadHD}
              disabled={downloading}
              className="btn btn-primary btn-lg w-full font-bold text-white shadow-md cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              {downloading ? 'Generando PNG HD…' : '📥 Descargar Cartel A5 (PNG HD)'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 px-5 py-3 text-sm font-extrabold text-slate-800 shadow-sm transition-all cursor-pointer w-full min-h-[48px]"
            >
              <span>🖨️ Imprimir Cartel (A5)</span>
            </button>

            <p className="text-[11px] text-slate-500 text-center leading-4 pt-1">
              💡 Alta Resolución (1414 x 2000px). Listo para imprenta o impresión directa.
            </p>
          </div>
        </div>
      </div>

      {/* Print Specific CSS Styles for A5 Page */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #a5-print-area,
          #a5-print-area * {
            visibility: visible !important;
          }
          #a5-print-area {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 148mm !important;
            height: 210mm !important;
            max-width: none !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          @page {
            size: A5 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Helpers
function truncateText(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

function adjustColor(hex: string, amount: number): string {
  let color = hex.replace('#', '');
  if (color.length === 3) {
    color = color.split('').map((c) => c + c).join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDefaultTextLogo(ctx: CanvasRenderingContext2D, name: string) {
  const initial = (name.charAt(0) || 'K').toUpperCase();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  roundRect(ctx, 647, 100, 120, 120, 30);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 70px system-ui, -apple-system, sans-serif';
  ctx.fillText(initial, 707, 185);
}
