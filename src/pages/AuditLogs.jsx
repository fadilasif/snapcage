import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import StatusBadge, { decisionTone, riskTone } from '../components/StatusBadge.jsx';
import { formatTime } from '../components/EventStream.jsx';

export default function AuditLogs({ records, onInspect }) {
  const [query, setQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (records || []).filter((r) => {
      if (decisionFilter !== 'ALL' && r.decision !== decisionFilter) return false;
      if (riskFilter !== 'ALL' && r.riskLevel !== riskFilter) return false;
      if (!q) return true;
      return (
        r.traceId.toLowerCase().includes(q) ||
        r.tool.toLowerCase().includes(q) ||
        r.action.toLowerCase().includes(q) ||
        r.scenario.toLowerCase().includes(q)
      );
    });
  }, [records, query, decisionFilter, riskFilter]);

  const hasFilters = query.trim() !== '' || decisionFilter !== 'ALL' || riskFilter !== 'ALL';

  return (
    <div className="space-y-4">
      <section aria-label="Audit filters" className="flex flex-col gap-2 rounded-xl border border-[#232a45] bg-[#0e1226] p-3.5 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search by tool, action, or trace ID</span>
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by tool, action, or trace ID (e.g. send_email, SC-0002)"
            className="w-full rounded-lg border border-[#2b3355] bg-black/30 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <label className="text-xs text-slate-400">
            <span className="sr-only">Filter by decision</span>
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="rounded-lg border border-[#2b3355] bg-black/30 px-2.5 py-2.5 text-sm text-slate-200"
            >
              <option value="ALL">All decisions</option>
              <option value="ALLOW">ALLOW</option>
              <option value="BLOCK">BLOCK</option>
              <option value="APPROVAL REQUIRED">APPROVAL REQUIRED</option>
            </select>
          </label>
          <label className="text-xs text-slate-400">
            <span className="sr-only">Filter by risk level</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="rounded-lg border border-[#2b3355] bg-black/30 px-2.5 py-2.5 text-sm text-slate-200"
            >
              <option value="ALL">All risk levels</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </label>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => { setQuery(''); setDecisionFilter('ALL'); setRiskFilter('ALL'); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b3355] px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5"
            >
              <X size={14} aria-hidden="true" /> Clear filters
            </button>
          ) : null}
        </div>
      </section>

      <p className="text-xs text-slate-500" role="status">
        Showing {filtered.length} of {(records || []).length} audit records. Every completed simulation and approval outcome is recorded here from shared demo state.
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2b3355] bg-[#0e1226] p-8 text-center">
          <p className="text-sm font-semibold text-slate-200">{(records || []).length === 0 ? 'No audit records yet' : 'No records match these filters'}</p>
          <p className="mt-1 text-xs text-slate-400">
            {(records || []).length === 0
              ? 'Run a scenario in the Security Simulator to create the first audit entry.'
              : 'Try clearing filters or searching for a different tool, action, or trace ID.'}
          </p>
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'timestamp', header: 'Time', render: (r) => <span className="font-mono text-xs text-slate-400">{formatTime(r.timestamp)}</span> },
            { key: 'traceId', header: 'Trace ID', render: (r) => <span className="font-mono text-indigo-200">{r.traceId}</span> },
            { key: 'scenario', header: 'Scenario', render: (r) => <span>{r.scenario}</span> },
            { key: 'tool', header: 'Tool', render: (r) => <code className="text-indigo-200">{r.tool}</code> },
            { key: 'action', header: 'Action', render: (r) => <span>{r.action}</span> },
            { key: 'riskLevel', header: 'Risk', render: (r) => <StatusBadge tone={riskTone(r.riskLevel)}>{r.riskLevel}</StatusBadge> },
            { key: 'policyResult', header: 'Policy', render: (r) => <span className="text-xs">{r.policyResult}</span> },
            { key: 'snapStatus', header: 'Snap', render: (r) => <span className="text-xs text-violet-300">{r.snapStatus}</span> },
            { key: 'decision', header: 'Decision', render: (r) => <StatusBadge tone={decisionTone(r.decision)}>{r.decision}</StatusBadge> },
            { key: 'enforcement', header: 'Enforcement', render: (r) => <span className="text-xs text-slate-300">{r.enforcement}</span> },
          ]}
          rows={filtered}
          onRowClick={(r) => onInspect(r.traceId)}
        />
      )}
      <p className="text-[11px] text-slate-500">Click any record to open its full decision trace. Snap status is always a locally simulated assessment in this demo.</p>
    </div>
  );
}
