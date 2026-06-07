# Tech Spec — Sukkha Citta Pertiwi Collection

## Component Inventory

### Layout (shared across page)

| Component | Source | Reuse |
|---|---|---|
| AnnouncementBar | Custom | Single instance, fixed top |
| Navigation | Custom | Single instance, sticky with dropdown |
| MegaMenu | Custom | Dropdown panel for "FARM TO CLOSET" |
| Footer | Custom | Single instance |
| WhatsAppButton | Custom | Single instance, fixed bottom-right |
| LoadingOverlay | Custom | Single instance, page load only |

### Sections (page-specific, used once)

| Component | Source |
|---|---|
| HeroSection | Custom — includes Three.js particle canvas overlay |
| StorySplitSection | Custom — 3-column editorial layout |
| ProductGridSection | Custom — 4-column grid with cards |
| PressStripSection | Custom — logo marquee |

### Reusable Components

| Component | Source | Used By |
|---|---|---|
| ProductCard | Custom | ProductGridSection (×4) |
| ColorSwatch | Custom | ProductCard (×1) |
| GhostButton | Custom | ProductGridSection, Footer |

### Hooks

| Hook | Purpose |
|---|---|
| useSmoothScroll | Lenis initialization + GSAP ticker sync |
| useImagePreloader | imagesloaded wrapper for page load sequence |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|---|---|---|---|
| Hero entrance sequence (image fade → title fade+scale → CTA slide-up → WhatsApp slide-in) | GSAP timeline | Single timeline with position offsets, triggered after image preload | Medium |
| Particle drift overlay | Three.js (raw) | Orthographic scene, custom ShaderMaterial with position/opacity/size attributes, velocity + sinusoidal drift in rAF loop | **🔒 High** |
| Section scroll-triggered entrances (Story, Products, Press, Footer) | GSAP + ScrollTrigger | Batch pattern: fade-in + translateY per section, stagger on children | Low |
| Navigation sticky transition | GSAP + ScrollTrigger | ScrollTrigger on hero end toggles nav CSS classes for backdrop/blur | Low |
| Nav link underline hover | CSS | `scaleX(0→1)` transform-origin center, transition 0.3s | Low |
| MegaMenu dropdown | GSAP | `translateY(-10px→0)` + `opacity` on React state change | Low |
| Product card image hover scale | CSS | `scale(1→1.03)` on container overflow:hidden | Low |
| Quick View label fade-in | CSS | `opacity` + `translateY` on hover | Low |
| Scroll indicator bounce | CSS keyframes | `translateY(0→6px→0)` infinite | Low |
| WhatsApp button hover | CSS | `scale(1.08)` + shadow intensify | Low |
| Page load overlay fade-out | GSAP | `opacity→0` then `pointer-events:none` after imagesLoaded resolves | Low |

---

## State & Logic

### Image Preloading Orchestration

The page load sequence depends on all images being loaded before the loading overlay dismisses. `imagesloaded` is used with `{ background: true }` to catch both `<img>` tags and CSS `background-image` references. This returns a Promise that resolves before GSAP timelines begin.

### Navigation Dropdown State

The MegaMenu uses a shared hover state: mouseenter on the nav link sets `isDropdownOpen=true`, and both the link and dropdown panel have onMouseLeave handlers that set `isDropdownOpen=false` after a 150ms delay (prevents flicker when moving between link and panel).

### Newsletter Form

Uncontrolled input with local React state. On submit: shows a toast ("Welcome to the inner circle.") and clears the field. No backend.

---

## Dependencies

```
gsap
@gsap/react
three
@types/three
lenis
imagesloaded
@types/imagesloaded
```

---

## Project File Structure

```
/mnt/agents/output/app/
├── public/
│   ├── images/
│   │   ├── hero-main.jpg
│   │   ├── story-farmer.jpg
│   │   ├── product-wrap.jpg
│   │   ├── product-kebaya-black.jpg
│   │   ├── product-kebaya-cream.jpg
│   │   ├── product-weekend.jpg
│   │   ├── dropdown-editorial.jpg
│   │   └── badge-bcorp.png
│   └── logos/
│       ├── le-monde.svg
│       ├── national-geographic.svg
│       ├── who-what-wear.svg
│       ├── vogue.svg
│       ├── financial-times.svg
│       └── cartier-womens.svg
├── src/
│   ├── components/
│   │   ├── AnnouncementBar.tsx
│   │   ├── Navigation.tsx
│   │   ├── MegaMenu.tsx
│   │   ├── WhatsAppButton.tsx
│   │   ├── LoadingOverlay.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ColorSwatch.tsx
│   │   └── GhostButton.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── StorySplitSection.tsx
│   │   ├── ProductGridSection.tsx
│   │   └── PressStripSection.tsx
│   ├── components/HeroParticles.tsx      # Three.js particle canvas
│   ├── hooks/
│   │   ├── useSmoothScroll.ts
│   │   └── useImagePreloader.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                         # Tailwind + custom properties
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## Other Key Decisions

### Raw Three.js over R3F

The particle system uses raw Three.js (not React Three Fiber) because:
- It's a single static scene with no React-driven state changes
- Raw Three.js avoids the R3F reconciler overhead for a simple Points + ShaderMaterial setup
- The component is fully isolated in a `useEffect` with manual lifecycle cleanup
- No interactivity (no raycasting, no orbit controls) — R3F's declarative benefits aren't needed

### Vite + React (not Next.js)

This is a single-page homepage with no routing, no SSR requirements, and no API routes. Vite provides faster HMR and simpler configuration. All content is static.

### GSAP ScrollTrigger over IntersectionObserver

All scroll-triggered animations use GSAP ScrollTrigger (not native IO) for:
- Consistent easing/timing with the rest of the animation system
- Built-in `toggleActions: "play none none none"` for once-only playback
- Batch staggering of child elements within sections
- Lenis scroll position sync
