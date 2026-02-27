import { createClient } from "../lib/supabase/client"
import { UniformItemOption } from "@/types /types"

const supabase = createClient()

/**
 * Fetch uniform items and format them for frontend usage.
 *
 * @returns Array of formatted uniform item options.
 * @throws Error if the database query fails.
 */
export async function getFormattedUniforms(): Promise<UniformItemOption[]> {
  const { data, error } = await supabase
    .from("uniform_items")
    .select("id, name, size, stock_on_hand")

  if (error) throw error

  return (data || []).map((u: any) => ({
    id: u.id,
    name: u.name,
    size: u.size ?? null,
    stockOnHand: u.stock_on_hand,
    lowStock: (u.stock_on_hand ?? 0) < 5,
  }))
}