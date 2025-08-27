export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getProject, _mem } from "@/lib/store";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  
  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  try {
    const project = getProject(projectId);
    const directProject = _mem.get(projectId);
    
    return NextResponse.json({
      projectId,
      exists: !!project,
      directExists: !!directProject,
      hasFiles: project?.files?.length || 0,
      hasPlan: !!project?.plan,
      directHasPlan: !!directProject?.plan,
      project: project,
      directProject: directProject,
      planKeys: project?.plan ? Object.keys(project.plan) : [],
      memorySize: _mem.size
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}