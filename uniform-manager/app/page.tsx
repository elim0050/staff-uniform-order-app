"use client"

import { useEffect, useMemo, useState } from "react"
import {
  type RequestRow,
  type RequestStatus,
  type StaffOption,
  type UniformItemOption,
  type RoleLimit,
} from "@/types /types"
import { RequestsTable } from "@/components/dashboard/RequestsTable"
import { NewRequestModal } from "@/components/dashboard/NewRequestModal"
import { ImportCsvModal } from "@/components/dashboard/ImportCsvModal"
import { RoleLimitModal } from "@/components/dashboard/RoleLimitModal"

type ToastState = {
  message: string
  tone: "success" | "error" | "info"
} | null

/**
 * Available status filter options for the requests table.
 */
const statusFilterOptions: { value: "ALL" | RequestStatus; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "REQUESTED", label: "Requested" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "ARRIVED", label: "Arrived" },
  { value: "COLLECTED", label: "Collected" },
]

/**
 * Main dashboard page for managing uniform requests.
 * Handles:
 * - Fetching core data (requests, staff, uniforms, role limits)
 * - Filtering and searching
 * - Opening modals
 * - Showing toast notifications
 */
export default function DashboardPage() {
  /** Core request state */
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** Modal visibility state */
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isImportStaffOpen, setIsImportStaffOpen] = useState(false)
  const [isRoleLimitsOpen, setIsRoleLimitsOpen] = useState(false)

  /** Supporting dropdown data */
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([])
  const [uniformOptions, setUniformOptions] = useState<UniformItemOption[]>([])
  const [roleLimits, setRoleLimits] = useState<RoleLimit[]>([])

  /** UI filters */
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | RequestStatus>("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  /** Toast state */
  const [toast, setToast] = useState<ToastState>(null)

  /**
   * Load initial dashboard data on mount.
   */
  useEffect(() => {
    void refreshData()
  }, [])

  /**
   * Filters requests based on selected status and search term.
   */
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : req.status === statusFilter

      const matchesSearch = searchTerm
        ? (req.staffName + " " + req.uniformItem)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true

      return matchesStatus && matchesSearch
    })
  }, [requests, statusFilter, searchTerm])

  /**
   * Helper function for fetching JSON with error handling.
   */
  async function fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(url, { cache: "no-store" })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`${url} failed: ${text}`)
    }

    return res.json()
  }

  /**
   * Fetches all dashboard data in parallel.
   */
  async function refreshData() {
    setIsLoading(true)
    setError(null)

    try {
      const [
        requestsData,
        staffData,
        uniformData,
        roleLimitsData,
      ] = await Promise.all([
        fetchJSON<RequestRow[]>("/api/requests"),
        fetchJSON<StaffOption[]>("/api/staff"),
        fetchJSON<UniformItemOption[]>("/api/uniform_items"),
        fetchJSON<RoleLimit[]>("/api/roles"),
      ])

      setRequests(Array.isArray(requestsData) ? requestsData : [])
      setStaffOptions(Array.isArray(staffData) ? staffData : [])
      setUniformOptions(Array.isArray(uniformData) ? uniformData : [])
      setRoleLimits(Array.isArray(roleLimitsData) ? roleLimitsData : [])
    } catch (err: any) {
      setError(err.message ?? "Something went wrong loading data")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Displays a temporary toast notification.
   */
  function showToast(next: ToastState) {
    setToast(next)

    if (next) {
      window.setTimeout(() => {
        setToast(null)
      }, 4000)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 text-zinc-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Page Header */}
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Uniform Ordering System
          </h1>
          <p className="text-sm text-zinc-600">
            Submit and track staff uniform requests in one simple place.
          </p>
        </header>

        {/* Controls + Table Section */}
        <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
          {/* Top Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className="inline-flex rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
              >
                ⬆ Upload Uniform
              </button>

              <button
                type="button"
                onClick={() => setIsImportStaffOpen(true)}
                className="inline-flex rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
              >
                ⬆ Upload Staff
              </button>

              <button
                type="button"
                onClick={() => setIsRoleLimitsOpen(true)}
                className="inline-flex rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
              >
                ⚙ Set Role Limits
              </button>
            </div>

            {/* Filters + New Request */}
            <div className="flex flex-wrap gap-2 sm:items-center">
              <select
                className="h-9 rounded-full border border-zinc-300 px-3 text-xs"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | RequestStatus)
                }
              >
                {statusFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <input
                type="search"
                placeholder="Search staff or item"
                className="h-9 rounded-full border border-zinc-300 px-3 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setIsNewRequestOpen(true)}
                className="inline-flex rounded-full bg-zinc-900 px-4 py-1.5 text-sm text-zinc-50 hover:bg-zinc-800"
              >
                ＋ New Request
              </button>
            </div>
          </div>

          <RequestsTable
            isLoading={isLoading}
            error={error}
            requests={filteredRequests}
            onRetry={refreshData}
          />
        </section>
      </div>

      {/* Modals */}
      {isNewRequestOpen && (
        <NewRequestModal
          staffOptions={staffOptions}
          uniformOptions={uniformOptions}
          roleLimits={roleLimits}
          onClose={() => setIsNewRequestOpen(false)}
          onCreated={(newRequest) => {
            setRequests((prev) => [newRequest, ...prev])
            showToast({ message: "Uniform request submitted", tone: "success" })
          }}
          onError={(message) =>
            showToast({ message, tone: "error" })
          }
        />
      )}

      {isImportOpen && (
        <ImportCsvModal
          type="uniform"
          onClose={() => setIsImportOpen(false)}
          onImported={({ summaryMessage }) => {
            showToast({ message: summaryMessage, tone: "success" })
            void refreshData()
          }}
          onError={(message) =>
            showToast({ message, tone: "error" })
          }
        />
      )}

      {isImportStaffOpen && (
        <ImportCsvModal
          type="staff"
          onClose={() => setIsImportStaffOpen(false)}
          onImported={({ summaryMessage }) => {
            showToast({ message: summaryMessage, tone: "success" })
            void refreshData()
          }}
          onError={(message) =>
            showToast({ message, tone: "error" })
          }
        />
      )}

      {isRoleLimitsOpen && (
        <RoleLimitModal
          roleLimits={roleLimits}
          onClose={() => setIsRoleLimitsOpen(false)}
          onChange={(next) => {
            setRoleLimits(next)
            showToast({ message: "Role limits updated", tone: "success" })
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center px-4">
          <div
            className={`max-w-sm rounded-lg px-4 py-3 text-sm shadow-lg ring-1 ${
              toast.tone === "success"
                ? "bg-emerald-50 text-emerald-900 ring-emerald-100"
                : toast.tone === "error"
                ? "bg-rose-50 text-rose-900 ring-rose-100"
                : "bg-zinc-50 text-zinc-900 ring-zinc-200"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}