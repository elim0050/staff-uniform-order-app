import { createClient } from "../lib/supabase/client"
const supabase = createClient()

/**
 * Retrieve a single uniform item by its ID.
 *
 * @param id - The unique identifier of the uniform item.
 * @returns The uniform item record.
 * @throws Error if the query fails.
 */
export async function getUniformQuantity(id: string) {
  const { data, error } = await supabase
    .from("uniform_items")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

/**
 * Deduct stock quantity for a uniform item using
 * the `deduct_stock` database RPC function.
 *
 * @param id - The uniform item ID.
 * @param quantity - The quantity to deduct.
 * @returns The result returned by the RPC function.
 * @throws Error if the RPC call fails.
 */
export async function updateQuantity(id: string, quantity: number) {
  const { data, error } = await supabase.rpc("deduct_stock", {
    item_id: id,
    qty: quantity
  })

  if (error) throw error
  return data
}

