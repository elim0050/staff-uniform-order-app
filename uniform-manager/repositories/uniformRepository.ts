import { createClient } from "../lib/supabase/client"
import { UniformItemOption } from "@/types /types"
const supabase = createClient()

export async function getAllUniforms() {
  const { data, error } = await supabase
    .from("uniform_items")
    .select("*")

  if (error) throw error
  return data
}

export async function getFormattedUniforms(): Promise<UniformItemOption[]> {
    const { data, error } = await supabase
      .from("uniform_items")
      .select("id, name, size, stock_on_hand");
  
    if (error) throw error;
  
    return (data || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      size: u.size ?? null,
      stockOnHand: u.stock_on_hand,
      lowStock: (u.stock_on_hand ?? 0) < 5, // adjust threshold if needed
    }));
  }