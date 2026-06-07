"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StorySplitSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const centerColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const elements = [leftColRef.current, centerColRef.current, rightColRef.current];

      gsap.fromTo(
        elements,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
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
      style={{
        backgroundColor: "#EBF3EC",
        paddingTop: "80px",
        paddingBottom: "60px",
      }}
    >
      <div
        className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-0 container-pad"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        {/* Left Column */}
        <div
          ref={leftColRef}
          className="lg:flex-1 flex items-center lg:pr-6"
          style={{ opacity: 0 }}
        >
          <p
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: "14px",
              fontWeight: 300,
              letterSpacing: "0.01em",
              lineHeight: 1.75,
              color: "#1A1A1A",
              maxWidth: "100%",
            }}
          >
            Behind every seam, a master craftsperson. Rooted in Kathmandu&apos;s
            centuries-old textile tradition, our artisans bring your designs to
            life with the precision and care that only generational expertise
            can provide.
          </p>
        </div>

        {/* Center Column - Image */}
        <div
          ref={centerColRef}
          className="flex-shrink-0"
          style={{
            opacity: 0,
            width: "100%",
            maxWidth: "360px",
            aspectRatio: "1/1",
            position: "relative",
          }}
        >
          <Image
            src="/images/story-farmer.jpg"
            alt="A woman farmer in a rice paddy wearing a traditional conical hat, holding a basket"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 360px"
          />
        </div>

        {/* Right Column */}
        <div
          ref={rightColRef}
          className="lg:flex-1 flex flex-col justify-center lg:pl-6"
          style={{ opacity: 0 }}
        >
          <p
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: "14px",
              fontWeight: 300,
              letterSpacing: "0.01em",
              lineHeight: 1.75,
              color: "#1A1A1A",
              maxWidth: "100%",
            }}
          >
            We trace every thread from Nepal&apos;s GOTS-certified organic
            highlands through our Kathmandu atelier — so your UK brand
            can stand behind a supply chain built on full transparency
            and genuine craftsmanship.
          </p>
          <p
            className="mt-4"
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: "14px",
              fontWeight: 300,
              fontStyle: "italic",
              letterSpacing: "0.01em",
              lineHeight: 1.75,
              color: "#1A1A1A",
              maxWidth: "100%",
            }}
          >
            Not just a factory. A creative partner built for brands
            that believe quality and conscience belong together.
          </p>
        </div>
      </div>
    </section>
  );
}
