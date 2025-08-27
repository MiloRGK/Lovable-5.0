export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(req: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    
    // Test with a simple chat completion first
    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10
    });

    return NextResponse.json({ 
      success: true,
      content: response.choices[0].message.content,
      model: response.model
    }, { status: 200 });

  } catch (error) {
    console.error('OpenAI API Test Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!process.env.OPENAI_API_KEY
    }, { status: 500 });
  }
}