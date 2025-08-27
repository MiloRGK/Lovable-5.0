export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { planner } from "@/lib/ai/coderClient";
import { getOrCreateProject, putProject } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { brief, projectId } = await req.json();
    const project = getOrCreateProject(projectId);

    const res = await planner(brief || "Make a simple invoice tracker with clients and invoices, brand color #7c3aed");
    
    console.log('[Plan] GPT-5 response:', res);
    console.log('[Plan] Output text:', res.output_text);
    
    // Extract JSON from GPT-5 responses API format - use output_text for convenience
    let planText = res.output_text || "{}";
    let plan;
    
    // Try to fix common JSON issues
    try {
      plan = JSON.parse(planText);
    } catch (parseError) {
      console.log('[Plan] JSON parse failed, attempting to fix malformed JSON...');
      console.log('[Plan] Original text:', planText);
      
      // Try to extract JSON from between first { and last }
      const firstBrace = planText.indexOf('{');
      const lastBrace = planText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        planText = planText.substring(firstBrace, lastBrace + 1);
        // Try to fix common issues with quotes and escapes
        planText = planText.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
        try {
          plan = JSON.parse(planText);
        } catch (secondError) {
          console.log('[Plan] Second parse attempt failed, using fallback plan');
          plan = {
            name: "Default App",
            description: "Generated app",
            style: { brandColor: "#7c3aed", font: "Inter" },
            entities: [],
            pages: []
          };
        }
      } else {
        console.log('[Plan] No valid JSON structure found, using fallback plan');
        plan = {
          name: "Default App", 
          description: "Generated app",
          style: { brandColor: "#7c3aed", font: "Inter" },
          entities: [],
          pages: []
        };
      }
    }
    
    console.log('[Plan] Parsed plan:', plan);

    console.log('[Plan] About to store plan:', plan);
    console.log('[Plan] Project before setting plan:', project);
    
    project.plan = plan;
    project.style = plan.style || { brandColor: "#7c3aed", font: "Inter" };
    
    console.log('[Plan] Project after setting plan:', project);
    
    const storedProject = putProject(project);
    
    console.log('[Plan] Project after putProject call:', storedProject);

    return NextResponse.json({ projectId: project.id, plan: project.plan }, { status: 200 });
  } catch (error) {
    console.error('[Plan] Error:', error);
    return NextResponse.json({ 
      error: "Failed to generate plan",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}