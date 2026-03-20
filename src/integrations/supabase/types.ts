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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      case_routing_log: {
        Row: {
          action: string
          admin_id: string | null
          case_id: string
          created_at: string
          id: string
          lawyer_id: string | null
          reason: string | null
          score: number | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          case_id: string
          created_at?: string
          id?: string
          lawyer_id?: string | null
          reason?: string | null
          score?: number | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          case_id?: string
          created_at?: string
          id?: string
          lawyer_id?: string | null
          reason?: string | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "case_routing_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "case_routing_log_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "case_routing_log_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyer_profiles"
            referencedColumns: ["lawyer_id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_at: string | null
          assigned_lawyer_id: string | null
          case_id: string
          case_reference_number: string
          decline_count: number | null
          declined_lawyer_ids: string[] | null
          issue_category: Database["public"]["Enums"]["specialization"]
          issue_description: string
          privacy_accepted: boolean
          resolved_at: string | null
          routing_attempts: number | null
          specific_questions: string
          status: Database["public"]["Enums"]["case_status"]
          submitted_at: string
          terms_accepted: boolean
          updated_at: string
          urgency_level: Database["public"]["Enums"]["urgency_level"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_lawyer_id?: string | null
          case_id?: string
          case_reference_number: string
          decline_count?: number | null
          declined_lawyer_ids?: string[] | null
          issue_category: Database["public"]["Enums"]["specialization"]
          issue_description: string
          privacy_accepted?: boolean
          resolved_at?: string | null
          routing_attempts?: number | null
          specific_questions: string
          status?: Database["public"]["Enums"]["case_status"]
          submitted_at?: string
          terms_accepted?: boolean
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["urgency_level"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_lawyer_id?: string | null
          case_id?: string
          case_reference_number?: string
          decline_count?: number | null
          declined_lawyer_ids?: string[] | null
          issue_category?: Database["public"]["Enums"]["specialization"]
          issue_description?: string
          privacy_accepted?: boolean
          resolved_at?: string | null
          routing_attempts?: number | null
          specific_questions?: string
          status?: Database["public"]["Enums"]["case_status"]
          submitted_at?: string
          terms_accepted?: boolean
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["urgency_level"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_lawyer_id_fkey"
            columns: ["assigned_lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyer_profiles"
            referencedColumns: ["lawyer_id"]
          },
          {
            foreignKeyName: "cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          case_id: string
          document_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: Database["public"]["Enums"]["file_type"]
          uploaded_at: string
          uploaded_by: string
          virus_scan_status: Database["public"]["Enums"]["virus_scan_status"]
        }
        Insert: {
          case_id: string
          document_id?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: Database["public"]["Enums"]["file_type"]
          uploaded_at?: string
          uploaded_by: string
          virus_scan_status?: Database["public"]["Enums"]["virus_scan_status"]
        }
        Update: {
          case_id?: string
          document_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: Database["public"]["Enums"]["file_type"]
          uploaded_at?: string
          uploaded_by?: string
          virus_scan_status?: Database["public"]["Enums"]["virus_scan_status"]
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lawyer_profiles: {
        Row: {
          bar_license_number: string
          current_caseload: number
          is_available: boolean
          lawyer_id: string
          max_caseload: number
          specializations: Database["public"]["Enums"]["specialization"][]
          user_id: string
          years_of_experience: number
        }
        Insert: {
          bar_license_number: string
          current_caseload?: number
          is_available?: boolean
          lawyer_id?: string
          max_caseload?: number
          specializations?: Database["public"]["Enums"]["specialization"][]
          user_id: string
          years_of_experience?: number
        }
        Update: {
          bar_license_number?: string
          current_caseload?: number
          is_available?: boolean
          lawyer_id?: string
          max_caseload?: number
          specializations?: Database["public"]["Enums"]["specialization"][]
          user_id?: string
          years_of_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_path: string | null
          attachment_size: number | null
          attachment_type: string | null
          case_id: string
          is_read: boolean
          message_id: string
          message_text: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          sent_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_path?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          case_id: string
          is_read?: boolean
          message_id?: string
          message_text: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          sent_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_path?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          case_id?: string
          is_read?: boolean
          message_id?: string
          message_text?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          email_verified: boolean
          full_name: string
          is_active: boolean
          last_login: string | null
          national_id: string | null
          password_hash: string
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          email_verified?: boolean
          full_name: string
          is_active?: boolean
          last_login?: string | null
          national_id?: string | null
          password_hash?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          email_verified?: boolean
          full_name?: string
          is_active?: boolean
          last_login?: string | null
          national_id?: string | null
          password_hash?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_case_reference: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "lawyer" | "admin"
      case_status:
        | "Submitted"
        | "Under Review"
        | "Assigned"
        | "In Progress"
        | "Awaiting Client"
        | "Resolved"
        | "Closed"
      file_type: "PDF" | "DOC" | "DOCX" | "JPG" | "JPEG" | "PNG"
      specialization:
        | "Family Law"
        | "Criminal Law"
        | "Civil Litigation"
        | "Employment Law"
        | "Real Estate Law"
        | "Business & Corporate Law"
        | "Immigration Law"
        | "Intellectual Property"
        | "Tax Law"
        | "Estate Planning"
        | "Personal Injury"
        | "Consumer Protection"
      urgency_level: "Low" | "Medium" | "High" | "Critical"
      virus_scan_status: "Pending" | "Clean" | "Infected"
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
    Enums: {
      app_role: ["client", "lawyer", "admin"],
      case_status: [
        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Awaiting Client",
        "Resolved",
        "Closed",
      ],
      file_type: ["PDF", "DOC", "DOCX", "JPG", "JPEG", "PNG"],
      specialization: [
        "Family Law",
        "Criminal Law",
        "Civil Litigation",
        "Employment Law",
        "Real Estate Law",
        "Business & Corporate Law",
        "Immigration Law",
        "Intellectual Property",
        "Tax Law",
        "Estate Planning",
        "Personal Injury",
        "Consumer Protection",
      ],
      urgency_level: ["Low", "Medium", "High", "Critical"],
      virus_scan_status: ["Pending", "Clean", "Infected"],
    },
  },
} as const
