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
    colors: [
      { name: "Forest Green", hex: "#1B3D2A" },
      { name: "Sage", hex: "#8FA89B" },
      { name: "Bone White", hex: "#EBF3EC" },
      { name: "Charcoal", hex: "#3A3A3A" },
    ],
    badge: undefined,
  },
  {
    name: "DROPSHOULDER TEE",
    slug: "dropshoulder-tee",
    price: "From US$ 12.00 / piece",
    image: "/images/dropshoulder-tee.jpg",
    garment: "t-shirt",
    colors: [
      { name: "Deep Green", hex: "#1B3D2A" },
      { name: "Olive", hex: "#6B6B4E" },
      { name: "Navy", hex: "#1A2744" },
      { name: "Off-White", hex: "#EBF3EC" },
    ],
    badge: undefined,
  },
  {
    name: "PREMIUM HOODIE",
    slug: "premium-hoodie",
    price: "From US$ 18.00 / piece",
    image: "/images/premium-hoodie.jpg",
    garment: "hoodie",
    colors: undefined,
    badge: "BESTSELLER",
  },
  {
    name: "ORGANIC OVERSHIRT",
    slug: "organic-overshirt",
    price: "From US$ 22.00 / piece",
    image: "/images/product-weekend.jpg",
    garment: "t-shirt",
    colors: undefined,
    badge: "GENDER NEUTRAL",
  },
];

export default function ProductGridSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
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
        backgroundColor: "#EBF3EC",
        paddingTop: "40px",
        paddingBottom: "80px",
      }}
    >
      <div className="container-pad" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section Header */}
        <h2
          ref={headerRef}
          className="text-center"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "11px",
            fontWeight: 400,
            letterSpacing: "0.35em",
            lineHeight: 1.4,
            color: "#1A1A1A",
            textTransform: "uppercase",
            marginBottom: "48px",
            opacity: 0,
          }}
        >
          Signature Styles
        </h2>

        {/* Product Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{ gap: "24px" }}
        >
          {products.map((product, index) => (
            <ProductCard
              key={product.name}
              name={product.name}
              price={product.price}
              image={product.image}
              colors={product.colors}
              badge={product.badge}
              index={index}
              href={`/products/${product.slug}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center" style={{ marginTop: "48px" }}>
          <GhostButton href="/configure">Explore the Atelier</GhostButton>
        </div>
      </div>
    </section>
  );
}
