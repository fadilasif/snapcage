import { Check, Inbox, X } from 'lucide-react';
import StatusBadge, { riskTone } from '../components/StatusBadge.jsx';
import { formatTime } from '../components/EventStream.jsx';

export default function Approvals({ items, onApprove, onReject, onInspect, actionBusy }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#2b3355] bg-[#0e1226] p-10 text-center">
        <Inbox size={28} className="mx-auto text-slate-500" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-slate-200">Approval queue is empty</p>
        <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">
          Run Scenario C (destructive operation) in the Security Simulator to create a pending approval. Approving here only records authorization in the simulation — it never executes the underlying action.
        </p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((d) => (
        <li key={d.traceId} className="rounded-xl border border-amber-400/25 bg-[#0e1226] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-400">{d.traceId}</span>
            <StatusBadge tone={riskTone(d.riskLevel)}>Risk: {d.riskLevel}</StatusBadge>
            <StatusBadge tone="review">Approval required</StatusBadge>
            <span className="ml-auto text-xs text-slate-500">{formatTime(d.completedAt || d.startedAt)} · {d.agent}</span>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-100">{d.action}</p>
          <p className="text-xs text-slate-400">{d.requestSummary}</p>
          <div className="mt-2 grid gap-2 text-[13px] sm:grid-cols-2">
            <div className="rounded-lg border border-[#232a45] bg-black/30 p-2.5">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Proposed tool & arguments</p>
              <p className="mt-1"><code className="text-indigo-200">{d.tool}</code></p>
              <pre className="mt-1 overflow-x-auto text-xs text-emerald-200">{JSON.stringify(d.args, null, 2)}</pre>
            </div>
            <div className="rounded-lg border border-[#232a45] bg-black/30 p-2.5">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Why human approval is required</p>
              <p className="mt-1 text-slate-300">{d.explanation}</p>
              <button type="button" onClick={() => onInspect(d.traceId)} className="mt-1.5 text-xs font-semibold text-indigo-300 underline-offset-2 hover:underline">
                Inspect full decision trace
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => onApprove(d.traceId)}
              disabled={actionBusy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
            >
              <Check size={16} aria-hidden="true" /> Approve (record authorization)
            </button>
            <button
              type="button"
              onClick={() => onReject(d.traceId)}
              disabled={actionBusy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/20 disabled:opacity-50"
            >
              <X size={16} aria-hidden="true" /> Reject (deny action)
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Policy reason: {d.policyChecks.filter((c) => c.result === 'FAIL').map((c) => c.name).join(' · ') || 'Destructive-action policy'}</p>
        </li>
      ))}
    </ul>
  );
}
