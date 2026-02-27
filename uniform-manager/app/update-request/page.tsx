"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Page for dispatch staff to navigate to a specific request
 * using a tracking number.
 */
export default function UpdateRequestPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const router = useRouter()

  /**
   * Navigates to the request detail page if a valid tracking
   * number is entered.
   */
  function handleSubmit() {
    const trimmed = trackingNumber.trim()
    if (!trimmed) return

    router.push(`/update-request/${trimmed}`)
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      {/* Page container (top-aligned, not centered) */}
      <div className="mx-auto w-full max-w-md flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Dispatch Update
          </h1>
          <p className="text-sm text-zinc-600">
            Enter the order tracking number to update its status.
          </p>
        </header>

        {/* Input Section */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tracking number"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}