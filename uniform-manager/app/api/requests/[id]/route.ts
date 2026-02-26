import { NextResponse } from "next/server"
import { changeRequestStatus } from "@/services/requestService"

export async function PATCH(req: Request, { params }: any) {
  try {
    const body = await req.json()
    await changeRequestStatus(params.id, body.status)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}