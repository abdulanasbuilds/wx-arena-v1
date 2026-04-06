-- =============================================================================
-- WX ARENA — Supabase Database Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

-- =============================================================================
-- TABLES
-- =============================================================================

-- 1. profiles — extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT         UNIQUE NOT NULL
                              CHECK (
                                char_length(username) >= 3 AND
                                char_length(username) <= 20 AND
                                username ~ '^[a-zA-Z0-9_]+$'
                              ),
  avatar_url    TEXT,
  bio           TEXT         CHECK (char_length(bio) <= 150),
  points        INTEGER      NOT NULL DEFAULT 1000,
  total_matches INTEGER      NOT NULL DEFAULT 0,
  wins          INTEGER      NOT NULL DEFAULT 0,
  losses        INTEGER      NOT NULL DEFAULT 0,
  win_rate      NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  rank          INTEGER      NOT NULL DEFAULT 9999,
  streak        INTEGER      NOT NULL DEFAULT 0,
  is_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
  is_pro        BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 2. matches
CREATE TABLE IF NOT EXISTS public.matches (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id      TEXT        NOT NULL
                            CHECK (game_id IN ('efootball','dls','free-fire','league-of-legends','cod','fortnite')),
  match_type   TEXT        NOT NULL
                            CHECK (match_type IN ('1v1','2v2','3v3','Squad')),
  status       TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','in_progress','completed','disputed','cancelled')),
  wager_points INTEGER     NOT NULL
                            CHECK (wager_points >= 50 AND wager_points <= 10000),
  player_1_id  UUID        NOT NULL REFERENCES public.profiles(id),
  player_2_id  UUID        REFERENCES public.profiles(id),
  winner_id    UUID        REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 3. tournaments
CREATE TABLE IF NOT EXISTS public.tournaments (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT        NOT NULL,
  game_id              TEXT        NOT NULL
                                    CHECK (game_id IN ('efootball','dls','free-fire','league-of-legends','cod','fortnite')),
  status               TEXT        NOT NULL DEFAULT 'open'
                                    CHECK (status IN ('open','in_progress','completed','cancelled')),
  entry_fee            INTEGER     NOT NULL DEFAULT 0,
  prize_pool           INTEGER     NOT NULL DEFAULT 0,
  max_participants     INTEGER     NOT NULL DEFAULT 16,
  current_participants INTEGER     NOT NULL DEFAULT 0,
  start_time           TIMESTAMPTZ NOT NULL,
  created_by           UUID        REFERENCES public.profiles(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. tournament_entries
CREATE TABLE IF NOT EXISTS public.tournament_entries (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID        NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  final_rank    INTEGER,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, user_id)
);

-- 5. wallet_transactions
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL
                           CHECK (type IN ('earn','spend','wager','win','refund','purchase')),
  points      INTEGER     NOT NULL,
  description TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. linked_games
CREATE TABLE IF NOT EXISTS public.linked_games (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id      TEXT        NOT NULL
                            CHECK (game_id IN ('efootball','dls','free-fire','league-of-legends','cod','fortnite')),
  platform     TEXT        NOT NULL
                            CHECK (platform IN ('Android','iOS','PlayStation','Xbox','PC','Steam')),
  external_id  TEXT        NOT NULL,
  display_name TEXT        NOT NULL,
  is_verified  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, game_id)
);

-- 7. chat_rooms
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  type       TEXT        NOT NULL
                          CHECK (type IN ('direct','group','game_room')),
  game_id    TEXT        CHECK (game_id IN ('efootball','dls','free-fire','league-of-legends','cod','fortnite')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. chat_room_members
CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id   UUID        NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_id, user_id)
);

-- 9. chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    UUID        NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  content    TEXT        NOT NULL CHECK (char_length(content) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY — Enable on all tables
-- =============================================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linked_games       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages      ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES — profiles
-- =============================================================================

-- Any authenticated user can view all profiles (public leaderboard, etc.)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can only delete their own profile
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Profiles are inserted automatically via trigger (no direct INSERT policy needed)
-- but allowing service role implicitly handles this via SECURITY DEFINER trigger.

-- =============================================================================
-- RLS POLICIES — matches
-- =============================================================================

-- Any authenticated user can view all matches
CREATE POLICY "matches_select_authenticated"
  ON public.matches
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Any authenticated user can create a match (as player_1)
CREATE POLICY "matches_insert_authenticated"
  ON public.matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_1_id);

