import { NextResponse } from "next/server"
import { listUniforms } from "@/services/uniformService"

/**
 * Retrieves all uniform items formatted for frontend usage.
 *
 * Returns:
 * - 200 with uniform list (empty array if none exist)
 * - 500 for unexpected server errors
 */
export async function GET() {
  try {
    const uniforms = await listUniforms()
    return NextResponse.json(uniforms ?? [], { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to fetch uniforms." },
      { status: 500 }
    )
  }
}