import { createClient } from "../lib/supabase/client"
const supabase = createClient()

export async function getUniformQuantity(id: string) {
  const { data, error } = await supabase
    .from("uniform_items")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function updateQuantity(id: string, quantity: number) {
  const { data, error } = await supabase.rpc("deduct_stock", {
    item_id: id,
    qty: quantity
  })

  if (error) throw error
  return data
}

export async function getAllUniforms() {
  const { data, error } = await supabase
    .from("uniform_items")
    .select("*")

  if (error) throw error
  return data
}

