"use client";

export default function AnnouncementBar() {
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#1B3D2A",
        height: "32px",
        zIndex: 100,
      }}
    >
      <p
        className="text-white text-center px-4"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          fontWeight: 400,
          letterSpacing: "0.12em",
          lineHeight: 1.4,
        }}
      >
        <span className="hidden sm:inline">Crafted in Nepal · 0% Import Duty to UK · Minimum Order 50 Pieces</span>
        <span className="sm:hidden">Crafted in Nepal · MOQ 50 Pieces</span>
      </p>
    </div>
  );
}
