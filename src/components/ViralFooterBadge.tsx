"use client";

export function ViralFooterBadge({ primaryColor }: { primaryColor: string }) {
  return (
    <footer className="mt-16 pb-12 pt-8 text-center border-t border-slate-200 dark:border-slate-800 px-4 max-w-3xl mx-auto">
      {/* Lead Magnet Viral B2B */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 p-4 shadow-xl">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="font-bold text-xs" style={{ color: primaryColor }}>✨ Kitcho Menu</span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-semibold">
            Tecnología Hostelería
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          ¿Tienes un restaurante, café o gastrobar? Digitaliza tu carta con IA en 30s con Tasa BCV automática.
        </p>
        <a
          href="https://kitcho-menu.vercel.app/register?ref=menu_footer"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition shadow-lg hover:scale-105"
          style={{ backgroundColor: primaryColor }}
        >
          Crear mi Menú QR Gratis (15 Días) →
        </a>
      </div>

      <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-4">
        Experiencia gastronómica digitalizada con Kitcho Menu.
      </p>
    </footer>
  );
}
