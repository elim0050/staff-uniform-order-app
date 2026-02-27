import { NextResponse } from "next/server"
import { importStaffCSV } from "@/services/importService"

/**
 * Handles staff CSV import.
 * Accepts raw CSV text in the request body.
 */
export async function POST(req: Request) {
  try {
    const csvText = await req.text()

    if (!csvText) {
      return NextResponse.json(
        { error: "CSV content is empty." },
        { status: 400 }
      )
    }

    const result = await importStaffCSV(csvText)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to import staff CSV." },
      { status: 500 }
    )
  }
}