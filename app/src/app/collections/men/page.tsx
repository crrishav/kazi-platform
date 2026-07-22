'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const PRODUCTS = [
  { name: 'Organic Crew Tee',      slug: 'organic-crew-tee',      price: 75,  garment: 't-shirt' },
  { name: 'Essential Hoodie',      slug: 'essential-hoodie',      price: 87,  garment: 'hoodie'  },
  { name: 'Dropshoulder Pocket Tee', slug: 'dropshoulder-pocket-tee', price: 99,  garment: 't-shirt' },
  { name: 'Heavyweight Pullover',  slug: 'heavyweight-pullover',  price: 111, garment: 'hoodie'  },
  { name: 'Classic V-Neck',        slug: 'classic-v-neck',        price: 123, garment: 't-shirt' },
  { name: 'Zip-Up Hoodie',         slug: 'zip-up-hoodie',         price: 135, garment: 'hoodie'  },
  { name: 'Oversized Tee',         slug: 'oversized-tee',         price: 147, garment: 't-shirt' },
  { name: 'Quarter-Zip Fleece',    slug: 'quarter-zip-fleece',    price: 159, garment: 'hoodie'  },
];

export default function MenCollectionsPage() {
  useSmoothScroll();
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-48 pb-16 px-6 border-b border-rule">
        <div className="max-w-5xl mx-auto">
          <p className="font-inter text-xs tracking-nav text-text-muted uppercase mb-3">Collections</p>
          <h1 className="font-cinzel text-4xl md:text-5xl text-espresso mb-5">Men</h1>
          <p className="font-inter text-text-muted text-base max-w-lg leading-relaxed">
            Purposeful menswear built for the conscious wardrobe. Structured silhouettes in natural fibres, made with transparency.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-rule">
            {PRODUCTS.map((product) => (
              <Link
                key={product.name}
                href={`/products/${product.slug}`}
                className="bg-cream aspect-[3/4] flex flex-col items-center justify-end p-4 group cursor-pointer hover:bg-white/60 transition-colors duration-200"
              >
                <div className="w-full aspect-[3/4] bg-white/60 mb-3 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-cinzel text-xs text-text-light tracking-widest uppercase group-hover:text-accent-warm transition-colors duration-200">
                      Configure →
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-inter text-xs text-text-primary tracking-wide">{product.name}</p>
                  <p className="font-inter text-xs text-text-muted mt-0.5">from £{product.price}</p>
                </div>
              </Link>
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
