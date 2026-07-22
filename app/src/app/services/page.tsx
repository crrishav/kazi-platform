'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const SERVICES = [
  {
    code: 'SVC-01',
    title: 'Custom Manufacturing',
    tagline: 'Full garment production from your designs',
    description:
      'End-to-end custom garment production. From fabric sourcing and pattern grading to cutting, sewing, and finishing — we build your collection to your exact specifications.',
    specs: ['Min. 50 units', 'All fabric weights', 'GOTS-certified cotton available', 'Lead time: 6–10 weeks'],
    cta: { label: 'Configure a garment', href: '/configure' },
    accent: '#3A7D44',
  },
  {
    code: 'SVC-02',
    title: 'Direct-to-Garment (DTG)',
    tagline: 'Full-colour photo-quality prints on fabric',
    description:
      'Industrial inkjet printing directly onto finished garments. Ideal for complex artwork, photographic detail, or low-minimum custom runs. No screens, no setup fees.',
    specs: ['No minimum per design', 'Full CMYK + spot colours', 'Soft hand-feel finish', 'Wash-tested to 40+ cycles'],
    cta: { label: 'Get a DTG quote', href: '/quote?service=dtg' },
    accent: '#9B8FD4',
  },
  {
    code: 'SVC-03',
    title: 'Screen Printing',
    tagline: 'High-volume precision for brand graphics',
    description:
      'Traditional water-based screen printing for bold, long-lasting brand marks. Best for 1–6 spot colours, large orders, and classic print aesthetics.',
    specs: ['From 50 units/design', 'Up to 6 spot colours', 'Eco water-based inks only', 'Price breaks at 250, 500, 1000'],
    cta: { label: 'Get a screen print quote', href: '/quote?service=screenprint' },
    accent: '#5B9E8A',
  },
  {
    code: 'SVC-04',
    title: 'Embroidery',
    tagline: 'Textural luxury for premium branding',
    description:
      'Computer-aided embroidery for chest badges, sleeve patches, and full back panels. Adds tactile depth that elevates any garment from commodity to collector\'s piece.',
    specs: ['Small from £2.50/unit', 'Large from £4.00/unit', 'Digitising included', 'Metallic threads available'],
    cta: { label: 'Get an embroidery quote', href: '/quote?service=embroidery' },
    accent: '#B4956A',
  },
  {
    code: 'SVC-05',
    title: 'Direct-to-Film (DTF)',
    tagline: 'Versatile transfer prints on any fabric',
    description:
      'Heat-transfer film printing that works on any fabric composition — including nylon, polyester blends, and dark garments. Vibrant colour with no pretreatment required.',
    specs: ['Works on any fabric', 'No minimum order', 'Ideal for dark garments', 'Edge-to-edge prints possible'],
    cta: { label: 'Get a DTF quote', href: '/quote?service=dtf' },
    accent: '#E07A5F',
  },
];

export default function ServicesPage() {
  useSmoothScroll();
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-48 pb-16 px-6 border-b border-rule">
        <div className="max-w-5xl mx-auto">
          <p className="font-inter text-xs tracking-nav text-text-muted uppercase mb-4">What we do</p>
          <h1 className="font-cinzel text-4xl md:text-5xl text-espresso mb-5 leading-tight max-w-2xl">
            Services Built for Ambitious Brands
          </h1>
          <p className="font-inter text-text-muted text-base max-w-xl leading-relaxed mb-8">
            From 50 to 50,000 units — sustainable manufacturing, precision printing, and artisan embroidery.
            Every process is certified, traceable, and built to last.
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 bg-espresso text-cream font-inter text-xs tracking-button uppercase px-6 py-3 hover:bg-accent-warm transition-colors duration-200"
          >
            Get a Quote
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-0">
          {SERVICES.map((svc, i) => (
            <div
              key={svc.code}
              className={`grid grid-cols-1 md:grid-cols-2 gap-0 border border-rule ${i > 0 ? 'border-t-0' : ''}`}
            >
              {/* Left */}
              <div className="px-8 py-10 border-b md:border-b-0 md:border-r border-rule">
                <p className="font-inter text-[10px] tracking-nav text-text-light uppercase mb-3">{svc.code}</p>
                <h2 className="font-cinzel text-2xl text-espresso mb-2">{svc.title}</h2>
                <p className="font-inter text-sm text-accent-warm mb-5">{svc.tagline}</p>
                <p className="font-inter text-sm text-text-muted leading-relaxed mb-7">{svc.description}</p>
                <Link
                  href={svc.cta.href}
                  className="inline-flex items-center gap-2 font-inter text-xs tracking-button uppercase text-espresso border border-espresso px-5 py-2.5 hover:bg-espresso hover:text-cream transition-colors duration-200"
                >
                  {svc.cta.label}
                </Link>
              </div>

              {/* Right — specs */}
              <div className="px-8 py-10 bg-white">
                <p className="font-inter text-[10px] tracking-nav text-text-light uppercase mb-5">Specifications</p>
                <ul className="space-y-3">
                  {svc.specs.map(spec => (
                    <li key={spec} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: svc.accent }} />
                      <span className="font-inter text-sm text-text-muted">{spec}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-rule-light">
                  <p className="font-inter text-xs text-text-light leading-relaxed">
                    All services use GOTS-certified inputs where available. Ask us about our full sustainability audit documentation.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-6 border-t border-rule bg-espresso">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-cinzel text-2xl text-cream mb-2">Not sure which service?</h2>
            <p className="font-inter text-sm text-cream/70 max-w-md">
              Describe your project and we&apos;ll recommend the right combination of services for your brief and budget.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/configure"
              className="font-inter text-xs tracking-button uppercase text-cream border border-cream/30 px-5 py-3 hover:border-cream transition-colors duration-200">
              Try Configurator
            </Link>
            <Link href="/quote"
              className="font-inter text-xs tracking-button uppercase text-espresso bg-cream px-5 py-3 hover:bg-accent-warm hover:text-cream transition-colors duration-200">
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
