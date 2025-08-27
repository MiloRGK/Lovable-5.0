export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getProject, writeFiles } from "@/lib/store";
import { applyUnifiedPatches } from "@/lib/utils/applyUnifiedPatches";
import { maybeWriteToDisk } from "@/lib/utils/writeToDisk";

export async function POST(req: NextRequest) {
  const { projectId, patches } = await req.json();
  if (!projectId || !Array.isArray(patches)) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const p = getProject(projectId);
  const merged = applyUnifiedPatches(p.files, patches);
  writeFiles(projectId, merged);
  const disk = await maybeWriteToDisk(merged);

  return NextResponse.json({ applied: patches.length, wroteToDisk: disk }, { status: 200 });
}