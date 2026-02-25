import { createClient } from "../lib/supabase/client"

export async function getRoleById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}