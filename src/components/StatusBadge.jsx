const tones = {
  allow: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  block: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  review: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  info: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  pending: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  snap: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  muted: 'bg-slate-500/10 text-slate-400 border-slate-600/40',
};

export function decisionTone(decision) {
  if (decision === 'ALLOW') return 'allow';
  if (decision === 'BLOCK') return 'block';
  if (decision === 'APPROVAL REQUIRED') return 'review';
  return 'info';
}

export function riskTone(risk) {
  if (risk === 'LOW') return 'allow';
  if (risk === 'MEDIUM') return 'review';
  if (risk === 'HIGH') return 'block';
  if (risk === 'CRITICAL') return 'block';
  return 'muted';
}

export default function StatusBadge({ tone = 'info', children, className = '' }) {
  const t = tones[tone] || tones.info;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${t} ${className}`}
    >
      {children}
    </span>
  );
}
