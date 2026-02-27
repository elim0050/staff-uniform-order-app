import {
  updateRoleSettings,
  getAllRoles,
  getFormattedRoles,
} from "@/repositories/roleRepository"
import type { RoleSettingsRow } from "../types /types"
import {
  getStaffByRoleWithLastRequest,
  updateStaff,
} from "@/repositories/staffRepository"
import { getRequestedQuantityByStaffId } from "@/repositories/requestRepository"

/**
 * Returns roles formatted for frontend consumption (RoleLimit[] shape).
 *
 * @returns Formatted role list.
 */
export async function listRoles() {
  return await getFormattedRoles()
}

/**
 * Returns raw role settings formatted for a role settings table UI.
 *
 * @returns Array of RoleSettingsRow objects.
 */
export async function listRoleSettings(): Promise<RoleSettingsRow[]> {
  const roles = await getAllRoles()

  if (!roles) {
    return []
  }

  return roles.map((role: any) => ({
    id: role.id,
    roleName: role.name ?? "",
    uniformLimit: role.uniform_limit ?? 0,
    cooldownDays: role.cooldown_days ?? 0,
  }))
}

/**
 * Updates role settings and recalculates cooldown state for staff in that role.
 *
 * For each staff member with a last_request_date set:
 * - Recomputes requested quantity since last_request_date
 * - Sets staff.is_cooldown based on updated uniform_limit
 * Then updates the role settings in the roles table.
 *
 * @param role_id - Role ID to update.
 * @param updates - Partial role settings to apply.
 * @returns Updated role record.
 */
export async function updateRoles(
  role_id: string,
  updates: {
    cooldown_days?: number
    uniform_limit?: number
  }
) {
  // Fetch staff for the given role who have a last_request_date set.
  const currStaff = await getStaffByRoleWithLastRequest(role_id)

  // Recalculate cooldown flags based on the updated uniform_limit.
  for (const staff of currStaff) {
    const staffUpdates: any = {}

    const reqQty = await getRequestedQuantityByStaffId(staff)

    staffUpdates.is_cooldown =
      updates.uniform_limit != null && reqQty >= updates.uniform_limit

    await updateStaff(staff.id, staffUpdates)
  }

  // Apply role settings updates.
  return await updateRoleSettings(role_id, updates)
}