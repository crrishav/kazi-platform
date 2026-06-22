"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  {
    value: "10",
    suffix: "",
    label: "Dedicated Tailors",
    desc: "A small, focused team of master tailors in our Kathmandu partner studio hand-crafting every custom run.",
  },
  {
    value: "100",
    suffix: "%",
    label: "GOTS Organic Cotton",
    desc: "Fully certified organic cotton jersey, ensuring zero toxic chemicals or synthetic blends touch the earth.",
  },
  {
    value: "2.5",
    suffix: "x",
    label: "Living Wage Index",
    desc: "We pay our tailors well above the average living wage, directly supporting health coverage and local education.",
  },
  {
    value: "DFQF",
    suffix: "",
    label: "Duty-Free Export",
    desc: "Fully compliant with Nepal export regulations for tariff-free customs clearance straight to your brand hub.",
  },
];

export default function ImpactStatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title fade-in
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Cards fade-in
      const cards = gridRef.current?.querySelectorAll("[data-stat-card]");
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Animate counter values
      const counters = gridRef.current?.querySelectorAll("[data-counter]");
      counters?.forEach((counter) => {
        const valStr = counter.getAttribute("data-value");
        const isNumeric = !isNaN(Number(valStr));
        if (isNumeric && valStr) {
          const valNum = Number(valStr);
          const obj = { value: 0 };
          const isDecimal = valStr.includes(".");
          
          gsap.to(obj, {
            value: valNum,
            duration: 1.8,
            ease: "power1.out",
            scrollTrigger: {
              trigger: counter,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            onUpdate: () => {
              counter.textContent = isDecimal 
                ? obj.value.toFixed(1) 
                : Math.floor(obj.value).toString();
            },
          });
        } else if (valStr) {
          // If not numeric (like DFQF), do a simple letter fade-in / typewriter
          gsap.fromTo(
            counter,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 1.2,
              ease: "power1.out",
              scrollTrigger: {
                trigger: counter,
                start: "top 85%",
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: "#1B3D2A", // Brand forest green/espresso
        paddingTop: "96px",
        paddingBottom: "96px",
        color: "#EBF3EC", // Cream text
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

      <div className="container-pad" style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
        
        {/* Title */}
        <div ref={titleRef} className="text-center mb-16" style={{ opacity: 0 }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.25em",
              color: "#8FA89B",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Verified Impact
          </p>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "28px",
              fontWeight: 400,
              letterSpacing: "0.08em",
              color: "#FFFFFF",
              lineHeight: 1.3,
            }}
          >
            Atelier Standards &amp; Credentials
          </h2>
          <div
            style={{
              width: "40px",
              height: "1px",
              backgroundColor: "rgba(235, 243, 236, 0.2)",
              margin: "24px auto 0",
            }}
          />
        </div>

        {/* Stats Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              data-stat-card
              className="flex flex-col border border-white/10 bg-white/5 p-6 backdrop-blur-sm relative"
              style={{ opacity: 0, minHeight: "220px" }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/20" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/20" />

              {/* Number Counter */}
              <div className="flex items-baseline mb-3">
                <span
                  data-counter
                  data-value={stat.value}
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "44px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    lineHeight: 1.0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: "24px",
                      fontWeight: 300,
                      color: "#8FA89B",
                      marginLeft: "2px",
                    }}
                  >
                    {stat.suffix}
                  </span>
                )}
              </div>

              {/* Label & Description */}
              <h3
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#8FA89B",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                {stat.label}
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  fontWeight: 300,
                  lineHeight: 1.6,
                  color: "rgba(235, 243, 236, 0.75)",
                }}
              >
                {stat.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
