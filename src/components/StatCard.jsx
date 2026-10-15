export default function StatCard({ label, value, sub, icon, accent = 'text-indigo-300' }) {
  return (
    <div className="rounded-xl border border-[#232a45] bg-[#131830] p-4 transition-colors hover:border-[#314062]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        {icon ? <span className={accent} aria-hidden="true">{icon}</span> : null}
      </div>
      <p className="mt-1 text-2xl font-bold text-slate-100 tabular-nums">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
    </div>
  );
}
