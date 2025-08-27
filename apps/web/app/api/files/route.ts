export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/store";
import { sha1 } from "@/lib/utils/hash";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });
  const p = getProject(projectId);
  const files = p.files.map(f => ({ path: f.path, sha: sha1(f.content) }));
  return NextResponse.json({ files }, { status: 200 });
}