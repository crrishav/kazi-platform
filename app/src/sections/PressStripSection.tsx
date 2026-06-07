"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Inline SVG logos for press strip
const logos = [
  {
    name: "Le Monde",
    svg: (
      <svg viewBox="0 0 120 30" fill="currentColor" style={{ width: 120, height: 30 }}>
        <text
          x="0"
          y="22"
          style={{
            fontFamily: "'Times New Roman', serif",
            fontSize: "22px",
            fontWeight: 400,
            fontStyle: "italic",
          }}
        >
          Le Monde
        </text>
      </svg>
    ),
  },
  {
    name: "National Geographic",
    svg: (
      <svg viewBox="0 0 140 40" fill="currentColor" style={{ width: 140, height: 40 }}>
        <rect x="0" y="5" width="20" height="28" rx="2" fill="#FFCC00" />
        <text
          x="26"
          y="20"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "8px",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          NATIONAL
        </text>
        <text
          x="26"
          y="32"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "8px",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          GEOGRAPHIC
        </text>
      </svg>
    ),
  },
  {
    name: "Who What Wear",
    svg: (
      <svg viewBox="0 0 130 24" fill="currentColor" style={{ width: 130, height: 24 }}>
        <text
          x="0"
          y="18"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          WHO WHAT WEAR
        </text>
      </svg>
    ),
  },
  {
    name: "Vogue",
    svg: (
      <svg viewBox="0 0 100 30" fill="currentColor" style={{ width: 100, height: 30 }}>
        <text
          x="0"
          y="26"
          style={{
            fontFamily: "'Times New Roman', serif",
            fontSize: "30px",
            fontWeight: 400,
          }}
        >
          VOGUE
        </text>
      </svg>
    ),
  },
  {
    name: "Financial Times",
    svg: (
      <svg viewBox="0 0 120 35" fill="currentColor" style={{ width: 120, height: 35 }}>
        <rect x="0" y="5" width="24" height="24" rx="2" fill="#FFF1E5" />
        <text
          x="4"
          y="20"
          style={{
            fontFamily: "'Times New Roman', serif",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          FT
        </text>
        <text
          x="30"
          y="16"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "8px",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          FINANCIAL
        </text>
        <text
          x="30"
          y="28"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "8px",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          TIMES
        </text>
      </svg>
    ),
  },
  {
    name: "Cartier Women's Initiative",
    svg: (
      <svg viewBox="0 0 130 40" fill="currentColor" style={{ width: 130, height: 40 }}>
        <text
          x="0"
          y="14"
          style={{
            fontFamily: "'Times New Roman', serif",
            fontSize: "11px",
            fontWeight: 400,
            fontStyle: "italic",
          }}
        >
          Cartier
        </text>
        <text
          x="0"
          y="26"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "7px",
            fontWeight: 500,
            letterSpacing: "0.1em",
          }}
        >
          WOMEN{"'"}S INITIATIVE
        </text>
      </svg>
    ),
  },
];

export default function PressStripSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLHeadingElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Label animation
      gsap.fromTo(
        labelRef.current,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Logos stagger animation
      const logoElements = logosRef.current?.children;
      if (logoElements) {
        gsap.fromTo(
          logoElements,
          { opacity: 0 },
          {
            opacity: 0.5,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: logosRef.current,
              start: "top 85%",
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
      ref={sectionRef}
      style={{
        backgroundColor: "#EBF3EC",
        paddingTop: "48px",
        paddingBottom: "48px",
        borderTop: "1px solid #D6E6D8",
      }}
    >
      <div className="container-pad" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Label */}
        <h2
          ref={labelRef}
          className="text-center"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "11px",
            fontWeight: 400,
            letterSpacing: "0.35em",
            lineHeight: 1.4,
            color: "#1A1A1A",
            textTransform: "uppercase",
            marginBottom: "32px",
            opacity: 0,
          }}
        >
          As Featured In
        </h2>

        {/* Logos */}
        <div
          ref={logosRef}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16"
        >
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center justify-center transition-opacity duration-200 hover:opacity-80"
              style={{
                opacity: 0,
                color: "#1A1A1A",
                filter: "grayscale(100%)",
                minWidth: "100px",
              }}
              title={logo.name}
            >
              {logo.svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
