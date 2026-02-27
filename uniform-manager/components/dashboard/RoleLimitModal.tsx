import { useEffect, useState } from "react"
import type { RoleLimit, RoleSettingsRow } from "../../types /types"
import { Modal } from "./Modal"
import { listRoleSettings, updateRoles } from "@/services/rolesService"

type RoleLimitModalProps = {
  /** Current role limits passed from parent */
  roleLimits: RoleLimit[]
  /** Close modal callback */
  onClose: () => void
  /** Triggered after successful save */
  onChange: (next: RoleLimit[]) => void
}

/**
 * Modal for configuring role-based uniform limits and cooldown periods.
 *
 * Loads role settings from the server and allows inline editing.
 * Only changed rows are sent back to the server when saving.
 */
export function RoleLimitModal({
  roleLimits,
  onClose,
  onChange,
}: RoleLimitModalProps) {
  const [rows, setRows] = useState<RoleSettingsRow[]>([])
  const [originalRows, setOriginalRows] =
    useState<RoleSettingsRow[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load role settings from server on mount.
   * Falls back to provided roleLimits if fetch fails.
   */
  useEffect(() => {
    let isMounted = true

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const roleSettings = await listRoleSettings()
        if (!isMounted) return

        setRows(roleSettings)
        setOriginalRows(roleSettings)
      } catch {
        if (!isMounted) return

        setError("Unable to load role settings from the server.")

        // Fallback to props if server fails
        if (roleLimits.length) {
          const fallbackRows: RoleSettingsRow[] = roleLimits.map(
            (limit, index) => ({
              id: limit.role || String(index),
              roleName: limit.role,
              uniformLimit: limit.maxItemsPerPeriod,
              cooldownDays: limit.cooldownDays,
            })
          )

          setRows(fallbackRows)
          setOriginalRows(fallbackRows)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [roleLimits])

  /**
   * Updates a specific row locally.
   */
  function updateRow(index: number, patch: Partial<RoleSettingsRow>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    )
  }

  /**
   * Returns only rows that were modified.
   */
  function getChangedRows(): RoleSettingsRow[] {
    if (!originalRows) return rows

    const byId = new Map(originalRows.map((row) => [row.id, row]))

    return rows.filter((row) => {
      const original = byId.get(row.id)
      if (!original) return true

      return (
        original.uniformLimit !== row.uniformLimit ||
        original.cooldownDays !== row.cooldownDays
      )
    })
  }

  /**
   * Persists changed role settings to the server.
   */
  async function handleSave() {
    setIsSaving(true)
    setError(null)

    try {
      const changedRows = getChangedRows()

      await Promise.all(
        changedRows.map((row) =>
          updateRoles(row.id, {
            uniform_limit: row.uniformLimit,
            cooldown_days: row.cooldownDays,
          })
        )
      )

      const nextRoleLimits: RoleLimit[] = rows.map((row) => ({
        role: row.roleName,
        maxItemsPerPeriod: row.uniformLimit,
        periodMonths: 0, // Managed server-side
        cooldownDays: row.cooldownDays,
      }))

      onChange(nextRoleLimits)
      onClose()
    } catch {
      setError("Unable to save role settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal onClose={onClose} ariaLabel="Configure role limits and cooldowns">
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-900">
            Role Limits &amp; Cooldowns
          </h2>
          <p className="text-xs text-zinc-500">
            Control how often different roles can request uniforms and how many
            items they can receive.
          </p>
        </header>

        {error && <p className="text-xs text-red-600">{error}</p>}
        {isLoading && (
          <p className="text-xs text-zinc-500">Loading role settings…</p>
        )}

        <div className="rounded-md border border-zinc-200 bg-zinc-50">
          <table className="min-w-full border-separate border-spacing-0 text-left text-xs">
            <thead className="bg-zinc-100">
              <tr>
                <th className="border-b border-zinc-200 px-2 py-2 font-semibold text-zinc-700">
                  Role
                </th>
                <th className="border-b border-zinc-200 px-2 py-2 font-semibold text-zinc-700">
                  Uniform limit
                </th>
                <th className="border-b border-zinc-200 px-2 py-2 font-semibold text-zinc-700">
                  Cooldown (days)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-zinc-100">
                  <td className="px-2 py-2 align-top text-zinc-800">
                    {row.roleName}
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      type="number"
                      min={0}
                      value={row.uniformLimit}
                      onChange={(e) =>
                        updateRow(index, {
                          uniformLimit: Number(e.target.value || 0),
                        })
                      }
                      disabled={isLoading || isSaving}
                      className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-300"
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      type="number"
                      min={0}
                      value={row.cooldownDays}
                      onChange={(e) =>
                        updateRow(index, {
                          cooldownDays: Number(e.target.value || 0),
                        })
                      }
                      disabled={isLoading || isSaving}
                      className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-300"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-zinc-500">
          These settings help prevent over-ordering and ensure staff cannot
          request uniforms too frequently. Actual enforcement happens on the
          server.
        </p>

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="inline-flex rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  )
}