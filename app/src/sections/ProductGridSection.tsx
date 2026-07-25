"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "@/components/ProductCard";
import GhostButton from "@/components/GhostButton";

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    name: "KAZI ORGANIC TEE",
    slug: "kazi-organic-tee",
    price: "From US$ 8.50 / piece",
    image: "/images/organic-tee.jpg",
    garment: "t-shirt",
  },
  {
    name: "DROPSHOULDER TEE",
    slug: "dropshoulder-tee",
    price: "From US$ 12.00 / piece",
    image: "/images/dropshoulder-tee.jpg",
    garment: "t-shirt",
  },
  {
    name: "PREMIUM HOODIE",
    slug: "premium-hoodie",
    price: "From US$ 18.00 / piece",
    image: "/images/premium-hoodie.jpg",
    garment: "hoodie",
  },
  {
    name: "DESIGN YOUR OWN",
    slug: "design-your-own",
    price: "Bespoke Production",
    image: "/images/custom-tailoring.png",
    garment: "t-shirt",
  },
];

export default function ProductGridSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Cards stagger animation
      const cards = gridRef.current?.querySelectorAll("[data-product-card]");
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="collection"
      ref={sectionRef}
      style={{
        backgroundColor: "#FFFFFF",
        paddingTop: "40px",
        paddingBottom: "80px",
      }}
    >
      <div className="container-pad" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section Header */}
        <div ref={headerRef} className="text-center" style={{ opacity: 0, marginBottom: "64px" }}>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "28px",
              fontWeight: 400,
              letterSpacing: "0.08em",
              lineHeight: 1.3,
              color: "#1A1A1A",
            }}
          >
            Signature Styles
          </h2>
          <div
            style={{
              width: "40px",
              height: "1px",
              backgroundColor: "#C2D6C6",
              margin: "24px auto 0",
            }}
          />
        </div>

        {/* Product Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          style={{ gap: "24px" }}
        >
          {products.map((product, index) => (
            <ProductCard
              key={product.name}
              name={product.name}
              price={product.price}
              image={product.image}
              index={index}
              href={`/products/${product.slug}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center" style={{ marginTop: "48px" }}>
          <GhostButton href="/studio">Design Your Garment</GhostButton>
        </div>
      </div>
    </section>
  );
}
