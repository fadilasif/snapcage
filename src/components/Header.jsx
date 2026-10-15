import { Bell, Menu } from 'lucide-react';

const TITLES = {
  overview: 'Overview',
  simulator: 'Security Simulator',
  approvals: 'Approval Queue',
  audit: 'Audit Logs',
  policies: 'Policies',
};

export default function Header({ page, pendingCount, onOpenMobile, onGoApprovals }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#232a45] bg-[#0a0d1a]/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          className="rounded-lg border border-[#2b3355] p-2 text-slate-300 hover:bg-white/5 lg:hidden"
          onClick={onOpenMobile}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-slate-100 sm:text-lg">{TITLES[page] || 'SnapCage'}</h1>
          <p className="hidden text-xs text-slate-400 sm:block">SnapCage Security Gateway · Powered by Snap · By SubQ AI</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 md:inline-flex">
            DEMO ENVIRONMENT
          </span>
          <span className="hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 md:inline-flex">
            SANDBOX MODE
          </span>
          <button
            type="button"
            onClick={onGoApprovals}
            className="relative rounded-lg border border-[#2b3355] p-2 text-slate-300 hover:bg-white/5"
            aria-label={`Notifications, ${pendingCount} pending approvals`}
            title="Open Approval Queue"
          >
            <Bell size={18} />
            {pendingCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-black">
                {pendingCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
