import {  getFormattedUniforms } from "@/repositories/uniformRepository"

export async function listUniforms() {
  return await getFormattedUniforms()
}
