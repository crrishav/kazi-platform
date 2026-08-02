// Bridges the studio configurator to the quote page across a client-side navigation. The
// studio's collection (images, patterns) lives in component state as blob URLs, which stay
// valid for the tab's lifetime but can't be passed through a URL query string — sessionStorage
// carries a lightweight, already-resolved snapshot instead (labels, not raw ids, so the quote
// page never needs to import the studio's GARMENT_TYPES/FABRICS/COLOURS tables).

export interface QuoteDesign {
  id: string;
  garmentLabel: string;
  fabricLabel: string;
  colourLabel: string;
  colourHex: string;
  hasPattern: boolean;
  /** Pattern image URL, if any — used as the card's swatch when present. */
  patternThumb: string | null;
  /** First uploaded image layer's URL, if any — fallback swatch when there's no pattern. */
  assetThumb: string | null;
  layerCount: number;
  qty: number;
}

const STORAGE_KEY = 'kazi-studio-quote-designs';

export function saveQuoteDesigns(designs: QuoteDesign[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  } catch {
    // sessionStorage unavailable (private browsing, quota, etc.) — the quote page just
    // falls back to its generic, non-studio form.
  }
}

export function readQuoteDesigns(): QuoteDesign[] | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as QuoteDesign[]) : null;
  } catch {
    return null;
  }
}

export function clearQuoteDesigns(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
