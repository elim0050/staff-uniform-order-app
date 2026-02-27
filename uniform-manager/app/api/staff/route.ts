import { NextResponse } from "next/server"
import { listStaff } from "@/services/staffService"

/**
 * Retrieves all staff formatted for frontend usage.
 *
 * Returns:
 * - 200 with staff list (empty array if none exist)
 * - 500 for unexpected server errors
 */
export async function GET() {
  try {
    const staff = await listStaff()
    return NextResponse.json(staff ?? [], { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to fetch staff." },
      { status: 500 }
    )
  }
}