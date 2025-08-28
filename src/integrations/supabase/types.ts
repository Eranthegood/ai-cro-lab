export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ab_test_backlog: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          original_suggestion_data: Json
          priority: string | null
          status: string | null
          suggestion_id: string
          tags: string[] | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          original_suggestion_data?: Json
          priority?: string | null
          status?: string | null
          suggestion_id: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          original_suggestion_data?: Json
          priority?: string | null
          status?: string | null
          suggestion_id?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      ab_test_suggestions_history: {
        Row: {
          created_at: string
          goal_type: string | null
          id: string
          page_url: string | null
          session_id: string | null
          suggestion_data: Json
          user_action: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          goal_type?: string | null
          id?: string
          page_url?: string | null
          session_id?: string | null
          suggestion_data?: Json
          user_action?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          goal_type?: string | null
          id?: string
          page_url?: string | null
          session_id?: string | null
          suggestion_data?: Json
          user_action?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      ab_test_user_preferences: {
        Row: {
          created_at: string
          id: string
          industry_context: string | null
          scope_preference: string | null
          successful_patterns: Json | null
          technical_comfort: string | null
          tone_preference: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          industry_context?: string | null
          scope_preference?: string | null
          successful_patterns?: Json | null
          technical_comfort?: string | null
          tone_preference?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          industry_context?: string | null
          scope_preference?: string | null
          successful_patterns?: Json | null
          technical_comfort?: string | null
          tone_preference?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      ab_tests: {
        Row: {
          business_impact: Json | null
          code_generated: string | null
          created_at: string
          created_by: string
          external_ticket_id: string | null
          external_ticket_url: string | null
          framework: string | null
          hypothesis: string | null
          id: string
          metrics: Json | null
          name: string
          priority: string | null
          source_suggestion_id: string | null
          status: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          business_impact?: Json | null
          code_generated?: string | null
          created_at?: string
          created_by: string
          external_ticket_id?: string | null
          external_ticket_url?: string | null
          framework?: string | null
          hypothesis?: string | null
          id?: string
          metrics?: Json | null
          name: string
          priority?: string | null
          source_suggestion_id?: string | null
          status?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          business_impact?: Json | null
          code_generated?: string | null
          created_at?: string
          created_by?: string
          external_ticket_id?: string | null
          external_ticket_url?: string | null
          framework?: string | null
          hypothesis?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          priority?: string | null
          source_suggestion_id?: string | null
          status?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_tests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean
          notification_channels: Json | null
          threshold_value: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_channels?: Json | null
          threshold_value?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_channels?: Json | null
          threshold_value?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      alerts_log: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          workspace_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          severity: string
          status?: string
          title: string
          workspace_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          workspace_id?: string
        }
        Relationships: []
      }
      contentsquare_data: {
        Row: {
          analysis_results: Json | null
          created_at: string
          data: Json
          file_type: string
          filename: string
          id: string
          processed: boolean | null
          uploaded_by: string
          workspace_id: string
        }
        Insert: {
          analysis_results?: Json | null
          created_at?: string
          data?: Json
          file_type: string
          filename: string
          id?: string
          processed?: boolean | null
          uploaded_by: string
          workspace_id: string
        }
        Update: {
          analysis_results?: Json | null
          created_at?: string
          data?: Json
          file_type?: string
          filename?: string
          id?: string
          processed?: boolean | null
          uploaded_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contentsquare_data_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contentsquare_data_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          content: Json | null
          created_at: string
          file_size: number | null
          id: string
          name: string
          processed_at: string | null
          type: string
          uploaded_by: string
          workspace_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          file_size?: number | null
          id?: string
          name: string
          processed_at?: string | null
          type: string
          uploaded_by: string
          workspace_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          file_size?: number | null
          id?: string
          name?: string
          processed_at?: string | null
          type?: string
          uploaded_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_vault_audit: {
        Row: {
          action: string
          action_metadata: Json | null
          created_at: string
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          action: string
          action_metadata?: Json | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          action?: string
          action_metadata?: Json | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_vault_audit_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_vault_cache: {
        Row: {
          context_size: number
          created_at: string
          file_hash: string
          file_id: string
          id: string
          last_accessed: string
          parsed_content: Json
          token_count: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          context_size?: number
          created_at?: string
          file_hash: string
          file_id: string
          id?: string
          last_accessed?: string
          parsed_content?: Json
          token_count?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          context_size?: number
          created_at?: string
          file_hash?: string
          file_id?: string
          id?: string
          last_accessed?: string
          parsed_content?: Json
          token_count?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      knowledge_vault_config: {
        Row: {
          completion_score: number
          config_data: Json
          config_section: string
          created_at: string
          created_by: string
          id: string
          is_sensitive: boolean
          updated_at: string
          workspace_id: string
        }
        Insert: {
          completion_score?: number
          config_data?: Json
          config_section: string
          created_at?: string
          created_by: string
          id?: string
          is_sensitive?: boolean
          updated_at?: string
          workspace_id: string
        }
        Update: {
          completion_score?: number
          config_data?: Json
          config_section?: string
          created_at?: string
          created_by?: string
          id?: string
          is_sensitive?: boolean
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_vault_config_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_vault_files: {
        Row: {
          config_section: string
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          is_processed: boolean
          project_id: string | null
          storage_path: string
          upload_metadata: Json | null
          uploaded_by: string
          workspace_id: string
        }
        Insert: {
          config_section: string
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          is_processed?: boolean
          project_id?: string | null
          storage_path: string
          upload_metadata?: Json | null
          uploaded_by: string
          workspace_id: string
        }
        Update: {
          config_section?: string
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          is_processed?: boolean
          project_id?: string | null
          storage_path?: string
          upload_metadata?: Json | null
          uploaded_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_vault_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_vault_files_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_vault_parsed_content: {
        Row: {
          columns_metadata: Json | null
          content_type: string
          created_at: string
          file_id: string
          id: string
          parsed_at: string | null
          parsing_error: string | null
          parsing_status: string
          structured_data: Json
          summary: string | null
          token_count: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          columns_metadata?: Json | null
          content_type: string
          created_at?: string
          file_id: string
          id?: string
          parsed_at?: string | null
          parsing_error?: string | null
          parsing_status?: string
          structured_data?: Json
          summary?: string | null
          token_count?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          columns_metadata?: Json | null
          content_type?: string
          created_at?: string
          file_id?: string
          id?: string
          parsed_at?: string | null
          parsing_error?: string | null
          parsing_status?: string
          structured_data?: Json
          summary?: string | null
          token_count?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_knowledge_vault_parsed_content_file"
            columns: ["file_id"]
            isOneToOne: true
            referencedRelation: "knowledge_vault_files"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          messages: Json
          project_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          messages?: Json
          project_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          messages?: Json
          project_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          settings: Json | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      semantic_cache: {
        Row: {
          created_at: string
          id: string
          last_accessed: string | null
          query_hash: string
          query_text: string
          response_content: string
          tokens_saved: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_accessed?: string | null
          query_hash: string
          query_text: string
          response_content: string
          tokens_saved?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_accessed?: string | null
          query_hash?: string
          query_text?: string
          response_content?: string
          tokens_saved?: number | null
          workspace_id?: string
        }
        Relationships: []
      }
      vault_saved_responses: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          message_context: Json | null
          name: string
          project_id: string
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          message_context?: Json | null
          name: string
          project_id: string
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          message_context?: Json | null
          name?: string
          project_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_saved_responses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: unknown | null
          referral_source: string | null
          user_agent: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown | null
          referral_source?: string | null
          user_agent?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown | null
          referral_source?: string | null
          user_agent?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          token: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role: string
          token: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role: string
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: string | null
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_knowledge_base: {
        Args: { kb_workspace_id: string }
        Returns: boolean
      }
      check_workspace_permission: {
        Args: {
          required_role?: string
          user_uuid: string
          workspace_uuid: string
        }
        Returns: boolean
      }
      clean_vault_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_knowledge_vault_progress: {
        Args: { p_workspace_id: string }
        Returns: {
          completion_percentage: number
          max_score: number
          score: number
          section: string
        }[]
      }
      get_user_workspaces: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      get_workspace_profile_names: {
        Args: { workspace_uuid: string }
        Returns: {
          full_name: string
          user_id: string
        }[]
      }
      log_knowledge_vault_action: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type: string
          p_workspace_id: string
        }
        Returns: undefined
      }
      update_knowledge_vault_config: {
        Args: {
          p_completion_score: number
          p_config_data: Json
          p_section: string
          p_workspace_id: string
        }
        Returns: string
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
