"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type RequestRow,
  type RequestStatus,
  type StaffOption,
  type UniformItemOption,
  type RoleLimit,
} from "@/types /types";
import { RequestsTable } from "@/components/dashboard/RequestsTable";
import { NewRequestModal } from "@/components/dashboard/NewRequestModal";
import { ImportCsvModal } from "@/components/dashboard/ImportCsvModal";
import { RoleLimitModal } from "@/components/dashboard/RoleLimitModal";

type ToastState = {
  message: string;
  tone: "success" | "error" | "info";
} | null;

const statusFilterOptions: { value: "ALL" | RequestStatus; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "REQUESTED", label: "Requested" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "ARRIVED", label: "Arrived" },
  { value: "COLLECTED", label: "Collected" },
];

export default function DashboardPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImportStaffOpen, setIsImportStaffOpen] = useState(false);

  const [isRoleLimitsOpen, setIsRoleLimitsOpen] = useState(false);

  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [uniformOptions, setUniformOptions] = useState<UniformItemOption[]>([]);
  const [roleLimits, setRoleLimits] = useState<RoleLimit[]>([]);

  const [statusFilter, setStatusFilter] = useState<"ALL" | RequestStatus>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    void refreshData();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : req.status === statusFilter;
      const matchesSearch = searchTerm
        ? (req.staffName + " " + req.uniformItem)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchTerm]);

  async function fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(url, { cache: "no-store" });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${url} failed: ${text}`);
    }
  
    return res.json();
  }


  async function refreshData() {
    setIsLoading(true);
    setError(null);
  
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
      ]);
  
      setRequests(Array.isArray(requestsData) ? requestsData : []);
      setStaffOptions(Array.isArray(staffData) ? staffData : []);
      setUniformOptions(Array.isArray(uniformData) ? uniformData : []);
      setRoleLimits(Array.isArray(roleLimitsData) ? roleLimitsData : []);
  
    } catch (err: any) {
      setError(err.message ?? "Something went wrong loading data");
    } finally {
      setIsLoading(false);
    }
  }

  function showToast(next: ToastState) {
    setToast(next);
    if (next) {
      window.setTimeout(() => {
        setToast(null);
      }, 4000);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 text-zinc-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Uniform Ordering System
          </h1>
          <p className="text-sm text-zinc-600">
            Submit and track staff uniform requests in one simple place.
          </p>
        </header>

        <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50"
              >
                <span className="text-xs">⬆</span>
                Upload Uniform 
              </button>
              <button
                type="button"
                onClick={() => setIsImportStaffOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50"
              >
                <span className="text-xs">⬆</span>
                Upload Staff 
              </button>
              <button
                type="button"
                onClick={() => setIsRoleLimitsOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50"
              >
                <span className="text-xs">⚙</span>
                Set Role Limits
              </button>
            </div>

            <div className="flex flex-wrap gap-2 sm:items-center">
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="status-filter">
                  Filter by status
                </label>
                <select
                  id="status-filter"
                  className="h-9 rounded-full border border-zinc-300 bg-white px-3 text-xs text-zinc-800 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
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
              </div>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="search">
                  Search by staff or item
                </label>
                <input
                  id="search"
                  type="search"
                  placeholder="Search staff or item"
                  className="h-9 min-w-[180px] flex-1 rounded-full border border-zinc-300 bg-zinc-50 px-3 text-xs text-zinc-800 shadow-inner focus:border-zinc-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsNewRequestOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-zinc-50 shadow-sm hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <span className="text-base leading-none">＋</span>
                New Request
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

      {isNewRequestOpen && (
        <NewRequestModal
          staffOptions={staffOptions}
          uniformOptions={uniformOptions}
          roleLimits={roleLimits}
          onClose={() => setIsNewRequestOpen(false)}
          onCreated={(newRequest) => {
            setRequests((prev) => [newRequest, ...prev]);
            showToast({
              message: "Uniform request submitted",
              tone: "success",
            });
          }}
          onError={(message) =>
            showToast({
              message,
              tone: "error",
            })
          }
        />
      )}

      {isImportOpen && (
        <ImportCsvModal
          type="uniform"
          onClose={() => setIsImportOpen(false)}
          onImported={({ summaryMessage }) => {
            showToast({ message: summaryMessage, tone: "success" });
            void refreshData();
          }}
          onError={(message) =>
            showToast({
              message,
              tone: "error",
            })
          }
        />
      )}
        {isImportStaffOpen && (
        <ImportCsvModal
          type="staff"
          onClose={() => setIsImportStaffOpen(false)}
          onImported={({ summaryMessage }) => {
            showToast({ message: summaryMessage, tone: "success" });
            void refreshData();
          }}
          onError={(message) =>
            showToast({
              message,
              tone: "error",
            })
          }
        />
      )}

      {isRoleLimitsOpen && (
        <RoleLimitModal
          roleLimits={roleLimits}
          onClose={() => setIsRoleLimitsOpen(false)}
          onChange={(next) => {
            setRoleLimits(next);
            showToast({
              message: "Role limits updated",
              tone: "success",
            });
          }}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
          <div
            className={`pointer-events-auto max-w-sm rounded-lg px-4 py-3 text-sm shadow-lg ring-1 ${
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
  );
}

