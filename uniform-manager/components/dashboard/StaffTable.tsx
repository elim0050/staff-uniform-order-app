import type { StaffOption } from "@/types /types"
import { DataTableShell, Th, Td } from "./DataTableShell"

type StaffTableProps = {
  isLoading: boolean
  error: string | null
  staff: StaffOption[]
  onRetry: () => void
}

export function StaffTable({ isLoading, error, staff, onRetry }: StaffTableProps) {
  console.log(staff)
    return (
    <DataTableShell
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={!staff.length}
      emptyTitle="No staff found"
      emptyDescription="Upload staff via CSV to start managing requests."
    >
      <div className="-mx-4 -mb-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th>Last request date</Th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s, index) => {
              const showDivider = index !== staff.length - 1
              return (
                <tr
                  key={s.id}
                  className={`transition-colors hover:bg-zinc-50 ${
                    showDivider ? "border-b border-zinc-100" : ""
                  }`}
                >
                  <Td className="font-medium text-zinc-900">{s.name}</Td>
                  <Td>{s.roleName ?? "—"}</Td>
                  <Td>
                    {s.lastRequestDate
                      ? new Date(s.lastRequestDate).toLocaleDateString()
                      : "—"}
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