-- Only participants (player_1 or player_2) can update a match
CREATE POLICY "matches_update_participants"
  ON public.matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_1_id OR auth.uid() = player_2_id)
  WITH CHECK (auth.uid() = player_1_id OR auth.uid() = player_2_id);

-- =============================================================================
-- RLS POLICIES — tournaments
-- =============================================================================

-- Any authenticated user can view tournaments
CREATE POLICY "tournaments_select_authenticated"
  ON public.tournaments
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- INSERT is restricted to admins only (blocked for regular users)
CREATE POLICY "tournaments_insert_admin_only"
  ON public.tournaments
  FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

-- =============================================================================
-- RLS POLICIES — tournament_entries
-- =============================================================================

-- Any authenticated user can view tournament entries
CREATE POLICY "tournament_entries_select_authenticated"
  ON public.tournament_entries
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users can only insert their own tournament entry
CREATE POLICY "tournament_entries_insert_own"
  ON public.tournament_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own entry if the tournament is still open
CREATE POLICY "tournament_entries_delete_own_if_open"
  ON public.tournament_entries
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1
      FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.status = 'open'
    )
  );

-- =============================================================================
-- RLS POLICIES — wallet_transactions
-- =============================================================================

-- Users can only view their own transactions
CREATE POLICY "wallet_transactions_select_own"
  ON public.wallet_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only insert their own transaction records
CREATE POLICY "wallet_transactions_insert_own"
  ON public.wallet_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE allowed on wallet_transactions (immutable ledger)

-- =============================================================================
-- RLS POLICIES — linked_games
-- =============================================================================

-- Users can only view their own linked games
CREATE POLICY "linked_games_select_own"
  ON public.linked_games
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only link games to their own account
CREATE POLICY "linked_games_insert_own"
  ON public.linked_games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own linked game entries
CREATE POLICY "linked_games_delete_own"
  ON public.linked_games
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES — chat_rooms
-- =============================================================================

-- Members can see rooms they belong to; game_rooms are public to all authenticated users
CREATE POLICY "chat_rooms_select_member_or_game_room"
  ON public.chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    type = 'game_room'
    OR EXISTS (
      SELECT 1
      FROM public.chat_room_members m
      WHERE m.room_id = id
        AND m.user_id = auth.uid()
    )
  );

-- =============================================================================
-- RLS POLICIES — chat_messages
-- =============================================================================

-- Only room members can read messages
CREATE POLICY "chat_messages_select_members"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.chat_room_members m
      WHERE m.room_id = room_id
        AND m.user_id = auth.uid()
    )
  );

-- Only room members can post messages
CREATE POLICY "chat_messages_insert_members"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1
      FROM public.chat_room_members m
      WHERE m.room_id = room_id
        AND m.user_id = auth.uid()
    )
  );

-- =============================================================================
-- RLS POLICIES — chat_room_members
-- =============================================================================

-- Any authenticated user can see room membership lists
CREATE POLICY "chat_room_members_select_authenticated"
  ON public.chat_room_members
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users can only add themselves to a room
CREATE POLICY "chat_room_members_insert_own"
  ON public.chat_room_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- TRIGGER — Auto-create profile on user signup
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(NEW.id::text, 1, 8)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- INDEXES — Performance
-- =============================================================================

-- matches: lookups by player, status, and game
CREATE INDEX IF NOT EXISTS idx_matches_player_1_id  ON public.matches (player_1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player_2_id  ON public.matches (player_2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status       ON public.matches (status);
CREATE INDEX IF NOT EXISTS idx_matches_game_id      ON public.matches (game_id);

-- wallet_transactions: per-user history sorted by newest first
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id    ON public.wallet_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions (created_at DESC);

-- profiles (leaderboard): sorted by points descending
CREATE INDEX IF NOT EXISTS idx_profiles_points_desc ON public.profiles (points DESC);

-- chat_messages: per-room history sorted by newest first
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id    ON public.chat_messages (room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages (created_at DESC);

-- tournament_entries: lookups by tournament and user
CREATE INDEX IF NOT EXISTS idx_tournament_entries_tournament_id ON public.tournament_entries (tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_entries_user_id       ON public.tournament_entries (user_id);

-- linked_games: lookups by user
CREATE INDEX IF NOT EXISTS idx_linked_games_user_id ON public.linked_games (user_id);

-- chat_room_members: lookups by room and user
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room_id ON public.chat_room_members (room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id ON public.chat_room_members (user_id);
