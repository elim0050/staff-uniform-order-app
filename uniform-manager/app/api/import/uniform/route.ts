import { NextResponse } from "next/server"
import { importCSV } from "@/services/importService"

/**
 * Handles uniform CSV import.
 * Expects raw CSV text in the request body.
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

    const result = await importCSV(csvText)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to import CSV." },
      { status: 500 }
    )
  }
}