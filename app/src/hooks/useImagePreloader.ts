"use client";

import { useState, useEffect } from "react";

export function useImagePreloader(_containerRef: React.RefObject<HTMLElement>) {
  // Hero is a video with poster — no blocking preload needed
  const [loaded] = useState(true);

  return loaded;
}
