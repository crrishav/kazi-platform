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
//
// `area` is the garment's own opaque bounding box within the image (shoulders/sleeves to
// hem) — not a small centred print zone. Artwork can be dragged and resized across this
// whole span; Garment2DEditor clips the rendered artwork to the garment's silhouette (via
// the same image used as a CSS mask), so anything pushed past the fabric edge is cut off
// rather than spilling onto the transparent background, matching how the 3D decal is
// naturally bounded by the mesh it's projected onto.
const GARMENT_IMAGES: Record<'t-shirt' | 'hoodie', Record<DesignSide, GarmentImageMeta>> = {
  't-shirt': {
    front: { src: '/mockups/tshirt-front.png', width: 1280, height: 669, area: { x: 0.242, y: 0.161, width: 0.507, height: 0.743 } },
    back:  { src: '/mockups/tshirt-back.png',  width: 1280, height: 669, area: { x: 0.248, y: 0.146, width: 0.500, height: 0.735 } },
  },
  hoodie: {
    front: { src: '/mockups/hoodie-front.png', width: 1280, height: 698, area: { x: 0.113, y: 0.040, width: 0.776, height: 0.898 } },
    back:  { src: '/mockups/hoodie-back.png',  width: 1280, height: 683, area: { x: 0.127, y: 0.047, width: 0.745, height: 0.887 } },
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
  garment, side, colour, pattern = null, patternOpacity = 1,
}: {
  garment: string;
  side: DesignSide;
  colour: string;
  /** URL of an uploaded all-over pattern image; tiled in place of the flat colour fill. */
  pattern?: string | null;
  /** 0..1 strength of the tiled pattern over the fabric; only meaningful when `pattern` is set. */
  patternOpacity?: number;
}) {
  const uid = useId();
  const { src, width, height } = getImageMeta(garment, side);
  const maskId = `garment-mask-${uid}`;
  const patternId = `garment-pattern-${uid}`;
  const tileSize = width / 5;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" aria-hidden>
      <defs>
        {/* Recolor mask, driven by the mockup photo's own alpha/luminance. */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <image href={src} xlinkHref={src} x="0" y="0" width={width} height={height} preserveAspectRatio="none" />
        </mask>

        {pattern && (
          <pattern id={patternId} patternUnits="userSpaceOnUse" width={tileSize} height={tileSize}>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <image href={pattern} xlinkHref={pattern} width={tileSize} height={tileSize} preserveAspectRatio="xMidYMid slice" />
          </pattern>
        )}
      </defs>

      {/* 1. Neutral grayscale base — clean start regardless of the source photo's cast. */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <image
        href={src} xlinkHref={src} x="0" y="0" width={width} height={height}
        preserveAspectRatio="none"
        style={{ filter: 'grayscale(1) contrast(1.08) brightness(1.04)' }}
      />

      {/* 2. Colour, masked to the garment silhouette and multiplied over the shading so fabric
          folds still read through. Always present — a pattern fades in *on top* of this
          (below) rather than replacing it, so the chosen colour still shows through/tints
          the print instead of the pattern sitting on a bare, uncoloured mockup. */}
      <rect x="0" y="0" width={width} height={height} fill={colour} mask={`url(#${maskId})`} style={{ mixBlendMode: 'multiply' }} />

      {/* 2b. Tiled pattern, same mask/blend, faded by patternOpacity so it blends into the
          colour fill above instead of overriding it outright. */}
      {pattern && (
        <rect x="0" y="0" width={width} height={height} fill={`url(#${patternId})`} mask={`url(#${maskId})`} style={{ mixBlendMode: 'multiply', opacity: patternOpacity }} />
      )}

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
