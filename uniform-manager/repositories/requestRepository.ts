import { createClient } from "../lib/supabase/client"
const supabase = createClient()

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

export async function getAllRequests() {
  const { data, error } = await supabase
    .from("requests")
    .select(`
      id,
      status,
      created_at,
      staff:staff_id(name),
      request_items(
        quantity,
        uniform_items(sku, size)
      )
    `)

  if (error) throw error
  return data
}

export async function updateRequestStatus(id: string, status: string) {
  const { error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", id)

  if (error) throw error
}