import Papa from "papaparse"
import { createClient } from "../lib/supabase/client"

const supabase = createClient()

interface UniformCSVRow {
  Name: string
  EAN: string
  Qty: string
}

/**
 * Extracts the size from a string in parentheses and returns a cleaned name.
 * Example: "Polo Shirt (M)" -> { name: "Polo Shirt", size: "M" }
 */
function extractNameAndSize(fullName: string) {
  const match = fullName.match(/\(([^)]+)\)/)
  const size = match ? match[1] : null
  const name = fullName.replace(/\s*\([^)]*\)/, "").trim()
  return { name, size }
}

/**
 * Imports uniform items from CSV text into `uniform_items`.
 * Returns a summary with success/failed counts and failure messages.
 */
export async function importCSV(csvText: string) {
  const parsed = Papa.parse<UniformCSVRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0) {
    return {
      success: 0,
      failed: parsed.data.length,
      failedMessages: parsed.errors.map((e) => e.message),
    }
  }

  let success = 0
  let failed = 0
  const failedMessages: string[] = []

  for (let index = 0; index < parsed.data.length; index++) {
    const row = parsed.data[index]
    const rowNumber = index + 2

    if (!row.Name || !row.EAN) {
      failed++
      failedMessages.push(`Row ${rowNumber}: Missing Name or EAN`)
      continue
    }

    const { name, size } = extractNameAndSize(row.Name)
    const qty = Number(row.Qty)

    const { error } = await supabase.from("uniform_items").insert({
      ean: row.EAN.trim(),
      name,
      size,
      stock_on_hand: isNaN(qty) ? 0 : qty,
    })

    if (error) {
      failed++
      failedMessages.push(`Row ${rowNumber} (EAN: ${row.EAN}): ${error.message}`)
    } else {
      success++
    }
  }

  return { success, failed, failedMessages }
}

/**
 * Returns a role ID for the given role name, creating the role if it does not exist.
 */
async function getOrCreateRole(roleName: string): Promise<string> {
  const normalizedRole = roleName.trim().toLowerCase()

  const { data: existingRole, error } = await supabase
    .from("roles")
    .select("id")
    .ilike("name", normalizedRole)
    .limit(1)
    .single()

  // PGRST116 indicates "no rows found" for `.single()`
  if (error && error.code !== "PGRST116") throw error
  if (existingRole?.id) return existingRole.id

  const { data: newRole, error: insertError } = await supabase
    .from("roles")
    .insert({ name: normalizedRole })
    .select("id")
    .single()

  if (insertError || !newRole?.id) {
    throw insertError || new Error("Failed to create role")
  }

  return newRole.id
}

/**
 * Imports staff from CSV text into `staff`.
 * Returns a summary with success/failed counts and failure messages.
 */
export async function importStaffCSV(csvText: string) {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0) {
    return {
      success: 0,
      failed: (parsed.data as any[])?.length ?? 0,
      failedMessages: parsed.errors.map((e) => e.message),
    }
  }

  let success = 0
  let failed = 0
  const failedMessages: string[] = []

  const rows = parsed.data as any[]

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 2

    try {
      const name = row["Display Name"]?.trim()
      const role = row["Role"]?.trim()
      const store = row["Store"]?.trim()

      if (!name || !role || !store) {
        failed++
        failedMessages.push(
          `Row ${rowNumber}: Missing required field(s) - Display Name, Role, or Store`
        )
        continue
      }

      const role_id = await getOrCreateRole(role)

      const { error } = await supabase.from("staff").insert({
        name,
        role_id,
        store,
        last_request_date : null
      })

      if (error) {
        failed++
        failedMessages.push(`Row ${rowNumber} (${name}): ${error.message}`)
      } else {
        success++
      }
    } catch (err: any) {
      failed++
      failedMessages.push(
        `Row ${rowNumber}: ${err?.message ?? "Unexpected error"}`
      )
    }
  }

  return { success, failed, failedMessages }
}