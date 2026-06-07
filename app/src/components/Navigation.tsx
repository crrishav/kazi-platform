"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Search, ShoppingBag, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navigation() {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole]             = useState<string | null>(null);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async (res: any) => {
      const user = res?.data?.user;
      if (!user) return;
      const { data } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();
      setUserRole(data?.role ?? "customer");
    });
  }, []);

  const dashboardHref =
    userRole === "admin"    ? "/admin" :
    userRole === "employee" ? "/factory" :
    userRole               ? "/dashboard" :
                             "/auth/login";

  const leftNavLinks = [
    { label: "Atelier",      href: "/configure" },
    { label: "Our Heritage", href: "/services" },
  ];

  const isActive = (href: string) =>
    href !== "#" && pathname?.startsWith(href);

  return (
    <nav
      className="fixed left-0 right-0 transition-all duration-500"
      style={{
        top: "32px",
        zIndex: 90,
        backgroundColor: isScrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0)",
        backdropFilter: isScrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: isScrolled ? "blur(16px)" : "none",
        borderBottom: isScrolled ? "1px solid rgba(0,0,0,0.07)" : "1px solid transparent",
        height: "80px",
      }}
    >
      <div
        className="flex items-center justify-between h-full relative container-pad"
        style={{ maxWidth: 1400, margin: "0 auto" }}
      >
        {/* Left: Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {leftNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link-underline"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "12px",
                fontWeight: isActive(link.href) ? 500 : 400,
                letterSpacing: "0.06em",
                lineHeight: 1.0,
                color: isScrolled
                  ? (isActive(link.href) ? "#3A7D44" : "#1A1A1A")
                  : "rgba(255,255,255,0.92)",
                textDecoration: "none",
                paddingBottom: "2px",
                transition: "color 0.3s ease",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center justify-center"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X size={22} strokeWidth={1.5} color={isScrolled ? "#1A1A1A" : "#ffffff"} />
          ) : (
            <Menu size={22} strokeWidth={1.5} color={isScrolled ? "#1A1A1A" : "#ffffff"} />
          )}
        </button>

        {/* Center: Brand Logo — oversized then clipped to remove PNG padding */}
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          aria-label="Kazi Manufacturing — home"
          style={{
            display: "flex",
            alignItems: "flex-start",
            width: "160px",
            height: "80px",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/kazi-logo.png"
            alt="Kazi Manufacturing"
            style={{
              width: "200px",
              height: "200px",
              objectFit: "contain",
              flexShrink: 0,
              marginTop: "-53px",
              marginLeft: "-17px",
              filter: isScrolled ? "brightness(0)" : "brightness(0) invert(1)",
              transition: "filter 0.4s ease",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </Link>

        {/* Right: CTA + Icons */}
        <div className="flex items-center gap-4">

          {/* Enquire — hidden on mobile */}
          <Link
            href="/quote"
            className="hidden md:inline-flex items-center nav-link-underline"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              letterSpacing: "0.06em",
              color: isScrolled ? "#1A1A1A" : "rgba(255,255,255,0.92)",
              textDecoration: "none",
              transition: "color 0.3s ease",
              paddingBottom: "2px",
            }}
          >
            Enquire
          </Link>

          <Link
            href={dashboardHref}
            aria-label="Account"
            className="transition-opacity duration-200 hover:opacity-60"
          >
            <User size={20} strokeWidth={1.5} color={isScrolled ? "#1A1A1A" : "#ffffff"} />
          </Link>

          <button aria-label="Search" className="transition-opacity duration-200 hover:opacity-60">
            <Search size={20} strokeWidth={1.5} color={isScrolled ? "#1A1A1A" : "#ffffff"} />
          </button>

          <button aria-label="Cart" className="relative transition-opacity duration-200 hover:opacity-60">
            <ShoppingBag size={20} strokeWidth={1.5} color={isScrolled ? "#1A1A1A" : "#ffffff"} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden absolute left-0 right-0 top-full"
          style={{
            backgroundColor: "rgba(235, 243, 236, 0.98)",
            backdropFilter: "blur(12px)",
            zIndex: 89,
            borderTop: "1px solid #D6E6D8",
          }}
        >
          <div className="flex flex-col p-8 gap-0">
            {leftNavLinks.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center justify-between py-4"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: isActive(link.href) ? 500 : 400,
                  letterSpacing: "0.18em",
                  color: isActive(link.href) ? "#3A7D44" : "#1A1A1A",
                  textDecoration: "none",
                  borderBottom: i < leftNavLinks.length - 1 ? "1px solid #D6E6D8" : "none",
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Enquire CTA */}
            <div className="pt-6">
              <Link
                href="/quote"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  color: "#EBF3EC",
                  backgroundColor: "#1B3D2A",
                  padding: "14px 24px",
                  borderRadius: "100px",
                  textDecoration: "none",
                }}
              >
                Enquire
              </Link>
            </div>

            {/* Account */}
            <div className="pt-3">
              <Link
                href={dashboardHref}
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  fontWeight: 400,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#4D6B55",
                  padding: "10px 24px",
                  textDecoration: "none",
                  border: "1px solid #C2D6C6",
                }}
              >
                {userRole ? "My Account" : "Sign In"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
