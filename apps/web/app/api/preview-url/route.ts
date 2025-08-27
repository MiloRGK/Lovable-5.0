export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";

// For now, your preview is just the running Next app root.
// Later you can point to a dev server or sandbox port.
export async function GET(_req: NextRequest) {
  return NextResponse.json({ url: "/" }, { status: 200 });
}