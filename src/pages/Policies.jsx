import { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight, FlaskConical, Info, Scale, ShieldCheck, Sparkles, X } from 'lucide-react';
import { POLICIES, getScenarioById } from '../data/mockData.js';
import StatusBadge from '../components/StatusBadge.jsx';

const TIERS = [
  { name: 'HARD BLOCK', tone: 'block', meaning: 'Violation ends evaluation immediately. Cannot be overridden.' },
  { name: 'APPROVAL GATE', tone: 'review', meaning: 'Pauses the action and routes it to a human reviewer.' },
  { name: 'CONTEXT SIGNAL', tone: 'snap', meaning: 'Informs Snap\u2019s judgment. Never allows or blocks alone.' },
  { name: 'FAIL-SAFE', tone: 'failsafe', meaning: 'Enforced by SnapCage when Snap cannot answer.' },
];

/* Colored left-border marker per enforcement tier. Classes must stay literal for Tailwind. */
const TIER_ACCENT = {
  block: 'border-l-rose-500/70',
  review: 'border-l-amber-400/70',
  snap: 'border-l-violet-500/70',
  failsafe: 'border-l-blue-500/70',
};

const RELATION_TONES = {
  'VIOLATED BY': 'block',
  'TRIGGERS APPROVAL': 'review',
  'SATISFIED BY': 'allow',
  'CONTEXT FOR': 'snap',
  'PROTECTED BY': 'failsafe',
};

