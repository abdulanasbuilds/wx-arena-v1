export type GameId = "efootball" | "dls" | "free-fire" | "league-of-legends" | "cod" | "fortnite" | "pubg" | "apex-legends";
export type MatchType = "1v1" | "2v2" | "3v3" | "Squad";
export type MatchStatus = "pending" | "in_progress" | "completed" | "disputed" | "cancelled";
export type TournamentStatus = "open" | "in_progress" | "completed" | "cancelled";
export type Platform = "Android" | "iOS" | "PlayStation" | "Xbox" | "PC" | "Steam";

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  points: number;
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
  rank: number;
  streak: number;
  is_verified: boolean;
  is_pro: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  game_id: GameId;
  match_type: MatchType;
  status: MatchStatus;
  wager_points: number;
  player_1_id: string;
  player_2_id: string | null;
  winner_id: string | null;
  created_at: string;
  completed_at: string | null;
  player_1?: UserProfile | null;
  player_2?: UserProfile | null;
}

export interface Tournament {
  id: string;
  title: string;
  game_id: GameId;
  status: TournamentStatus;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  start_time: string;
  created_at: string;
}

export interface LinkedGame {
  id: string;
  user_id: string;
  game_id: GameId;
  platform: Platform;
  external_id: string;
  display_name: string;
  is_verified: boolean;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: "earn" | "spend" | "wager" | "win" | "refund" | "purchase";
  points: number;
  description: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: UserProfile;
  username?: string;
  avatar_url?: string | null;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: "direct" | "group" | "game_room";
  game_id?: GameId;
  participants: string[];
  last_message?: ChatMessage;
  unread_count: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
