import {
  getFormattedStaff,
  updateStaff,
} from "@/repositories/staffRepository"

/**
 * Retrieves all staff formatted for frontend usage.
 *
 * Returns staff records mapped into the StaffOption structure
 * via the repository layer.
 *
 * @returns Array of formatted staff options.
 */
export async function listStaff() {
  return await getFormattedStaff()
}

/**
 * Updates a staff member's fields.
 *
 * Acts as a service-layer wrapper around the repository update function.
 *
 * @param staff_id - The ID of the staff member to update.
 * @param updatedItems - Partial staff fields to update.
 * @returns The updated staff record.
 */
export async function updateStaffItems(
  staff_id: string,
  updatedItems: any
) {
  return await updateStaff(staff_id, updatedItems)
}