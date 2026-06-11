-- =========================================
-- TRUFMATE SUPABASE SCHEMA
-- Complete, Working, and Idempotent Version
-- =========================================

-- =========================================
-- ENUMS (Safe Creation - Idempotent)
-- =========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('player', 'ground_owner');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_role') THEN
        CREATE TYPE team_role AS ENUM ('captain', 'vice_captain', 'player');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
        CREATE TYPE match_status AS ENUM ('upcoming', 'completed', 'cancelled');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_target_type') THEN
        CREATE TYPE review_target_type AS ENUM ('team', 'ground');
    END IF;
END$$;

-- =========================================
-- TABLES (Safe Creation - Idempotent)
-- =========================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL,
    avatar_url TEXT,
    location JSONB,
    sports_pref TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sport_type TEXT NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role_in_team team_role NOT NULL DEFAULT 'player',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Grounds table
CREATE TABLE IF NOT EXISTS public.grounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location JSONB,
    sports TEXT[],
    amenities TEXT[],
    pitches INT,
    equipment TEXT,
    turf_type TEXT,
    images TEXT[],
    rating_avg NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ground_id UUID REFERENCES public.grounds(id) ON DELETE CASCADE,
    sport TEXT,
    team_size INT,
    date DATE,
    start_time TIME,
    end_time TIME,
    price NUMERIC,
    amount_paid NUMERIC,
    payment_status TEXT,
    refund_status TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_a_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    team_b_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    ground_id UUID REFERENCES public.grounds(id) ON DELETE SET NULL,
    date DATE,
    time TIME,
    status TEXT,
    score_a INT DEFAULT 0,
    score_b INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    target_type review_target_type NOT NULL,
    target_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ground_id UUID REFERENCES public.grounds(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Temporary users (24h expiry) for pre-verification storage
CREATE TABLE IF NOT EXISTS public.temp_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    contact_number TEXT,
    role user_role NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- =========================================
-- INDEXES (Safe Creation - Idempotent)
-- =========================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON public.teams(created_by);

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- Grounds indexes
CREATE INDEX IF NOT EXISTS idx_grounds_owner_id ON public.grounds(owner_id);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_ground_id ON public.bookings(ground_id);
CREATE INDEX IF NOT EXISTS idx_bookings_player_id ON public.bookings(player_id);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_team_a_id ON public.matches(team_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_team_b_id ON public.matches(team_b_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_target_type_target_id ON public.reviews(target_type, target_id);

-- Temp users indexes
CREATE INDEX IF NOT EXISTS idx_temp_users_email ON public.temp_users(email);
CREATE INDEX IF NOT EXISTS idx_temp_users_expires_at ON public.temp_users(expires_at);

-- =========================================
-- ROW LEVEL SECURITY (Safe Enable)
-- =========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temp_users ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS POLICIES (Safe Creation - Idempotent)
-- =========================================

-- Users policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile' AND tablename = 'users') THEN
        CREATE POLICY "Users can view their own profile" ON public.users
            FOR SELECT USING (auth.uid() = id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'users') THEN
        CREATE POLICY "Users can update their own profile" ON public.users
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile' AND tablename = 'users') THEN
        CREATE POLICY "Users can insert their own profile" ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END$$;

-- Teams policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view teams' AND tablename = 'teams') THEN
        CREATE POLICY "Anyone can view teams" ON public.teams
            FOR SELECT USING (true);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team creators can update their teams' AND tablename = 'teams') THEN
        CREATE POLICY "Team creators can update their teams" ON public.teams
            FOR UPDATE USING (auth.uid() = created_by);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create teams' AND tablename = 'teams') THEN
        CREATE POLICY "Users can create teams" ON public.teams
            FOR INSERT WITH CHECK (auth.uid() = created_by);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team creators can delete their teams' AND tablename = 'teams') THEN
        CREATE POLICY "Team creators can delete their teams" ON public.teams
            FOR DELETE USING (auth.uid() = created_by);
    END IF;
END$$;

-- Team members policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view team members' AND tablename = 'team_members') THEN
        CREATE POLICY "Anyone can view team members" ON public.team_members
            FOR SELECT USING (true);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team captains can manage team members' AND tablename = 'team_members') THEN
        CREATE POLICY "Team captains can manage team members" ON public.team_members
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.team_members tm
                    JOIN public.teams t ON tm.team_id = t.id
                    WHERE tm.user_id = auth.uid()
                    AND tm.role_in_team IN ('captain', 'vice_captain')
                    AND tm.team_id = public.team_members.team_id
                )
            );
    END IF;
END$$;

-- Grounds policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view grounds' AND tablename = 'grounds') THEN
        CREATE POLICY "Anyone can view grounds" ON public.grounds
            FOR SELECT USING (true);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Ground owners can manage their grounds' AND tablename = 'grounds') THEN
        CREATE POLICY "Ground owners can manage their grounds" ON public.grounds
            FOR ALL USING (auth.uid() = owner_id);
    END IF;
END$$;

-- Bookings policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view bookings' AND tablename = 'bookings') THEN
        CREATE POLICY "Anyone can view bookings" ON public.bookings
            FOR SELECT USING (true);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Players can create bookings' AND tablename = 'bookings') THEN
        CREATE POLICY "Players can create bookings" ON public.bookings
            FOR INSERT WITH CHECK (auth.uid() = player_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Players can update their own bookings' AND tablename = 'bookings') THEN
        CREATE POLICY "Players can update their own bookings" ON public.bookings
            FOR UPDATE USING (auth.uid() = player_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Ground owners can update bookings for their grounds' AND tablename = 'bookings') THEN
        CREATE POLICY "Ground owners can update bookings for their grounds" ON public.bookings
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.grounds g
                    WHERE g.id = public.bookings.ground_id
                    AND g.owner_id = auth.uid()
                )
            );
    END IF;
END$$;

-- Matches policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view matches' AND tablename = 'matches') THEN
        CREATE POLICY "Anyone can view matches" ON public.matches
            FOR SELECT USING (true);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team captains can create matches' AND tablename = 'matches') THEN
        CREATE POLICY "Team captains can create matches" ON public.matches
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.team_members tm
                    WHERE tm.team_id = public.matches.team_a_id
                    AND tm.user_id = auth.uid()
                    AND tm.role_in_team = 'captain'
                )
            );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team captains can update matches' AND tablename = 'matches') THEN
        CREATE POLICY "Team captains can update matches" ON public.matches
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.team_members tm
                    WHERE tm.team_id IN (public.matches.team_a_id, public.matches.team_b_id)
                    AND tm.user_id = auth.uid()
                    AND tm.role_in_team = 'captain'
                )
            );
    END IF;
