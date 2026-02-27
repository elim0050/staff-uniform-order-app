import { createClient } from "../lib/supabase/client"
import { RequestRow, RequestStatus } from "../types /types"

const supabase = createClient()

type Request = {
  id: number
  staff_id: string
  created_date: string
}

type RequestItem = {
  id: number
  request_id: string
  quantity: number
}

/**
 * Creates a new request record for a staff member.
 *
 * @param staffId - The ID of the staff member making the request.
 * @param reason - Optional reason for the request.
 * @returns The inserted request record.
 * @throws Error if insertion fails.
 */
export async function insertRequest(staffId: string, reason?: string) {
  const { data, error } = await supabase
    .from("requests")
    .insert({ staff_id: staffId, reason })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Inserts multiple request items linked to a request.
 *
 * @param items - Array of request item objects.
 * @throws Error if insertion fails.
 */
export async function insertRequestItems(items: any[]) {
  const { error } = await supabase
    .from("request_items")
    .insert(items)

  if (error) throw error
}

/**
 * Updates the status of a request using its tracking number.
 *
 * @param trackingId - The tracking number of the request.
 * @param newStatus - The new request status.
 * @throws Error if update fails.
 */
export async function updateRequestStatus(
  trackingId: string,
  newStatus: string
) {
  const { data: existing, error: checkError } = await supabase
    .from("requests")
    .select("id")
    .eq("tracking_number", trackingId.trim())

  if (checkError) throw checkError
  if (!existing || existing.length === 0) return

  const { error } = await supabase
    .from("requests")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("tracking_number", trackingId.trim())

  if (error) throw error
}

/**
 * Retrieves all request records from the database.
 *
 * @returns Array of request records.
 * @throws Error if fetch fails.
 */
export async function getAllRequests() {
  const { data, error } = await supabase
    .from("requests")
    .select("*")

  if (error) throw error
  return data
}

/**
 * Calculates total requested quantity by a staff member
 * since their last request date (cooldown logic).
 *
 * @param staff - Staff object containing id and last_request_date.
 * @returns Total quantity requested.
 * @throws Error if any database query fails.
 */
export async function getRequestedQuantityByStaffId(staff: any) {
  let qty = 0

  if (!staff?.last_request_date) return qty

  const { data: requests, error: fetchError } = await supabase
    .from("requests")
    .select("id")
    .eq("staff_id", staff.id)
    .gte("created_at", staff.last_request_date)

  if (fetchError) throw fetchError

  const typedRequests = (requests as Request[]) || []

  for (const request of typedRequests) {
    const { data: reqItems, error: itemError } = await supabase
      .from("request_items")
      .select("quantity")
      .eq("request_id", request.id)

    if (itemError) throw itemError

    const typedItems = (reqItems as RequestItem[]) || []

    for (const item of typedItems) {
      qty += item.quantity
    }
  }

  return qty
}

type RawRequest = {
  id: string
  status: RequestStatus
  created_at: string
  tracking_number: string
  staff: {
    name: string
    is_cooldown: boolean
    role: {
      name: string
    }
  }
  request_items: {
    quantity: number
    uniform_items: {
      name: string
      stock_on_hand: number
      size: string
      ean: string
    }
  }[]
}

/**
 * Fetches all requests with related staff, role, and uniform item details,
 * then formats them into UI-friendly RequestRow objects.
 *
 * @returns Array of formatted request rows.
 * @throws Error if fetch fails.
 */
export async function getFormattedRequests(): Promise<RequestRow[]> {
  const { data, error } = await supabase
    .from("requests")
    .select(`
      id,
      status,
      created_at,
      tracking_number,
      staff:staff_id (
        name,
        is_cooldown,
        role:role_id ( name )
      ),
      request_items (
        quantity,
        uniform_items (
          name,
          stock_on_hand,
          size,
          ean
        )
      )
    `)
    .returns<RawRequest[]>()

  if (error) throw error

  return (data || []).map((req) => {
    const staff = req.staff
    const role = staff?.role
    const item = req.request_items?.[0]
    const uniform = item?.uniform_items

    return {
      id: req.id,
      staffName: staff?.name ?? "",
      staffRole: role?.name ?? null,
      uniformItem: uniform?.name ?? "",
      quantity: item?.quantity ?? 0,
      status: req.status,
      requestedAt: req.created_at,
      lowStock: uniform ? uniform.stock_on_hand < 5 : false,
      onCooldown: staff?.is_cooldown ?? false,
      uniformSize: uniform?.size ?? "",
      uniformEan: uniform?.ean ?? "",
      trackingNum: req.tracking_number,
    }
  })
}

/**
 * Fetches a single request using its tracking number
 * and returns formatted RequestRow data.
 *
 * @param tracking_num - The tracking number of the request.
 * @returns Formatted request rows or null if not found.
 */
export async function getRequestByTrackingNumber(
  tracking_num: string
): Promise<RequestRow[] | null> {
  const { data, error } = await supabase
    .from("requests")
    .select(`
      id,
      status,
      created_at,
      staff:staff_id (
        name,
        is_cooldown,
        role:role_id ( name )
      ),
      request_items (
        quantity,
        uniform_items (
          name,
          stock_on_hand,
          ean,
          size
        )
      )
    `)
    .eq("tracking_number", tracking_num)
    .returns<RawRequest[]>()

  if (error || !data || data.length === 0) return null

  return data.map((req) => {
    const staff = req.staff
    const role = staff?.role
    const item = req.request_items?.[0]
    const uniform = item?.uniform_items

    return {
      id: req.id,
      staffName: staff?.name ?? "",
      staffRole: role?.name ?? null,
      uniformItem: uniform?.name ?? "",
      quantity: item?.quantity ?? 0,
      status: req.status,
      requestedAt: req.created_at,
      lowStock: uniform ? uniform.stock_on_hand < 5 : false,
      onCooldown: staff?.is_cooldown ?? false,
      uniformSize: uniform?.size ?? "",
      uniformEan: uniform?.ean ?? "",
      trackingNum: tracking_num,
    }
  })
}