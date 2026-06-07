"use client";

import React, { useState } from "react";

interface GhostButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "dark" | "light";
}

export default function GhostButton({ children, onClick, href, variant = "dark" }: GhostButtonProps) {
  const isDark = variant === "dark";
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    padding: "14px 48px",
    backgroundColor: isHovered
      ? (isDark ? "#1A1A1A" : "rgba(255,255,255,0.1)")
      : "transparent",
    border: `1px solid ${isDark ? "#1A1A1A" : "rgba(255,255,255,0.4)"}`,
    borderRadius: 0,
    color: isHovered && isDark ? "#EBF3EC" : (isDark ? "#1A1A1A" : "#FFFFFF"),
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: "0.15em",
    lineHeight: 1.0,
    textTransform: "uppercase" as const,
    cursor: "pointer",
    transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
    textDecoration: "none",
    display: "inline-block",
    textAlign: "center",
  };

  if (href) {
    return (
      <a
        href={href}
        style={baseStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
}
