import { useEffect, useRef } from 'react';
import { AlertTriangle, Check, CheckCircle2, Gavel, Loader2, Play, RotateCcw } from 'lucide-react';
import { getScenarioById, SCENARIOS } from '../data/mockData.js';
import DecisionInspector from '../components/DecisionInspector.jsx';
import StatusBadge, { riskTone, decisionTone } from '../components/StatusBadge.jsx';

const STEP_DELAY_MS = 650;

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export default function Simulator({
  selectedScenarioId,
  onSelectScenario,
  isRunning,
  progress,
  lastDecision,
  onRun,
  onReset,
  onOpenApprovals,
  runToken,
}) {
  const scenario = getScenarioById(selectedScenarioId);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (progress.visibleSteps > 0 && bottomRef.current && !prefersReducedMotion()) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [progress.visibleSteps, runToken]);

  const scenarioCard = (s) => {
    const active = s.id === scenario.id;
    return (
      <button
        key={s.id}
        type="button"
        onClick={() => !isRunning && onSelectScenario(s.id)}
        disabled={isRunning}
        aria-pressed={active}
        className={`group relative w-full cursor-pointer rounded-xl border p-3.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
          active
            ? 'border-indigo-500 bg-indigo-500/[0.12] shadow-lg shadow-indigo-950/50 ring-2 ring-indigo-500/40'
            : 'border-[#314062] bg-[#10152c] hover:border-indigo-500/60 hover:bg-[#161d3e] hover:shadow-md hover:shadow-black/40 active:scale-[0.98]'
        }`}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? 'text-indigo-300' : 'text-slate-400'}`}>{s.shortLabel}</span>
            <StatusBadge tone={riskTone(s.riskLevel)}>{s.riskLevel}</StatusBadge>
          </span>
          {/* Radio-style selection indicator */}
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              active ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600 bg-transparent group-hover:border-indigo-500/70'
            }`}
            aria-hidden="true"
          >
            {active ? <Check size={13} className="text-white" strokeWidth={3} /> : null}
          </span>
        </span>
        <span className="mt-1 block text-sm font-semibold text-slate-100">{s.title}</span>
        <span className="mt-0.5 block text-xs text-slate-400">
          <code className="text-indigo-200">{s.tool}</code> → <StatusBadge tone={decisionTone(s.decision)}>{s.decision}</StatusBadge>
        </span>
        <span
          className={`mt-2.5 block text-center text-xs font-semibold transition-opacity ${
            active ? 'text-indigo-300' : 'text-slate-500 opacity-0 group-hover:opacity-100'
          }`}
        >
          {active ? '✓ Selected — press Run Simulation' : 'Click to select'}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-5">
      {/* Scenario picker */}
      <section aria-label="Scenario presets" className="rounded-xl border border-[#232a45] bg-[#0e1226] p-4">
        <div className="mb-3 flex items-center gap-2">
          <p className="text-sm font-bold text-slate-100">Choose a scenario</p>
          <span className="text-xs text-slate-500">— click a card, then press Run Simulation</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {SCENARIOS.map(scenarioCard)}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-5">
        {/* Left: scenario details + run */}
        <section aria-label="Scenario details" className="space-y-4 rounded-xl border border-[#232a45] bg-[#0e1226] p-4 xl:col-span-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Proposed action</p>
            <h2 className="mt-0.5 text-base font-bold text-slate-100">{scenario.action}</h2>
            <p className="mt-1 text-[13px] text-slate-400">{scenario.requestSummary}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tool & arguments (simulated)</p>
            <p className="mt-1 text-[13px]"><code className="rounded bg-white/5 px-1.5 py-0.5 text-indigo-200">{scenario.tool}</code></p>
            <pre className="mt-1.5 overflow-x-auto rounded-lg border border-[#232a45] bg-black/40 p-3 text-xs text-emerald-200">{JSON.stringify(scenario.args, null, 2)}</pre>
          </div>
          <div className="rounded-lg border border-[#232a45] bg-white/[0.015] p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Risk context</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-300">{scenario.riskContext}</p>
            {scenario.untrustedSource ? (
              <div className="mt-2 rounded-md border border-rose-500/30 bg-rose-500/[0.07] p-2.5 text-xs">
                <p className="flex items-center gap-1.5 font-semibold text-rose-200"><AlertTriangle size={13} aria-hidden="true" /> Untrusted source: {scenario.untrustedSource.file}</p>
                <p className="mt-1 italic text-rose-200/90">{scenario.untrustedSource.excerpt}</p>
                <p className="mt-1 text-rose-200/70">Document instructions do not constitute user authorization.</p>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRun}
              disabled={isRunning}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              {isRunning ? `Evaluating… step ${Math.min(progress.visibleSteps, scenario.pipeline.length)}/${scenario.pipeline.length}` : 'Run Simulation'}
            </button>
            <button
              type="button"
              onClick={onReset}
              disabled={isRunning}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2b3355] px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={15} aria-hidden="true" /> Reset Demo
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Deterministic local logic — visual delays are staged for observability, not real Snap inference or model latency. Simulations cannot overlap; replay any scenario as often as needed.
          </p>
          {lastDecision && lastDecision.decision === 'APPROVAL REQUIRED' && lastDecision.reviewStatus === 'PENDING' ? (
            <button
              type="button"
              onClick={onOpenApprovals}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-400/20"
            >
              <Gavel size={15} aria-hidden="true" /> Open Approval Queue ({lastDecision.traceId})
            </button>
          ) : null}
        </section>

        {/* Right: progressive timeline */}
        <section aria-label="Evaluation timeline" aria-live="polite" className="rounded-xl border border-[#232a45] bg-[#0e1226] p-4 xl:col-span-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-100">Evaluation timeline</h2>
            {progress.traceId ? <span className="font-mono text-xs text-slate-400">{progress.traceId}</span> : null}
            {isRunning ? <span className="ml-auto flex items-center gap-1 text-xs text-indigo-300"><Loader2 size={13} className="animate-spin" aria-hidden="true" /> running…</span> : null}
          </div>
          {progress.visibleSteps === 0 && !progress.done ? (
            <div className="mt-3 rounded-xl border border-dashed border-[#2b3355] p-6 text-center text-sm text-slate-400">
              Select a scenario and press <span className="font-semibold text-slate-200">Run Simulation</span> to watch each evaluation stage appear here and in the live event stream.
            </div>
          ) : (
            <ol className="mt-3 space-y-2">
              {scenario.pipeline.slice(0, progress.visibleSteps).map((step, i) => {
                const isLast = i === progress.visibleSteps - 1;
                const done = progress.done || !isLast || !isRunning;
                return (
                  <li key={`${runToken}-${i}`} className={`flex gap-3 rounded-lg border px-3 py-2.5 ${done ? 'border-[#232a45] bg-[#10152c]' : 'border-indigo-500/40 bg-indigo-500/[0.07]'}`}>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${done ? 'bg-emerald-500/15 text-emerald-300' : 'bg-indigo-500/25 text-indigo-200'}`} aria-hidden="true">
                      {done ? <CheckCircle2 size={14} /> : i + 1}
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold text-slate-100">{step.label}</span>
                      <span className="block text-xs text-slate-400">{step.detail}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          <div ref={bottomRef} />
          {progress.done && progress.decision ? (
            <div className="mt-4">
              <DecisionInspector decision={progress.decision} inline />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export { STEP_DELAY_MS };
