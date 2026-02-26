import { NextResponse } from "next/server"
import { listUniforms } from "@/services/uniformService"

export async function GET() {
  const uniforms = await listUniforms()
  return NextResponse.json(uniforms)
}

