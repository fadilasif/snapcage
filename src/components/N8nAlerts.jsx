import { useState } from 'react';
import { Check, ChevronDown, Copy, ShieldAlert, Webhook, X } from 'lucide-react';
import { formatTime } from './EventStream.jsx';

function AlertCard({ alert, onDismiss, onInspect }) {
  const [copied, setCopied] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(alert.payload, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — payload stays visible for manual copy */
    }
  };

  return (
    <div
      role="alert"
      className="animate-slide-in-right pointer-events-auto w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#2b3355] border-l-4 border-l-[#ea4b71] bg-[#160f1a] shadow-2xl shadow-black/60"
    >
      <div className="flex items-start gap-2.5 p-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ea4b71]/15 text-[#ea4b71]" aria-hidden="true">
          <Webhook size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-bold text-slate-100">n8n Alert</span>
            <span className="rounded border border-amber-400/40 bg-amber-400/10 px-1 py-px text-[9px] font-bold text-amber-300">SIMULATED</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-rose-200">
            <ShieldAlert size={13} aria-hidden="true" /> {alert.title}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-slate-500">{formatTime(alert.timestamp)}</span>
        <button
          type="button"
          onClick={() => onDismiss(alert.id)}
          aria-label="Dismiss n8n alert"
          className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={15} />
        </button>
      </div>

      <p className="px-3 pb-1 text-xs leading-relaxed text-slate-300">{alert.message}</p>
      <p className="px-3 pb-2 font-mono text-[11px] text-slate-500">
        {alert.traceId} · <code className="text-indigo-300">{alert.tool}</code> · workflow <code className="text-[#ea4b71]">snapcage-security-alerts</code>
      </p>

      <div className="flex items-center gap-2 px-3 pb-2.5">
        <button
          type="button"
          onClick={() => setShowPayload((v) => !v)}
          aria-expanded={showPayload}
          className="inline-flex items-center gap-1 rounded-md border border-[#2b3355] px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/5"
        >
          Webhook payload
          <ChevronDown size={13} aria-hidden="true" className={`transition-transform ${showPayload ? 'rotate-180' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => onInspect(alert.traceId)}
          className="rounded-md border border-[#2b3355] px-2 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-white/5"
        >
          View trace
        </button>
      </div>

      {showPayload ? (
        <div className="border-t border-[#232a45] bg-black/40 p-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Would-be POST body — not sent</p>
            <button
              type="button"
              onClick={copyPayload}
              className="inline-flex items-center gap-1 rounded-md border border-[#2b3355] px-1.5 py-0.5 text-[11px] text-slate-300 hover:bg-white/5"
            >
              {copied ? <Check size={12} className="text-emerald-400" aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="slim-scroll mt-1.5 max-h-40 overflow-auto rounded-md text-[11px] leading-relaxed text-emerald-200">
            {JSON.stringify(alert.payload, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

export default function N8nAlerts({ alerts, onDismiss, onInspect }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div
      className="pointer-events-none fixed right-4 top-16 z-[70] flex flex-col gap-2"
      aria-live="assertive"
      aria-label="Security alerts"
    >
      {alerts.map((a) => (
        <AlertCard key={a.id} alert={a} onDismiss={onDismiss} onInspect={onInspect} />
      ))}
    </div>
  );
}
