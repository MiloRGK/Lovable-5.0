// Strict JSON schemas for the Lovelier coder agent

export const PlanSchema = {
  name: "app_plan",
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      style: {
        type: "object",
        properties: {
          brandColor: { type: "string" },
          font: { type: "string" }
        },
        required: ["brandColor"]
      },
      entities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: {
                    type: "string",
                    enum: [
                      "id","string","text","number","boolean","date","enum","relation"
                    ]
                  },
                  required: { type: "boolean" },
                  enumValues: { type: "array", items: { type: "string" } },
                  relation: {
                    type: "object",
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
          properties: {
            kind: { type: "string", enum: ["list","detail","form","dashboard","auth","custom"] },
            route: { type: "string" },
            title: { type: "string" },
            entity: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  kind: { type: "string", enum: ["hero","features","pricing","faq","custom"] },
                  variant: { type: "string" },
                  data: { type: "object" }
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
} as const;

export const FileMapSchema = {
  name: "file_map",
  schema: {
    type: "object",
    properties: {
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: { type: "string" },
            content: { type: "string" }
          },
          required: ["path","content"]
        }
      },
      explanation: { type: "string" }
    },
    required: ["files"]
  }
} as const;

export const DiffSchema = {
  name: "patches",
  schema: {
    type: "object",
    properties: {
      patches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: { type: "string" },
            diff: { type: "string" }
          },
          required: ["path","diff"]
        }
      },
      explanation: { type: "string" }
    },
    required: ["patches"]
  }
} as const;

// Type definitions for the schemas
export type AppPlan = {
  name: string;
  description: string;
  style: {
    brandColor: string;
    font?: string;
  };
  entities: Array<{
    name: string;
    fields: Array<{
      name: string;
      type: "id" | "string" | "text" | "number" | "boolean" | "date" | "enum" | "relation";
      required?: boolean;
      enumValues?: string[];
      relation?: {
        entity: string;
        kind: "one" | "many";
      };
    }>;
  }>;
  pages: Array<{
    kind: "list" | "detail" | "form" | "dashboard" | "auth" | "custom";
    route: string;
    title?: string;
    entity?: string;
    sections?: Array<{
      kind: "hero" | "features" | "pricing" | "faq" | "custom";
      variant?: string;
      data?: Record<string, any>;
    }>;
  }>;
};

export type FileMap = {
  files: Array<{
    path: string;
    content: string;
  }>;
  explanation?: string;
};

export type DiffPatches = {
  patches: Array<{
    path: string;
    diff: string;
  }>;
  explanation?: string;
};