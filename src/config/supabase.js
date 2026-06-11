import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project credentials
// You'll get these from your Supabase project dashboard
const supabaseUrl = "https://ldbvhochvyomcfegnubf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYnZob2NodnlvbWNmZWdudWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzI4MzMsImV4cCI6MjA3MDIwODgzM30.4yWjtd-1GHX1H13b0S_53lCzfVu3Kr2gY6CVg0UmLnA";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database table names
export const TABLES = {
  USERS: "users",
  TEAMS: "teams",
  TEAM_MEMBERS: "team_members",
  GROUNDS: "grounds",
  BOOKINGS: "bookings",
  MATCHES: "matches",
  MESSAGES: "messages",
  REVIEWS: "reviews",
};

// User roles
export const USER_ROLES = {
  PLAYER: "player",
  GROUND_OWNER: "ground_owner",
};

// Team member roles
export const TEAM_ROLES = {
  CAPTAIN: "captain",
  VICE_CAPTAIN: "vice_captain",
  PLAYER: "player",
};

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

// Match statuses
export const MATCH_STATUS = {
  UPCOMING: "upcoming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};
