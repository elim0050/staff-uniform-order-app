"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpdateRequestPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const router = useRouter();

  function handleSubmit() {
    if (!trackingNumber.trim()) return;

    // Navigate to the request detail page
    router.push(`/update-request/${trackingNumber.trim()}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 bg-zinc-50">
      <h1 className="text-2xl font-semibold">Dispatch Update</h1>
      <p className="text-sm text-zinc-600">Enter the order tracking number:</p>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tracking number"
          className="rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}