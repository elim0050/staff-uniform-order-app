import { createClient } from "../lib/supabase/client"
const supabase = createClient()
import {RequestRow, RequestStatus} from "../types /types"

type Request = {
  id: number;
  staff_id: string;
  created_date: string;
};


type RequestItem = {
  id: number;
  request_id: string;
  quantity: number;
};

export async function insertRequest(staffId: string, reason?: string) {
  const { data, error } = await supabase
    .from("requests")
    .insert({ staff_id: staffId, reason })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function insertRequestItems(items: any[]) {
  const { error } = await supabase
    .from("request_items")
    .insert(items)

  if (error) throw error
}

export async function updateRequestStatus(trackingId: string, newStatus: string) {
  console.log("Attempting update:", trackingId, newStatus);

  // Check if row exists first
  const { data: existing, error: checkError } = await supabase
    .from("requests")
    .select("*")
    .eq("tracking_number", trackingId)

  if (checkError) throw checkError;
  if (!existing || existing.length === 0) {
    console.log("No rows found with tracking_number:", trackingId);
    return;
  }

  // Attempt update
  const { data, error } = await supabase
    .from("requests")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("tracking_number", trackingId.trim())
    .select();

  console.log("Update result:", data, error);
  if (error) throw error;
}

export async function getAllRequests() {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
  if (error) throw error
  return data
}

export async function getRequestedQuantityByStaffId(staff: any) {
  console.log(staff)
  let qty = 0 

  // means previously requested need to check between the timeframe 
  if (staff.last_request_date != null ){
    const { data: requests, error: fetchError } = await supabase
    .from("requests")
    .select("*")
    .eq("staff_id", staff.id)
    .gte("created_at", staff.last_request_date); // just compare full timestamp
  
    if (fetchError) throw fetchError
  
    console.log(requests)
    // check the request_items quantity
    const typedRequests = requests as Request[] || null;
    console.log("IM request", typedRequests)
    for (const request of typedRequests || []) {
      const { data : reqItem, error: fetchError } = await supabase
      .from("request_items")
      .select("*")
      .eq("request_id",request.id )
  
      console.log(reqItem)
      if (fetchError) throw fetchError
      const typedRequestItem = reqItem as RequestItem[] || null;
      for (const requestItem of typedRequestItem || null ){
          qty += requestItem.quantity 
      }
  
    }
    console.log("quantity = ", qty)
  }
  return qty 
}

type RawRequest = {
  id: string;
  status: RequestStatus;
  created_at: string;
  staff: {
    name: string;
    is_cooldown: boolean;
    role: {
      name: string;
    };
  };
  request_items: {
    quantity: number;
    uniform_items: {
      name: string;
      stock_on_hand: number;
    };
  }[];
};

export async function getFormattedRequests(): Promise<RequestRow[]> {
  const { data, error } = await supabase
    .from("requests")
    .select(`
      id,
      status,
      created_at,
      staff:staff_id (
        name,
        is_cooldown,
        role:role_id (
          name
        )
      ),
      request_items (
        quantity,
        uniform_items (
          name,
          stock_on_hand
        )
      )
    `)
    .returns<RawRequest[]>(); // 
  console.log("Supabase data:", data);
  console.log("Supabase error:", error);
  if (error) throw error;

  const formatted: RequestRow[] = (data || []).map(req => {
    const staff = req.staff;
    const role = staff?.role;
    const item = req.request_items?.[0];
    const uniform = item?.uniform_items;

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
    };
  });

  return formatted;
}


export async function getRequestByTrackingNumber(tracking_num: string): Promise<RequestRow[] | null> {
  const { data, error } = await supabase
    .from("requests")
    .select(`
      id,
      status,
      created_at,
      staff:staff_id (
        name,
        is_cooldown,
        role:role_id (
          name
        )
      ),
      request_items (
        quantity,
        uniform_items (
          name,
          stock_on_hand
        )
      )
    `)
    .eq("tracking_number", tracking_num)
    .returns<RawRequest[]>(); // <-- same as getFormattedRequests

  console.log("Supabase data:", data);
  console.log("Supabase error:", error);

  if (error) {
    console.error("Error fetching request:", error.message);
    return null;
  }

  if (!data || data.length === 0) return null;

  // Format exactly like getFormattedRequests
  const formatted: RequestRow[] = data.map((req) => {
    const staff = req.staff;
    const role = staff?.role;
    const item = req.request_items?.[0];
    const uniform = item?.uniform_items;

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
    };
  });

  return formatted;
}