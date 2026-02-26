import { NextResponse } from "next/server"
import { importStaffCSV } from "@/services/importService"

export async function POST(req: Request) {
    const csvText = await req.text()
    const result = await importStaffCSV(csvText)
    return NextResponse.json(result)
}