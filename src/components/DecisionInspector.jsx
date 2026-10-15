import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, FileText, Gavel, PauseCircle, ShieldCheck, Sparkles, X } from 'lucide-react';
import StatusBadge, { decisionTone, riskTone } from './StatusBadge.jsx';
import { formatTime } from './EventStream.jsx';

function StageShell({ index, title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-[#232a45] bg-[#10152c]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-white/[0.02]"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[12px] font-bold text-indigo-200">{index}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-100">{title}</span>
          {subtitle ? <span className="block truncate text-xs text-slate-400">{subtitle}</span> : null}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open ? <div className="border-t border-[#232a45] px-3.5 py-3">{children}</div> : null}
    </div>
  );
}

function CheckRow({ check }) {
  const tone = check.result === 'PASS' ? 'allow' : check.result === 'FAIL' ? 'block' : 'muted';
  return (
    <li className="flex items-start gap-2.5 rounded-lg border border-[#232a45] bg-white/[0.015] px-2.5 py-2">
      {check.result === 'PASS' ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" /> : null}
      {check.result === 'FAIL' ? <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-400" aria-hidden="true" /> : null}
      {check.result !== 'PASS' && check.result !== 'FAIL' ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-500" aria-hidden="true" /> : null}
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-slate-200">{check.name}</span>
          <StatusBadge tone={tone}>{check.result}</StatusBadge>
        </span>
        <span className="mt-0.5 block text-xs text-slate-400">{check.explanation}</span>
      </span>
    </li>
  );
}

export default function DecisionInspector({ decision, onClose, inline = false }) {
  if (!decision) return null;
  const body = (
    <div className="space-y-3">
      {/* Summary header */}
      <div className="rounded-xl border border-[#2b3355] bg-[#0e1330] p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-slate-400">{decision.traceId}</span>
          <StatusBadge tone={decisionTone(decision.decision)}>{decision.decision}</StatusBadge>
          <StatusBadge tone={riskTone(decision.riskLevel)}>Risk: {decision.riskLevel}</StatusBadge>
          {decision.reviewStatus && decision.reviewStatus !== 'NOT_REQUIRED' ? (
            <StatusBadge tone={decision.reviewStatus === 'PENDING' ? 'review' : decision.reviewStatus === 'APPROVED' ? 'allow' : 'block'}>
              Review: {decision.reviewStatus}
            </StatusBadge>
          ) : null}
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-100">{decision.action}</p>
        <p className="text-xs text-slate-400">
          {decision.scenarioName} · <code className="text-indigo-200">{decision.tool}</code> · {formatTime(decision.completedAt || decision.startedAt)} · simulated latency {decision.simulatedLatencyMs} ms
        </p>
        {decision.reviewedBy ? (
          <p className="mt-1 text-xs text-slate-400">Reviewed by {decision.reviewedBy} · {decision.reviewStatus}{decision.reviewNote ? ` — ${decision.reviewNote}` : ''}</p>
        ) : null}
      </div>

      <StageShell index={1} title="Request received" subtitle={`${decision.requestSummary}`} defaultOpen>
        <dl className="grid gap-2 text-[13px] sm:grid-cols-2">
          <div><dt className="text-[11px] uppercase tracking-wider text-slate-500">Scenario</dt><dd className="text-slate-200">{decision.scenarioName} ({decision.scenarioId})</dd></div>
          <div><dt className="text-[11px] uppercase tracking-wider text-slate-500">Trace ID</dt><dd className="font-mono text-slate-200">{decision.traceId}</dd></div>
          <div><dt className="text-[11px] uppercase tracking-wider text-slate-500">Requesting agent</dt><dd className="font-mono text-slate-200">{decision.agent}</dd></div>
          <div><dt className="text-[11px] uppercase tracking-wider text-slate-500">Timestamp</dt><dd className="text-slate-200">{formatTime(decision.startedAt)} (generated at runtime)</dd></div>
        </dl>
        <p className="mt-2 text-[13px] text-slate-300">{decision.requestSummary}</p>
      </StageShell>

      <StageShell index={2} title={`Tool call intercepted — ${decision.tool}`} subtitle={decision.targetResource} defaultOpen>
        <div className="space-y-2 text-[13px]">
          <p><span className="text-slate-500">Tool: </span><code className="rounded bg-white/5 px-1.5 py-0.5 text-indigo-200">{decision.tool}</code></p>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Proposed arguments (simulated — never executed)</p>
            <pre className="mt-1 overflow-x-auto rounded-lg border border-[#232a45] bg-black/40 p-2.5 text-xs text-emerald-200">{JSON.stringify(decision.args, null, 2)}</pre>
          </div>
          <p><span className="text-slate-500">Target resource: </span><span className="text-slate-200">{decision.targetResource}</span></p>
          <p><span className="text-slate-500">Intended effect: </span><span className="text-slate-200">{decision.intendedEffect}</span></p>
        </div>
      </StageShell>

      <StageShell index={3} title="Policy checks" subtitle={`${decision.policyChecks.filter((c) => c.result === 'FAIL').length} failed · ${decision.policyChecks.length} evaluated`} defaultOpen>
        <ul className="space-y-1.5">
          {decision.policyChecks.map((c) => <CheckRow key={c.name} check={c} />)}
        </ul>
      </StageShell>

      <StageShell index={4} title="Snap contextual judgment (simulated)" subtitle="Snap by SubQ AI — illustrative result only" defaultOpen>
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/[0.06] p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-300">
            <Sparkles size={13} aria-hidden="true" /> Simulated Snap response — SubQ AI
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Locally simulated for this demo. Not a real model call, not real API output, no measured confidence.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge tone={riskTone(decision.snapAssessment.riskLevel)}>Risk: {decision.snapAssessment.riskLevel}</StatusBadge>
            <StatusBadge tone={decision.snapAssessment.recommendation.includes('ALLOW') ? 'allow' : decision.snapAssessment.recommendation.includes('BLOCK') ? 'block' : 'review'}>
              {decision.snapAssessment.recommendation}
            </StatusBadge>
          </div>
          <p className="mt-2 text-[13px] text-slate-200">{decision.snapAssessment.rationale}</p>
          <p className="mt-1.5 text-xs text-slate-400"><span className="font-semibold text-slate-300">Context: </span>{decision.snapAssessment.context}</p>
          {decision.untrustedSource ? (
            <div className="mt-2 rounded-md border border-rose-500/30 bg-rose-500/[0.07] p-2 text-xs text-rose-200">
              <p className="flex items-center gap-1 font-semibold"><FileText size={13} aria-hidden="true" /> Untrusted source: {decision.untrustedSource.file}</p>
              <p className="mt-1 italic text-rose-200/90">{decision.untrustedSource.excerpt}</p>
            </div>
          ) : null}
        </div>
      </StageShell>

      <StageShell index={5} title={`Final SnapCage decision: ${decision.decision}`} subtitle={decision.explanation.slice(0, 90) + '…'} defaultOpen>
        <div className={`rounded-lg border p-3 ${
          decision.decision === 'ALLOW' ? 'border-emerald-500/30 bg-emerald-500/[0.06]' :
          decision.decision === 'BLOCK' ? 'border-rose-500/30 bg-rose-500/[0.06]' :
          'border-amber-500/30 bg-amber-500/[0.06]'
        }`}>
          <p className="flex items-center gap-2 text-sm font-bold">
            {decision.decision === 'ALLOW' ? <ShieldCheck size={17} className="text-emerald-300" aria-hidden="true" /> : null}
            {decision.decision === 'BLOCK' ? <ShieldCheck size={17} className="text-rose-300" aria-hidden="true" /> : null}
            {decision.decision === 'APPROVAL REQUIRED' ? <Gavel size={17} className="text-amber-300" aria-hidden="true" /> : null}
            <span className={decision.decision === 'ALLOW' ? 'text-emerald-200' : decision.decision === 'BLOCK' ? 'text-rose-200' : 'text-amber-200'}>{decision.decision}</span>
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-200">{decision.explanation}</p>
          <p className="mt-1.5 text-[11px] text-slate-400">SnapCage owns enforcement: a permissive Snap judgment can never override a mandatory policy failure, and an unavailable judgment never auto-authorizes.</p>
        </div>
      </StageShell>

      <StageShell index={6} title="Enforcement result" subtitle={decision.enforcementShort} defaultOpen>
        <p className="flex items-start gap-2 text-[13px] text-slate-200">
          {decision.decision === 'APPROVAL REQUIRED' ? <PauseCircle size={16} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" /> : null}
          <span>{decision.enforcement} Review actions in this demo only record authorization — they never execute the underlying tool.</span>
        </p>
      </StageShell>
    </div>
  );

  if (inline) return body;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`Decision trace ${decision.traceId}`}>
      <button type="button" aria-label="Close decision trace" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-[#2b3355] bg-[#0c1024] sm:rounded-2xl">
        <div className="flex items-center gap-2 border-b border-[#232a45] px-4 py-3">
          <p className="text-sm font-bold text-slate-100">Decision trace · <span className="font-mono">{decision.traceId}</span></p>
          <button type="button" onClick={onClose} className="ml-auto rounded-lg border border-[#2b3355] p-1.5 text-slate-300 hover:bg-white/5" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="slim-scroll overflow-y-auto p-4">{body}</div>
      </div>
    </div>
  );
}
