import { NextResponse } from "next/server"
import { changeRequestStatus, getRequestByTrackingNum } from "@/services/requestService"

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {  try {
    const body = await request.json()
    const { id } = await context.params; // 👈 THIS IS THE FIX
    console.log("woiiiiiiiiiii")
    console.log(body.status, id)

    await changeRequestStatus(id, body.status)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}



export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 👈 THIS IS THE FIX
    console.log("in update request showing detail page : ",id)
    const requestData = await getRequestByTrackingNum(id);

    if (!requestData) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(requestData);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 400 }
    );
  }
}