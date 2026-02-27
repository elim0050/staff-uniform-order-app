import type { RequestRow, RequestStatus } from "../../types /types"
import { DataTableShell, Th, Td } from "./DataTableShell"

type RequestsTableProps = {
  isLoading: boolean
  error: string | null
  requests: RequestRow[]
  onRetry: () => void
}

const statusLabel: Record<RequestStatus, string> = {
  REQUESTED: "Requested",
  DISPATCHED: "Dispatched",
  ARRIVED: "Arrived",
  COLLECTED: "Collected",
}

const statusColorClasses: Record<RequestStatus, string> = {
  REQUESTED: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  DISPATCHED: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
  ARRIVED: "bg-teal-50 text-teal-800 ring-1 ring-teal-100",
  COLLECTED: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100",
}

type Flag = { label: string; className: string }

export function RequestsTable({
  isLoading,
  error,
  requests,
  onRetry,
}: RequestsTableProps) {
  return (
    <DataTableShell
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={!requests.length}
      emptyTitle="No uniform requests yet"
      emptyDescription="Once you submit a request, it will appear here so you can track its status."
    >
      <div className="-mx-4 -mb-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <Th>Staff name</Th>
              <Th>Uniform item</Th>
              <Th>Size</Th>
              <Th>EAN</Th>
              <Th className="text-right">Quantity</Th>
              <Th>Status</Th>
              <Th>Created Date</Th>
              <Th>Order ID</Th>
              <Th>Notes / flags</Th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req, index) => {
              const showDivider = index !== requests.length - 1

              const flags: Flag[] = []
              if (req.lowStock) {
                flags.push({
                  label: "Low stock",
                  className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
                })
              }
              if (req.onCooldown) {
                flags.push({
                  label: "On cooldown",
                  className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
                })
              }
              if (req.reason) {
                flags.push({
                  label: req.reason,
                  className: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
                })
              }

              return (
                <tr
                  key={req.id}
                  className={`transition-colors hover:bg-zinc-50 ${
                    showDivider ? "border-b border-zinc-100" : ""
                  }`}
                >
                  <Td>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-900">
                        {req.staffName}
                      </span>
                      {req.staffRole && (
                        <span className="text-xs text-zinc-500">
                          {req.staffRole}
                        </span>
                      )}
                    </div>
                  </Td>

                  <Td>{req.uniformItem}</Td>
                  <Td>{req.uniformSize}</Td>
                  <Td>{req.uniformEan}</Td>

                  <Td className="text-right">
                    <span className="tabular-nums">{req.quantity}</span>
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColorClasses[req.status]}`}
                    >
                      {statusLabel[req.status]}
                    </span>
                  </Td>

                  <Td>
                    <span className="text-xs text-zinc-600">
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </span>
                  </Td>

                  <Td>{req.trackingNum}</Td>

                  <Td>
                    {flags.length ? (
                      <div className="flex flex-wrap gap-1">
                        {flags.map((flag) => (
                          <span
                            key={flag.label}
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${flag.className}`}
                          >
                            {flag.label}
                          </span>
                        ))}
                      </div>
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