"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Search, ShoppingBag, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";
import { useCart } from "@/context/CartContext";

interface NavigationProps {
  showAnnouncementBar?: boolean;
}

export default function Navigation({ showAnnouncementBar = true }: NavigationProps) {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen]         = useState(false);
  const [userRole, setUserRole]             = useState<string | null>(null);
  const pathname = usePathname();
  const { totalItems } = useCart();

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

  const isHomepage = !pathname || pathname === "/";
  const showSolidNav = isScrolled || !isHomepage;

  return (
    <>
    {showAnnouncementBar && <AnnouncementBar />}
    <nav
      className="fixed left-0 right-0 transition-all duration-500"
      style={{
        top: showAnnouncementBar ? "32px" : "0px",
        zIndex: 90,
        backgroundColor: showSolidNav ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0)",
        backdropFilter: showSolidNav ? "blur(16px)" : "none",
        WebkitBackdropFilter: showSolidNav ? "blur(16px)" : "none",
        borderBottom: showSolidNav ? "1px solid rgba(0,0,0,0.07)" : "1px solid transparent",
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
                color: showSolidNav
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
            <X size={22} strokeWidth={1.5} color={showSolidNav ? "#1A1A1A" : "#ffffff"} />
          ) : (
            <Menu size={22} strokeWidth={1.5} color={showSolidNav ? "#1A1A1A" : "#ffffff"} />
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
              width: "172px",
              height: "172px",
              objectFit: "contain",
              flexShrink: 0,
              marginTop: "-44px",
              marginLeft: "-15px",
              filter: showSolidNav ? "brightness(0)" : "brightness(0) invert(1)",
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
              color: showSolidNav ? "#1A1A1A" : "rgba(255,255,255,0.92)",
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
            <User size={20} strokeWidth={1.5} color={showSolidNav ? "#1A1A1A" : "#ffffff"} />
          </Link>

          <button aria-label="Search" className="transition-opacity duration-200 hover:opacity-60">
            <Search size={20} strokeWidth={1.5} color={showSolidNav ? "#1A1A1A" : "#ffffff"} />
          </button>

          <button
            aria-label={`Cart${totalItems > 0 ? ` (${totalItems} items)` : ""}`}
            onClick={() => setIsCartOpen(true)}
            className="relative transition-opacity duration-200 hover:opacity-60"
          >
            <ShoppingBag size={20} strokeWidth={1.5} color={showSolidNav ? "#1A1A1A" : "#ffffff"} />
            {totalItems > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -8,
                  minWidth: 16,
                  height: 16,
                  padding: "0 3px",
                  borderRadius: "999px",
                  backgroundColor: "#3A7D44",
                  color: "#ffffff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "9px",
                  fontWeight: 600,
                  lineHeight: "16px",
                  textAlign: "center",
                }}
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
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

    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} topOffset={showAnnouncementBar ? 32 : 0} />
    </>
  );
}
