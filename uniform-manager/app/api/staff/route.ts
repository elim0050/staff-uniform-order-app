import { NextResponse } from "next/server"
import { listStaff } from "@/services/staffService"

export async function GET() {
  const staff = await listStaff()
  return NextResponse.json(staff)
}

