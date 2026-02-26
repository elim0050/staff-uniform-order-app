export function validateQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Quantity must be a positive integer")
    }
  }
  
  export function validateStatus(status: string) {
    const allowed = ["REQUESTED", "DISPATCHED", "ARRIVED", "COLLECTED"]
  
    if (!allowed.includes(status)) {
      throw new Error("Invalid request status")
    }
  }