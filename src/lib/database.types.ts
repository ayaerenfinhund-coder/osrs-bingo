export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      completions: {
        Row: {
          created_at: string | null
          player_id: number
          tile_id: number
        }
        Insert: {
          created_at?: string | null
          player_id: number
          tile_id: number
        }
        Update: {
          created_at?: string | null
          player_id?: number
          tile_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "completions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completions_tile_id_fkey"
            columns: ["tile_id"]
            isOneToOne: false
            referencedRelation: "tiles"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          color_hex: string
          id: number
          name: string
        }
        Insert: {
          color_hex: string
          id?: number
          name: string
        }
        Update: {
          color_hex?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      tiles: {
        Row: {
          icon_id: string | null
          id: number
          index: number
          task_name: string
        }
        Insert: {
          icon_id?: string | null
          id?: number
          index: number
          task_name: string
        }
        Update: {
          icon_id?: string | null
          id?: number
          index?: number
          task_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
