import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function WomenCollectionsPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navigation />

      <section className="pt-40 pb-16 px-6 border-b border-rule">
        <div className="max-w-5xl mx-auto">
          <p className="font-inter text-xs tracking-nav text-text-muted uppercase mb-3">Collections</p>
          <h1 className="font-cinzel text-4xl md:text-5xl text-espresso mb-5">Women</h1>
          <p className="font-inter text-text-muted text-base max-w-lg leading-relaxed">
            Sustainably crafted essentials designed for longevity. Each piece is made in Nepal using natural fibres and traditional artisan techniques.
          </p>
        </div>
      </section>

      {/* Placeholder grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-rule">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-cream aspect-[3/4] flex flex-col items-center justify-end p-4 group cursor-pointer">
                <div className="w-full aspect-[3/4] bg-white/60 mb-3 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-cinzel text-xs text-text-light tracking-widest uppercase">Coming Soon</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-inter text-xs text-text-primary tracking-wide">Artisan Essential</p>
                  <p className="font-inter text-xs text-text-muted mt-0.5">from £{(85 + i * 15).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="font-cinzel text-sm text-text-muted mb-4">Looking for custom production?</p>
            <Link href="/configure"
              className="inline-flex items-center gap-2 border border-espresso text-espresso font-inter text-xs tracking-button uppercase px-6 py-3 hover:bg-espresso hover:text-cream transition-colors duration-200">
              Configure a collection
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
