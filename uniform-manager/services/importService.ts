import Papa from "papaparse"
import { createClient } from "../lib/supabase/client"
const supabase = createClient()

interface CSVRow {
    Name: string
    EAN: string
    Qty: string  // CSV fields are usually parsed as strings
  }

function extractNameAndSize(fullName: string) {
    const match = fullName.match(/\(([^)]+)\)/)
  
    const size = match ? match[1] : null
    const name = fullName.replace(/\s*\([^)]*\)/, "").trim()
  
    return { name, size }
  }
  

  export async function importCSV(csvText: string) {
    const parsed = Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    })
  
    if (parsed.errors.length > 0) {
      return {
        success: 0,
        failed: parsed.data.length,
        failedMessages: parsed.errors.map(e => e.message),
      }
    }
  
    let success = 0
    let failed = 0
    const failedMessages: string[] = []
  
    for (let index = 0; index < parsed.data.length; index++) {
      const row = parsed.data[index]
  
      // Validate required fields
      if (!row.Name || !row.EAN) {
        failed++
        failedMessages.push(
          `Row ${index + 2}: Missing Name or EAN`
        )
        continue
      }
  
      const { name, size } = extractNameAndSize(row.Name)
      const qty = Number(row.Qty)
  
      const { error } = await supabase
        .from("uniform_items")
        .insert({
          ean: row.EAN.trim(),
          name: name,
          size: size,
          stock_on_hand: isNaN(qty) ? 0 : qty,
        })
  
      if (error) {
        failed++
        failedMessages.push(
          `Row ${index + 2} (EAN: ${row.EAN}): ${error.message}`
        )
      } else {
        success++
      }
    }
  
    return {
      success,
      failed,
      failedMessages,
    }
  }


async function getOrCreateRole(roleName: string): Promise<string> {
    const normalizedRole = roleName.trim().toLowerCase()
  
    // 1️⃣ Check if role exists (case-insensitive)
    const { data: existingRole, error } = await supabase
      .from("roles")
      .select("id")
      .ilike("name", normalizedRole)
      .limit(1)
      .single()
  
    if (error && error.code !== "PGRST116") { // PGRST116 = no rows found
      throw error
    }
  
    if (existingRole?.id) {
      console.log("return existing role id for:", normalizedRole)
      return existingRole.id
    }
  
    // 2️⃣ Insert new role
    const { data: newRole, error: insertError } = await supabase
      .from("roles")
      .insert({ name: normalizedRole })
      .select("id")
      .single()
  
    if (insertError || !newRole?.id) {
      throw insertError || new Error("Failed to create role")
    }
  
    console.log("created new role for:", normalizedRole)
    return newRole.id
  }

  export async function importStaffCSV(csvText: string) {
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    })
  
    // If Papa parse itself has errors, return them as failedMessages
    if (parsed.errors?.length > 0) {
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
  
      // Row number in the original CSV:
      // +1 for 0-index, +1 for header row => +2
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
  
        const { error } = await supabase
          .from("staff")
          .insert({
            name,
            role_id,
            store,
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
          `Row ${rowNumber}: Unexpected error - ${err?.message ?? "Unknown error"}`
        )
      }
    }
  
    return { success, failed, failedMessages }
  }