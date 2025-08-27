export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(req: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    
    // Test GPT-5 responses API directly
    const response = await (openai.responses as any).create({
      model: "gpt-5-mini",
      input: "Say hello in JSON format",
      reasoning: { effort: "minimal" },
      text: { verbosity: "low" },
      max_output_tokens: 50
    });

    return NextResponse.json({ 
      success: true,
      response: response
    }, { status: 200 });

  } catch (error) {
    console.error('GPT-5 API Test Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}