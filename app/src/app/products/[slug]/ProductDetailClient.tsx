'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, ChevronDown, ChevronUp, Leaf, ArrowRight, ShoppingBag, Image as ImageIcon, Box } from 'lucide-react';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import GarmentViewer from '@/components/GarmentViewer';
import { products } from '@/data/products';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useCart, parseUnitPrice } from '@/context/CartContext';

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  useSmoothScroll();
  const product = products.find((p) => p.slug === slug);
  const { addItem } = useCart();

  // States
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [viewMode, setViewMode] = useState<'image' | '3d'>('image');
  const [activeAccordion, setActiveAccordion] = useState<'details' | 'fabric' | 'sustainability' | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  // Handle color default initialization when slug changes
  useEffect(() => {
    setSelectedColor(0);
    setViewMode('image');
  }, [slug]);

  if (!product) {
    return (
      <main className="min-h-screen bg-white flex flex-col justify-between">
        <Navigation showAnnouncementBar={false} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-40">
          <h1 className="font-cinzel text-3xl text-espresso mb-4">Product Not Found</h1>
          <p className="font-inter text-sm text-text-muted mb-8 max-w-md">
            The product style you are looking for does not exist or has been moved to our archive.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-espresso text-espresso font-inter text-xs tracking-button uppercase px-6 py-3 hover:bg-espresso hover:text-cream transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const sizes = ['S', 'M', 'L', 'XL'];
  const hasColors = product.colors && product.colors.length > 0;
  const activeColorHex = hasColors ? product.colors![selectedColor].hex : '#E8E0D0';
  const activeColorName = hasColors ? product.colors![selectedColor].name : 'Default';

  // Get related products (same collection, or other products, excluding current)
  const relatedProducts = products
    .filter((p) => p.slug !== product.slug && (p.collection === product.collection || p.collection === 'featured'))
    .slice(0, 4);

  const toggleAccordion = (section: 'details' | 'fabric' | 'sustainability') => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const handleAddToBag = () => {
    addItem(
      {
        id: `${product.slug}-${activeColorName}-${selectedSize}`,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: product.price,
        unitPrice: parseUnitPrice(product.price),
        color: hasColors ? activeColorName : undefined,
        size: selectedSize,
      },
      50
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <>
      <Navigation showAnnouncementBar={false} />

      <main className="min-h-screen bg-white flex flex-col pt-20">
        <div className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col">
          {/* Breadcrumb */}
          <div className="shrink-0 mb-3 font-inter text-[10px] tracking-widest text-text-light uppercase flex items-center gap-2">
            <Link href="/" className="hover:text-espresso transition-colors">Home</Link>
            <span>/</span>
            {product.collection !== 'featured' ? (
              <>
                <Link href={`/collections/${product.collection}`} className="hover:text-espresso transition-colors">
                  {product.collection}
                </Link>
                <span>/</span>
              </>
            ) : null}
            <span className="text-text-muted">{product.name}</span>
          </div>

          {/* Product Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* ── LEFT COLUMN: Image & 3D Viewer ── */}
            <div className="flex flex-col">
              {/* Media Frame */}
              <div
                className="relative bg-white border border-rule overflow-hidden flex items-center justify-center mx-auto max-w-full"
                style={{ aspectRatio: '4/5', height: 'calc(100vh - 190px)' }}
              >
                {/* View Switch — overlaid top-right */}
                <button
                  onClick={() => setViewMode(viewMode === 'image' ? '3d' : 'image')}
                  title={viewMode === 'image' ? 'Switch to interactive 3D preview' : 'Switch to product image'}
                  aria-label={viewMode === 'image' ? 'Switch to interactive 3D preview' : 'Switch to product image'}
                  className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center bg-espresso text-cream border border-espresso shadow-sm hover:bg-accent-warm hover:border-accent-warm transition-colors duration-200"
                >
                  {viewMode === 'image' ? (
                    <Box size={16} strokeWidth={1.5} />
                  ) : (
                    <ImageIcon size={16} strokeWidth={1.5} />
                  )}
                </button>

                {viewMode === 'image' ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full relative">
                    <GarmentViewer
                      garment={product.garment}
                      colour={activeColorHex}
                    />
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 border border-rule text-[9px] font-inter text-text-muted tracking-widest uppercase pointer-events-none select-none z-10">
                      Drag to rotate
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN: Product Info ── */}
            <div className="flex flex-col">
              {/* Badges & Category */}
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <span className="font-inter text-[9px] tracking-widest text-[#3A7D44] font-medium uppercase">
                  Nepal Atelier Series
                </span>
                {product.badge && (
                  <span className="border border-[#7A9B82] px-2.5 py-0.5 rounded-full font-inter text-[8px] tracking-wider text-text-primary uppercase">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <h1 className="font-cinzel text-2xl md:text-3xl text-espresso mb-1.5 tracking-wide">
                {product.name}
              </h1>
              <p className="font-cinzel text-lg text-accent-warm mb-3">
                {product.price}
              </p>

              {/* Description */}
              <p className="font-inter text-xs text-text-muted leading-relaxed mb-4 line-clamp-2">
                {product.description}
              </p>

              {/* Color Selector */}
              {hasColors && (
                <div className="mb-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-inter text-[9px] tracking-widest text-text-light uppercase">Colour</span>
                    <span className="font-inter text-[10px] text-text-primary uppercase font-medium">{activeColorName}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors!.map((color, index) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(index)}
                        title={color.name}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-200 relative flex items-center justify-center ${
                          selectedColor === index
                            ? 'border-espresso scale-110 shadow-sm'
                            : 'border-rule hover:border-espresso/40'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selectedColor === index && (
                          <Check className={`w-3 h-3 ${
                            color.hex === '#FFFFFF' || color.hex === '#EBF3EC' || color.hex === '#F5F3EE'
                              ? 'text-espresso'
                              : 'text-white'
                          }`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <span className="font-inter text-[9px] tracking-widest text-text-light uppercase">Size Range</span>
                  <span className="font-inter text-[10px] text-text-primary uppercase font-medium">Standard {selectedSize}</span>
                </div>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 border font-inter text-xs transition-colors duration-200 flex items-center justify-center ${
                        selectedSize === size
                          ? 'border-espresso bg-espresso text-cream font-medium'
                          : 'border-rule bg-white text-text-muted hover:border-espresso/40 hover:text-espresso'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 mb-2.5">
                <button
                  onClick={handleAddToBag}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-espresso text-cream font-inter text-xs tracking-button uppercase py-3 hover:bg-accent-warm transition-colors duration-200"
                >
                  {justAdded ? (
                    <>
                      <Check size={13} strokeWidth={1.5} /> Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={13} strokeWidth={1.5} /> Add to Bag · MOQ 50
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                <Link
                  href={`/configure?garment=${product.garment}&colour=${encodeURIComponent(activeColorHex)}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-espresso text-cream font-inter text-xs tracking-button uppercase py-3 hover:bg-accent-warm transition-colors duration-200"
                >
                  Configure &amp; Design <ArrowRight size={13} strokeWidth={1.5} />
                </Link>
                <Link
                  href={`/quote?productType=${product.garment === 'hoodie' ? 'Hoodies' : 'T-Shirts'}&qtyRange=100–249&details=${encodeURIComponent(
                    `Inquiry for ${product.name} (Colour: ${activeColorName}, Size: ${selectedSize})`
                  )}`}
                  className="inline-flex items-center justify-center gap-2 border border-espresso text-espresso font-inter text-xs tracking-button uppercase py-3 px-6 hover:bg-espresso hover:text-cream transition-colors duration-200"
                >
                  Request Sample / Quote
                </Link>
              </div>

              {/* Accordions */}
              <div className="border-t border-rule">

                {/* Details Accordion */}
                <div className="border-b border-rule">
                  <button
                    onClick={() => toggleAccordion('details')}
                    className="w-full py-2.5 flex items-center justify-between text-left font-cinzel text-xs tracking-widest text-espresso uppercase"
                  >
                    <span>Specification &amp; Fit</span>
                    {activeAccordion === 'details' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {activeAccordion === 'details' && (
                    <div className="pb-3 font-inter text-xs text-text-muted leading-relaxed space-y-1.5 pl-2">
                      {product.details.map((detail, idx) => (
                        <p key={idx} className="flex items-start gap-2">
                          <span className="text-accent-warm mt-0.5">•</span>
                          <span>{detail}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fabric Accordion */}
                <div className="border-b border-rule">
                  <button
                    onClick={() => toggleAccordion('fabric')}
                    className="w-full py-2.5 flex items-center justify-between text-left font-cinzel text-xs tracking-widest text-espresso uppercase"
                  >
                    <span>Fabric &amp; Care</span>
                    {activeAccordion === 'fabric' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {activeAccordion === 'fabric' && (
                    <div className="pb-3 font-inter text-xs text-text-muted leading-relaxed space-y-1.5 pl-2">
                      {product.sustainability.map((sust, idx) => (
                        <p key={idx} className="flex items-start gap-2">
                          <span className="text-accent-warm mt-0.5">•</span>
                          <span>{sust}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sustainability Accordion */}
                <div className="border-b border-rule">
                  <button
                    onClick={() => toggleAccordion('sustainability')}
                    className="w-full py-2.5 flex items-center justify-between text-left font-cinzel text-xs tracking-widest text-espresso uppercase"
                  >
                    <span>Artisan Ethics &amp; Sourcing</span>
                    {activeAccordion === 'sustainability' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {activeAccordion === 'sustainability' && (
                    <div className="pb-3 font-inter text-xs text-text-muted leading-relaxed space-y-1.5 pl-2">
                      {product.sizeFit.map((fit, idx) => (
                        <p key={idx} className="flex items-start gap-2">
                          <span className="text-accent-warm mt-0.5">•</span>
                          <span>{fit}</span>
                        </p>
                      ))}
                      <p className="flex items-start gap-2 pt-2 text-[#3A7D44] font-medium">
                        <Leaf size={12} className="mt-0.5" />
                        <span>Nepali highland production guarantees fair livable wages and medical insurance.</span>
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="bg-white border-t border-rule">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h2 className="font-cinzel text-center text-sm tracking-widest text-espresso uppercase mb-12">
              Related Atelier Styles
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  name={p.name}
                  price={p.price}
                  image={p.image}
                  colors={p.colors}
                  badge={p.badge}
                  index={idx}
                  href={`/products/${p.slug}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
