import { NextResponse } from "next/server"
import { createUniformRequest, listRequests } from "@/services/requestService"

/**
 * Creates a new uniform request.
 *
 * Returns:
 * - 200 on success
 * - 500 for unexpected server errors
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const result = await createUniformRequest(body)

    return NextResponse.json(result, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to create request." },
      { status: 500 }
    )
  }
}

/**
 * Retrieves all uniform requests.
 *
 * Returns:
 * - 200 with request list (empty array if none exist)
 * - 500 for unexpected server errors
 */
export async function GET() {
  try {
    const data = await listRequests()
    return NextResponse.json(data ?? [], { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to fetch requests." },
      { status: 500 }
    )
  }
}