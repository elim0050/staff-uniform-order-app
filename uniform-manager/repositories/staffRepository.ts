import { createClient } from "../lib/supabase/client"
import {StaffOption} from "../types /types"

const supabase = createClient()

export async function getStaffById(id: string) {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}


export async function getAllStaff() {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    
  if (error) throw error
  return data
}

export async function getStaffByRoleWithLastRequest(roleId: string ) {
  const { data: staff, error } = await supabase
    .from("staff")
    .select("*")
    .eq("role_id", roleId)       // filter by role
    .not("last_request_date", "is", null); // only staff with a last_request_date

  if (error) throw error;

  return staff;
}

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