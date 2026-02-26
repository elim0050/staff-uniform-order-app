import { NextResponse } from "next/server"
import { listRoles } from "@/services/rolesService"


export async function GET() {
  const data = await listRoles()
  return NextResponse.json(data)
}

