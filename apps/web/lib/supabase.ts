import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          visibility: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          owner_id: string
          name: string
          description?: string | null
          visibility?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          visibility?: string | null
        }
      }
      plans: {
        Row: {
          id: string
          project_id: string
          plan_json: any
          version: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          project_id: string
          plan_json: any
          version?: number | null
          is_active?: boolean | null
        }
        Update: {
          plan_json?: any
          version?: number | null
          is_active?: boolean | null
        }
      }
      files: {
        Row: {
          id: string
          project_id: string
          path: string
          content: string
          sha: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          project_id: string
          path: string
          content: string
          sha?: string | null
        }
        Update: {
          content?: string
          sha?: string | null
        }
      }
      runs: {
        Row: {
          id: string
          project_id: string
          type: string
          prompt: string
          tokens_used: number | null
          cost_cents: number | null
          status: string | null
          logs: string[] | null
          result: any | null
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          project_id: string
          type: string
          prompt: string
          tokens_used?: number | null
          cost_cents?: number | null
          status?: string | null
          logs?: string[] | null
          result?: any | null
        }
        Update: {
          status?: string | null
          logs?: string[] | null
          result?: any | null
          completed_at?: string | null
        }
      }
      deployments: {
        Row: {
          id: string
          project_id: string
          provider: string
          url: string | null
          status: string | null
          logs: string[] | null
          deployed_at: string | null
        }
        Insert: {
          project_id: string
          provider?: string
          url?: string | null
          status?: string | null
          logs?: string[] | null
        }
        Update: {
          url?: string | null
          status?: string | null
          logs?: string[] | null
        }
      }
    }
  }
}