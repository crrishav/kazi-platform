"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Height (px) of any fixed announcement bar sitting above the nav on this page. */
  topOffset?: number;
}

export default function CartDrawer({ isOpen, onClose, topOffset = 0 }: CartDrawerProps) {
  const { items, removeItem, updateQty, subtotal } = useCart();

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen, onClose]);

  const requestQuoteHref = `/quote?details=${encodeURIComponent(
    items.map((i) => `${i.name}${i.color ? ` (${i.color}` : ""}${i.size ? `${i.color ? ", " : " ("}Size ${i.size})` : i.color ? ")" : ""} x${i.qty}`).join("; ")
  )}`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: topOffset,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 98,
          backgroundColor: "rgba(0,0,0,0.4)",
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
          transition: "opacity 0.4s ease, visibility 0.4s ease",
        }}
      />

      {/* Panel */}
      <aside
        aria-hidden={!isOpen}
        style={{
          position: "fixed",
          top: topOffset,
          right: 0,
          bottom: 0,
          zIndex: 99,
          width: "min(420px, 100vw)",
          backgroundColor: "#ffffff",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          visibility: isOpen ? "visible" : "hidden",
          transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.45s",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "24px 28px",
            borderBottom: "1px solid #E5E0D8",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#1A1A1A",
            }}
          >
            Your Bag {items.length > 0 && `(${items.length})`}
          </span>
          <button
            onClick={onClose}
            aria-label="Close cart"
            tabIndex={isOpen ? 0 : -1}
            className="transition-opacity duration-200 hover:opacity-60"
          >
            <X size={20} strokeWidth={1.5} color="#1A1A1A" />
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ padding: "40px" }}>
            <ShoppingBag size={32} strokeWidth={1} color="#B0AA9E" />
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: "#6B6459",
                textAlign: "center",
              }}
            >
              Your bag is empty
            </p>
            <Link
              href="/configure"
              onClick={onClose}
              tabIndex={isOpen ? 0 : -1}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#EBF3EC",
                backgroundColor: "#1B3D2A",
                padding: "12px 28px",
                borderRadius: "100px",
                textDecoration: "none",
                marginTop: "8px",
              }}
            >
              Start Designing
            </Link>
          </div>
        ) : (
          <>
            {/* Line items */}
            <div className="flex-1" style={{ overflowY: "auto", padding: "20px 28px" }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3"
                  style={{ paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid #F0ECE3" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 72,
                      height: 90,
                      objectFit: "cover",
                      flexShrink: 0,
                      backgroundColor: "#F0ECE3",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#1A1A1A",
                        marginBottom: "4px",
                      }}
                    >
                      {item.name}
                    </p>
                    {(item.color || item.size) && (
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#6B6459", marginBottom: "8px" }}>
                        {[item.color, item.size ? `Size ${item.size}` : null].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center"
                        style={{ border: "1px solid #E5E0D8" }}
                      >
                        <button
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="hover:opacity-60 transition-opacity duration-200"
                          style={{ padding: "6px 8px" }}
                        >
                          <Minus size={12} strokeWidth={1.5} />
                        </button>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", minWidth: 24, textAlign: "center" }}>
                          {item.qty}
                        </span>
                        <button
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="hover:opacity-60 transition-opacity duration-200"
                          style={{ padding: "6px 8px" }}
                        >
                          <Plus size={12} strokeWidth={1.5} />
                        </button>
                      </div>
                      <button
                        aria-label={`Remove ${item.name} from bag`}
                        onClick={() => removeItem(item.id)}
                        className="hover:opacity-60 transition-opacity duration-200"
                      >
                        <Trash2 size={14} strokeWidth={1.5} color="#B0AA9E" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: "24px 28px", borderTop: "1px solid #E5E0D8", flexShrink: 0 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#6B6459", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Estimated Subtotal
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, color: "#1A1A1A" }}>
                  US$ {subtotal.toFixed(2)}
                </span>
              </div>
              <Link
                href={requestQuoteHref}
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#EBF3EC",
                  backgroundColor: "#1B3D2A",
                  padding: "14px 24px",
                  borderRadius: "100px",
                  textDecoration: "none",
                }}
              >
                Request Bulk Quote
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
