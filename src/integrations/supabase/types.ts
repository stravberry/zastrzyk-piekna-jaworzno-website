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
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      appointment_calendar_events: {
        Row: {
          appointment_id: string
          created_at: string | null
          event_url: string | null
          external_event_id: string
          id: string
          integration_id: string
          last_synced_at: string | null
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          event_url?: string | null
          external_event_id: string
          id?: string
          integration_id: string
          last_synced_at?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          event_url?: string | null
          external_event_id?: string
          id?: string
          integration_id?: string
          last_synced_at?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_calendar_events_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "patient_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_calendar_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "calendar_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_reminders: {
        Row: {
          appointment_id: string
          created_at: string | null
          email_sent: boolean | null
          error_message: string | null
          id: string
          reminder_type: string
          scheduled_at: string
          sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          email_sent?: boolean | null
          error_message?: string | null
          id?: string
          reminder_type: string
          scheduled_at: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          email_sent?: boolean | null
          error_message?: string | null
          id?: string
          reminder_type?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "patient_appointments"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "blog_post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "published_blog_posts"
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
          is_published: boolean
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
          is_published?: boolean
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
          is_published?: boolean
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
      calendar_integrations: {
        Row: {
          access_token: string | null
          calendar_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          owner_email: string
          provider: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_email: string
          provider: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_email?: string
          provider?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      contact_replies: {
        Row: {
          created_at: string
          email_id: string | null
          id: string
          message: string
          original_submission_id: string
          sent_at: string | null
          sent_by_ip: unknown | null
          sent_by_user_agent: string | null
          subject: string
          to_email: string
          to_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_id?: string | null
          id?: string
          message: string
          original_submission_id: string
          sent_at?: string | null
          sent_by_ip?: unknown | null
          sent_by_user_agent?: string | null
          subject: string
          to_email: string
          to_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_id?: string | null
          id?: string
          message?: string
          original_submission_id?: string
          sent_at?: string | null
          sent_by_ip?: unknown | null
          sent_by_user_agent?: string | null
          subject?: string
          to_email?: string
          to_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_replies_original_submission_id_fkey"
            columns: ["original_submission_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          consent_given: boolean
          created_at: string | null
          email: string
          id: string
          ip_address: unknown | null
          message: string
          name: string
          phone: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          consent_given?: boolean
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown | null
          message: string
          name: string
          phone?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          consent_given?: boolean
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown | null
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          text_content: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type: string
          text_content?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          text_content?: string | null
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
      keep_alive_log: {
        Row: {
          created_at: string | null
          id: string
          response_data: Json | null
          status: string
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          response_data?: Json | null
          status: string
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          response_data?: Json | null
          status?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      patient_appointments: {
        Row: {
          calendar_sync_enabled: boolean | null
          cost: number | null
          created_at: string | null
          created_by: string | null
          duration_minutes: number | null
          email_reminders_enabled: boolean | null
          id: string
          patient_id: string
          post_treatment_notes: string | null
          pre_treatment_notes: string | null
          products_used: string | null
          reminder_preferences: Json | null
          scheduled_date: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          treatment_id: string
          updated_at: string | null
        }
        Insert: {
          calendar_sync_enabled?: boolean | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          email_reminders_enabled?: boolean | null
          id?: string
          patient_id: string
          post_treatment_notes?: string | null
          pre_treatment_notes?: string | null
          products_used?: string | null
          reminder_preferences?: Json | null
          scheduled_date: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          treatment_id: string
          updated_at?: string | null
        }
        Update: {
          calendar_sync_enabled?: boolean | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          email_reminders_enabled?: boolean | null
          id?: string
          patient_id?: string
          post_treatment_notes?: string | null
          pre_treatment_notes?: string | null
          products_used?: string | null
          reminder_preferences?: Json | null
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
      rate_limits: {
        Row: {
          action: string
          attempts: number
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          action: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          action?: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          updated_at?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          severity: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_blocks: {
        Row: {
          block_type: string
          blocked_until: string
          created_at: string | null
          id: string
          identifier: string
          reason: string
        }
        Insert: {
          block_type: string
          blocked_until: string
          created_at?: string | null
          id?: string
          identifier: string
          reason: string
        }
        Update: {
          block_type?: string
          blocked_until?: string
          created_at?: string | null
          id?: string
          identifier?: string
          reason?: string
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
      published_blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          date: string | null
          excerpt: string | null
          id: number | null
          image: string | null
          is_published: boolean | null
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          read_time: string | null
          slug: string | null
          title: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          date?: string | null
          excerpt?: string | null
          id?: number | null
          image?: string | null
          is_published?: boolean | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          read_time?: string | null
          slug?: string | null
          title?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          date?: string | null
          excerpt?: string | null
          id?: number | null
          image?: string | null
          is_published?: boolean | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          read_time?: string | null
          slug?: string | null
          title?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      anonymize_ip: {
        Args: { ip_addr: unknown }
        Returns: string
      }
      can_manage_users: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          _action: string
          _identifier: string
          _max_attempts?: number
          _window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_contact_submissions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_appointment_reminders: {
        Args: { appointment_id_param: string }
        Returns: undefined
      }
      create_code_settings_table_directly: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_code_settings_table_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      decrypt_contact_data: {
        Args: { encrypted_data: string }
        Returns: string
      }
      decrypt_sensitive_data: {
        Args: { encrypted_data: string }
        Returns: string
      }
      encrypt_contact_data: {
        Args: { data: string }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: { data: string }
        Returns: string
      }
      enhanced_rate_limit_check: {
        Args: {
          _action: string
          _block_duration_minutes?: number
          _identifier: string
          _max_attempts?: number
          _window_minutes?: number
        }
        Returns: Json
      }
      generate_ics_event: {
        Args: { appointment_id_param: string }
        Returns: string
      }
      get_all_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          email_confirmed_at: string
          last_sign_in_at: string
          roles: string[]
          user_id: string
        }[]
      }
      get_code_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          body_code: string
          head_code: string
        }[]
      }
      get_contact_submissions_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          consent_given: boolean
          created_at: string
          email: string
          id: string
          ip_address: string
          message: string
          name: string
          phone: string
          status: string
          subject: string
          updated_at: string
          user_agent: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_patient_secure: {
        Args: { patient_id: string }
        Returns: {
          address: string
          allergies: string
          contraindications: string
          created_at: string
          date_of_birth: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          medical_notes: string
          notes: string
          phone: string
          skin_type: string
          source: string
          updated_at: string
        }[]
      }
      get_pending_reminders: {
        Args: Record<PropertyKey, never>
        Returns: {
          appointment_id: string
          duration_minutes: number
          id: string
          patient_email: string
          patient_name: string
          pre_treatment_notes: string
          reminder_type: string
          scheduled_date: string
          treatment_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
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
          _details?: Json
          _resource_id?: string
          _resource_type?: string
        }
        Returns: undefined
      }
      log_emergency_patient_access: {
        Args: { override_user?: string; patient_id: string; reason: string }
        Returns: undefined
      }
      log_patient_access: {
        Args: {
          access_type: string
          additional_metadata?: Json
          patient_id: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          _details?: Json
          _event_type: string
          _ip_address?: unknown
          _severity?: string
          _user_agent?: string
        }
        Returns: undefined
      }
      log_sensitive_access_attempt: {
        Args: { _action: string; _table_name: string }
        Returns: undefined
      }
      remove_user_role: {
        Args: {
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      search_patients: {
        Args: { search_term: string }
        Returns: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_appointment: string
          last_name: string
          phone: string
        }[]
      }
      search_patients_secure: {
        Args: { search_term: string }
        Returns: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_appointment: string
          last_name: string
          phone: string
        }[]
      }
      submit_contact_secure: {
        Args: {
          _consent_given: boolean
          _email: string
          _ip_address?: unknown
          _message: string
          _name: string
          _phone: string
          _subject: string
          _user_agent?: string
        }
        Returns: Json
      }
      update_code_settings: {
        Args: { p_body_code: string; p_head_code: string }
        Returns: undefined
      }
      validate_admin_contact_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_patient_access_session: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
