export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { planner } from "@/lib/ai/coderClient";

export async function GET(req: NextRequest) {
  try {
    const res = await planner("Simple todo app");
    
    return NextResponse.json({ 
      success: true,
      response: res,
      outputText: res.output_text
    }, { status: 200 });

  } catch (error) {
    console.error('Planner Test Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}