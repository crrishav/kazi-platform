"use client";

import { useRef } from "react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navigation from "@/components/Navigation";
import WhatsAppButton from "@/components/WhatsAppButton";
import LoadingOverlay from "@/components/LoadingOverlay";
import Footer from "@/components/Footer";
import HeroSection from "@/sections/HeroSection";
import StorySplitSection from "@/sections/StorySplitSection";
import ProductGridSection from "@/sections/ProductGridSection";
import PressStripSection from "@/sections/PressStripSection";
import B2BWorkflowSection from "@/sections/B2BWorkflowSection";
import ImpactStatsSection from "@/sections/ImpactStatsSection";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesLoaded = useImagePreloader(containerRef);

  // Initialize smooth scroll
  useSmoothScroll();

  return (
    <>
      <LoadingOverlay loaded={imagesLoaded} />

      <div ref={containerRef}>
        {/* Fixed Header */}
        <AnnouncementBar />
        <Navigation />

        {/* Main Content */}
        <main>
          <HeroSection />
          <StorySplitSection />
          <ProductGridSection />
          <B2BWorkflowSection />
          <ImpactStatsSection />
          <PressStripSection />
        </main>

        <Footer />
      </div>

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </>
  );
}
