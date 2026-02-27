import { NextResponse } from "next/server"
import {
  changeRequestStatus,
  getRequestByTrackingNum,
} from "@/services/requestService"

/**
 * Updates the status of a request by tracking number.
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const body = await request.json()
  const { id } = await context.params

  if (!body?.status) {
    return NextResponse.json(
      { error: "Status is required." },
      { status: 400 }
    )
  }

  try {
    await changeRequestStatus(id, body.status)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal server error" },
      { status: 500 }
    )
  }
}


/**
 * Retrieves request details by tracking number.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id || !id.trim()) {
      return NextResponse.json(
        { error: "Tracking number is required." },
        { status: 400 }
      )
    }

    const requestData = await getRequestByTrackingNum(id)

    if (!requestData) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(requestData, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to fetch request." },
      { status: 500 }
    )
  }
}