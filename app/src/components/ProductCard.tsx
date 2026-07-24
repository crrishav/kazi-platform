"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  name: string;
  price: string;
  image: string;
  index: number;
  href?: string;
}

export default function ProductCard({ name, price, image, index, href }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const Wrapper = href ? Link : 'div' as any;
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="group cursor-pointer block"
      data-product-card
      data-index={index}
    >
      {/* Image Container */}
      <div
        className="product-image-container relative overflow-hidden"
        style={{ backgroundColor: "#D6E6D8", aspectRatio: "3/4" }}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500"
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Quick View Label */}
        <div
          className="quick-view-label absolute bottom-0 left-0 right-0 flex items-center justify-center py-3"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)",
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: "0.15em",
              lineHeight: 1.4,
              color: "#FFFFFF",
              textTransform: "uppercase",
            }}
          >
            Quick View
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-4 text-center">
        <h3
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            letterSpacing: "0.12em",
            lineHeight: 1.4,
            color: "#1A1A1A",
            textTransform: "uppercase",
          }}
        >
          {name}
        </h3>
        <p
          className="mt-1"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            letterSpacing: "0.02em",
            lineHeight: 1.4,
            color: "#4D6B55",
          }}
        >
          {price}
        </p>
      </div>
    </Wrapper>
  );
}
