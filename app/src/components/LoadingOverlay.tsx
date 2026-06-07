"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface LoadingOverlayProps {
  loaded: boolean;
}

export default function LoadingOverlay({ loaded }: LoadingOverlayProps) {
  const [visible, setVisible]   = useState(true);
  const [fading, setFading]     = useState(false);
  const [logoIn, setLogoIn]     = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  // Animate logo in on mount
  useEffect(() => {
    const t = setTimeout(() => setLogoIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Animate progress bar
  useEffect(() => {
    const t1 = setTimeout(() => setBarWidth(60), 200);
    const t2 = setTimeout(() => setBarWidth(85), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Fade out when loaded
  useEffect(() => {
    if (loaded && visible) {
      setBarWidth(100);
      const t1 = setTimeout(() => setFading(true), 400);
      const t2 = setTimeout(() => setVisible(false), 950);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [loaded, visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        backgroundColor: "#EBF3EC",
        zIndex: 200,
        opacity: fading ? 0 : 1,
        transition: "opacity 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          opacity: logoIn ? 1 : 0,
          transform: logoIn ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <Image
          src="/logos/kazi-logo.png"
          alt="KAZI"
          width={120}
          height={48}
          priority
          style={{ objectFit: "contain", width: "120px", height: "auto" }}
        />
      </div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: "32px",
          width: "80px",
          height: "1px",
          backgroundColor: "#D6E6D8",
          overflow: "hidden",
          opacity: logoIn ? 1 : 0,
          transition: "opacity 0.7s ease 0.2s",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "#3A7D44",
            width: `${barWidth}%`,
            transition: "width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        />
      </div>
    </div>
  );
}
