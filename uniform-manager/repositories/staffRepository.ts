import { createClient } from "../lib/supabase/client"
import { StaffOption } from "../types /types"

const supabase = createClient()

/**
 * Fetch a single staff member by ID.
 *
 * @param id - The unique staff ID.
 * @returns The staff record.
 * @throws Error if the query fails.
 */
export async function getStaffById(id: string) {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

/**
 * Retrieve all staff records from the database.
 *
 * @returns Array of staff records.
 * @throws Error if the query fails.
 */
export async function getAllStaff() {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    
  if (error) throw error
  return data
}

/**
 * Retrieve staff members by role who have a last_request_date set.
 * Useful for enforcing cooldown or request limits.
 *
 * @param roleId - The role ID to filter staff by.
 * @returns Array of matching staff records.
 * @throws Error if the query fails.
 */
export async function getStaffByRoleWithLastRequest(roleId: string ) {
  const { data: staff, error } = await supabase
    .from("staff")
    .select("*")
    .eq("role_id", roleId)       // filter by role
    .not("last_request_date", "is", null); // only staff with a last_request_date

  if (error) throw error;

  return staff;
}

/**
 * Update a staff member's record.
 *
 * @param staff_id - The staff ID to update.
 * @param updatedItems - Object containing fields to update.
 * @returns The updated staff record.
 * @throws Error if the update fails.
 */
export async function updateStaff(staff_id : string , updatedItems : any){
    const { data, error } = await supabase
      .from("staff")
      .update(updatedItems)
      .eq("id", staff_id)
      .select()
      .single()
  
    if (error) throw error
    return data
}

/**
 * Retrieve staff with related role information and format
 * the result into StaffOption objects for frontend usage.
 *
 * @returns Array of formatted staff options.
 * @throws Error if the query fails.
 */
export async function getFormattedStaff(): Promise<StaffOption[]> {
  const { data, error } = await supabase
    .from("staff")
    .select(`
      id,
      name,
      store,
      last_request_date,
      roles:role_id (
        name
      )
    `);

  if (error) throw error;

  const formatted: StaffOption[] = (data || []).map((req: any) => ({
    id: req.id,
    name: req.name,
    roleName: req.role?.name ?? null,
    roleId: req.role_id,
    lastRequestDate: req.last_request_date
  }));

  return formatted;
}