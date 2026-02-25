// import { z } from 'zod';

// /* =========================
//    1️⃣ Staff Validation
// ========================= */

// export const staffSchema = z.object({
//   name: z.string().min(1, 'Name is required'),
//   store: z.string().min(1, 'Store is required'),
//   role: z.string().min(1, 'Role is required'),
// });

// /* =========================
//    2️⃣ Uniform Item Validation
// ========================= */

// export const uniformItemSchema = z.object({
//   ean: z.string().min(1, 'ean is required'),
//   size: z.string().min(1, 'Size is required'),
//   stock_on_hand: z
//     .number()
//     .int('Stock must be an integer')
//     .nonnegative('Stock cannot be negative'),
//   low_stock_threshold: z
//     .number()
//     .int('Threshold must be an integer')
//     .nonnegative('Threshold cannot be negative'),
// });

// /* =========================
//    3️⃣ Role Limit Validation
// ========================= */

// export const roleLimitSchema = z.object({
//   role: z.string().min(1, 'Role is required'),
//   max_quantity_per_request: z
//     .number()
//     .int('Max quantity must be an integer')
//     .positive('Max quantity must be greater than 0'),
//   cooldown_days: z
//     .number()
//     .int('Cooldown must be an integer')
//     .nonnegative('Cooldown cannot be negative'),
// });

// /* =========================
//    4️⃣ Create Request Validation
// ========================= */

// export const createRequestSchema = z.object({
//   staff_id: z.uuid('Invalid staff ID'),
// });

// /* =========================
//    5️⃣ Request Item Validation
//    (when submitting uniform request)
// ========================= */

// export const requestItemSchema = z.object({
//   request_id: z.uuid('Invalid request ID'),
//   uniform_item_id: z.uuid('Invalid uniform item ID'),
//   quantity: z.preprocess(
//     (val) => Number(val),
//     z
//       .number()
//       .int('Quantity must be an integer')
//       .positive('Quantity must be greater than 0')
//   ),
// });

// /* =========================
//    6️⃣ Full Request Submission
//    (used in POST /api/requests)
// ========================= */

// export const submitUniformRequestSchema = z.object({
//   staff_id: z.uuid('Invalid staff ID'),
//   items: z
//     .array(
//       z.object({
//         uniform_item_id: z.uuid('Invalid uniform item ID'),
//         quantity: z.preprocess(
//           (val) => Number(val),
//           z
//             .number()
//             .int('Quantity must be an integer')
//             .positive('Quantity must be greater than 0')
//         ),
//       })
//     )
//     .min(1, 'At least one item must be selected'),
// });

// /* =========================
//    7️⃣ Update Status Validation
// ========================= */

// export const updateStatusSchema = z.object({
//   request_id: z.uuid('Invalid request ID'),
//   status: z.enum(['requested', 'dispatched', 'arrived', 'collected']),
// });

// /* =========================
//    8️⃣ CSV Import Row Validation
// ========================= */

// export const csvRowSchema = z.object({
//   name: z.string().min(1, 'Staff name is required'),
//   store: z.string().min(1, 'Store is required'),
//   role: z.string().min(1, 'Role is required'),
//   ean: z.string().min(1, 'ean is required'),
//   size: z.string().min(1, 'Size is required'),
//   stock_on_hand: z.preprocess(
//     (val) => Number(val),
//     z
//       .number()
//       .int('Stock must be an integer')
//       .nonnegative('Stock cannot be negative')
//   ),
// });