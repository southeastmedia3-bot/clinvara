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
    <div className="overflow-hidden rounded-lg border border-[var(--brand-border)] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--brand-border)] text-sm">
          <thead className="bg-[var(--brand-off-white)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-muted)]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--brand-border)]">{children}</tbody>
        </table>
      </div>
      {empty && (
        <div className="px-6 py-12 text-center text-sm text-[var(--brand-text-muted)]">
          No records found yet.
        </div>
      )}
    </div>
  );
}
