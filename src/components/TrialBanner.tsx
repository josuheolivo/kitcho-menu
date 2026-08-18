'use client';

export default function TrialBanner({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 px-6 py-4 shadow-lg shadow-orange-950/20">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-black text-lg">
          🎁
        </span>
        <div>
          <p className="text-sm font-bold text-white">
            Estás disfrutando de tus 15 días gratis (Te quedan {daysLeft} días)
          </p>
          <p className="text-xs text-slate-400">
            Asegura el Plan Anual VIP por <strong>$100 USD/año</strong> con congelamiento de tarifa por 2 años y soporte WhatsApp.
          </p>
        </div>
      </div>
      <a
        href="/dashboard/upgrade-vip"
        className="whitespace-nowrap rounded-lg bg-orange-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-500 transition shadow-md shadow-orange-600/20"
      >
        Activar Oferta VIP ($100/Año)
      </a>
    </div>
  );
}
