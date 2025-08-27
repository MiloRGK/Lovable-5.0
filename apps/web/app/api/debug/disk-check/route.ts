export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    const outputDir = path.join(process.cwd(), ".tmp", "lovable-output");
    
    let exists = false;
    let contents: string[] = [];
    
    try {
      const stats = fs.statSync(outputDir);
      exists = stats.isDirectory();
      
      if (exists) {
        contents = fs.readdirSync(outputDir, { recursive: true }) as string[];
      }
    } catch (error) {
      exists = false;
    }
    
    return NextResponse.json({
      outputDir,
      exists,
      contents: contents.slice(0, 20), // Limit to first 20 files
      totalFiles: contents.length
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({
      error: "Failed to check disk",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}