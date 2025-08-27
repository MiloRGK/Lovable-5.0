export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { iterator } from "@/lib/ai/coderClient";
import { getProject } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { projectId, instruction } = await req.json();
  if (!projectId || !instruction) return NextResponse.json({ error: "projectId and instruction required" }, { status: 400 });
  const project = getProject(projectId);
  const files = project.files;

  const res = await iterator(instruction, files);
  // Extract JSON from GPT-5 responses API format - use output_text for convenience
  const payload = JSON.parse(res.output_text || "{}");

  return NextResponse.json({ patches: payload.patches ?? [] }, { status: 200 });
}