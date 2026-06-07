"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import HeroParticles from "@/components/HeroParticles";

export default function HeroSection() {
  const heroRef  = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef   = useRef<HTMLParagraphElement>(null);
  const ctaRef   = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(imageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.4, ease: "power2.out" }
    );
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
      0.55
    );
    tl.fromTo(subRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
      0.85
    );
    tl.fromTo(ctaRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      1.1
    );

    return () => { tl.kill(); };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", minHeight: 600 }}
    >
      {/* Background Video */}
      <div ref={imageRef} className="absolute inset-0" style={{ opacity: 0, zIndex: 1 }}>
        <video
          autoPlay muted loop playsInline
          poster="/images/hero-main.jpg"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover", objectPosition: "center 25%" }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Particle Overlay */}
      <HeroParticles />

      {/* Gradient — dark at bottom for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.08) 100%)",
          zIndex: 3,
        }}
      />

      {/* Hero Content — vertically centered */}
      <div
        className="absolute left-1/2 flex flex-col items-center"
        style={{
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 4,
          width: "100%",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        {/* Heading */}
        <h1
          ref={titleRef}
          style={{
            opacity: 0,
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(28px, 3.2vw, 52px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.12,
            color: "#ffffff",
            marginBottom: "16px",
            maxWidth: "640px",
            textShadow: "0 2px 20px rgba(0,0,0,0.22)",
          }}
        >
          Built for Your Brand. Crafted in Nepal.
        </h1>

        {/* Subtitle */}
        <p
          ref={subRef}
          style={{
            opacity: 0,
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(14px, 1.4vw, 17px)",
            fontWeight: 400,
            letterSpacing: "0.01em",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.76)",
            maxWidth: "480px",
            marginBottom: "36px",
          }}
        >
          Custom apparel from Kathmandu for UK clothing brands.
          <br />0% import duty. MOQ from 50 units.
        </p>

        {/* CTA */}
        <a
          ref={ctaRef}
          href="/quote"
          style={{
            opacity: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "#1B3D2A",
            backgroundColor: "#ffffff",
            padding: "13px 28px",
            borderRadius: "100px",
            textDecoration: "none",
            boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.28)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.18)";
          }}
        >
          Get a Quote
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: "transform 0.2s ease" }}>
            <path d="M1 11L11 1M11 1H4M11 1V8" stroke="#1B3D2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute hidden md:flex flex-col items-center"
        style={{ right: "48px", bottom: "48px", zIndex: 5 }}
      >
        <div style={{ width: "1px", height: "40px", backgroundColor: "rgba(255,255,255,0.3)" }} />
        <div
          className="scroll-bounce rounded-full"
          style={{ width: "5px", height: "5px", backgroundColor: "rgba(255,255,255,0.4)", marginTop: "6px" }}
        />
      </div>
    </section>
  );
}
