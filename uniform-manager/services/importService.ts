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
  console.log("parsed", parsed.data)
  if (parsed.errors.length > 0) {
    console.error("CSV Parse Errors:", parsed.errors)
    return { success: 0, failed: parsed.data.length }
  }

  let success = 0
  let failed = 0

  for (const row of parsed.data) {
    // Validate required fields
    if (!row.Name || !row.EAN) {
      failed++
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
      console.error("Insert error:", error.message)
      failed++
    } else {
      success++
    }
  }

  return { success, failed }
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
    });
  
    let success = 0;
    let failed = 0;
  
    for (const row of parsed.data as any[]) {
      try {
        const name = row["Display Name"]?.trim();
        const role = row["Role"]?.trim();
        const store = row["Store"]?.trim();
        console.log(name, role, store )
        if (!name || !role || !store) {
          failed++;
          continue;
        }
        const role_id = await getOrCreateRole(role)
        const { error } = await supabase
          .from("staff")
          .insert({ 
            name: name,
            role_id : role_id,  
            store: store });
  
        if (error) {
            console.error("Insert error:", error.message)
          failed++;
        } else {
          success++;
        }
      } catch {
        failed++;
      }
    }
  
    return { success, failed };
  }
