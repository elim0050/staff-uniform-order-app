import { getAllStaff, getFormattedStaff, updateStaff } from "@/repositories/staffRepository"

export async function listStaff() {
  return await getFormattedStaff()
}

export async function updateStaffItems(staff_id : string, updatedItems : any ){
  return await updateStaff(staff_id , updatedItems)

}

