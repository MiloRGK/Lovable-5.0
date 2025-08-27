import OpenAI from "openai";

// ---------- JSON Schemas ----------
export const PlanSchema = {
  name: "app_plan",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      style: {
        type: "object",
        additionalProperties: false,
        properties: { brandColor: { type: "string" }, font: { type: "string" } },
        required: ["brandColor", "font"]
      },
      entities: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            fields: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  type: { type: "string", enum: ["id","string","text","number","boolean","date","enum","relation"] },
                  required: { type: "boolean" },
                  enumValues: { type: "array", items: { type: "string" } },
                  relation: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      entity: { type: "string" },
                      kind: { type: "string", enum: ["one","many"] }
                    },
                    required: ["entity","kind"]
                  }
                },
                required: ["name","type"]
              }
            }
          },
          required: ["name","fields"]
        }
      },
      pages: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            kind: { type: "string", enum: ["list","detail","form","dashboard","auth","custom"] },
            route: { type: "string" },
            title: { type: "string" },
            entity: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  kind: { type: "string", enum: ["hero","features","pricing","faq","custom"] },
                  variant: { type: "string" },
                  data: { type: "object", additionalProperties: true }
                },
                required: ["kind"]
              }
            }
          },
          required: ["kind","route"]
        }
      }
    },
    required: ["name","entities","pages","style"]
  }
} as const;export const FileMapSchema = {
  name: "file_map",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      files: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: { path: { type: "string" }, content: { type: "string" } },
          required: ["path","content"]
        }
      }
    },
    required: ["files"]
  }
} as const;

export const DiffSchema = {
  name: "patches",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      patches: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: { path: { type: "string" }, diff: { type: "string" } },
          required: ["path","diff"]
        }
      }
    },
    required: ["patches"]
  }
} as const;

// ---------- Client + helpers ----------
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function respondJSON(opts: {
  model: "gpt-5" | "gpt-5-mini";
  schema: any;
  max_output_tokens: number;
  effort: "minimal" | "medium" | "high";
  verbosity?: "low" | "medium" | "high";
  seed?: number;
  messages: any[];
}) {
  const { model, schema, max_output_tokens, effort, verbosity="low", seed=7, messages } = opts;
  
  // Convert messages to input string for GPT-5 responses API
  const input = messages.map(m => {
    if (m.role === "system") return `System: ${m.content}`;
    if (m.role === "user") return `User: ${m.content}`;
    return m.content;
  }).join('\n\n');
  
  // Cast as any to bypass TypeScript issues with GPT-5 beta API
  // Temporarily use simpler JSON format until schema validation is fully debugged
  return (openai.responses as any).create({
    model,
    input: `${input}\n\nPlease return a JSON response that matches this schema: ${JSON.stringify(schema.schema)}`,
    reasoning: { effort },
    text: { 
      verbosity,
      format: { type: "text" }
    },
    max_output_tokens
  });
}export async function planner(brief: string) {
  return respondJSON({
    model: "gpt-5",
    schema: PlanSchema,
    max_output_tokens: 3000,
    effort: "medium",
    messages: [{ role: "user", content: brief }]
  });
}

export async function composer(plan: any) {
  return respondJSON({
    model: "gpt-5-mini",
    schema: FileMapSchema,
    max_output_tokens: 1200,
    effort: "minimal",
    messages: [
      { role: "system", content: "Return only JSON matching the schema. Generate code files from the plan." },
      { role: "user", content: JSON.stringify(plan) }
    ]
  });
}

export async function iterator(instruction: string, files: {path:string,content:string}[]) {
  return respondJSON({
    model: "gpt-5-mini",
    schema: DiffSchema,
    max_output_tokens: 800,
    effort: "minimal",
    messages: [
      { role: "system", content: "Return only JSON matching the schema. Output unified diffs for the requested change." },
      { role: "user", content: JSON.stringify({ instruction, files }) }
    ]
  });
}