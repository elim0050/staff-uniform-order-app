import { validateQuantity, validateStatus } from "@/utils/validators"
import { getStaffById, updateStaff } from "@/repositories/staffRepository"
import { getRoleById } from "@/repositories/roleRepository"
import { getUniformQuantity, updateQuantity, getAllUniforms } from "@/repositories/stockRepository"
import {
  insertRequest,
  insertRequestItems,
  getAllRequests,
  getFormattedRequests, 
  updateRequestStatus,
  getRequestedQuantityByStaffId
} from "@/repositories/requestRepository"
import { updateStaffItems } from "./staffService"


export async function createUniformRequest(payload: any) {
  const { staffId, items, reason } = payload
  console.log(staffId, items, reason)

  const staff = await getStaffById(staffId)
  const role = await getRoleById(staff.role_id)

  const _ = await validateRequest(staff, role, items)
  const request = await insertRequest(staffId, reason)

  await insertRequestItems(
    items.map((item: any) => ({
      request_id: request.id,
      uniform_item_id: item.uniform_item_id,
      quantity: item.quantity
    }))
  )

  for (const item of items) {
    await updateQuantity(item.uniform_item_id, item.quantity)
  }

  // check if need to update the staff last requested date
  const updateItem: any = {};

  // set last_request_date if none exists
  if (!staff.last_request_date) {
    updateItem.last_request_date = new Date().toISOString();
  }
  
  // check if the quantity == uniform limit, start cooldown
  const prevQty = (await getRequestedQuantityByStaffId(staff)) || 0;
  
  if (role.uniform_limit != null) {
    const currQty = getQuantity(items);
    if (currQty + prevQty >= role.uniform_limit) {
      updateItem.is_cooldown = true;
    }
  }
  
  // only update if there is something to update
  if (Object.keys(updateItem).length > 0) {
    const data = await updateStaff(staff.id, updateItem);
  }

  return request
}

export async function listRequests() {
  const requests = await getFormattedRequests()
  return requests 
}

export async function changeRequestStatus(id: string, status: string) {
  validateStatus(status)
  await updateRequestStatus(id, status)
}



export async function validateRequest(staff: any, role: any, items: any) {
  console.log("in validating request===============")
  // check if is cooldown days 
  if (staff.is_cooldown == true) {
    // check if cool down has finished 
    const cooldownEnd = new Date(
      new Date(staff.last_request_date).getTime() +
      role.cooldown_days * 24 * 60 * 60 * 1000
    );

    if (Date.now() < cooldownEnd.getTime()) {
      throw new Error("Cooldown period not finished")
    }
    else {
      const updateStaffItem = {
        "is_cooldown": false,
        "last_request_date": null
      }
      staff = await updateStaff(staff.id, updateStaffItem)
    }
  }

  for (const item of items) {
    validateQuantity(item.quantity)
    const stock = await getUniformQuantity(item.uniform_item_id)

    if (item.quantity > stock.stock_on_hand) {
      console.log(item.quantity, stock.stock_on_hand)
      throw new Error("Insufficient stock")
    }
  }


  // check the role.uniform_limit and the staff requested limit based on last requested date 
  const prevQty = await getRequestedQuantityByStaffId(staff)
  if (role.uniform_limit != null) {
    console.log("checking this requested quantity and uniform limit ----")
    const currQty = getQuantity(items)
    if (currQty + prevQty > role.uniform_limit) {
      const allowance = role.uniform_limit - prevQty;
      throw new Error(
        `Requested quantity exceeds this role's uniform limit. You can only request ${allowance} more.`
      );
    }
  }


}

function getQuantity(items: any) {
  const currQty = (items ?? []).reduce(
    (sum: number, item: any) => sum + Number(item.quantity ?? 0),
    0
  )
  return currQty

}
