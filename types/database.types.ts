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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_reward_log: {
        Row: {
          created_at: string
          id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_earned: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_reward_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_members: {
        Row: {
          id: string
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          game_id: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          game_id?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          game_id?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          game_id: string | null
          id: string
          is_public: boolean
          max_members: number
          member_count: number
          name: string
          owner_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          game_id?: string | null
          id?: string
          is_public?: boolean
          max_members?: number
          member_count?: number
          name: string
          owner_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          game_id?: string | null
          id?: string
          is_public?: boolean
          max_members?: number
          member_count?: number
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      linked_games: {
        Row: {
          created_at: string
          display_name: string
          external_id: string
          game_id: string
          id: string
          is_verified: boolean
          platform: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          external_id: string
          game_id: string
          id?: string
          is_verified?: boolean
          platform: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          external_id?: string
          game_id?: string
          id?: string
          is_verified?: boolean
          platform?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "linked_games_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_queue: {
        Row: {
          created_at: string
          game_id: string
          id: string
          match_type: string
          matched_at: string | null
          matched_with: string | null
          status: string
          user_id: string
          wager_points: number
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          match_type: string
          matched_at?: string | null
          matched_with?: string | null
          status?: string
          user_id: string
          wager_points: number
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          match_type?: string
          matched_at?: string | null
          matched_with?: string | null
          status?: string
          user_id?: string
          wager_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_queue_matched_with_fkey"
            columns: ["matched_with"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          completed_at: string | null
          created_at: string
          game_id: string
          id: string
          match_type: string
          player_1_id: string
          player_2_id: string | null
          status: string
          wager_points: number
          winner_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          game_id: string
          id?: string
          match_type: string
          player_1_id: string
          player_2_id?: string | null
          status?: string
          wager_points: number
          winner_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          game_id?: string
          id?: string
          match_type?: string
          player_1_id?: string
          player_2_id?: string | null
          status?: string
          wager_points?: number
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_player_1_id_fkey"
            columns: ["player_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player_2_id_fkey"
            columns: ["player_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matchmaking_queue: {
        Row: {
          created_at: string
          game_id: string
          id: string
          match_type: string
          matched_at: string | null
          matched_with: string | null
          status: string
          user_id: string
          wager_points: number
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          match_type: string
          matched_at?: string | null
          matched_with?: string | null
          status?: string
          user_id: string
          wager_points: number
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          match_type?: string
          matched_at?: string | null
          matched_with?: string | null
          status?: string
          user_id?: string
          wager_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "matchmaking_queue_matched_with_fkey"
            columns: ["matched_with"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchmaking_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      online_status: {
        Row: {
          game_id: string | null
          is_online: boolean
          last_seen: string
          status_text: string | null
          user_id: string
        }
        Insert: {
          game_id?: string | null
          is_online?: boolean
          last_seen?: string
          status_text?: string | null
          user_id: string
        }
        Update: {
          game_id?: string | null
          is_online?: boolean
          last_seen?: string
          status_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "online_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          is_admin: boolean
          is_pro: boolean
          is_verified: boolean
          losses: number
          points: number
          rank: number
          referral_code: string | null
          streak: number
          total_matches: number
          updated_at: string
          username: string
          win_rate: number
          wins: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          is_admin?: boolean
          is_pro?: boolean
          is_verified?: boolean
          losses?: number
          points?: number
          rank?: number
          referral_code?: string | null
          streak?: number
          total_matches?: number
          updated_at?: string
          username: string
          win_rate?: number
          wins?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          is_pro?: boolean
          is_verified?: boolean
          losses?: number
          points?: number
          rank?: number
          referral_code?: string | null
          streak?: number
          total_matches?: number
          updated_at?: string
          username?: string
          win_rate?: number
          wins?: number
        }
        Relationships: []
      }
      tournament_entries: {
        Row: {
          final_rank: number | null
          id: string
          joined_at: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          final_rank?: number | null
          id?: string
          joined_at?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          final_rank?: number | null
          id?: string
          joined_at?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_entries_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          created_by: string | null
          current_participants: number
          entry_fee: number
          game_id: string
          id: string
          max_participants: number
          prize_pool: number
          start_time: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_participants?: number
          entry_fee?: number
          game_id: string
          id?: string
          max_participants?: number
          prize_pool?: number
          start_time: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_participants?: number
          entry_fee?: number
          game_id?: string
          id?: string
          max_participants?: number
          prize_pool?: number
          start_time?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          room_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          room_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          room_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "typing_indicators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          created_at: string
          description: string
          id: string
          points: number
          reference_id: string | null
          reference_type: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          account_name: string
          account_number: string
          amount: number
          bank_code: string
          created_at: string
          fee: number
          id: string
          points_deducted: number
          status: string
          total_deducted: number
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          amount: number
          bank_code: string
          created_at?: string
          fee: number
          id?: string
          points_deducted: number
          status?: string
          total_deducted: number
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          amount?: number
          bank_code?: string
          created_at?: string
          fee?: number
          id?: string
          points_deducted?: number
          status?: string
          total_deducted?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_community_members: {
        Args: { community_id: string }
        Returns: undefined
      }
      increment_community_members: {
        Args: { community_id: string }
        Returns: undefined
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
