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
      cleaning_records: {
        Row: {
          cleanedby: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          roomid: string | null
          verified: boolean
        }
        Insert: {
          cleanedby: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          roomid?: string | null
          verified?: boolean
        }
        Update: {
          cleanedby?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          roomid?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_records_roomid_fkey"
            columns: ["roomid"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          bankrefno: string | null
          checkindate: string
          checkoutdate: string
          created_at: string | null
          depositamount: number | null
          depositcollectedby: string | null
          depositpaymentmethod: string | null
          email: string | null
          id: string
          idnumber: string | null
          name: string
          phone: string
          roomid: string | null
        }
        Insert: {
          address?: string | null
          bankrefno?: string | null
          checkindate: string
          checkoutdate: string
          created_at?: string | null
          depositamount?: number | null
          depositcollectedby?: string | null
          depositpaymentmethod?: string | null
          email?: string | null
          id?: string
          idnumber?: string | null
          name: string
          phone: string
          roomid?: string | null
        }
        Update: {
          address?: string | null
          bankrefno?: string | null
          checkindate?: string
          checkoutdate?: string
          created_at?: string | null
          depositamount?: number | null
          depositcollectedby?: string | null
          depositpaymentmethod?: string | null
          email?: string | null
          id?: string
          idnumber?: string | null
          name?: string
          phone?: string
          roomid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_roomid_fkey"
            columns: ["roomid"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          cashin: number | null
          cashout: number | null
          created_at: string | null
          date: string
          expectedcheckins: number
          expectedcheckouts: number
          id: string
          occupiedrooms: number
          roomsneedcleaning: number
          totalrevenue: number
          totalrooms: number
          vacantrooms: number
        }
        Insert: {
          cashin?: number | null
          cashout?: number | null
          created_at?: string | null
          date?: string
          expectedcheckins: number
          expectedcheckouts: number
          id?: string
          occupiedrooms: number
          roomsneedcleaning: number
          totalrevenue: number
          totalrooms: number
          vacantrooms: number
        }
        Update: {
          cashin?: number | null
          cashout?: number | null
          created_at?: string | null
          date?: string
          expectedcheckins?: number
          expectedcheckouts?: number
          id?: string
          occupiedrooms?: number
          roomsneedcleaning?: number
          totalrevenue?: number
          totalrooms?: number
          vacantrooms?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          collectedby: string
          created_at: string | null
          customerid: string | null
          date: string
          id: string
          isrefund: boolean | null
          method: string
          notes: string | null
          roomid: string | null
          status: string
        }
        Insert: {
          amount: number
          collectedby: string
          created_at?: string | null
          customerid?: string | null
          date?: string
          id?: string
          isrefund?: boolean | null
          method: string
          notes?: string | null
          roomid?: string | null
          status: string
        }
        Update: {
          amount?: number
          collectedby?: string
          created_at?: string | null
          customerid?: string | null
          date?: string
          id?: string
          isrefund?: boolean | null
          method?: string
          notes?: string | null
          roomid?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_roomid_fkey"
            columns: ["roomid"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_reminders: {
        Row: {
          checkoutdate: string
          created_at: string | null
          customerid: string
          id: string
          reminderdate: string
          roomid: string
          status: string
        }
        Insert: {
          checkoutdate: string
          created_at?: string | null
          customerid: string
          id?: string
          reminderdate: string
          roomid: string
          status?: string
        }
        Update: {
          checkoutdate?: string
          created_at?: string | null
          customerid?: string
          id?: string
          reminderdate?: string
          roomid?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_reminders_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_reminders_roomid_fkey"
            columns: ["roomid"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          cleanedby: string | null
          created_at: string | null
          id: string
          lastcleaned: string | null
          rate: number
          roomnumber: string
          status: string
          type: string
        }
        Insert: {
          cleanedby?: string | null
          created_at?: string | null
          id?: string
          lastcleaned?: string | null
          rate: number
          roomnumber: string
          status: string
          type: string
        }
        Update: {
          cleanedby?: string | null
          created_at?: string | null
          id?: string
          lastcleaned?: string | null
          rate?: number
          roomnumber?: string
          status?: string
          type?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
