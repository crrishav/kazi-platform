"use client";

import Image from "next/image";

interface MegaMenuProps {
  isOpen: boolean;
}

const supplyChainLinks = [
  { label: "Raw Material Sourcing",   href: "#" },
  { label: "Fabric Production",        href: "#" },
  { label: "Cutting & Sewing",         href: "#" },
  { label: "Quality Control",          href: "#" },
  { label: "Finishing & Packing",      href: "#" },
];

const sustainabilityLinks = [
  { label: "GOTS Certification",       href: "#" },
  { label: "Organic & Recycled Fabrics", href: "#" },
  { label: "Water-Based Inks",         href: "#" },
  { label: "Zero-Waste Cutting",       href: "#" },
  { label: "Fair Wage Guarantee",      href: "#" },
];

const workWithUsLinks = [
  { label: "Request a Sample",         href: "/quote" },
  { label: "Design Your Collection",   href: "/configure" },
  { label: "Pricing",                  href: "/pricing" },
  { label: "Our Certifications",       href: "#" },
  { label: "Sustainability Report",    href: "#" },
];

export default function MegaMenu({ isOpen }: MegaMenuProps) {
  return (
    <div
      className="fixed left-0 right-0 overflow-hidden"
      style={{
        top: "112px",          /* 32px announcement bar + 80px nav */
        backgroundColor: "#FFFFFF",
        zIndex: 85,
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "translateY(0)" : "translateY(-8px)",
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        borderTop: "1px solid #D6E6D8",
      }}
    >
      <div
        className="flex"
        style={{ maxWidth: 1400, margin: "0 auto" }}
      >
        {/* Left: Editorial Image */}
        <div
          className="hidden lg:block"
          style={{ width: "38%", position: "relative", minHeight: 340 }}
        >
          <Image
            src="/images/dropdown-editorial.jpg"
            alt="Kazi Manufacturing factory floor"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 38vw, 0vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(27,61,42,0.75) 0%, rgba(27,61,42,0.15) 60%, transparent 100%)",
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "11px",
                fontWeight: 400,
                letterSpacing: "0.35em",
                lineHeight: 1.4,
                color: "#FFFFFF",
                textTransform: "uppercase",
              }}
            >
              Our Heritage
            </p>
            <p
              style={{
                fontFamily: "'Newsreader', serif",
                fontSize: "14px",
                fontWeight: 300,
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.85)",
                marginTop: "8px",
                maxWidth: "280px",
              }}
            >
              Rooted in Kathmandu&apos;s craft traditions — every thread traced from Nepal&apos;s organic highlands to your finished collection.
            </p>
          </div>
        </div>

        {/* Right: Link Columns */}
        <div
          className="flex-1 grid grid-cols-3 gap-10 px-10 py-9"
          style={{ minHeight: 340 }}
        >
          {/* SUPPLY CHAIN */}
          <div>
            <h4
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                lineHeight: 1.0,
                textTransform: "uppercase",
                color: "#3A7D44",
                marginBottom: "18px",
              }}
            >
              Supply Chain
            </h4>
            <ul className="space-y-1">
              {supplyChainLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="block transition-colors duration-200 hover:text-[#3A7D44]"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      fontWeight: 300,
                      letterSpacing: "0.01em",
                      lineHeight: 2.2,
                      color: "#1A1A1A",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SUSTAINABILITY */}
          <div>
            <h4
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                lineHeight: 1.0,
                textTransform: "uppercase",
                color: "#3A7D44",
                marginBottom: "18px",
              }}
            >
              Sustainability
            </h4>
            <ul className="space-y-1">
              {sustainabilityLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="block transition-colors duration-200 hover:text-[#3A7D44]"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      fontWeight: 300,
                      letterSpacing: "0.01em",
                      lineHeight: 2.2,
                      color: "#1A1A1A",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* WORK WITH US */}
          <div>
            <h4
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                lineHeight: 1.0,
                textTransform: "uppercase",
                color: "#3A7D44",
                marginBottom: "18px",
              }}
            >
              Work With Us
            </h4>
            <ul className="space-y-1">
              {workWithUsLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="block transition-colors duration-200 hover:text-[#3A7D44]"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      fontWeight: 300,
                      letterSpacing: "0.01em",
                      lineHeight: 2.2,
                      color: "#1A1A1A",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
