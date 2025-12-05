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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addons: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      aircrafts: {
        Row: {
          business_seats: number
          columns: number
          created_at: string | null
          economy_seats: number
          first_class_seats: number
          id: string
          manufacturer: string
          model: string
          rows: number
          total_seats: number
        }
        Insert: {
          business_seats: number
          columns: number
          created_at?: string | null
          economy_seats: number
          first_class_seats: number
          id?: string
          manufacturer: string
          model: string
          rows: number
          total_seats: number
        }
        Update: {
          business_seats?: number
          columns?: number
          created_at?: string | null
          economy_seats?: number
          first_class_seats?: number
          id?: string
          manufacturer?: string
          model?: string
          rows?: number
          total_seats?: number
        }
        Relationships: []
      }
      airports: {
        Row: {
          city: string
          code: string
          country: string
          created_at: string | null
          id: string
          name: string
          terminal_info: string | null
          timezone: string
        }
        Insert: {
          city: string
          code: string
          country: string
          created_at?: string | null
          id?: string
          name: string
          terminal_info?: string | null
          timezone: string
        }
        Update: {
          city?: string
          code?: string
          country?: string
          created_at?: string | null
          id?: string
          name?: string
          terminal_info?: string | null
          timezone?: string
        }
        Relationships: []
      }
      booking_addons: {
        Row: {
          addon_id: string
          booking_id: string
          created_at: string | null
          id: string
          quantity: number
        }
        Insert: {
          addon_id: string
          booking_id: string
          created_at?: string | null
          id?: string
          quantity?: number
        }
        Update: {
          addon_id?: string
          booking_id?: string
          created_at?: string | null
          id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_addons_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_passengers: {
        Row: {
          age: number
          booking_id: string
          created_at: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          id_number: string
          id_type: string
          seat_id: string | null
          seat_number: string | null
        }
        Insert: {
          age: number
          booking_id: string
          created_at?: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          id_number: string
          id_type: string
          seat_id?: string | null
          seat_number?: string | null
        }
        Update: {
          age?: number
          booking_id?: string
          created_at?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          id_number?: string
          id_type?: string
          seat_id?: string | null
          seat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_passengers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_passengers_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          addon_charges: number | null
          base_fare: number
          booking_date: string | null
          booking_status: Database["public"]["Enums"]["booking_status"]
          created_at: string | null
          flight_instance_id: string
          id: string
          pnr: string
          taxes: number
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          addon_charges?: number | null
          base_fare: number
          booking_date?: string | null
          booking_status?: Database["public"]["Enums"]["booking_status"]
          created_at?: string | null
          flight_instance_id: string
          id?: string
          pnr: string
          taxes: number
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          addon_charges?: number | null
          base_fare?: number
          booking_date?: string | null
          booking_status?: Database["public"]["Enums"]["booking_status"]
          created_at?: string | null
          flight_instance_id?: string
          id?: string
          pnr?: string
          taxes?: number
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_flight_instance_id_fkey"
            columns: ["flight_instance_id"]
            isOneToOne: false
            referencedRelation: "flight_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          boarding_pass_generated: boolean | null
          booking_id: string
          checkin_time: string | null
          created_at: string | null
          id: string
          passenger_id: string
        }
        Insert: {
          boarding_pass_generated?: boolean | null
          booking_id: string
          checkin_time?: string | null
          created_at?: string | null
          id?: string
          passenger_id: string
        }
        Update: {
          boarding_pass_generated?: boolean | null
          booking_id?: string
          checkin_time?: string | null
          created_at?: string | null
          id?: string
          passenger_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "booking_passengers"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_instances: {
        Row: {
          aircraft_id: string
          arrival_time: string
          available_business_seats: number
          available_economy_seats: number
          available_first_class_seats: number
          business_price: number
          created_at: string | null
          departure_time: string
          economy_price: number
          first_class_price: number | null
          flight_date: string
          gate: string | null
          id: string
          status: Database["public"]["Enums"]["flight_status"]
          template_id: string
          updated_at: string | null
        }
        Insert: {
          aircraft_id: string
          arrival_time: string
          available_business_seats: number
          available_economy_seats: number
          available_first_class_seats: number
          business_price: number
          created_at?: string | null
          departure_time: string
          economy_price: number
          first_class_price?: number | null
          flight_date: string
          gate?: string | null
          id?: string
          status?: Database["public"]["Enums"]["flight_status"]
          template_id: string
          updated_at?: string | null
        }
        Update: {
          aircraft_id?: string
          arrival_time?: string
          available_business_seats?: number
          available_economy_seats?: number
          available_first_class_seats?: number
          business_price?: number
          created_at?: string | null
          departure_time?: string
          economy_price?: number
          first_class_price?: number | null
          flight_date?: string
          gate?: string | null
          id?: string
          status?: Database["public"]["Enums"]["flight_status"]
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_instances_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircrafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "flight_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_templates: {
        Row: {
          airline_name: string
          created_at: string | null
          flight_number: string
          id: string
          route_id: string
        }
        Insert: {
          airline_name?: string
          created_at?: string | null
          flight_number: string
          id?: string
          route_id: string
        }
        Update: {
          airline_name?: string
          created_at?: string | null
          flight_number?: string
          id?: string
          route_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_templates_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_booking_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_booking_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_booking_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          id: string
          payment_date: string | null
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_method: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string | null
          destination_airport_id: string
          distance_km: number
          duration_minutes: number
          id: string
          source_airport_id: string
        }
        Insert: {
          created_at?: string | null
          destination_airport_id: string
          distance_km: number
          duration_minutes: number
          id?: string
          source_airport_id: string
        }
        Update: {
          created_at?: string | null
          destination_airport_id?: string
          distance_km?: number
          duration_minutes?: number
          id?: string
          source_airport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_destination_airport_id_fkey"
            columns: ["destination_airport_id"]
            isOneToOne: false
            referencedRelation: "airports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_source_airport_id_fkey"
            columns: ["source_airport_id"]
            isOneToOne: false
            referencedRelation: "airports"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_cards: {
        Row: {
          card_last_four: string
          card_type: string
          cardholder_name: string
          created_at: string | null
          expiry_month: number
          expiry_year: number
          id: string
          user_id: string
        }
        Insert: {
          card_last_four: string
          card_type: string
          cardholder_name: string
          created_at?: string | null
          expiry_month: number
          expiry_year: number
          id?: string
          user_id: string
        }
        Update: {
          card_last_four?: string
          card_type?: string
          cardholder_name?: string
          created_at?: string | null
          expiry_month?: number
          expiry_year?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_passengers: {
        Row: {
          age: number
          created_at: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          id_number: string
          id_type: string
          user_id: string
        }
        Insert: {
          age: number
          created_at?: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          id_number: string
          id_type: string
          user_id: string
        }
        Update: {
          age?: number
          created_at?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          id_number?: string
          id_type?: string
          user_id?: string
        }
        Relationships: []
      }
      seats: {
        Row: {
          aircraft_id: string
          column_letter: string
          id: string
          is_aisle: boolean | null
          is_window: boolean | null
          row_number: number
          seat_class: Database["public"]["Enums"]["seat_class"]
          seat_number: string
        }
        Insert: {
          aircraft_id: string
          column_letter: string
          id?: string
          is_aisle?: boolean | null
          is_window?: boolean | null
          row_number: number
          seat_class: Database["public"]["Enums"]["seat_class"]
          seat_number: string
        }
        Update: {
          aircraft_id?: string
          column_letter?: string
          id?: string
          is_aisle?: boolean | null
          is_window?: boolean | null
          row_number?: number
          seat_class?: Database["public"]["Enums"]["seat_class"]
          seat_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "seats_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircrafts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      flight_status:
        | "scheduled"
        | "boarding"
        | "departed"
        | "arrived"
        | "delayed"
        | "cancelled"
      gender: "male" | "female" | "other"
      notification_type:
        | "booking_confirmation"
        | "checkin_reminder"
        | "flight_delay"
        | "flight_cancellation"
        | "gate_change"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      seat_class: "economy" | "business" | "first"
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
      app_role: ["admin", "customer"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      flight_status: [
        "scheduled",
        "boarding",
        "departed",
        "arrived",
        "delayed",
        "cancelled",
      ],
      gender: ["male", "female", "other"],
      notification_type: [
        "booking_confirmation",
        "checkin_reminder",
        "flight_delay",
        "flight_cancellation",
        "gate_change",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      seat_class: ["economy", "business", "first"],
    },
  },
} as const
