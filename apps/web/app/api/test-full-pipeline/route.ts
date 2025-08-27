export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { planner, composer, iterator } from "@/lib/ai/coderClient";
import { getOrCreateProject, putProject, writeFiles } from "@/lib/store";
import { maybeWriteToDisk } from "@/lib/utils/writeToDisk";
import { parseJsonSafely } from "@/lib/utils/parseJsonSafely";

export async function POST(req: NextRequest) {
  try {
    const { brief } = await req.json();
    if (!brief) {
      return NextResponse.json({ error: "brief is required" }, { status: 400 });
    }

    console.log(`[Pipeline] Starting full pipeline test for: "${brief}"`);

    // Step 1: Generate Plan with GPT-5
    console.log('[Pipeline] Step 1: Generating plan with GPT-5...');
    const project = getOrCreateProject();
    
    const planRes = await planner(brief);
    const plan = parseJsonSafely(planRes.output_text, { 
      name: "Test App", 
      entities: [], 
      pages: [], 
      style: { brandColor: "#7c3aed", font: "Inter" } 
    });
    
    project.plan = plan;
    putProject(project);
    
    console.log('[Pipeline] Step 1 complete: Plan generated');    // Step 2: Generate Files with GPT-5-mini  
    console.log('[Pipeline] Step 2: Generating files with GPT-5-mini...');
    
    const composeRes = await composer(plan);
    const fileMap = parseJsonSafely(composeRes.output_text, { files: [] });
    
    const files = fileMap.files || [];
    writeFiles(project.id, files);
    
    console.log('[Pipeline] Step 2 complete: Files generated');    // Step 3: Test iteration with GPT-5-mini
    console.log('[Pipeline] Step 3: Testing iteration with GPT-5-mini...');
    
    const iterateRes = await iterator("Add error handling to the main component", files);
    const patches = parseJsonSafely(iterateRes.output_text, { patches: [] });
    
    console.log('[Pipeline] Step 3 complete: Patches generated');

    // Optional: Write to disk
    await maybeWriteToDisk(files);

    return NextResponse.json({
      success: true,
      projectId: project.id,
      steps: {
        plan: {
          name: plan.name,
          entitiesCount: plan.entities?.length || 0,
          pagesCount: plan.pages?.length || 0
        },
        files: {
          count: files.length,
          paths: files.map(f => f.path)
        },
        iteration: {
          patchesCount: patches.patches?.length || 0,
          patches: patches.patches || []
        }
      },
      pipeline: "plan -> files -> iterate",
      models: "gpt-5 -> gpt-5-mini -> gpt-5-mini"
    }, { status: 200 });

  } catch (error) {
    console.error('[Pipeline] Error:', error);
    return NextResponse.json({
      error: "Pipeline test failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}