const STAGES = [
  { id: 'ordered',  label: 'Order Placed' },
  { id: 'cutting',  label: 'Cutting' },
  { id: 'sewing',   label: 'Sewing' },
  { id: 'printing', label: 'Printing' },
  { id: 'qc',       label: 'QC Check' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'delivered',label: 'Delivered' },
];

const STAGE_INDEX: Record<string, number> = {
  ordered: 0, cutting: 1, sewing: 2, printing: 3, qc: 4, shipping: 5, delivered: 6,
};

export default function OrderTimeline({ status }: { status: string }) {
  const current = STAGE_INDEX[status] ?? 0;

  return (
    <div className="py-6">
      {/* Progress bar */}
      <div className="relative h-px bg-rule mb-8">
        <div
          className="absolute top-0 left-0 h-px bg-accent-warm transition-all duration-700"
          style={{ width: `${(current / (STAGES.length - 1)) * 100}%` }}
        />
      </div>

      {/* Stages */}
      <div className="grid grid-cols-7 gap-1">
        {STAGES.map((stage, i) => {
          const done    = i < current;
          const active  = i === current;
          const pending = i > current;
          return (
            <div key={stage.id} className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 border flex items-center justify-center transition-all duration-300 ${
                  done    ? 'border-accent-warm bg-accent-warm' :
                  active  ? 'border-espresso bg-espresso' :
                            'border-rule bg-cream'
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4 text-cream" fill="none" viewBox="0 0 16 16">
                    <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className={`font-inter text-[10px] font-medium ${active ? 'text-cream' : 'text-text-light'}`}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                className={`font-inter text-[10px] tracking-wide text-center leading-tight ${
                  done || active ? 'text-espresso font-medium' : 'text-text-light'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
