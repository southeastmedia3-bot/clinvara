export function AdminTable({
  columns,
  children,
  empty,
}: {
  columns: string[];
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 [&_td]:align-middle [&_tr:hover]:bg-zinc-50/70">
            {children}
          </tbody>
        </table>
      </div>
      {empty && (
        <div className="px-6 py-12 text-center text-sm text-zinc-500">
          No records found yet.
        </div>
      )}
    </div>
  );
}
