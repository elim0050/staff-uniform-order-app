/**
 * Validates that a quantity is a positive integer.
 *
 * Ensures the value:
 * - Is an integer
 * - Is greater than zero
 *
 * @param quantity - The quantity to validate.
 * @throws Error if the quantity is not a positive integer.
 */
export function validateQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer")
  }
}

/**
 * Validates that a request status is one of the allowed values.
 *
 * Allowed statuses:
 * - REQUESTED
 * - DISPATCHED
 * - ARRIVED
 * - COLLECTED
 *
 * @param status - The status string to validate.
 * @throws Error if the status is not recognized.
 */
export function validateStatus(status: string) {
  const allowed = ["REQUESTED", "DISPATCHED", "ARRIVED", "COLLECTED"]

  if (!allowed.includes(status)) {
    throw new Error("Invalid request status")
  }
}