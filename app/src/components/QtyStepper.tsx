'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

/**
 * Minus/plus buttons for quick nudges, plus a free-typing field for an exact number — commits
 * on blur/Enter rather than on every keystroke, so clearing the field to type a fresh value
 * doesn't fight a live clamp (a controlled number input that reclamps on every keystroke can't
 * ever go empty, which makes typing "250" over an existing "10" nearly impossible).
 */
export default function QtyStepper({
  value, onChange, min = 10, max = 5000, step = 10, className = '',
}: {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => { setDraft(String(value)); }, [value]);

  function clamp(n: number): number {
    return Math.min(max, Math.max(min, n));
  }

  function commit() {
    const n = parseInt(draft, 10);
    const next = Number.isFinite(n) ? clamp(n) : value;
    setDraft(String(next));
    if (next !== value) onChange(next);
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button type="button" onClick={() => onChange(clamp(value - step))} aria-label="Decrease quantity"
        className="w-5 h-5 border border-rule flex items-center justify-center hover:border-espresso transition-colors shrink-0">
        <Minus size={9} strokeWidth={1.5} />
      </button>
      <input
        type="text" inputMode="numeric" aria-label="Quantity"
        value={draft}
        onChange={e => setDraft(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); (e.target as HTMLInputElement).blur(); } }}
        className="w-12 text-center font-inter text-[11px] text-espresso tabular-nums border border-rule focus:outline-none focus:border-espresso bg-white py-0.5"
      />
      <button type="button" onClick={() => onChange(clamp(value + step))} aria-label="Increase quantity"
        className="w-5 h-5 border border-rule flex items-center justify-center hover:border-espresso transition-colors shrink-0">
        <Plus size={9} strokeWidth={1.5} />
      </button>
    </div>
  );
}
