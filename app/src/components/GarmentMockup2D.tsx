'use client';

import { useId } from 'react';
import type { DesignSide } from '@/lib/design-layers';

interface GarmentImageMeta {
  src: string;
  width: number;
  height: number;
  /** Printable area, as a fraction (0..1) of this image's own width/height. */
  area: { x: number; y: number; width: number; height: number };
}

// Real flat-lay photography (transparent background), recolored live via an SVG mask + a
// multiply blend of the chosen colour — same technique real print-on-demand configurators
// use, so the fabric's actual folds/shading carry through regardless of colour.
const GARMENT_IMAGES: Record<'t-shirt' | 'hoodie', Record<DesignSide, GarmentImageMeta>> = {
  't-shirt': {
    front: { src: '/mockups/tshirt-front.png', width: 1280, height: 669, area: { x: 0.365, y: 0.25, width: 0.27, height: 0.24 } },
    back:  { src: '/mockups/tshirt-back.png',  width: 1280, height: 669, area: { x: 0.365, y: 0.22, width: 0.27, height: 0.26 } },
  },
  hoodie: {
    front: { src: '/mockups/hoodie-front.png', width: 1280, height: 698, area: { x: 0.39, y: 0.31, width: 0.22, height: 0.18 } },
    back:  { src: '/mockups/hoodie-back.png',  width: 1280, height: 683, area: { x: 0.39, y: 0.32, width: 0.22, height: 0.22 } },
  },
};

export function getImageMeta(garment: string, side: DesignSide): GarmentImageMeta {
  const g = garment === 'hoodie' ? 'hoodie' : 't-shirt';
  return GARMENT_IMAGES[g][side];
}

/** Printable area for a garment/side, as a fraction (0..1) of the mockup image's own bounds. */
export function getDesignArea(garment: string, side: DesignSide) {
  return getImageMeta(garment, side).area;
}

export function GarmentMockup2D({
  garment, side, colour,
}: {
  garment: string;
  side: DesignSide;
  colour: string;
}) {
  const uid = useId();
  const { src, width, height } = getImageMeta(garment, side);
  const maskId = `garment-mask-${uid}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" aria-hidden>
      <defs>
        {/* Recolor mask, driven by the mockup photo's own alpha/luminance. */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <image href={src} xlinkHref={src} x="0" y="0" width={width} height={height} preserveAspectRatio="none" />
        </mask>
      </defs>

      {/* 1. Neutral grayscale base — clean start regardless of the source photo's cast. */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <image
        href={src} xlinkHref={src} x="0" y="0" width={width} height={height}
        preserveAspectRatio="none"
        style={{ filter: 'grayscale(1) contrast(1.08) brightness(1.04)' }}
      />

      {/* 2. Colour, masked to the garment silhouette and multiplied over the shading. */}
      <rect x="0" y="0" width={width} height={height} fill={colour} mask={`url(#${maskId})`} style={{ mixBlendMode: 'multiply' }} />

      {/* 3. Highlight sheen on top for a bit of depth. */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <image
        href={src} xlinkHref={src} x="0" y="0" width={width} height={height}
        preserveAspectRatio="none"
        style={{ filter: 'grayscale(1) contrast(1.2) brightness(1.15)', opacity: 0.16, mixBlendMode: 'screen' }}
      />
    </svg>
  );
}
