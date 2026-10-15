import StatusBadge, { decisionTone } from './StatusBadge.jsx';

const typeLabels = {
  agent: 'Agent',
  interception: 'Intercept',
  policy: 'Policy',
  snap: 'Snap (sim)',
  decision: 'Decision',
  enforcement: 'Enforce',
  system: 'System',
  review: 'Review',
};

const dotColors = {
  allow: 'bg-emerald-400',
  block: 'bg-rose-400',
  review: 'bg-amber-400',
  pending: 'bg-indigo-400',
  info: 'bg-slate-400',
};

export function formatTime(ts) {
  try {
    const d = ts instanceof Date ? ts : new Date(ts);
    return d.toLocaleTimeString([], { hour12: false });
  } catch {
    return '';
  }
}

export default function EventStream({ events, onInspect, compact = false }) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#2b3355] bg-white/[0.01] p-6 text-center">
        <p className="text-sm font-medium text-slate-300">No events yet</p>
        <p className="mt-1 text-xs text-slate-500">Run a scenario in the Security Simulator to generate simulated telemetry.</p>
      </div>
    );
  }
  const shown = [...events].reverse();
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">Simulated telemetry · timestamps generated at runtime</p>
      <ol className={`slim-scroll space-y-1.5 ${compact ? 'max-h-80' : 'max-h-[420px]'} overflow-y-auto pr-1`} aria-label="Live event stream">
        {shown.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onInspect?.(e.traceId)}
              className="flex w-full items-start gap-2.5 rounded-lg border border-[#232a45] bg-[#10152c] px-2.5 py-2 text-left transition-colors hover:border-indigo-500/40 hover:bg-[#141a36]"
              title={`Open decision trace ${e.traceId}`}
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColors[e.status] || dotColors.info}`} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-mono text-[11px] text-slate-400">{formatTime(e.timestamp)}</span>
                  <span className="text-[11px] font-semibold text-slate-300">{typeLabels[e.type] || e.type}</span>
                  {e.tool ? <code className="rounded bg-white/5 px-1 text-[11px] text-indigo-200">{e.tool}</code> : null}
                  <span className="font-mono text-[11px] text-slate-500">{e.traceId}</span>
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-slate-200">{e.message}</span>
              </span>
              {e.decision ? <StatusBadge tone={decisionTone(e.decision)} className="shrink-0 normal-case">{e.decision}</StatusBadge> : null}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
