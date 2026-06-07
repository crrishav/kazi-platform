"use client";

import { useState } from "react";
import Image from "next/image";
import ColorSwatch from "./ColorSwatch";

interface ProductCardProps {
  name: string;
  price: string;
  image: string;
  colors?: { name: string; hex: string }[];
  badge?: string;
  index: number;
}

export default function ProductCard({ name, price, image, colors, badge, index }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="group cursor-pointer"
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

        {/* Badge */}
        {badge && (
          <div
            className="absolute"
            style={{
              top: "12px",
              left: "12px",
              padding: "4px 10px",
              border: "1px solid #7A9B82",
              borderRadius: "999px",
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
                color: "#1A1A1A",
                textTransform: "uppercase",
              }}
            >
              {badge}
            </span>
          </div>
        )}

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

        {/* Color Swatches */}
        {colors && colors.length > 0 && (
          <div className="flex justify-center">
            <ColorSwatch
              colors={colors}
              selectedIndex={selectedColor}
              onSelect={setSelectedColor}
            />
          </div>
        )}
      </div>
    </div>
  );
}
