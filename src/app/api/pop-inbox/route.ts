// app/api/admin/ai-rewrite/route.ts
// The 'route' file MUST export a handler function.

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // ... your logic here
  return NextResponse.json({ success: true });
}

// Or if it's a GET request:
// export async function GET(request: Request) { ... }