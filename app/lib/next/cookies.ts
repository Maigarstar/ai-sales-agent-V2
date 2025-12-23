// lib/next/cookies.ts
import { cookies } from "next/headers";

export async function getCookieStore() {
  return await cookies();
}
