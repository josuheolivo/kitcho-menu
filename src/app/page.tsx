import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--kitcho-orange)] flex items-center justify-center font-bold text-white text-sm">K</div>
            <span className="text-xl font-bold text-[var(--kitcho-charcoal)]">Kitcho Menu</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm text-[var(--text-secondary)]">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Prueba gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-b from-[var(--kitcho-gray)] to-white">
        <div className="container text-center max-w-4xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--kitcho-orange)]/10 border border-[var(--kitcho-orange)]/20 text-[var(--kitcho-orange)] text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--kitcho-orange)] animate-pulse"></span>
            15 días gratis — Sin tarjeta de crédito
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-[var(--kitcho-charcoal)] leading-tight mb-6 tracking-tight">
            Tu menú digital
            <br />
            <span className="text-[var(--kitcho-orange)]">en minutos</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Crea un menú digital profesional para tu restaurante. 
            Personaliza categorías, platos y precios. Tus clientes escanean y listo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn btn-primary btn-lg">
              Comenzar prueba gratis
            </Link>
            <Link href="#features" className="btn btn-outline btn-lg">
              Ver características
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--kitcho-charcoal)] mb-3">
              Todo lo que necesitas
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">Simple, rápido y profesional</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🎨"
              title="100% Personalizable"
              description="Colores, logo, tipografía. Adapta el menú a la identidad de tu marca."
            />
            <FeatureCard
              icon="🌍"
              title="Multi-idioma"
              description="Español, inglés, coreano, francés, italiano y portugués automáticos."
            />
            <FeatureCard
              icon="📱"
              title="QR Instantáneo"
              description="Genera el código QR de tu menú. Tus clientes escanean y ven el menú."
            />
            <FeatureCard
              icon="⚡"
              title="Edición en tiempo real"
              description="Cambia precios, añade platos o modifica descripciones al instante."
            />
            <FeatureCard
              icon="📊"
              title="Sin instalación"
              description="Tus clientes solo necesitan un navegador. Sin apps que descargar."
            />
            <FeatureCard
              icon="🔒"
              title="Seguro y rápido"
              description="Tus datos protegidos. Menú disponible 24/7 sin caídas."
            />
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-20 bg-[var(--kitcho-gray)]">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--kitcho-charcoal)] mb-8">
            Así se ve tu menú
          </h2>
          <div className="max-w-sm mx-auto">
            <div className="bg-[var(--kitcho-charcoal)] rounded-[2.5rem] p-3 shadow-2xl">
              <div className="bg-white rounded-[2rem] overflow-hidden">
                <div className="bg-gradient-to-br from-[var(--kitcho-charcoal)] to-[var(--kitcho-charcoal-light)] p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[var(--kitcho-orange)]/20 flex items-center justify-center mb-3">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">Tu Restaurante</h3>
                  <p className="text-white/60 text-sm">Tu eslogan aquí</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-[var(--kitcho-gray)] rounded-xl p-3">
                    <p className="font-bold text-[var(--kitcho-charcoal)] text-sm mb-2">Para Compartir</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-primary)] text-sm">Croquetas de jamón</span>
                        <span className="text-[var(--kitcho-orange)] font-semibold text-sm">9.50€</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-primary)] text-sm">Patatas bravas</span>
                        <span className="text-[var(--kitcho-orange)] font-semibold text-sm">7.00€</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[var(--kitcho-gray)] rounded-xl p-3">
                    <p className="font-bold text-[var(--kitcho-charcoal)] text-sm mb-2">Principales</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-primary)] text-sm">Paella valenciana</span>
                        <span className="text-[var(--kitcho-orange)] font-semibold text-sm">14.00€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--kitcho-charcoal)] mb-4">
            Empieza hoy. Gratis por 15 días.
          </h2>
          <p className="text-[var(--text-secondary)] text-lg mb-8">
            Sin compromisos. Sin tarjeta de crédito. Cancela cuando quieras.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Crear mi menú digital
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[var(--border)] bg-[var(--kitcho-gray)]">
        <div className="container text-center text-[var(--text-secondary)] text-sm">
          <p>© {new Date().getFullYear()} Kitcho Menu. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="card p-6 text-center hover:shadow-md transition-shadow group">
      <div className="w-14 h-14 mx-auto rounded-xl bg-[var(--kitcho-orange)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-[var(--kitcho-charcoal)] mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)] text-sm">{description}</p>
    </div>
  );
}
