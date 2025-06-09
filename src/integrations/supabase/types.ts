export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_post_views: {
        Row: {
          created_at: string | null
          id: string
          post_id: number
          unique_views: number
          updated_at: string | null
          views: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: number
          unique_views?: number
          updated_at?: string | null
          views?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: number
          unique_views?: number
          updated_at?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string
          content: string
          date: string | null
          excerpt: string
          id: number
          image: string | null
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          read_time: string
          slug: string | null
          title: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          date?: string | null
          excerpt: string
          id?: number
          image?: string | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          read_time: string
          slug?: string | null
          title: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          date?: string | null
          excerpt?: string
          id?: number
          image?: string | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          read_time?: string
          slug?: string | null
          title?: string
          view_count?: number | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          appointment_id: string
          created_at: string | null
          end_time: string
          event_description: string | null
          event_title: string
          ics_content: string | null
          id: string
          location: string | null
          reminder_minutes: number | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          end_time: string
          event_description?: string | null
          event_title: string
          ics_content?: string | null
          id?: string
          location?: string | null
          reminder_minutes?: number | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          end_time?: string
          event_description?: string | null
          event_title?: string
          ics_content?: string | null
          id?: string
          location?: string | null
          reminder_minutes?: number | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "patient_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      code_settings: {
        Row: {
          body_code: string | null
          created_at: string | null
          head_code: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          body_code?: string | null
          created_at?: string | null
          head_code?: string | null
          id: number
          updated_at?: string | null
        }
        Update: {
          body_code?: string | null
          created_at?: string | null
          head_code?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_categories: {
        Row: {
          category_type: Database["public"]["Enums"]["gallery_category_type"]
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category_type: Database["public"]["Enums"]["gallery_category_type"]
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category_type?: Database["public"]["Enums"]["gallery_category_type"]
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          file_size: number | null
          file_type: string
          height: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          medium_url: string | null
          mime_type: string | null
          original_url: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          video_duration: number | null
          video_provider: string | null
          video_url: string | null
          webp_url: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          file_size?: number | null
          file_type?: string
          height?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          medium_url?: string | null
          mime_type?: string | null
          original_url: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          video_duration?: number | null
          video_provider?: string | null
          video_url?: string | null
          webp_url?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          file_size?: number | null
          file_type?: string
          height?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          medium_url?: string | null
          mime_type?: string | null
          original_url?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          video_duration?: number | null
          video_provider?: string | null
          video_url?: string | null
          webp_url?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "gallery_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_appointments: {
        Row: {
          cost: number | null
          created_at: string | null
          created_by: string | null
          duration_minutes: number | null
          id: string
          patient_id: string
          post_treatment_notes: string | null
          pre_treatment_notes: string | null
          products_used: string | null
          scheduled_date: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          treatment_id: string
          updated_at: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          patient_id: string
          post_treatment_notes?: string | null
          pre_treatment_notes?: string | null
          products_used?: string | null
          scheduled_date: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          treatment_id: string
          updated_at?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          patient_id?: string
          post_treatment_notes?: string | null
          pre_treatment_notes?: string | null
          products_used?: string | null
          scheduled_date?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          treatment_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_appointments_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          contraindications: string | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          medical_notes: string | null
          notes: string | null
          phone: string | null
          skin_type: Database["public"]["Enums"]["skin_type"] | null
          source: Database["public"]["Enums"]["patient_source"] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          contraindications?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          medical_notes?: string | null
          notes?: string | null
          phone?: string | null
          skin_type?: Database["public"]["Enums"]["skin_type"] | null
          source?: Database["public"]["Enums"]["patient_source"] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string | null
          contraindications?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          medical_notes?: string | null
          notes?: string | null
          phone?: string | null
          skin_type?: Database["public"]["Enums"]["skin_type"] | null
          source?: Database["public"]["Enums"]["patient_source"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_categories: {
        Row: {
          id: string
          items: Json
          title: string
        }
        Insert: {
          id: string
          items?: Json
          title: string
        }
        Update: {
          id?: string
          items?: Json
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      treatment_photos: {
        Row: {
          appointment_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          photo_type: Database["public"]["Enums"]["photo_type"]
          photo_url: string
          taken_at: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          photo_type: Database["public"]["Enums"]["photo_type"]
          photo_url: string
          taken_at?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          photo_type?: Database["public"]["Enums"]["photo_type"]
          photo_url?: string
          taken_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_photos_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "patient_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      treatments: {
        Row: {
          aftercare_instructions: string | null
          category: string
          contraindications: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          aftercare_instructions?: string | null
          category: string
          contraindications?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          aftercare_instructions?: string | null
          category?: string
          contraindications?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_users: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      create_code_settings_table_directly: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_code_settings_table_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_ics_event: {
        Args: { appointment_id_param: string }
        Returns: string
      }
      get_all_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          created_at: string
          last_sign_in_at: string
          email_confirmed_at: string
          roles: string[]
        }[]
      }
      get_code_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          head_code: string
          body_code: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_blog_post_views: {
        Args: { post_id: number }
        Returns: undefined
      }
      invite_user: {
        Args: {
          user_email: string
          user_role?: Database["public"]["Enums"]["app_role"]
        }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_activity: {
        Args: {
          _action: string
          _resource_type?: string
          _resource_id?: string
          _details?: Json
        }
        Returns: undefined
      }
      remove_user_role: {
        Args: {
          target_user_id: string
          target_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      search_patients: {
        Args: { search_term: string }
        Returns: {
          id: string
          first_name: string
          last_name: string
          phone: string
          email: string
          created_at: string
          last_appointment: string
        }[]
      }
      update_code_settings: {
        Args: { p_head_code: string; p_body_code: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      appointment_status: "scheduled" | "completed" | "cancelled" | "no_show"
      gallery_category_type:
        | "lip_modeling"
        | "anti_aging"
        | "general"
        | "before_after"
      patient_source:
        | "instagram"
        | "facebook"
        | "google"
        | "recommendation"
        | "website"
        | "other"
      photo_type: "before" | "after" | "control_1week" | "control_1month"
      skin_type: "normal" | "dry" | "oily" | "combination" | "sensitive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
      appointment_status: ["scheduled", "completed", "cancelled", "no_show"],
      gallery_category_type: [
        "lip_modeling",
        "anti_aging",
        "general",
        "before_after",
      ],
      patient_source: [
        "instagram",
        "facebook",
        "google",
        "recommendation",
        "website",
        "other",
      ],
      photo_type: ["before", "after", "control_1week", "control_1month"],
      skin_type: ["normal", "dry", "oily", "combination", "sensitive"],
    },
  },
} as const
