import { validateQuantity, validateStatus } from "@/utils/validators"
import { getStaffById, updateStaff } from "@/repositories/staffRepository"
import { getRoleById } from "@/repositories/roleRepository"
import {
  getUniformQuantity,
  updateQuantity,
} from "@/repositories/stockRepository"
import {
  insertRequest,
  insertRequestItems,
  getFormattedRequests,
  updateRequestStatus,
  getRequestedQuantityByStaffId,
  getRequestByTrackingNumber,
  getFormattedRequestById,
} from "@/repositories/requestRepository"


/**
 * Creates a uniform request for a staff member.
 *
 * Steps:
 * - Load staff and role information
 * - Validate request (cooldown, limits, and stock availability)
 * - Insert request and request items
 * - Deduct stock for each requested item
 * - Update staff last_request_date and cooldown flag where applicable
 *
 * @param payload - Request payload containing staffId, items, and optional reason.
 * @returns The created request record.
 */
export async function createUniformRequest(payload: any) {
  const { staffId, items, reason } = payload

  const staff = await getStaffById(staffId)
  const role = await getRoleById(staff.role_id)

  await validateRequest(staff, role, items)

  const request = await insertRequest(staffId, reason)

  await insertRequestItems(
    items.map((item: any) => ({
      request_id: request.id,
      uniform_item_id: item.uniform_item_id,
      quantity: item.quantity,
    }))
  )

  // Deduct stock for each requested item.
  for (const item of items) {
    await updateQuantity(item.uniform_item_id, item.quantity)
  }

  // Prepare staff updates after request creation.
  const updateItem: any = {}

  // Set last_request_date if none exists.
  if (!staff.last_request_date) {
    updateItem.last_request_date = new Date().toISOString()
  }

  // Update cooldown if the request reaches the role uniform limit.
  const prevQty = (await getRequestedQuantityByStaffId(staff)) || 0

  if (role.uniform_limit != null) {
    const currQty = getQuantity(items)
    if (currQty + prevQty >= role.uniform_limit) {
      updateItem.is_cooldown = true
    }
  }

  // Apply staff updates only when needed.
  if (Object.keys(updateItem).length > 0) {
    await updateStaff(staff.id, updateItem)
  }
  const formattedReq = await getFormattedRequestById(request.id)

  return formattedReq
}

/**
 * Retrieves all requests formatted for UI consumption.
 *
 * @returns Array of formatted requests.
 */
export async function listRequests() {
  const requests = await getFormattedRequests()
  return requests
}

/**
 * Updates a request status using its tracking number.
 *
 * @param id - Request tracking number.
 * @param status - New status value.
 */
export async function changeRequestStatus(id: string, status: string) {
  validateStatus(status)
  await updateRequestStatus(id, status)
}

/**
 * Validates a uniform request for:
 * - Staff cooldown rules
 * - Requested quantities
 * - Stock availability
 * - Role uniform limit enforcement
 *
 * If a cooldown has expired, it clears staff cooldown status and last_request_date.
 *
 * @param staff - Staff record.
 * @param role - Role record (includes uniform_limit and cooldown_days).
 * @param items - Requested items array.
 * @throws Error if any validation fails.
 */
export async function validateRequest(staff: any, role: any, items: any) {
  // Check cooldown status and enforce cooldown window.
  if (staff.is_cooldown == true) {
    const cooldownEnd = new Date(
      new Date(staff.last_request_date).getTime() +
        role.cooldown_days * 24 * 60 * 60 * 1000
    )

    if (Date.now() < cooldownEnd.getTime()) {
      throw new Error("Cooldown period not finished")
    } else {
      const updateStaffItem = {
        is_cooldown: false,
        last_request_date: null,
      }
      staff = await updateStaff(staff.id, updateStaffItem)
    }
  }

  // Validate each item quantity and ensure stock is sufficient.
  for (const item of items) {
    validateQuantity(item.quantity)
    const stock = await getUniformQuantity(item.uniform_item_id)

    if (item.quantity > stock.stock_on_hand) {
      throw new Error("Insufficient stock")
    }
  }

  // Enforce role uniform limit based on staff's previous requests.
  const prevQty = await getRequestedQuantityByStaffId(staff)

  if (role.uniform_limit != null) {
    const currQty = getQuantity(items)

    if (currQty + prevQty > role.uniform_limit) {
      const allowance = role.uniform_limit - prevQty
      throw new Error(
        `Requested quantity exceeds this role's uniform limit. You can only request ${allowance} more.`
      )
    }
  }
}

/**
 * Calculates total quantity across requested items.
 *
 * @param items - Requested items array.
 * @returns Total quantity requested.
 */
function getQuantity(items: any) {
  const currQty = (items ?? []).reduce(
    (sum: number, item: any) => sum + Number(item.quantity ?? 0),
    0
  )
  return currQty
}

/**
 * Retrieves request details by tracking number.
 *
 * @param tracking_num - The tracking number to look up.
 * @returns Formatted request rows, or null if not found.
 */
export async function getRequestByTrackingNum(tracking_num: string) {
  const getReq = await getRequestByTrackingNumber(tracking_num)
  return getReq
}