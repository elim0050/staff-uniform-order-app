import type { UniformItemOption } from "@/types /types"
import { DataTableShell, Th, Td } from "./DataTableShell"

type UniformsTableProps = {
  isLoading: boolean
  error: string | null
  uniforms: UniformItemOption[]
  onRetry: () => void
}

export function UniformsTable({
  isLoading,
  error,
  uniforms,
  onRetry,
}: UniformsTableProps) {
  return (
    <DataTableShell
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={!uniforms.length}
      emptyTitle="No uniform items found"
      emptyDescription="Upload uniform inventory via CSV to start managing stock."
    >
      <div className="-mx-4 -mb-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <Th>EAN</Th>
              <Th>Item</Th>
              <Th>Size</Th>
              <Th className="text-right">Stock</Th>
              <Th>Flags</Th>
            </tr>
          </thead>
          <tbody>
            {uniforms.map((u, index) => {
              const showDivider = index !== uniforms.length - 1
              const isLow = Boolean(u.lowStock)

              return (
                <tr
                  key={u.id}
                  className={`transition-colors hover:bg-zinc-50 ${
                    showDivider ? "border-b border-zinc-100" : ""
                  }`}
                >
                  <Td>{u.ean ?? "—"}</Td>
                  <Td className="font-medium text-zinc-900">{u.name}</Td>
                  <Td>{u.size ?? "—"}</Td>
                  <Td className="text-right tabular-nums">{u.stockOnHand ?? 0}</Td>
                  <Td>
                    {isLow ? (
                      <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 ring-1 ring-rose-200">
                        Low stock
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DataTableShell>
  )
}