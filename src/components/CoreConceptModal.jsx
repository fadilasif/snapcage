import { useEffect, useRef } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Bot,
  BrainCircuit,
  ClipboardList,
  GitBranch,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

const STAGES = [
  { icon: Bot, title: 'AI Agent', description: 'Proposes an action' },
  { icon: ShieldCheck, title: 'SnapCage', description: 'Checks policies and context' },
  { icon: GitBranch, title: 'Decision', description: 'Enforces the outcome' },
];

const DIFFERENTIATORS = [
  { icon: ShieldCheck, heading: 'Policy-based protection', description: 'Enforces explicit security restrictions.' },
  { icon: BrainCircuit, heading: 'Context-aware decisions', description: 'Uses Snap to assess suspicious actions in context.' },
  { icon: UserCheck, heading: 'Human oversight', description: 'Escalates risky operations for approval.' },
  { icon: ClipboardList, heading: 'Auditable decisions', description: 'Records outcomes and reasons.' },
];

export default function CoreConceptModal({ onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="core-concept-title"
    >
      <button
        type="button"
        aria-label="Close Core Concept dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70"
      />
      <div
        className="slim-scroll relative flex max-h-[85vh] w-full max-w-[800px] flex-col overflow-hidden rounded-t-2xl border border-[#2b3355] bg-[#0c1024] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-[#232a45] px-5 py-4">
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            className="mt-0.5 h-10 w-10 shrink-0 rounded-xl bg-black object-cover ring-1 ring-indigo-500/30"
          />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300">Core Concept</p>
            <h2 id="core-concept-title" className="mt-1 text-lg font-bold text-slate-100">
              Understanding SnapCage Security Gateway
            </h2>
            <p className="mt-0.5 text-[13px] italic text-slate-400">Context-aware security for AI agents.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto shrink-0 rounded-lg border border-[#2b3355] p-1.5 text-slate-300 transition-colors hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="slim-scroll space-y-6 overflow-y-auto px-5 py-5">
          {/* Section 1 */}
          <section aria-label="What is SnapCage?">
            <h3 className="text-sm font-bold text-slate-100">What is SnapCage?</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">
              AI agents can be manipulated by malicious instructions hidden in documents or tool outputs,
              potentially causing unauthorized actions.
            </p>
            <p className="mt-1.5 rounded-lg border border-indigo-500/25 bg-indigo-500/[0.07] p-3 text-[13px] leading-relaxed text-slate-100">
              <strong>
                SnapCage acts as a security checkpoint between an AI agent and its tools, evaluating
                proposed actions before they execute.
              </strong>
            </p>
          </section>

          {/* Section 2 */}
          <section aria-label="How does it work?">
            <h3 className="text-sm font-bold text-slate-100">How does it work?</h3>
            <ol className="mt-2.5 flex flex-col items-stretch gap-2 md:flex-row md:items-center">
              {STAGES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li key={s.title} className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-1 flex-col items-center rounded-xl border border-[#232a45] bg-[#10152c] px-3 py-4 text-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300" aria-hidden="true">
                        <Icon size={19} />
                      </span>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Stage {i + 1}</p>
                      <p className="text-sm font-bold text-slate-100">{s.title}</p>
                      <p className="text-xs text-slate-400">{s.description}</p>
                    </div>
                    {i < STAGES.length - 1 ? (
                      <span className="flex justify-center text-slate-500" aria-hidden="true">
                        <ArrowDown size={17} className="md:hidden" />
                        <ArrowRight size={17} className="hidden md:block" />
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <StatusBadge tone="allow">Allow</StatusBadge>
              <StatusBadge tone="block">Block</StatusBadge>
              <StatusBadge tone="review">Require approval</StatusBadge>
            </div>
            <p className="mt-2 text-center text-xs leading-relaxed text-slate-400">
              Actions are evaluated against security rules and relevant context before a decision is enforced.
            </p>
          </section>

          {/* Section 3 */}
          <section aria-label="Why Snap by SubQ AI?">
            <h3 className="text-sm font-bold text-slate-100">Why Snap by SubQ AI?</h3>
            <div className="mt-1.5 space-y-1.5 text-[13px] leading-relaxed text-slate-300">
              <p>
                Snap is a decision model designed to return structured judgments using context. Its context
                window supports up to <strong className="text-slate-100">384K tokens</strong>, according to
                SubQ&rsquo;s published documentation.
              </p>
              <p>
                This could help assess actions against earlier instructions, conversation history, and
                untrusted content—not just the latest tool call.
              </p>
              <p className="text-slate-100">
                <strong>Snap provides the judgment; SnapCage enforces the security decision.</strong>
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section aria-label="What makes it different?">
            <h3 className="text-sm font-bold text-slate-100">What makes it different?</h3>
            <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DIFFERENTIATORS.map((d) => {
                const Icon = d.icon;
                return (
                  <li key={d.heading} className="flex items-start gap-2.5 rounded-xl border border-[#232a45] bg-[#10152c] p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300" aria-hidden="true">
                      <Icon size={17} />
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold text-slate-100">{d.heading}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">{d.description}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Section 5 */}
          <section aria-label="Our objective">
            <h3 className="text-sm font-bold text-slate-100">Our objective</h3>
            <p className="mt-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-3.5 text-[13px] leading-relaxed text-amber-100/90">
              To investigate whether long-context decision-making improves AI-agent security compared with
              rules alone, measured through attack prevention, false positives, and performance.
            </p>
          </section>

          {/* Disclaimer */}
          <p className="border-t border-[#232a45] pt-3 text-xs leading-relaxed text-slate-500">
            Demo environment: Security checks and Snap decisions are simulated. No real tool calls are
            executed, and no live Snap API is connected.
          </p>
        </div>
      </div>
    </div>
  );
}
