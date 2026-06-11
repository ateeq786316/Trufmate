import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthService } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check for existing session on app start
    checkUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session) {
        await handleUserSession(session);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      console.log("🔄 Checking for existing user session...");
      const { session } = await AuthService.getSession();

      if (session) {
        await handleUserSession(session);
      }
    } catch (error) {
      console.error("❌ Error checking user session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSession = async (session) => {
    try {
      console.log("🔄 Handling user session...");
      const { user, error } = await AuthService.getCurrentUser();

      if (error) {
        console.error("❌ Error getting current user:", error);
        setUser(null);
        setSession(null);
        return;
      }

      if (user) {
        console.log("✅ User session established:", user.full_name);
        console.log("🎭 User role:", user.role);
        setUser(user);
        setSession(session);
      }
    } catch (error) {
      console.error("❌ Error handling user session:", error);
      setUser(null);
      setSession(null);
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      console.log("🔄 AuthContext: Starting signup...");
      const { data, error } = await AuthService.signUp(
        email,
        password,
        userData
      );

      if (error) {
        console.error("❌ AuthContext: Signup failed:", error);
        throw error;
      }

      console.log("✅ AuthContext: Signup successful!");
      return { data, error: null };
    } catch (error) {
      console.error("❌ AuthContext: Signup error:", error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password, role = null) => {
    try {
      console.log("🔄 AuthContext: Starting signin...");
      console.log("🎭 Expected role:", role);

      const { data, error } = await AuthService.signIn(email, password, role);

      if (error) {
        console.error("❌ AuthContext: Signin failed:", error);
        throw error;
      }

      if (data?.user) {
        console.log("✅ AuthContext: Signin successful!");
        console.log("👤 User:", data.user.full_name);
        console.log("🎭 Role:", data.user.role);
        setUser(data.user);
        setSession(data.session);
      }

      return { data, error: null };
    } catch (error) {
      console.error("❌ AuthContext: Signin error:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log("🔄 AuthContext: Starting signout...");
      const { error } = await AuthService.signOut();

      if (error) {
        console.error("❌ AuthContext: Signout failed:", error);
        throw error;
      }

      console.log("✅ AuthContext: Signout successful!");
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      console.error("❌ AuthContext: Signout error:", error);
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      console.log("🔄 AuthContext: Starting password reset...");
      const { error } = await AuthService.resetPassword(email);

      if (error) {
        console.error("❌ AuthContext: Password reset failed:", error);
        throw error;
      }

      console.log("✅ AuthContext: Password reset email sent!");
      return { error: null };
    } catch (error) {
      console.error("❌ AuthContext: Password reset error:", error);
      return { error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      console.log("🔄 AuthContext: Starting password update...");
      const { error } = await AuthService.updatePassword(newPassword);

      if (error) {
        console.error("❌ AuthContext: Password update failed:", error);
        throw error;
      }

      console.log("✅ AuthContext: Password updated successfully!");
      return { error: null };
    } catch (error) {
      console.error("❌ AuthContext: Password update error:", error);
      return { error };
    }
  };

  const checkUserRole = async (expectedRole) => {
    try {
      const { hasRole, error } = await AuthService.checkUserRole(expectedRole);

      if (error) {
        console.error("❌ AuthContext: Role check failed:", error);
        return { hasRole: false, error };
      }

      return { hasRole, error: null };
    } catch (error) {
      console.error("❌ AuthContext: Role check error:", error);
      return { hasRole: false, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    checkUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
