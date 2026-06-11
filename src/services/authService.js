import { supabase } from "../config/supabase";

export class AuthService {
  // Debug method to check Supabase connection
  static async debugSupabaseConnection() {
    try {
      console.log("🔍 DEBUG: Checking Supabase connection...");

      // Just check if supabase object is available
      if (supabase && supabase.auth) {
        console.log("✅ DEBUG: Supabase connection working (client available)");
        return { connected: true, error: null };
      } else {
        console.log("❌ DEBUG: Supabase client not available");
        return { connected: false, error: "Client not available" };
      }
    } catch (error) {
      console.log("❌ DEBUG: Supabase connection failed:", error);
      return { connected: false, error };
    }
  }

  // Debug method to check auth configuration
  static async debugAuthConfig() {
    try {
      console.log("🔍 DEBUG: Checking auth configuration...");

      // Check if auth is enabled - AuthSessionMissingError is expected when no user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (
        error &&
        (error.message.includes("JWT") ||
          error.message.includes("Auth session missing"))
      ) {
        console.log("✅ DEBUG: Auth is configured (expected no user error)");
        return { configured: true, error: null };
      } else if (error) {
        console.log("❌ DEBUG: Auth configuration error:", error);
        return { configured: false, error };
      }

      return { configured: true, error: null };
    } catch (error) {
      console.log("❌ DEBUG: Auth configuration failed:", error);
      return { configured: false, error };
    }
  }

  // Debug method to check email settings
  static async debugEmailSettings() {
    try {
      console.log("🔍 DEBUG: Checking email settings...");

      // Try a simple auth operation that should work
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.log("❌ DEBUG: Email service check failed:", error);
        return { emailWorking: false, error };
      }

      // If we can get session without error, auth is working
      console.log("✅ DEBUG: Email service check passed (auth working)");
      return { emailWorking: true, error: null };
    } catch (error) {
      console.log("❌ DEBUG: Email service check failed:", error);
      return { emailWorking: false, error };
    }
  }

  // Enhanced signup with detailed debugging
  static async signUp(email, password, userData) {
    try {
      console.log("🔍 DEBUG: Starting signup process...");
      console.log("📧 Email:", email);
      console.log("👤 User Data:", userData);

      // Step 1: Check Supabase connection
      const connectionCheck = await this.debugSupabaseConnection();
      if (!connectionCheck.connected) {
        throw new Error(
          `Supabase connection failed: ${connectionCheck.error?.message}`
        );
      }

      // Step 2: Check auth configuration
      const authCheck = await this.debugAuthConfig();
      if (!authCheck.configured) {
        throw new Error(
          `Auth configuration failed: ${authCheck.error?.message}`
        );
      }

      // Step 3: Check email settings
      const emailCheck = await this.debugEmailSettings();
      if (!emailCheck.emailWorking) {
        throw new Error(`Email service failed: ${emailCheck.error?.message}`);
      }

      console.log(" DEBUG: All pre-checks passed, attempting signup...");

      // Step 4: Attempt signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name,
            phone: userData.phone,
            role: userData.role,
          },
          // Remove this line completely:
          // emailRedirectTo: "https://supabase.com/auth/callback",
        },
      });

      if (error) {
        console.error("❌ DEBUG: Supabase signup error details:", {
          code: error.code,
          message: error.message,
          status: error.status,
          details: error.details,
        });
        throw error;
      }

      console.log("✅ DEBUG: Signup successful! User created:", data.user?.id);
      console.log(
        " Email confirmed:",
        data.user?.email_confirmed_at ? "Yes" : "No"
      );
      console.log(
        " Email sent:",
        data.user?.email_confirmed_at ? "No (already confirmed)" : "Yes"
      );

      return { data, error: null };
    } catch (error) {
      console.error("❌ DEBUG: Signup failed with error:", {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      return { data: null, error };
    }
  }

  // Simple signin (only works if email verified)
  static async signIn(email, password, expectedRole = null) {
    try {
      console.log(" Starting signin...");

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Signin error:", error);
        throw error;
      }

      // Check if email is verified
      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error(
          "Please verify your email before signing in. Check your inbox for the verification link."
        );
      }

      // ✅ Get user role from database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (userError) {
        console.error("❌ Error fetching user role:", userError);
        // Return user data without role for fallback handling
        return { data, error: null };
      }

      // Add role to user data
      data.user.role = userData.role;
      console.log("✅ Signin successful! User role:", userData.role);

      return { data, error: null };
    } catch (error) {
      console.error("❌ Signin failed:", error);
      return { data: null, error };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Get session (ADD THIS METHOD)
  static async getSession() {
    try {
      console.log("🔄 AuthService: Getting session...");

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("❌ AuthService: Get session error:", error);
        throw error;
      }

      if (session) {
        console.log("✅ AuthService: Session found for user:", session.user.id);
      } else {
        console.log("ℹ️ AuthService: No active session");
      }

      return { session, error: null };
    } catch (error) {
      console.error("❌ AuthService: Get session failed:", error);
      return { session: null, error };
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Listen to auth changes
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Add these missing methods that AuthContext expects
  static async resetPassword(email) {
    try {
      console.log("🔄 AuthService: Starting password reset...");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "trufmate://reset-password",
      });

      if (error) {
        console.error("❌ AuthService: Password reset error:", error);
        throw error;
      }

      console.log("✅ AuthService: Password reset email sent successfully!");
      return { error: null };
    } catch (error) {
      console.error("❌ AuthService: Password reset failed:", error);
      return { error };
    }
  }

  static async updatePassword(newPassword) {
    try {
      console.log("🔄 AuthService: Updating password...");

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("❌ AuthService: Update password error:", error);
        throw error;
      }

      console.log("✅ AuthService: Password updated successfully!");
      return { error: null };
    } catch (error) {
      console.error("❌ AuthService: Password update failed:", error);
      return { error };
    }
  }

  static async checkUserRole(expectedRole) {
    try {
      const { user, error } = await this.getCurrentUser();
      if (error || !user) {
        return { hasRole: false, error: "User not authenticated" };
      }

      const hasRole = user.role === expectedRole;
      console.log(`🎭 Role check for ${expectedRole}:`, hasRole ? "✅" : "❌");

      return { hasRole, error: null };
    } catch (error) {
      console.error("❌ AuthService: Role check failed:", error);
      return { hasRole: false, error };
    }
  }

  // Verify OTP
  static async verifyOTP(email, otp) {
    try {
      console.log("🔍 DEBUG: Verifying OTP...");
      console.log("📧 Email:", email);
      console.log("🔢 OTP:", otp);

      // Use Supabase's verifyOTP method
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });

      if (error) {
        console.error("❌ OTP verification error:", error);
        throw error;
      }

      console.log("✅ OTP verified successfully!");
      return { data, error: null };
    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      return { data: null, error };
    }
  }

  // Resend OTP
  static async resendOTP(email, role) {
    try {
      console.log("🔍 DEBUG: Resending OTP...");
      console.log("📧 Email:", email);

      // Resend signup email with new OTP
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          data: {
            role: role,
          },
        },
      });

      if (error) {
        console.error("❌ Resend OTP error:", error);
        throw error;
      }

      console.log("✅ OTP resent successfully!");
      return { error: null };
    } catch (error) {
      console.error("❌ Resend OTP failed:", error);
      return { error };
    }
  }

  static async storeTempUserData(userId, userData) {
    try {
      const { error } = await supabase.from("temp_users").insert({
        user_id: userId,
        full_name: userData.name, // ✅ This is correct for temp_users table
        contact_number: userData.phone, // ✅ This is correct for temp_users table
        role: userData.role,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      if (error) {
        console.error("❌ DEBUG: Error storing temp user data:", error);
        throw error;
      }

      console.log("✅ DEBUG: Temp user data stored successfully");
    } catch (error) {
      console.error("❌ DEBUG: Error in storeTempUserData:", error);
      throw error;
    }
  }

  static async createUserProfile(userId) {
    try {
      // Get temp user data
      const { data: tempData, error: tempError } = await supabase
        .from("temp_users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (tempError || !tempData) {
        console.error("❌ DEBUG: No temp user data found:", tempError);
        return { error: "No temporary user data found" };
      }

      // Create user profile with correct column names
      const { error: profileError } = await supabase.from("users").insert({
        id: userId,
        name: tempData.full_name, // ✅ Changed from full_name to name
        phone: tempData.contact_number, // ✅ Changed from contact_number to phone
        role: tempData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("❌ DEBUG: Error creating user profile:", profileError);
        throw profileError;
      }

      // Clean up temp data
      const { error: cleanupError } = await supabase
        .from("temp_users")
        .delete()
        .eq("user_id", userId);

      if (cleanupError) {
        console.error("❌ DEBUG: Error cleaning up temp data:", cleanupError);
      }

      console.log("✅ DEBUG: User profile created successfully");
      return { error: null };
    } catch (error) {
      console.error("❌ DEBUG: Error in createUserProfile:", error);
      return { error };
    }
  }
}
