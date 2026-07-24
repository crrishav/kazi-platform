"use client";

import { useEffect, useState } from "react";

const MIN_DISPLAY_MS = 900;
const FADE_MS = 500;

export default function SplashScreen() {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();

    const finish = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
      window.setTimeout(() => setLoading(false), wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      return () => window.removeEventListener("load", finish);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      const timeout = window.setTimeout(() => setVisible(false), FADE_MS);
      return () => window.clearTimeout(timeout);
    }
  }, [loading]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1B3D2A",
        opacity: loading ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: loading ? "auto" : "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/kazi-logo.png"
        alt="Kazi Manufacturing"
        style={{
          width: "140px",
          height: "140px",
          objectFit: "contain",
          filter: "brightness(0)",
        }}
      />
    </div>
  );
}
