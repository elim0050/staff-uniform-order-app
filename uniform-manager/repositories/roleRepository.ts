import { createClient } from "../lib/supabase/client"
import { RoleLimit } from "@/types /types"
const supabase = createClient()

export async function getRoleById(id: string) {

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function getAllRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")

  if (error) throw error
  return data
}

export async function updateRoleSettings(
  role_id: string,
  updates: {
    cooldown_days?: number
    uniform_limit?: number
  }
) {
  const { data, error } = await supabase
    .from("roles")
    .update(updates)
    .eq("id", role_id)
    .select()
    .single()

  if (error) throw error
  return data
}


export async function getFormattedRoles(): Promise<RoleLimit[]> {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name, uniform_limit, cooldown_days");

  if (error) throw error;

  return (data || []).map((r: any) => ({
    role: r.name,
    maxItemsPerPeriod: r.uniform_limit,
    periodMonths: r.period_months ?? 0,
    cooldownDays: r.cooldown_days,
  }));
}