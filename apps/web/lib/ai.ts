import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FileChange {
  path: string;
  diff: string;
}

export interface CodeGenerationResult {
  patches: FileChange[];
  explanation: string;
  tokensUsed: number;
}

/**
 * Generate code changes based on an instruction and current file contents
 */
export async function generateCodeChanges(
  instruction: string,
  currentFiles: Array<{ path: string; content: string }>,
  projectContext?: string
): Promise<CodeGenerationResult> {
  const systemPrompt = `You are an expert full-stack developer and code generator for a Lovable-style AI app builder.

Your job is to:
1. Analyze the current codebase structure and content
2. Generate specific code changes based on the user's instruction
3. Return unified diff patches that can be applied to update the files
4. Ensure all changes follow TypeScript, React, and Next.js best practices

Guidelines:
- Generate ONLY the necessary changes, don't rewrite entire files unless needed
- Use proper TypeScript types and interfaces
- Follow React best practices and hooks patterns
- Maintain existing code style and patterns
- Generate clean, production-ready code
- Include proper error handling where appropriate
- Keep accessibility in mind for UI components

Output format:
- Return a JSON object with patches array and explanation
- Each patch should have "path" and "diff" (unified diff format)
- Unified diff format: show context lines, additions (+), and deletions (-)`;

  const userPrompt = `Project Context: ${projectContext || 'React/Next.js application'}

Current Files:
${currentFiles.map(f => `=== ${f.path} ===\n${f.content}\n`).join('\n')}

Instruction: ${instruction}

Generate the necessary code changes as unified diffs. Return a JSON object with:
{
  "patches": [{"path": "file/path", "diff": "unified diff content"}],
  "explanation": "Brief explanation of changes made"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini", // Using GPT-5-mini as requested
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      reasoning_effort: "medium", // Controls depth of reasoning: "minimal", "medium", "high"
      verbosity: "medium", // Controls output detail: "low", "medium", "high"
      max_completion_tokens: 4000, // GPT-5 uses max_completion_tokens instead of max_tokens
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    let result;
    try {
      result = JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', response);
      throw new Error('Invalid JSON response from AI');
    }

    return {
      patches: result.patches || [],
      explanation: result.explanation || '',
      tokensUsed: completion.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback to mock patches if API fails
    const mockPatch: FileChange = {
      path: "app/page.tsx",
      diff: `--- a/app/page.tsx
+++ b/app/page.tsx
@@ -1,5 +1,7 @@
 export default function Home() {
   return (
     <main className="p-6 space-y-6">
+      {/* ${instruction} */}
+      <div className="text-blue-600">AI-generated change: ${instruction}</div>
       <div className="container mx-auto text-center space-y-4">
         <h1 className="text-4xl font-bold tracking-tight">Welcome to Lovable Clone</h1>`
    };

    return {
      patches: [mockPatch],
      explanation: `Mock change for: ${instruction} (AI API unavailable)`,
      tokensUsed: 0,
    };
  }
}

/**
 * Generate an app plan from a natural language description
 */
export async function generateAppPlan(brief: string): Promise<any> {
  const systemPrompt = `You are an expert software architect. Generate a structured app plan from a natural language description.

Create a plan with:
- Entities (database models) with fields and types
- Pages (routes) with their purpose
- Style configuration (brand color, etc.)

Return JSON in this exact format:
{
  "name": "App Name",
  "description": "Brief description",
  "entities": [
    {
      "name": "EntityName", 
      "fields": [
        {"name": "id", "type": "id"},
        {"name": "title", "type": "string", "required": true},
        {"name": "status", "type": "enum", "enumValues": ["draft", "published"]}
      ]
    }
  ],
  "pages": [
    {"kind": "dashboard", "route": "/dashboard", "title": "Overview"},
    {"kind": "list", "route": "/items", "entity": "Item", "title": "Items"},
    {"kind": "custom", "route": "/", "sections": [{"kind": "hero"}, {"kind": "features"}]}
  ],
  "style": {"brandColor": "#7c3aed", "font": "inter"}
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate an app plan for: ${brief}` }
      ],
      response_format: { type: "json_object" },
      reasoning_effort: "medium", // Controls depth of reasoning: "minimal", "medium", "high"
      verbosity: "low", // Concise output for plan generation: "low", "medium", "high"
      max_completion_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Plan generation error:', error);
    
    // Return null to let the existing plan API handle fallback
    return null;
  }
}