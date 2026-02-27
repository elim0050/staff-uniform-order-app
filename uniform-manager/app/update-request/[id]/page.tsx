"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { type RequestRow, type RequestStatus } from "@/types /types"

const statusOptions: RequestStatus[] = [
  "REQUESTED",
  "DISPATCHED",
  "ARRIVED",
  "COLLECTED",
]

const statusLabel: Record<RequestStatus, string> = {
  REQUESTED: "Requested",
  DISPATCHED: "Dispatched",
  ARRIVED: "Arrived",
  COLLECTED: "Collected",
}

export default function RequestDetailPage() {
  const params = useParams()
  const trackingNumber = params.id as string
  const router = useRouter()

  const [request, setRequest] = useState<RequestRow | null>(null)
  const [newStatus, setNewStatus] = useState<RequestStatus | "">("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch request details by tracking number.
   */
  useEffect(() => {
    let isMounted = true

    async function fetchRequest() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/requests/${trackingNumber}`, {
          cache: "no-store",
        })

        const data = await res.json().catch(() => null)

        if (!res.ok) {
          if (!isMounted) return
          setError(data?.error ?? "Request not found.")
          setRequest(null)
          return
        }

        const row = Array.isArray(data) ? data[0] : data

        if (!isMounted) return
        setRequest(row ?? null)
        setNewStatus(row?.status ?? "")
      } catch {
        if (!isMounted) return
        setError("Failed to fetch request.")
        setRequest(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchRequest()

    return () => {
      isMounted = false
    }
  }, [trackingNumber])

  /**
   * Update request status.
   */
  async function handleUpdateStatus() {
    if (!request || !newStatus) return

    setUpdating(true)
    setError(null)

    try {
      const res = await fetch(`/api/requests/${trackingNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error ?? "Failed to update status.")
        return
      }

      setRequest({ ...request, status: newStatus })
    } catch {
      setError("Failed to update status.")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto w-full max-w-3xl flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Request Details
          </h1>
          <p className="text-sm text-zinc-600">
            Review the request and update its status.
          </p>
        </header>

        {/* Error */}
        {error && (
          <div className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm text-zinc-500">Loading request…</p>
          </div>
        ) : !request ? (
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm text-zinc-700">Request not found.</p>
            <button
              type="button"
              onClick={() => router.push("/update-request")}
              className="mt-3 inline-flex rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Back
            </button>
          </div>
        ) : (
          <>
            {/* Request Info Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 space-y-4">
              <Detail label="Tracking Number">{trackingNumber}</Detail>
              <Detail label="Staff">
                {request.staffName}
                {request.staffRole ? ` (${request.staffRole})` : ""}
              </Detail>
              <Detail label="Item">
                {request.uniformItem} × {request.quantity}
              </Detail>
              <Detail label="Requested At">
                {new Date(request.requestedAt).toLocaleString()}
              </Detail>
              <Detail label="Low Stock">
                {request.lowStock ? "Yes" : "No"}
              </Detail>
              <Detail label="On Cooldown">
                {request.onCooldown ? "Yes" : "No"}
              </Detail>
              <Detail label="Current Status">
                <span className="inline-flex rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium bg-zinc-100 text-zinc-700">
                  {statusLabel[request.status]}
                </span>
              </Detail>
            </div>

            {/* Update Status Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">
                Update Status
              </h2>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as RequestStatus)
                  }
                  disabled={updating}
                  className="h-9 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:opacity-60"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/update-request")}
                    disabled={updating}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    disabled={updating || !newStatus}
                    className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 px-4 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                  >
                    {updating ? "Updating…" : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Reusable detail row component.
 */
function Detail({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="font-medium text-zinc-600">{label}</span>
      <span className="text-zinc-900 text-right">{children}</span>
    </div>
  )
}