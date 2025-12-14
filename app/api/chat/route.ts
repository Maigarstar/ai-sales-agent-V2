import { NextResponse } from 'next/server'
import { POST as vendorsPOST } from './vendors/route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: 'Use POST with your chat payload, this route forwards to /api/chat/vendors.',
    },
    { status: 200 },
  )
}

// Forward all /api/chat POST traffic to the vendors handler
export async function POST(req: Request) {
  return vendorsPOST(req)
}
