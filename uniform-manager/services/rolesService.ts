import { updateRoleSettings, getAllRoles, getFormattedRoles } from "@/repositories/roleRepository"
import type { RoleSettingsRow } from "../types /types"
import {getStaffByRoleWithLastRequest, updateStaff} from "@/repositories/staffRepository"
import {getRequestedQuantityByStaffId} from "@/repositories/requestRepository"

export async function listRoles() {
    return await getFormattedRoles()
}


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


export async function updateRoles(
    role_id: string,
    updates: {
      cooldown_days?: number;
      uniform_limit?: number;
    }
  ) {
    // get all staff with this role and last_request_date not null
    const currStaff = await getStaffByRoleWithLastRequest(role_id);
  
    for (const staff of currStaff) {
      const staffUpdates: any = {};
  
      const reqQty = await getRequestedQuantityByStaffId(staff);
  
      if (updates.uniform_limit != null && reqQty >= updates.uniform_limit) {
        staffUpdates.is_cooldown = true;
      } else {
        staffUpdates.is_cooldown = false;
      }
  
      await updateStaff(staff.id, staffUpdates);
    }
  
    // update role settings
    return await updateRoleSettings(role_id, updates);
  }