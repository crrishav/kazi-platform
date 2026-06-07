const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending:   { label: 'Pending',   classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  ordered:   { label: 'Ordered',   classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  cutting:   { label: 'Cutting',   classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  sewing:    { label: 'Sewing',    classes: 'bg-red-50 text-red-700 border-red-200' },
  printing:  { label: 'Printing',  classes: 'bg-purple-50 text-purple-700 border-purple-200' },
  qc:        { label: 'QC Check',  classes: 'bg-pink-50 text-pink-700 border-pink-200' },
  shipping:  { label: 'Shipping',  classes: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered: { label: 'Delivered', classes: 'bg-green-50 text-green-700 border-green-200' },
  approved:  { label: 'Approved',  classes: 'bg-green-50 text-green-700 border-green-200' },
  rejected:  { label: 'Rejected',  classes: 'bg-red-50 text-red-700 border-red-200' },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-gray-50 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 border font-inter text-xs tracking-wide uppercase ${config.classes}`}>
      {config.label}
    </span>
  );
}
