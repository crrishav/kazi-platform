"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { subscribeToNewsletterClient } from "@/lib/newsletter-client";
import GhostButton from "./GhostButton";

gsap.registerPlugin(ScrollTrigger);

const workLinks = [
  { label: "Request a Sample",       href: "/quote" },
  { label: "Design Your Collection", href: "/configure" },
  { label: "Pricing",                href: "/pricing" },
  { label: "Our Process",            href: "/services" },
  { label: "Partner Programme",      href: "/quote" },
  { label: "FAQs",                   href: "/quote" },
];

const aboutLinks = [
  { label: "Enquire",        href: "/quote" },
  { label: "Our Heritage",   href: "/services" },
  { label: "Sustainability", href: "#" },
  { label: "Certifications", href: "#" },
  { label: "Press",          href: "#" },
  { label: "Careers",        href: "#" },
];

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const columns = footerRef.current?.querySelectorAll("[data-footer-col]");
      if (columns) {
        gsap.fromTo(
          columns,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const result = await subscribeToNewsletterClient(email);
    setToast({ message: result.message, type: result.success ? "success" : "error" });
    if (result.success) {
      setEmail("");
    }
  };

  return (
    <footer ref={footerRef}>
      {/* Main Footer Grid */}
      <div
        style={{
          backgroundColor: "#EBF3EC",
          borderTop: "1px solid #C2D6C6",
          paddingTop: "64px",
          paddingBottom: "48px",
        }}
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 container-pad"
          style={{ maxWidth: 1200, margin: "0 auto" }}
        >
          {/* Column 1 - WORK WITH US */}
          <div data-footer-col style={{ opacity: 0 }}>
            <h4
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.2em",
                lineHeight: 1.0,
                textTransform: "uppercase",
                color: "#1A1A1A",
                marginBottom: "20px",
              }}
            >
              Work With Us
            </h4>
            <ul className="space-y-2">
              {workLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="block transition-colors duration-200 hover:text-[#4D6B55]"
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

          {/* Column 2 - COMPANY */}
          <div data-footer-col style={{ opacity: 0 }}>
            <h4
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.2em",
                lineHeight: 1.0,
                textTransform: "uppercase",
                color: "#1A1A1A",
                marginBottom: "20px",
              }}
            >
              Company
            </h4>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="block transition-colors duration-200 hover:text-[#4D6B55]"
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

          {/* Column 3 - BE AN INSIDER */}
          <div data-footer-col style={{ opacity: 0 }}>
            <h4
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.2em",
                lineHeight: 1.0,
                textTransform: "uppercase",
                color: "#1A1A1A",
                marginBottom: "20px",
              }}
            >
              Be an Insider
            </h4>
            <p
              style={{
                fontFamily: "'Newsreader', serif",
                fontSize: "13px",
                fontWeight: 300,
                lineHeight: 1.6,
                color: "#4D6B55",
                marginBottom: "20px",
              }}
            >
              Factory updates, sustainability reports, and production insights for our brand partners.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="relative">
              <div className="flex items-center" style={{ borderBottom: "1px solid #C2D6C6" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="footer-input flex-1 bg-transparent py-2 pr-10"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                    color: "#1A1A1A",
                  }}
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="flex items-center justify-center transition-colors duration-200 hover:text-[#4D6B55]"
                  style={{
                    color: "#1A1A1A",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <ArrowRight size={20} strokeWidth={1.5} />
                </button>
              </div>
            </form>

            {/* Toast */}
            {toast && (
              <div
                className="mt-3 px-3 py-2 text-xs"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: toast.type === "success" ? "#E8F5E9" : "#FFEBEE",
                  color: toast.type === "success" ? "#2E7D32" : "#C62828",
                  borderRadius: "4px",
                  transition: "opacity 0.3s ease",
                }}
              >
                {toast.message}
              </div>
            )}
          </div>

          {/* Column 4 - B CORP */}
          <div data-footer-col style={{ opacity: 0 }}>
            <div className="relative" style={{ width: 100, height: 130 }}>
              <Image
                src="/images/badge-bcorp.png"
                alt="Certified B Corporation"
                fill
                className="object-contain"
                sizes="100px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="footer-bottom flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{
          backgroundColor: "#1B3D2A",
          padding: "16px 48px",
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            fontWeight: 400,
            letterSpacing: "0.12em",
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          &copy; 2015–2026 &middot; Kazi Manufacturing Ltd, Kathmandu, Nepal
        </p>
        <div className="mt-3 sm:mt-0">
          <GhostButton href="/quote" variant="light">
            Get a Quote
          </GhostButton>
        </div>
      </div>
    </footer>
  );
}
