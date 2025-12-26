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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      course_payments: {
        Row: {
          amount: number
          course_id: string
          created_at: string
          currency: string | null
          id: string
          order_id: string | null
          payment_id: string | null
          payment_status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          course_id: string
          created_at?: string
          currency?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          payment_status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          payment_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_hours: number | null
          id: string
          is_featured: boolean | null
          is_paid: boolean | null
          lessons_count: number | null
          price: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          youtube_playlist_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          id?: string
          is_featured?: boolean | null
          is_paid?: boolean | null
          lessons_count?: number | null
          price?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          youtube_playlist_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          id?: string
          is_featured?: boolean | null
          is_paid?: boolean | null
          lessons_count?: number | null
          price?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          youtube_playlist_url?: string | null
        }
        Relationships: []
      }
      investor_meetings: {
        Row: {
          created_at: string
          host_user_id: string
          id: string
          investor_user_id: string | null
          meeting_type: string | null
          notes: string | null
          room_name: string | null
          room_url: string | null
          scheduled_at: string | null
          startup_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          host_user_id: string
          id?: string
          investor_user_id?: string | null
          meeting_type?: string | null
          notes?: string | null
          room_name?: string | null
          room_url?: string | null
          scheduled_at?: string | null
          startup_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          host_user_id?: string
          id?: string
          investor_user_id?: string | null
          meeting_type?: string | null
          notes?: string | null
          room_name?: string | null
          room_url?: string | null
          scheduled_at?: string | null
          startup_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_meetings_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_applications: {
        Row: {
          amount: number
          bid_price: number
          created_at: string
          id: string
          ipo_id: string
          lots_applied: number
          status: string | null
          updated_at: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bid_price: number
          created_at?: string
          id?: string
          ipo_id: string
          lots_applied: number
          status?: string | null
          updated_at?: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bid_price?: number
          created_at?: string
          id?: string
          ipo_id?: string
          lots_applied?: number
          status?: string | null
          updated_at?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipo_applications_ipo_id_fkey"
            columns: ["ipo_id"]
            isOneToOne: false
            referencedRelation: "ipo_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_listings: {
        Row: {
          close_date: string
          company_name: string
          created_at: string
          description: string | null
          id: string
          issue_size: number | null
          issue_type: string | null
          listing_date: string | null
          logo_url: string | null
          lot_size: number
          open_date: string
          price_band_high: number
          price_band_low: number
          prospectus_url: string | null
          sector: string | null
          status: string | null
          subscription_rate: number | null
          symbol: string
          updated_at: string
        }
        Insert: {
          close_date: string
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          issue_size?: number | null
          issue_type?: string | null
          listing_date?: string | null
          logo_url?: string | null
          lot_size: number
          open_date: string
          price_band_high: number
          price_band_low: number
          prospectus_url?: string | null
          sector?: string | null
          status?: string | null
          subscription_rate?: number | null
          symbol: string
          updated_at?: string
        }
        Update: {
          close_date?: string
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          issue_size?: number | null
          issue_type?: string | null
          listing_date?: string | null
          logo_url?: string | null
          lot_size?: number
          open_date?: string
          price_band_high?: number
          price_band_low?: number
          prospectus_url?: string | null
          sector?: string | null
          status?: string | null
          subscription_rate?: number | null
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          created_at: string
          document_type: string
          document_url: string
          id: string
          rejection_reason: string | null
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url: string
          id?: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string
          id?: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean | null
          order_index: number | null
          title: string
          video_url: string | null
          youtube_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          order_index?: number | null
          title: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          order_index?: number | null
          title?: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_verifications: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp_code: string
          purpose: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          otp_code: string
          purpose: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          purpose?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email_verified: boolean | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      startup_investments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string | null
          payment_status: string | null
          startup_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          startup_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          startup_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "startup_investments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_registrations: {
        Row: {
          created_at: string
          description: string | null
          equity_offered: number | null
          founded_year: number | null
          funding_goal: number
          id: string
          logo_url: string | null
          min_investment: number | null
          pitch_deck_url: string | null
          pitch_video_url: string | null
          raised_amount: number | null
          sector: string | null
          startup_name: string
          status: string
          symbol: string
          team_size: number | null
          updated_at: string
          user_id: string
          valuation: number | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          equity_offered?: number | null
          founded_year?: number | null
          funding_goal: number
          id?: string
          logo_url?: string | null
          min_investment?: number | null
          pitch_deck_url?: string | null
          pitch_video_url?: string | null
          raised_amount?: number | null
          sector?: string | null
          startup_name: string
          status?: string
          symbol: string
          team_size?: number | null
          updated_at?: string
          user_id: string
          valuation?: number | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          equity_offered?: number | null
          founded_year?: number | null
          funding_goal?: number
          id?: string
          logo_url?: string | null
          min_investment?: number | null
          pitch_deck_url?: string | null
          pitch_video_url?: string | null
          raised_amount?: number | null
          sector?: string | null
          startup_name?: string
          status?: string
          symbol?: string
          team_size?: number | null
          updated_at?: string
          user_id?: string
          valuation?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          lesson_id: string | null
          progress_percent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          progress_percent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          progress_percent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      video_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          host_user_id: string
          id: string
          notes: string | null
          participant_user_id: string | null
          room_id: string
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          host_user_id: string
          id?: string
          notes?: string | null
          participant_user_id?: string | null
          room_id: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          host_user_id?: string
          id?: string
          notes?: string | null
          participant_user_id?: string | null
          room_id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          topic?: string | null
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
