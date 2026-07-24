"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import HeroParticles from "@/components/HeroParticles";

export default function HeroSection() {
  const heroRef  = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(imageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.4, ease: "power2.out" }
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

      {/* Bottom-right CTA */}
      <div
        className="absolute hidden md:block"
        style={{ right: "48px", bottom: "48px", zIndex: 5 }}
      >
        <Link
          href="/quote"
          className="font-inter text-xs tracking-button uppercase bg-white text-espresso border border-white/40 px-6 py-3.5 hover:bg-transparent hover:text-white transition-colors duration-200"
        >
          Request a Quote →
        </Link>
      </div>
    </section>
  );
}