END$$;

-- Messages policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view messages they sent or received' AND tablename = 'messages') THEN
        CREATE POLICY "Users can view messages they sent or received" ON public.messages
            FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can send messages' AND tablename = 'messages') THEN
        CREATE POLICY "Users can send messages" ON public.messages
            FOR INSERT WITH CHECK (auth.uid() = sender_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own messages' AND tablename = 'messages') THEN
        CREATE POLICY "Users can update their own messages" ON public.messages
            FOR UPDATE USING (auth.uid() = sender_id);
    END IF;
END$$;

-- Reviews policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view reviews' AND tablename = 'reviews') THEN
        CREATE POLICY "Anyone can view reviews" ON public.reviews
            FOR SELECT USING (true);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create reviews' AND tablename = 'reviews') THEN
        CREATE POLICY "Users can create reviews" ON public.reviews
            FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own reviews' AND tablename = 'reviews') THEN
        CREATE POLICY "Users can update their own reviews" ON public.reviews
            FOR UPDATE USING (auth.uid() = reviewer_id);
    END IF;
END$$;

-- Temp users policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create temp users' AND tablename = 'temp_users') THEN
        CREATE POLICY "Anyone can create temp users" ON public.temp_users
            FOR INSERT WITH CHECK (true);
    END IF;
END$$;

-- =========================================
-- FUNCTIONS (Safe Creation - Idempotent)
-- =========================================

-- Function for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate average rating for grounds
CREATE OR REPLACE FUNCTION public.update_ground_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_ground_id UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        target_ground_id := NEW.target_id;
    ELSIF TG_OP = 'UPDATE' THEN
        target_ground_id := NEW.target_id;
    ELSIF TG_OP = 'DELETE' THEN
        target_ground_id := OLD.target_id;
    END IF;

    IF target_ground_id IS NOT NULL AND 
       (TG_OP = 'INSERT' AND NEW.target_type = 'ground' OR
        TG_OP = 'UPDATE' AND NEW.target_type = 'ground' OR
        TG_OP = 'DELETE' AND OLD.target_type = 'ground') THEN
        UPDATE public.grounds 
        SET rating_avg = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.reviews 
            WHERE target_type = 'ground' 
            AND target_id = target_ground_id
        )
        WHERE id = target_ground_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to create a profile row when a new auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, phone, role, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'player'),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper: clean up expired temporary users
