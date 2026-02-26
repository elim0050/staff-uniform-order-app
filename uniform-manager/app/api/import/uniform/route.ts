import { NextResponse } from "next/server"
import { importCSV } from "@/services/importService"

export async function POST(req: Request) {
    const csvText = await req.text()
    console.log("csvText", csvText)
    const result = await importCSV(csvText)
    console.log("hi", result)
    return NextResponse.json(result)
}