import { NextResponse } from "next/server"
import { listRoles } from "@/services/rolesService"

/**
 * Retrieves all roles formatted for frontend usage.
 *
 * Returns:
 * - 200 with role list (empty array if none exist)
 * - 500 for unexpected server errors
 */
export async function GET() {
  try {
    const data = await listRoles()
    return NextResponse.json(data ?? [], { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to fetch roles." },
      { status: 500 }
    )
  }
}