export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      check_ins: {
        Row: {
          check_date: string
          created_at: string
          id: number
          minutes: number
          user_id: string
        }
        Insert: {
          check_date: string
          created_at?: string
          id?: never
          minutes?: number
          user_id: string
        }
        Update: {
          check_date?: string
          created_at?: string
          id?: never
          minutes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          category: string
          created_at: string
          done: boolean
          done_at: string | null
          id: number
          task_date: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          done?: boolean
          done_at?: string | null
          id?: never
          task_date?: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          done?: boolean
          done_at?: string | null
          id?: never
          task_date?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          due_date: string | null
          icon: string | null
          id: number
          progress: number
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          icon?: string | null
          id?: never
          progress?: number
          title: string
          user_id: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          icon?: string | null
          id?: never
          progress?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      points_events: {
        Row: {
          created_at: string
          event_date: string
          id: number
          points: number
          ref_id: number
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date?: string
          id?: never
          points: number
          ref_id: number
          source: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: never
          points?: number
          ref_id?: number
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          badge: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          id: string
          name: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      squad_activity: {
        Row: {
          action: string
          created_at: string
          id: number
          payload: Json
          squad_id: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: never
          payload?: Json
          squad_id: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: never
          payload?: Json
          squad_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_activity_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      squad_members: {
        Row: {
          joined_at: string
          squad_id: number
          user_id: string
        }
        Insert: {
          joined_at?: string
          squad_id: number
          user_id: string
        }
        Update: {
          joined_at?: string
          squad_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      squads: {
        Row: {
          created_at: string
          created_by: string
          id: number
          invite_code: string
          name: string
          season_ends_at: string | null
          subtitle: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: never
          invite_code: string
          name: string
          season_ends_at?: string | null
          subtitle?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: never
          invite_code?: string
          name?: string
          season_ends_at?: string | null
          subtitle?: string
        }
        Relationships: [
          {
            foreignKeyName: "squads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      v_user_points: {
        Row: {
          total: number | null
          user_id: string | null
          weekly: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      fn_heatmap: {
        Args: { uid?: string; weeks?: number }
        Returns: {
          check_date: string
          intensity: number
        }[]
      }
      fn_squad_ranking: {
        Args: { target_squad: number }
        Returns: {
          name: string
          rank: number
          streak: number
          user_id: string
          weekly_points: number
        }[]
      }
      fn_streak: { Args: { uid?: string }; Returns: number }
      generate_invite_code: { Args: never; Returns: string }
      is_squad_member: { Args: { target_squad: number }; Returns: boolean }
      rpc_check_in: { Args: { input_minutes?: number }; Returns: Json }
      rpc_complete_goal: { Args: { goal_id: number }; Returns: number }
      rpc_complete_task: { Args: { task_id: number }; Returns: number }
      rpc_create_squad: {
        Args: {
          season_end?: string
          squad_name: string
          squad_subtitle?: string
        }
        Returns: number
      }
      rpc_join_squad: { Args: { code: string }; Returns: number }
      shares_squad: { Args: { target_user: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
