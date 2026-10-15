import { Activity, Ban, CheckCircle2, Clock3, FlaskConical, Gauge, Inbox } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import EventStream from '../components/EventStream.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge, { decisionTone, riskTone } from '../components/StatusBadge.jsx';

export default function Dashboard({ metrics, systemStatus, events, recentDecisions, onInspect, onRunSimulation, agentActive }) {
  return (
    <div className="space-y-5">
      {/* System status */}
      <section aria-label="System status" className="rounded-xl border border-[#232a45] bg-[#0e1226] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-slate-100">System status</h2>
          <span className="rounded border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">DEMO · SIMULATED</span>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          {systemStatus.map((s) => (
            <li key={s.label} className="rounded-lg border border-[#232a45] bg-white/[0.015] px-2.5 py-2">
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${s.on ? 'bg-emerald-400' : 'bg-slate-500'}`} aria-hidden="true" />
                {s.label}
              </p>
              <p className="mt-0.5 text-[13px] font-semibold text-slate-100">{s.value}</p>
              {s.note ? <p className="text-[11px] text-slate-500">{s.note}</p> : null}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-slate-500">
          Agent state flips to Active while a simulation runs. Snap Risk Judge is locally simulated — no real model is contacted.
        </p>
      </section>

      {/* Metrics */}
      <section aria-label="Metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Tool calls evaluated" value={metrics.evaluated} sub="Recorded demo events" icon={<Activity size={16} />} />
        <StatCard label="Allowed" value={metrics.allowed} sub="Simulated permits" icon={<CheckCircle2 size={16} />} accent="text-emerald-300" />
        <StatCard label="Blocked" value={metrics.blocked} sub="Stopped pre-execution" icon={<Ban size={16} />} accent="text-rose-300" />
        <StatCard label="Awaiting approval" value={metrics.pending} sub="In Approval Queue" icon={<Inbox size={16} />} accent="text-amber-300" />
        <StatCard label="Avg eval latency" value={metrics.avgLatency} sub="Simulated · illustrative" icon={<Gauge size={16} />} accent="text-indigo-300" />
      </section>

      {/* CTA */}
      <section className="flex flex-col gap-2 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.06] p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-indigo-100">Watch SnapCage evaluate a tool call live</p>
          <p className="text-xs text-slate-400">Agent request → interception → policy checks → simulated Snap judgment → decision → enforcement → audit.</p>
        </div>
        <button
          type="button"
          onClick={onRunSimulation}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
        >
          <FlaskConical size={16} aria-hidden="true" /> Run Security Simulation
        </button>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Event stream */}
        <section aria-label="Live event stream" className="rounded-xl border border-[#232a45] bg-[#0e1226] p-4">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-100">Live event stream</h2>
            <span className="flex items-center gap-1 text-[11px] text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" /> live</span>
          </div>
          <EventStream events={events} onInspect={onInspect} compact />
        </section>

        {/* Recent decisions */}
        <section aria-label="Recent decisions" className="rounded-xl border border-[#232a45] bg-[#0e1226] p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-100">Recent decisions</h2>
          <DataTable
            columns={[
              { key: 'traceId', header: 'Trace', render: (r) => <span className="font-mono text-indigo-200">{r.traceId}</span> },
              { key: 'action', header: 'Action', render: (r) => <span><span className="block font-medium">{r.action}</span><code className="text-[11px] text-slate-400">{r.tool}</code></span> },
              { key: 'riskLevel', header: 'Risk', render: (r) => <StatusBadge tone={riskTone(r.riskLevel)}>{r.riskLevel}</StatusBadge> },
              { key: 'decision', header: 'Decision', render: (r) => <StatusBadge tone={decisionTone(r.decision)}>{r.decision}</StatusBadge> },
            ]}
            rows={recentDecisions}
            emptyMessage="No decisions yet — run a simulation to populate this table."
            onRowClick={(r) => onInspect(r.traceId)}
          />
          <p className="mt-2 text-[11px] text-slate-500">Click any row to open its full decision trace. {agentActive ? 'Agent is currently Active (simulation running).' : ''}</p>
        </section>
      </div>

      {/* Architecture */}
      <section aria-label="How Snap and SnapCage work together" className="rounded-xl border border-[#232a45] bg-[#0e1226] p-4">
        <h2 className="text-sm font-bold text-slate-100">How Snap and SnapCage work together</h2>
        <ol className="mt-3 grid gap-2 md:grid-cols-5">
          {[
            { t: 'AI Agent', d: 'Proposes a tool action with arguments.' },
            { t: 'SnapCage Policy Engine', d: 'Checks permissions, protected resources, exfiltration & destructive-action rules.' },
            { t: 'Snap by SubQ AI (simulated)', d: 'Adds contextual judgment on intent and suspicious instructions.' },
            { t: 'SnapCage Enforcement', d: 'Combines policy + context into ALLOW / BLOCK / APPROVAL REQUIRED.' },
            { t: 'Human Reviewer', d: 'Approves or rejects paused actions. Approval never executes code here.' },
          ].map((s, i) => (
            <li key={s.t} className="rounded-lg border border-[#232a45] bg-white/[0.015] p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Step {i + 1}</p>
              <p className="mt-0.5 text-[13px] font-semibold text-slate-100">{s.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{s.d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
          <Clock3 size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>SnapCage owns enforcement: a permissive Snap judgment cannot override a mandatory policy, and missing judgments never auto-authorize. All Snap responses in this prototype are locally simulated.</span>
        </p>
      </section>
    </div>
  );
}