function PolicyModal({ policy, onClose, onOpenScenario }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`Policy details ${policy.id}`}>
      <button type="button" aria-label="Close policy details" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div className={`slim-scroll relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-[#2b3355] border-l-4 bg-[#0c1024] sm:rounded-2xl ${TIER_ACCENT[policy.tierTone] || 'border-l-slate-500/60'}`}>
        <div className="flex items-center gap-2 border-b border-[#232a45] px-4 py-3">
          <span className="font-mono text-xs text-slate-400">{policy.id}</span>
          <StatusBadge tone={policy.tierTone}>{policy.tier}</StatusBadge>
          <span className="text-[11px] text-slate-500">Priority {policy.priority}</span>
          <button type="button" onClick={onClose} className="ml-auto rounded-lg border border-[#2b3355] p-1.5 text-slate-300 hover:bg-white/5" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">{policy.title}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-300">{policy.description}</p>
            <p className="mt-2 text-xs text-slate-400"><span className="font-semibold text-slate-300">How it enforces: </span>{policy.tierNote}</p>
            <p className="mt-2 inline-block rounded-md border border-[#2b3355] bg-black/30 px-2 py-1 font-mono text-[11px] text-emerald-200">{policy.effect}</p>
          </div>
          <div>
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <FlaskConical size={13} aria-hidden="true" /> Scenarios that exercise this rule
            </h3>
            <p className="mt-1 text-xs text-slate-500">{policy.linkNote}</p>
            <ul className="mt-2 space-y-2">
              {policy.links.map((l) => {
                const s = getScenarioById(l.scenarioId);
                return (
                  <li key={l.scenarioId} className="rounded-lg border border-[#232a45] bg-white/[0.015] p-3">
                    <p className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={RELATION_TONES[l.relation] || 'muted'}>{l.relation}</StatusBadge>
                      <span className="text-[13px] font-semibold text-slate-100">Scenario {l.scenarioId} — {s.title}</span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{l.note}</p>
                    <button
                      type="button"
                      onClick={() => onOpenScenario(l.scenarioId)}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400"
                    >
                      Open in Simulator <ArrowRight size={13} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Policies({ onOpenScenario }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = POLICIES.find((p) => p.id === selectedId) || null;

  const handleOpenScenario = (scenarioId) => {
    setSelectedId(null);
    onOpenScenario(scenarioId);
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
          <ShieldCheck size={19} className="text-indigo-300" aria-hidden="true" /> Security Policies
        </h2>
        <p className="mt-1 text-[13px] text-slate-400">
          Rules SnapCage evaluates to determine whether actions are allowed, blocked, or require approval.
        </p>
      </div>

      <section className="flex items-start gap-2.5 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.06] p-4" aria-label="Illustrative policy notice">
        <Info size={16} className="mt-0.5 shrink-0 text-indigo-300" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-slate-300">
          These policies are <span className="font-semibold text-slate-100">illustrative examples</span> evaluated by deterministic frontend logic in this demo.
          They are not enforced by a production backend, and there is no authentication, database, or policy editor in this prototype.
          Click any rule to inspect how it enforces and which simulator scenario triggers it.
        </p>
      </section>

      {/* The five enforceable rules */}
      <section aria-label="Security policy rules">
        <ul className="space-y-2.5">
          {POLICIES.map((p) => {
            const primary = p.links.find((l) => l.relation === 'VIOLATED BY' || l.relation === 'TRIGGERS APPROVAL');
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  aria-haspopup="dialog"
                  className={`flex w-full items-start gap-3 rounded-xl border border-[#232a45] border-l-4 bg-[#0e1226] p-4 text-left transition-colors hover:border-indigo-500/40 hover:bg-[#11173a] ${TIER_ACCENT[p.tierTone] || 'border-l-slate-500/60'}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="font-mono text-[11px] font-bold text-slate-400">{p.id}</span>
                      <StatusBadge tone={p.tierTone}>{p.tier}</StatusBadge>
                      <span className="text-[11px] text-slate-500">Priority {p.priority}</span>
                    </span>
                    <span className="mt-1.5 block text-[15px] font-bold text-slate-100">{p.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-slate-400">{p.description}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-[#2b3355] bg-black/30 px-2 py-1 font-mono text-[11px] text-emerald-200">{p.effect}</span>
                      {primary ? (
                        <span className="text-[11px] text-slate-500">
                          Triggered by <span className="font-semibold text-slate-300">Scenario {primary.scenarioId}</span>
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <ChevronRight size={17} className="mt-1 shrink-0 text-slate-500" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Explanatory material, clearly separated from the rules */}
      <section aria-label="How enforcement works" className="space-y-4 rounded-xl border border-[#232a45] bg-[#0b0f22] p-4 sm:p-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-100">
            <Scale size={17} className="text-slate-400" aria-hidden="true" /> How Enforcement Works
          </h2>
          <p className="mt-1 text-[13px] text-slate-400">
            Background on how the rules above are applied — not additional rules.
          </p>
        </div>

        <p className="rounded-lg border border-[#2b3355] bg-white/[0.02] p-3 text-center text-[13px] leading-relaxed text-slate-300">
          <span className="font-semibold text-violet-300">Snap provides contextual judgment</span>
          <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
          <span className="font-semibold text-slate-100">policies define constraints</span>
          <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
          <span className="font-semibold text-indigo-300">SnapCage enforces the final decision</span>
        </p>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evaluation priority</h3>
          <p className="mt-0.5 text-xs text-slate-500">Rules are evaluated in priority order. Higher-priority outcomes constrain everything below them.</p>
          <ul className="mt-2.5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {TIERS.map((t) => (
              <li key={t.name} className="rounded-lg border border-[#232a45] bg-white/[0.015] p-3">
                <StatusBadge tone={t.tone}>{t.name}</StatusBadge>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{t.meaning}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-violet-500/25 bg-violet-500/[0.05] p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold text-violet-200">
              <Sparkles size={15} aria-hidden="true" /> Snap by SubQ AI — contextual judgment
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">
              Evaluates user intent, suspicious instructions, and risks that simple rules might miss.
              Advisory only: Snap recommends, it never authorizes. Simulated locally in this demo.
            </p>
          </div>
          <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/[0.05] p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold text-indigo-200">
              <ShieldCheck size={15} aria-hidden="true" /> SnapCage — enforcement and fallback
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">
              Owns every ALLOW / BLOCK / APPROVAL REQUIRED outcome. Hard blocks apply first, and if Snap&rsquo;s
              response is missing or invalid, SnapCage enforces the strictest policy outcome instead (POL-05).
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Enforcement principles</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-slate-400">
            <li>SnapCage remains responsible for enforcement — Snap provides context, not authorization.</li>
            <li>A permissive Snap judgment must never override a mandatory security policy.</li>
            <li>Invalid or unavailable risk-judge responses must never automatically authorize an action.</li>
            <li>Approval in this demo only records authorization; it never executes the underlying tool.</li>
          </ul>
        </div>
      </section>

      {selected ? (
        <PolicyModal policy={selected} onClose={() => setSelectedId(null)} onOpenScenario={handleOpenScenario} />
      ) : null}
    </div>
  );
}
