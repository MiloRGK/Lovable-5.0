export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/store";

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = getProject(id);
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        id: project.id,
        plan: project.plan,
        filesCount: project.files?.length || 0,
        files: project.files?.map(f => ({ path: f.path, size: f.content?.length || 0 })) || []
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to retrieve project",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}