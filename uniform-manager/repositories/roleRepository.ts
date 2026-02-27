import { createClient } from "../lib/supabase/client"
import { RoleLimit } from "@/types /types"

const supabase = createClient()

/**
 * Fetch a single role by its ID.
 *
 * @param id - The unique role ID.
 * @returns The role record.
 * @throws Error if role is not found or query fails.
 */
export async function getRoleById(id: string) {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

/**
 * Retrieve all roles from the database.
 *
 * @returns Array of role records.
 * @throws Error if query fails.
 */
export async function getAllRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")

  if (error) throw error
  return data
}

/**
 * Update configurable role settings such as cooldown
 * and uniform request limits.
 *
 * @param role_id - The role ID to update.
 * @param updates - Partial role settings to update.
 * @returns Updated role record.
 * @throws Error if update fails.
 */
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

/**
 * Fetch roles and format them into RoleLimit objects
 * used by the frontend settings UI.
 *
 * Maps database fields into UI-friendly structure.
 *
 * @returns Array of formatted RoleLimit objects.
 * @throws Error if query fails.
 */
export async function getFormattedRoles(): Promise<RoleLimit[]> {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name, uniform_limit, cooldown_days")

  if (error) throw error

  return (data || []).map((r) => ({
    role: r.name,
    maxItemsPerPeriod: r.uniform_limit,
    cooldownDays: r.cooldown_days,
  }))
}