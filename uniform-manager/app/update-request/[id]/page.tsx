"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type RequestRow, type RequestStatus } from "@/types /types";

const statusOptions: RequestStatus[] = ["REQUESTED", "DISPATCHED", "ARRIVED", "COLLECTED"];

export default function RequestDetailPage() {
  const params = useParams();
  const trackingNumber = params.id as string;
  const router = useRouter();

  const [request, setRequest] = useState<RequestRow | null>(null);
  const [newStatus, setNewStatus] = useState<RequestStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchRequest() {
      setLoading(true);
      try {
        const res = await fetch(`/api/requests/${trackingNumber}`);
        const data = await res.json();
        if (!res.ok || data.error) {
          alert(data.error || "Request not found");
          setRequest(null);
          return;
        }
        setRequest(data[0] ?? null);
        setNewStatus(data[0]?.status ?? "");
      } catch (err) {
        console.error(err);
        alert("Failed to fetch request");
      } finally {
        setLoading(false);
      }
    }
    fetchRequest();
  }, [trackingNumber]);

  async function handleUpdateStatus() {
    if (!request || !newStatus) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/requests/${trackingNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Failed to update status");
        return;
      }

      setRequest({ ...request, status: newStatus });
      alert("Status updated successfully!");
      router.push(`/update-request`);

    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!request) return <div className="p-6">Request not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Request Details</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex justify-between">
            <span className="font-semibold">Tracking Number:</span>
            <span>{trackingNumber}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Staff:</span>
            <span>{request.staffName} ({request.staffRole})</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Item:</span>
            <span>{request.uniformItem} × {request.quantity}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Requested At:</span>
            <span>{new Date(request.requestedAt).toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Low Stock:</span>
            <span>{request.lowStock ? "Yes" : "No"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">On Cooldown:</span>
            <span>{request.onCooldown ? "Yes" : "No"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold">Current Status:</span>
            <span className="px-2 py-1 rounded-full border text-sm">{request.status}</span>
          </div>

          <div className="mt-4 flex gap-2">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
              className="flex-1 rounded border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button
              onClick={handleUpdateStatus}
              disabled={updating}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-zinc-400"
            >
              {updating ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}