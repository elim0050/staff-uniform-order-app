import { NextResponse } from "next/server"
import { createUniformRequest, listRequests } from "@/services/requestService"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await createUniformRequest(body)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function GET() {
  const data = await listRequests()
  console.log("reuets", data)
  return NextResponse.json(data)
}