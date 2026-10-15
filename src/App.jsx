import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import DecisionInspector from './components/DecisionInspector.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Simulator, { STEP_DELAY_MS } from './pages/Simulator.jsx';
import Approvals from './pages/Approvals.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import Policies from './pages/Policies.jsx';
import { formatTraceId, getScenarioById } from './data/mockData.js';
import { buildAuditRecord, buildDecision, nextEventId, pipelineStepToEvent } from './lib/simulateGuard.js';

function stepDelay() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : STEP_DELAY_MS;
  } catch {
    return STEP_DELAY_MS;
  }
}

export default function App() {
  const [page, setPage] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [traceCounter, setTraceCounter] = useState(1);
  const [events, setEvents] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [audits, setAudits] = useState([]);
  const [selectedTraceId, setSelectedTraceId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('A');
  const [sim, setSim] = useState({ isRunning: false, visibleSteps: 0, traceId: null, done: false, decision: null });
  const [runToken, setRunToken] = useState(0);
  const timersRef = useRef([]);

  const pushToast = useCallback((message, tone = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleSelectScenario = useCallback((id) => {
    setSelectedScenarioId(id);
    // Clear the finished timeline so switching scenarios never mixes
    // one scenario's steps with another run's decision. History is kept.
    setSim((prev) => {
      if (prev.isRunning) return prev;
      if (!prev.done && prev.visibleSteps === 0) return prev;
      return { isRunning: false, visibleSteps: 0, traceId: null, done: false, decision: null };
    });
    setRunToken((t) => t + 1);
  }, []);
  const selectedDecision = useMemo(
    () => decisions.find((d) => d.traceId === selectedTraceId) || null,
    [decisions, selectedTraceId],
  );

  const pendingDecisions = useMemo(
    () => decisions.filter((d) => d.decision === 'APPROVAL REQUIRED' && d.reviewStatus === 'PENDING'),
    [decisions],
  );

  const metrics = useMemo(() => {
    const evaluated = decisions.length;
    const allowed = decisions.filter((d) => d.decision === 'ALLOW').length;
    const blocked = decisions.filter((d) => d.decision === 'BLOCK').length;
    const pending = pendingDecisions.length;
    const avgLatency =
      evaluated === 0
        ? '—'
        : `${Math.round(decisions.reduce((s, d) => s + (d.simulatedLatencyMs || 0), 0) / evaluated)} ms`;
    return { evaluated, allowed, blocked, pending, avgLatency };
  }, [decisions, pendingDecisions]);

  const systemStatus = useMemo(
    () => [
      { label: 'Agent', value: sim.isRunning ? 'Active' : 'Idle', on: true, note: sim.isRunning ? 'Simulation running' : 'Awaiting scenario' },
      { label: 'SnapCage', value: 'Monitoring', on: true, note: 'Interception active (sim)' },
      { label: 'Policy Engine', value: 'Operational', on: true, note: 'Local deterministic rules' },
      { label: 'Snap Risk Judge', value: 'Simulated / Ready', on: true, note: 'No real model calls' },
      { label: 'Tool Environment', value: 'Sandbox Only', on: true, note: 'Nothing executes' },
    ],
    [sim.isRunning],
  );

  const recentDecisions = useMemo(() => [...decisions].reverse().slice(0, 5), [decisions]);

  const navigate = useCallback((p) => {
    setPage(p);
    setMobileOpen(false);
    try {
      window.scrollTo({ top: 0 });
    } catch { /* noop */ }
  }, []);

  const handleInspect = useCallback((traceId) => {
    if (traceId) setSelectedTraceId(traceId);
  }, []);

  const handleOpenScenario = useCallback((scenarioId) => {
    handleSelectScenario(scenarioId);
    navigate('simulator');
    pushToast(`Scenario ${scenarioId} loaded in the Security Simulator — press Run Simulation.`, 'info');
  }, [handleSelectScenario, navigate, pushToast]);

  const handleRun = useCallback(() => {
    if (sim.isRunning) return;
    const scenario = getScenarioById(selectedScenarioId);
    const traceNumber = traceCounter;
    const traceId = formatTraceId(traceNumber);
    const startedAt = new Date();
    const delay = stepDelay();
    setTraceCounter((n) => n + 1);
    setRunToken((t) => t + 1);
    setSim({ isRunning: true, visibleSteps: 0, traceId, done: false, decision: null });

    scenario.pipeline.forEach((step, i) => {
      const id = window.setTimeout(() => {
        const { type, status } = pipelineStepToEvent({ decision: scenario, stepIndex: i, step });
        setEvents((prev) => [
          ...prev,
          {
            id: nextEventId(),
            traceId,
            timestamp: new Date(),
            type,
            tool: scenario.tool,
            status,
            message: `${step.label} — ${step.detail}`,
            decision:
              step.label.toLowerCase().includes('final decision') || step.label.toLowerCase().includes('enforcement')
                ? scenario.decision
                : null,
          },
        ]);
        setSim((prev) => ({ ...prev, visibleSteps: i + 1 }));
      }, delay * (i + 1));
      timersRef.current.push(id);
    });

    const finishId = window.setTimeout(() => {
      const decision = buildDecision({ scenario, traceNumber, startedAt });
      setDecisions((prev) => [...prev, decision]);
      setAudits((prev) => [...prev, buildAuditRecord(decision)]);
      setSim({ isRunning: false, visibleSteps: scenario.pipeline.length, traceId, done: true, decision });
      pushToast(
        `${traceId} ${decision.decision} — ${decision.action}${
          decision.decision === 'APPROVAL REQUIRED' ? ' (see Approval Queue)' : ''
        }`,
        decision.decision === 'ALLOW' ? 'allow' : decision.decision === 'BLOCK' ? 'block' : 'review',
      );
    }, delay * (scenario.pipeline.length + 1));
    timersRef.current.push(finishId);
  }, [sim.isRunning, selectedScenarioId, traceCounter, pushToast]);

  const handleReset = useCallback(() => {
    if (sim.isRunning) return;
    clearTimers();
    setEvents([]);
    setDecisions([]);
    setAudits([]);
    setTraceCounter(1);
    setSelectedTraceId(null);
    setSim({ isRunning: false, visibleSteps: 0, traceId: null, done: false, decision: null });
    setRunToken((t) => t + 1);
    pushToast('Demo reset — mock state restored. Trace IDs restart at SC-0001.', 'info');
  }, [sim.isRunning, clearTimers, pushToast]);

  const handleReview = useCallback(
    (traceId, approved) => {
      const target = decisions.find((d) => d.traceId === traceId);
      if (!target || target.reviewStatus !== 'PENDING') return;
      const reviewStatus = approved ? 'APPROVED' : 'REJECTED';
      const reviewedAt = new Date();
      const enforcement = approved
        ? 'Approved in simulation — authorization recorded; underlying action was NOT executed.'
        : 'Rejected by reviewer — action will not proceed. Nothing was executed.';
      setDecisions((prev) =>
        prev.map((d) =>
          d.traceId === traceId
            ? {
                ...d,
                reviewStatus,
                reviewedBy: 'reviewer@snapcage.demo',
                reviewedAt,
                reviewNote: approved ? 'Authorized in simulation — no action executed.' : 'Denied by reviewer — action will not proceed.',
                enforcement,
                enforcementShort: approved ? 'Authorized in simulation (not executed)' : 'Denied — will not proceed',
              }
            : d,
        ),
      );
      setAudits((prev) =>
        prev.map((a) =>
          a.traceId === traceId
            ? { ...a, reviewStatus, enforcement: approved ? 'Authorized in simulation (not executed)' : 'Denied — will not proceed' }
            : a,
        ),
      );
      setEvents((prev) => [
        ...prev,
        {
          id: nextEventId(),
          traceId,
          timestamp: new Date(),
          type: 'review',
          tool: target.tool,
          status: approved ? 'allow' : 'block',
          message: `Human reviewer ${approved ? 'approved' : 'rejected'} ${traceId} (${target.action}) — recorded in simulation only.`,
          decision: target.decision,
        },
      ]);
      // Keep inspector in sync if it is open on this trace
      setSim((prev) => {
        if (prev.decision && prev.decision.traceId === traceId) {
          return {
            ...prev,
            decision: {
              ...prev.decision,
              reviewStatus,
              reviewedBy: 'reviewer@snapcage.demo',
              reviewedAt,
              enforcement,
              enforcementShort: approved ? 'Authorized in simulation (not executed)' : 'Denied — will not proceed',
            },
          };
        }
        return prev;
      });
      pushToast(
        `${traceId} ${approved ? 'approved' : 'rejected'} — authorization recorded in simulation; nothing executed.`,
        approved ? 'allow' : 'block',
      );
    },
    [decisions, pushToast],
  );

  return (
    <div className="flex min-h-screen bg-[#0a0d1a] text-slate-200">
      <Sidebar page={page} onNavigate={navigate} pendingCount={pendingDecisions.length} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header page={page} pendingCount={pendingDecisions.length} onOpenMobile={() => setMobileOpen(true)} onGoApprovals={() => navigate('approvals')} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6">
          {page === 'overview' ? (
            <Dashboard
              metrics={metrics}
              systemStatus={systemStatus}
              events={events}
              recentDecisions={recentDecisions}
              onInspect={handleInspect}
              onRunSimulation={() => navigate('simulator')}
              agentActive={sim.isRunning}
            />
          ) : null}
          {page === 'simulator' ? (
            <Simulator
              selectedScenarioId={selectedScenarioId}
              onSelectScenario={handleSelectScenario}
              isRunning={sim.isRunning}
              progress={sim}
              lastDecision={sim.decision}
              onRun={handleRun}
              onReset={handleReset}
              onOpenApprovals={() => navigate('approvals')}
              runToken={runToken}
            />
          ) : null}
          {page === 'approvals' ? (
            <Approvals
              items={[...pendingDecisions].reverse()}
              onApprove={(id) => handleReview(id, true)}
              onReject={(id) => handleReview(id, false)}
              onInspect={handleInspect}
              actionBusy={false}
            />
          ) : null}
          {page === 'audit' ? <AuditLogs records={[...audits].reverse()} onInspect={handleInspect} /> : null}
          {page === 'policies' ? <Policies onOpenScenario={handleOpenScenario} /> : null}

          <footer className="mt-8 border-t border-[#232a45] pt-4 text-[11px] leading-relaxed text-slate-500">
            <p><span className="font-semibold text-slate-400">SnapCage Security Gateway</span> · Powered by Snap · By SubQ AI · DEMO ENVIRONMENT · SANDBOX MODE · SIMULATED INTEGRATION</p>
            <p>Frontend-only prototype: deterministic mock data and local state. No backend, no model calls, no tool execution. Snap responses are locally simulated.</p>
          </footer>
        </main>
      </div>

      {selectedDecision ? (
        <DecisionInspector decision={selectedDecision} onClose={() => setSelectedTraceId(null)} />
      ) : null}

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border px-3.5 py-2.5 text-[13px] shadow-xl ${
              t.tone === 'allow'
                ? 'border-emerald-500/40 bg-[#0d2018] text-emerald-100'
                : t.tone === 'block'
                  ? 'border-rose-500/40 bg-[#220f16] text-rose-100'
                  : t.tone === 'review'
                    ? 'border-amber-500/40 bg-[#221806] text-amber-100'
                    : 'border-[#2b3355] bg-[#12172e] text-slate-100'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
