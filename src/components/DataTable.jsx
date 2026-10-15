export default function DataTable({ columns, rows, emptyMessage = 'No records.', onRowClick, rowKey = (r, i) => r.traceId || i }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#2b3355] p-6 text-center text-sm text-slate-400">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="slim-scroll overflow-x-auto rounded-xl border border-[#232a45]">
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-[#232a45] bg-[#0e1330] text-[11px] uppercase tracking-wider text-slate-400">
            {columns.map((c) => (
              <th key={c.key} scope="col" className="px-3 py-2.5 font-semibold">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={rowKey(r, i)}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={`border-b border-[#1c2340] last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-indigo-500/5' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2.5 align-top text-slate-200">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
