import {
  BookOpen,
  FlaskConical,
  Inbox,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'simulator', label: 'Security Simulator', icon: FlaskConical },
  { id: 'approvals', label: 'Approval Queue', icon: Inbox },
  { id: 'audit', label: 'Audit Logs', icon: ScrollText },
  { id: 'policies', label: 'Policies', icon: ShieldCheck },
];

export default function Sidebar({ page, onNavigate, pendingCount, mobileOpen, onCloseMobile, onOpenConcept }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#232a45] bg-[#0e1226] lg:flex" aria-label="Primary">
        <SidebarBody page={page} onNavigate={onNavigate} pendingCount={pendingCount} onOpenConcept={onOpenConcept} />
      </aside>
      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/60"
            onClick={onCloseMobile}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-[#232a45] bg-[#0e1226]">
            <SidebarBody page={page} onNavigate={(p) => { onNavigate(p); onCloseMobile(); }} pendingCount={pendingCount} showClose onCloseMobile={onCloseMobile} onOpenConcept={() => { onOpenConcept(); onCloseMobile(); }} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SidebarBody({ page, onNavigate, pendingCount, showClose = false, onCloseMobile, onOpenConcept }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[#232a45] px-4 py-4">
        <img
          src="/logo.png"
          alt="SnapCage logo"
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-xl bg-black object-cover ring-1 ring-indigo-500/30"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-100">SnapCage</p>
          <p className="truncate text-[11px] text-slate-400">Security Gateway</p>
        </div>
        {showClose ? (
          <button type="button" onClick={onCloseMobile} className="ml-auto rounded-md border border-[#2b3355] px-2 py-1 text-xs text-slate-300 hover:bg-white/5" aria-label="Close menu">
            ✕
          </button>
        ) : null}
      </div>

      <div className="border-b border-[#232a45] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400">Powered by <span className="font-semibold text-indigo-300">Snap</span> · By SubQ AI</p>
          <span className="rounded border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">DEMO</span>
        </div>
        <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">SIMULATED INTEGRATION · SANDBOX MODE</p>
      </div>

      <div className="border-b border-[#232a45] p-3">
        <button
          type="button"
          onClick={onOpenConcept}
          className="flex w-full items-center gap-3 rounded-xl bg-indigo-500 px-3 py-2.5 text-left shadow-lg shadow-indigo-950/50 transition-colors hover:bg-indigo-400"
        >
          <BookOpen size={19} className="shrink-0 text-white" aria-hidden="true" />
          <span>
            <span className="block text-sm font-bold text-white">Core Concept</span>
            <span className="block text-[11px] text-indigo-100">What SnapCage does & why</span>
          </span>
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Pages">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? 'bg-indigo-500/15 text-indigo-100 border border-indigo-500/30'
                  : 'border border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={17} aria-hidden="true" />
              <span className="font-medium">{item.label}</span>
              {item.id === 'approvals' && pendingCount > 0 ? (
                <span className="ml-auto rounded-full bg-amber-400/15 border border-amber-400/40 px-2 py-0.5 text-[11px] font-bold text-amber-300" aria-label={`${pendingCount} pending approvals`}>
                  {pendingCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#232a45] p-4 text-[11px] leading-relaxed text-slate-500">
        <p className="font-semibold text-slate-400">SnapCage Security Gateway</p>
        <p>Every action checked. Every decision explained.</p>
        <p className="mt-2 rounded-md border border-[#2b3355] bg-white/[0.02] p-2">Demo environment — all telemetry, Snap responses, and enforcement are locally simulated.</p>
      </div>
    </div>
  );
}
