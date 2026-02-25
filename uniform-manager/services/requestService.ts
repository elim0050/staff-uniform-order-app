import { validateQuantity, validateStatus } from "@/utils/validators"
import { getStaffById } from "@/repositories/staffRepository"
import { getRoleById } from "@/repositories/roleRepository"
import { getStockById, deductStock } from "@/repositories/stockRepository"
import {
  insertRequest,
  insertRequestItems,
  getAllRequests,
  updateRequestStatus
} from "@/repositories/requestRepository"

export async function createUniformRequest(payload: any) {
  const { staffId, items, reason } = payload

  const staff = await getStaffById(staffId)
  const role = await getRoleById(staff.role_id)

  // Cooldown check
  if (staff.last_request_date) {
    const last = new Date(staff.last_request_date)
    const now = new Date()
    const diff =
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)

    if (diff < role.cooldown_days) {
      throw new Error("Cooldown period not finished")
    }
  }

  // Validate stock
  for (const item of items) {
    validateQuantity(item.quantity)
    const stock = await getStockById(item.uniform_item_id)

    if (item.quantity > stock.stock_on_hand) {
      throw new Error("Insufficient stock")
    }
  }

  const request = await insertRequest(staffId, reason)

  await insertRequestItems(
    items.map((item: any) => ({
      request_id: request.id,
      uniform_item_id: item.uniform_item_id,
      quantity: item.quantity
    }))
  )

  for (const item of items) {
    await deductStock(item.uniform_item_id, item.quantity)
  }

  return request
}

export async function listRequests() {
  return await getAllRequests()
}

export async function changeRequestStatus(id: string, status: string) {
  validateStatus(status)
  await updateRequestStatus(id, status)
}