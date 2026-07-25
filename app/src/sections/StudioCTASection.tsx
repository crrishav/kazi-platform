"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StudioCTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex items-center justify-center"
      style={{
        backgroundColor: "#1B3D2A",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#EBF3EC 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div
        ref={contentRef}
        className="container-pad flex flex-col items-center text-center"
        style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 2, opacity: 0 }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.25em",
            color: "#8FA89B",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          Ready When You Are
        </p>

        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 400,
            letterSpacing: "0.04em",
            color: "#FFFFFF",
            lineHeight: 1.3,
            marginBottom: "20px",
          }}
        >
          Design Your Own Garment
        </h2>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            fontWeight: 300,
            lineHeight: 1.7,
            color: "rgba(235, 243, 236, 0.75)",
            marginBottom: "40px",
            maxWidth: 480,
          }}
        >
          Choose your garment, fabric, colour and logo placement, then get a live
          price — no back-and-forth, no sample fees.
        </p>

        <Link
          href="/studio"
          className="inline-flex items-center gap-2 font-inter text-xs tracking-button uppercase bg-white text-espresso px-8 py-4 hover:bg-transparent hover:text-white border border-white transition-colors duration-200"
        >
          Start Designing <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}