CREATE OR REPLACE FUNCTION public.cleanup_expired_temp_users()
RETURNS void AS $$
BEGIN
    DELETE FROM public.temp_users WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Helper: after verification, move temp data to verified users (if needed)
CREATE OR REPLACE FUNCTION public.verify_and_activate_user(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    temp_user_record RECORD;
    auth_user_record RECORD;
BEGIN
    SELECT * INTO temp_user_record FROM public.temp_users WHERE email = user_email AND expires_at > NOW();
    SELECT * INTO auth_user_record FROM auth.users WHERE email = user_email AND email_confirmed_at IS NOT NULL;

    IF temp_user_record.id IS NOT NULL AND auth_user_record.id IS NOT NULL THEN
        UPDATE public.users
        SET
            name = temp_user_record.full_name,
            phone = temp_user_record.contact_number,
            role = temp_user_record.role,
            updated_at = NOW()
        WHERE id = auth_user_record.id;

        DELETE FROM public.temp_users WHERE id = temp_user_record.id;
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: check whether a user is verified (exists in users and auth email confirmed)
CREATE OR REPLACE FUNCTION public.is_user_verified(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users au
        JOIN public.users pu ON pu.id = au.id
        WHERE au.email = user_email AND au.email_confirmed_at IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- OTP VERIFICATION SYSTEM (kept for diagnostics; safe under RLS)
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email_code ON public.otp_codes(email, code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes(expires_at);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert OTP codes' AND tablename = 'otp_codes') THEN
        CREATE POLICY "Anyone can insert OTP codes" ON public.otp_codes
            FOR INSERT WITH CHECK (true);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can verify OTP codes' AND tablename = 'otp_codes') THEN
        CREATE POLICY "Anyone can verify OTP codes" ON public.otp_codes
            FOR SELECT USING (true);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update OTP codes' AND tablename = 'otp_codes') THEN
        CREATE POLICY "Anyone can update OTP codes" ON public.otp_codes
            FOR UPDATE USING (true);
    END IF;
END$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_otp()
RETURNS void AS $$
BEGIN
    DELETE FROM public.otp_codes 
    WHERE expires_at < NOW() OR is_used = TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_otp(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    otp_code TEXT;
    expires_time TIMESTAMPTZ;
BEGIN
    otp_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    expires_time := NOW() + INTERVAL '10 minutes';

    DELETE FROM public.otp_codes WHERE email = user_email;

    INSERT INTO public.otp_codes (email, code, expires_at)
    VALUES (user_email, otp_code, expires_time);

    RETURN otp_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.verify_otp(user_email TEXT, otp_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    otp_record RECORD;
BEGIN
    SELECT * INTO otp_record 
    FROM public.otp_codes 
    WHERE email = user_email 
      AND code = otp_code 
      AND expires_at > NOW() 
      AND is_used = FALSE
    ORDER BY created_at DESC 
    LIMIT 1;

    IF otp_record.id IS NOT NULL THEN
        UPDATE public.otp_codes SET is_used = TRUE WHERE id = otp_record.id;
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- TRIGGERS (Safe Creation - Idempotent)
-- =========================================

-- Trigger to create user profile when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_grounds_updated_at ON public.grounds;
CREATE TRIGGER update_grounds_updated_at
    BEFORE UPDATE ON public.grounds
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update ground rating when reviews change
DROP TRIGGER IF EXISTS update_ground_rating_trigger ON public.reviews;
CREATE TRIGGER update_ground_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_ground_rating(); 

-- =========================================
-- COMPATIBILITY MIGRATIONS (Safe, Conditional)
-- Run BEFORE indexes/policies to avoid 42703 errors if old columns exist
-- =========================================

DO $$
BEGIN
  -- users.full_name -> users.name
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name'
  ) THEN
    EXECUTE 'ALTER TABLE public.users RENAME COLUMN full_name TO name';
  END IF;

  -- users.contact_number -> users.phone
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'contact_number'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone'
  ) THEN
    EXECUTE 'ALTER TABLE public.users RENAME COLUMN contact_number TO phone';
  END IF;

  -- team_members.role -> team_members.role_in_team
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'role'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'role_in_team'
  ) THEN
    EXECUTE 'ALTER TABLE public.team_members RENAME COLUMN role TO role_in_team';
  END IF;

  -- bookings.user_id -> bookings.player_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'player_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.bookings RENAME COLUMN user_id TO player_id';
  END IF;

  -- bookings.booking_date -> bookings.date
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'booking_date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'date'
  ) THEN
    EXECUTE 'ALTER TABLE public.bookings RENAME COLUMN booking_date TO date';
  END IF;

  -- bookings.booking_time -> bookings.start_time (if start_time missing)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'booking_time'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'start_time'
  ) THEN
    EXECUTE 'ALTER TABLE public.bookings RENAME COLUMN booking_time TO start_time';
  END IF;

  -- matches.match_date -> matches.date
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'match_date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'date'
  ) THEN
    EXECUTE 'ALTER TABLE public.matches RENAME COLUMN match_date TO date';
  END IF;

  -- matches.match_time -> matches.time
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'match_time'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'time'
  ) THEN
    EXECUTE 'ALTER TABLE public.matches RENAME COLUMN match_time TO time';
  END IF;
