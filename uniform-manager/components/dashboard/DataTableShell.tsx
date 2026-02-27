import type { ReactNode } from "react"

type DataTableShellProps = {
  /** True while data is being fetched. */
  isLoading: boolean
  /** Error message shown when the fetch fails. */
  error: string | null
  /** Empty state title shown when rows are empty. */
  emptyTitle: string
  /** Empty state description shown when rows are empty. */
  emptyDescription?: string
  /** Callback to retry fetching. */
  onRetry: () => void
  /** True when the dataset has zero rows. */
  isEmpty: boolean
  /** Rendered table element. */
  children: ReactNode
}

/**
 * Shared table shell for consistent loading/error/empty UI across tables.
 */
export function DataTableShell({
  isLoading,
  error,
  emptyTitle,
  emptyDescription,
  onRetry,
  isEmpty,
  children,
}: DataTableShellProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[180px] items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-6 text-center">
        <p className="text-sm font-medium text-rose-900">
          We couldn&apos;t load this data.
        </p>
        <p className="text-xs text-rose-700">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center justify-center rounded-full bg-rose-900 px-4 py-1.5 text-xs font-medium text-rose-50 hover:bg-rose-800"
        >
          Try again
        </button>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-8 text-center">
        <p className="text-sm font-medium text-zinc-800">{emptyTitle}</p>
        {emptyDescription && (
          <p className="max-w-sm text-xs text-zinc-500">{emptyDescription}</p>
        )}
      </div>
    )
  }

  return <>{children}</>
}

/** Table header cell with consistent styling. */
export function Th({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <th
      className={`border-b border-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 ${
        className ?? ""
      }`}
    >
      {children}
    </th>
  )
}

/** Table data cell with consistent styling. */
export function Td({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <td
      className={`px-4 py-3 align-top text-sm text-zinc-800 ${
        className ?? ""
      }`}
    >
      {children}
    </td>
  )
}