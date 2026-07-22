'use client';

import Navigation from '@/components/Navigation';
import PricingQuoteSection from '@/components/PricingQuoteSection';
import Footer from '@/components/Footer';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

export default function PricingPage() {
  useSmoothScroll();
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Page Header */}
      <div className="pt-40 pb-16 px-6 border-b border-rule">
        <div className="max-w-5xl mx-auto">
          <p className="font-inter text-xs tracking-nav text-text-muted uppercase mb-3">
            Quote Engine
          </p>
          <h1 className="font-cinzel text-4xl md:text-5xl text-espresso mb-5">Get a Quote</h1>
          <p className="font-inter text-text-muted text-base max-w-xl leading-relaxed">
            Configure your order below and submit a request — we&apos;ll respond within 24 hours.
          </p>
        </div>
      </div>

      {/* Quote Calculator */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <PricingQuoteSection />
        </div>
      </section>

      {/* Volume Pricing Reference */}
      <section className="py-16 px-6 bg-white border-t border-rule">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="font-inter text-xs tracking-nav text-text-muted uppercase mb-2">
              Volume Tiers
            </p>
            <h2 className="font-cinzel text-2xl text-espresso">Volume pricing reference</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { label: 'T-Shirts', code: 'PRD-001', rows: [['50–99','£8.50'],['100–249','£6.50'],['250–499','£5.00'],['500–999','£4.00'],['1000+','£3.20']] },
              { label: 'Hoodies',  code: 'PRD-002', rows: [['50–99','£18.00'],['100–249','£14.50'],['250–499','£12.00'],['500–999','£10.00'],['1000+','£8.50']] },
            ].map(({ label, code, rows }) => (
              <div key={label} className="border border-rule overflow-hidden bg-cream/40">
                <div className="border-b border-rule px-6 py-3 flex items-center justify-between">
                  <span className="font-inter text-[11px] text-text-muted tracking-widest uppercase">{label}</span>
                  <span className="font-inter text-[10px] text-text-light">{code}</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rule">
                      <th className="px-6 py-3 text-left font-inter font-normal text-[11px] text-text-light tracking-widest uppercase">Qty Range</th>
                      <th className="px-6 py-3 text-right font-inter font-normal text-[11px] text-text-light tracking-widest uppercase">Per Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(([qty, price], i) => (
                      <tr key={qty} className="border-b border-rule last:border-0 hover:bg-white transition-colors duration-150">
                        <td className="px-6 py-3.5 font-inter text-text-muted">{qty}</td>
                        <td className={`px-6 py-3.5 text-right font-inter font-semibold ${i === 4 ? 'text-accent-warm' : 'text-espresso'}`}>
                          {price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Decoration add-ons */}
          <p className="font-inter text-[11px] text-text-light tracking-widest uppercase mb-3">Decoration Add-Ons</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Embroidery (small)', '+£2.50', 'DEC-01'],
              ['Embroidery (large)', '+£4.00', 'DEC-02'],
              ['Screen print /colour', '+£1.50', 'DEC-03'],
              ['DTG print', '+£3.50', 'DEC-04'],
            ].map(([label, price, code]) => (
              <div key={label} className="border border-rule p-4 bg-cream/40 hover:border-accent-warm/40 transition-colors duration-200">
                <div className="font-inter text-[10px] text-text-light mb-2">{code}</div>
                <div className="font-inter text-xs text-text-muted leading-snug mb-1">{label}</div>
                <div className="font-inter text-sm font-semibold text-accent-warm">{price}/unit</div>
              </div>
            ))}
          </div>

          <p className="font-inter text-[11px] text-text-light mt-5">
            * Prices are estimates. Exclude shipping, customs and custom packaging.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