END;
$$;

-- =========================================
-- SAFE INDEX CREATION FOR BOOKINGS DATE COLUMN
-- Will target whichever date column exists
-- =========================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'date'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date)';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'booking_date'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date)';
  END IF;
END;
$$; 

-- Ensure schema/table privileges (usually default, but safe to add)
grant usage on schema public to anon, authenticated;
grant insert, select, update, delete on public.temp_users to anon, authenticated;

-- Make sure RLS is on
alter table public.temp_users enable row level security;

-- Clean conflicting policies (optional)
drop policy if exists "Anyone can create temp users" on public.temp_users;
drop policy if exists "temp_users insert open" on public.temp_users;

-- Create explicit open insert policy for both roles
create policy "temp_users insert open"
on public.temp_users
for insert
to anon, authenticated
with check (true);

-- Optional: allow reading own temp rows later if needed
-- create policy "temp_users read open"
-- on public.temp_users
-- for select
-- to anon, authenticated
-- using (true);

-- SELECT * FROM public.temp_users ORDER BY created_at DESC LIMIT 5;

-- =========================================
-- TEMP_USERS RLS HARDENED CONFIG (Idempotent)
-- Run-time safe: drops any existing policies and recreates permissive INSERT
-- =========================================
DO $$
DECLARE p RECORD;
BEGIN
  -- Ensure roles can use schema and table (safe grants)
  GRANT USAGE ON SCHEMA public TO anon, authenticated;
  GRANT INSERT, SELECT, UPDATE, DELETE ON public.temp_users TO anon, authenticated;

  -- RLS stays enabled
  ALTER TABLE public.temp_users ENABLE ROW LEVEL SECURITY;

  -- Drop ALL existing policies on temp_users to avoid conflicts
  FOR p IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'temp_users'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.temp_users', p.policyname);
  END LOOP;

  -- Recreate a clean INSERT policy for both anon and authenticated
  CREATE POLICY "temp_users insert open"
  ON public.temp_users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

  -- Optional: allow reading rows (useful for dashboard checks/tests)
  CREATE POLICY "temp_users select open"
  ON public.temp_users
  FOR SELECT
  TO anon, authenticated
  USING (true);
END$$;

-- =========================================
-- RPC: create_temp_user (bypass client-side RLS issues; SECURITY DEFINER)
-- Idempotent: replace function and set EXECUTE to anon/authenticated
-- =========================================
CREATE OR REPLACE FUNCTION public.create_temp_user(
  p_email TEXT,
  p_full_name TEXT,
  p_contact_number TEXT,
  p_role user_role,
  p_password_hash TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_id UUID;
BEGIN
  INSERT INTO public.temp_users(email, full_name, contact_number, role, password_hash)
  VALUES (p_email, p_full_name, p_contact_number, p_role, p_password_hash)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_temp_user(TEXT, TEXT, TEXT, user_role, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_temp_user(TEXT, TEXT, TEXT, user_role, TEXT) TO anon, authenticated;

-- Quick test (uncomment to run manually)
-- select public.create_temp_user('test+rps@example.com','RPC Tester','0000000000','player','demo');
-- select * from public.temp_users order by created_at desc limit 5;