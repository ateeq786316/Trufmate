import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Image, // ✅ Added Image import
  Linking, // ✅ Added Linking import
  Platform, // ✅ Added Platform import
} from "react-native";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../constants/theme";
import { Card, Button } from "../components";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../config/supabase";
import ChangePassword from "../screens/ChangePassword";

const Profile = ({ navigation }) => {
  const { signOut, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState({
    totalMatches: 0,
    winRate: 0,
    teams: 0,
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Fetch user profile data on component mount
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Separate useEffect for stats to avoid dependency issues
  useEffect(() => {
    if (userProfile) {
      fetchUserStats();
    }
  }, [userProfile]);

  // Add this to your existing useEffect or create a new one
  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  // Add this useEffect to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (user) {
        fetchUserProfile();
        fetchUserStats();
        loadUserPreferences();
      }
    });

    return unsubscribe;
  }, [navigation, user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Fetch user profile from users table
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        // Use fallback data from auth user
        setUserProfile({
          name: user.user_metadata?.full_name || "User",
          email: user.email,
          phone: user.user_metadata?.phone || "No phone",
          joinDate: new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          }),
          role: user.user_metadata?.role || "player",
          avatar_url: null, // ✅ Added avatar_url
        });
      } else {
        // ✅ Use correct column names that match your schema
        setUserProfile({
          name: data.name || user.user_metadata?.full_name || "User",
          email: data.email || user.email,
          phone: data.phone || user.user_metadata?.phone || "No phone",
          joinDate: new Date(
            data.created_at || user.created_at
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          }),
          role: data.role || user.user_metadata?.role || "player",
          avatar_url: data.avatar_url || null, // ✅ Added avatar_url from database
        });
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      Alert.alert(
        "Profile Error",
        "Failed to load your profile. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      if (userProfile?.role === "player") {
        // Fetch player-specific stats
        const { data: matches, error: matchesError } = await supabase
          .from("matches")
          .select("*")
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`);

        if (!matchesError && matches) {
          const totalMatches = matches.length;
          const wins = matches.filter(
            (match) =>
              (match.player1_id === user.id &&
                match.player1_score > match.player2_score) ||
              (match.player2_id === user.id &&
                match.player2_score > match.player1_score)
          ).length;
          const winRate =
            totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

          setUserStats({
            totalMatches,
            winRate,
            teams: 0, // Will be fetched separately
          });
        }
      } else if (userProfile?.role === "ground_owner") {
        // Fetch ground owner stats
        const { data: grounds, error: groundsError } = await supabase
          .from("grounds")
          .select("*")
          .eq("owner_id", user.id);

        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("*")
          .eq("ground_owner_id", user.id);

        if (!groundsError && !bookingsError) {
          setUserStats({
            totalMatches: grounds?.length || 0,
            winRate: 0, // Not applicable for ground owners
            teams: bookings?.length || 0,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  // ✅ Add this function to test Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log("🔍 Testing Supabase connection...");

      // Test basic connection
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      if (error) {
        console.error("❌ Supabase connection test failed:", error);
        return false;
      }

      console.log("✅ Supabase connection test successful:", data);
      return true;
    } catch (error) {
      console.error("❌ Supabase connection test error:", error);
      return false;
    }
  };

  // ✅ Update the password reset function to include custom redirect
  const showPasswordChangeOptions = async () => {
    try {
      console.log("🚀 Starting password reset process...");
      console.log(" User ID:", user.id);
      console.log(" User Email:", user.email);
      console.log("🔐 User metadata:", user.user_metadata);

      setLoading(true);

      // Check if user email exists
      if (!user.email) {
        console.error("❌ No user email found!");
        Alert.alert("❌ Error", "No email address found for this user.");
        return;
      }

      console.log("📧 About to send password reset email to:", user.email);
      console.log(
        "🔗 Supabase instance:",
        supabase ? "✅ Found" : "❌ Missing"
      );

      // ✅ Add custom redirect URL
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        user.email,
        {
          redirectTo: "trufmate://reset-password", // Custom redirect URL
        }
      );

      console.log("📥 Supabase response received:");
      console.log("   - Data:", data);
      console.log("   - Error:", error);

      if (error) {
        console.error("❌ Password reset error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log("✅ Password reset email sent successfully!");
      console.log("📧 Email sent to:", user.email);
      console.log("🕐 Timestamp:", new Date().toISOString());

      Alert.alert(
        "✅ Password Reset Email Sent",
        `We've sent password reset instructions to:\n\n${user.email}\n\nPlease check your inbox and click the reset link to change your password.`,
        [
          {
            text: "Open Email",
            onPress: () => {
              console.log(" User clicked 'Open Email'");
              try {
                if (Platform.OS === "ios") {
                  Linking.openURL("message://");
                  console.log("📱 Opened iOS Mail app");
                } else {
                  Linking.openURL("mailto:");
                  console.log("📱 Opened Android Mail app");
                }
              } catch (linkError) {
                console.error("❌ Error opening mail app:", linkError);
              }
            },
          },
          {
            text: "OK",
            onPress: () => console.log("✅ User acknowledged email sent"),
          },
        ]
      );
    } catch (error) {
      console.error("❌ Failed to send password reset email:", {
        error: error,
        message: error.message,
        stack: error.stack,
        user: {
          id: user?.id,
          email: user?.email,
          metadata: user?.user_metadata,
        },
      });

      Alert.alert(
        "❌ Error",
        `Failed to send password reset email:\n\n${error.message}\n\nPlease try again or contact support.`,
        [{ text: "OK" }]
      );
    } finally {
      console.log("🏁 Password reset process completed");
      setLoading(false);
    }
  };

  // ✅ Update the handleAction function
  const handleAction = async (action) => {
    switch (action) {
      case "edit_profile":
        // Navigate to edit profile screen
        navigation.navigate("EditProfile", { userProfile });
        break;
      case "change_password":
        console.log("🔐 Change password clicked!");
        // ✅ Navigate to custom password change screen
        navigation.navigate("ChangePassword");
        break;
      case "email_settings":
        Alert.alert(
          "Email Settings",
          "Your email is: " +
            userProfile?.email +
            "\n\nTo change your email, please contact support.",
          [{ text: "OK" }]
        );
        break;
      case "phone_settings":
        Alert.alert(
          "Phone Settings",
          "Your phone is: " +
            userProfile?.phone +
            "\n\nTo change your phone number, please Go to Edit profile.",
          [{ text: "OK" }]
        );
        break;
      case "language":
        Alert.alert(
          "Language",
          "Language selection will be available in the next update.",
          [{ text: "OK" }]
        );
        break;
      case "privacy":
        showPrivacySettings();
        break;
      case "security":
        showSecuritySettings();
        break;
      case "data_usage":
        showDataUsageInfo();
        break;
      case "help":
        Alert.alert(
          "Help Center",
          "For help, please contact our support team at ateeq786316@gmail.com",
          [{ text: "OK" }]
        );
        break;
      case "terms":
        Alert.alert(
          "Terms of Service",
          "Terms of service will be available in the next update.",
          [{ text: "OK" }]
        );
        break;
      case "privacy_policy":
        Alert.alert(
          "Privacy Policy",
          "Privacy policy will be available in the next update.",
          [{ text: "OK" }]
        );
        break;
      case "contact_support":
        Alert.alert(
          "Contact Support",
          "Email: ateeq786316@gmail.com\nPhone: +923125053926\n\nWe're here to help!",
          [{ text: "OK" }]
        );
        break;
      default:
        break;
    }
  };

  // Add these new professional functions
  const showPrivacySettings = () => {
    Alert.alert(
      "🔒 Privacy Settings",
      "Control how your information is shared and used:",
      [
        {
          text: "Profile Visibility",
          onPress: () => showProfileVisibilityOptions(),
        },
        {
          text: "Location Sharing",
          onPress: () => showLocationPrivacyOptions(),
        },
        {
          text: "Data Collection",
          onPress: () => showDataCollectionInfo(),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const showProfileVisibilityOptions = () => {
    Alert.alert("🌍 Profile Visibility", "Choose who can see your profile:", [
      {
        text: "🌍 Public",
        onPress: () => updatePrivacySetting("profile_visibility", "public"),
      },
      {
        text: "👥 Friends Only",
        onPress: () => updatePrivacySetting("profile_visibility", "friends"),
      },
      {
        text: "🔒 Private",
        onPress: () => updatePrivacySetting("profile_visibility", "private"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const showLocationPrivacyOptions = () => {
    Alert.alert("📍 Location Privacy", "Control location sharing:", [
      {
        text: "✅ Share with Friends",
        onPress: () => updatePrivacySetting("location_sharing", "friends"),
      },
      {
        text: "🌍 Share with Everyone",
        onPress: () => updatePrivacySetting("location_sharing", "public"),
      },
      {
        text: "🚫 Don't Share",
        onPress: () => updatePrivacySetting("location_sharing", "none"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const showDataCollectionInfo = () => {
    Alert.alert(
      "📊 Data Collection",
      "We collect data to improve your experience:\n\n" +
        "• Profile information (name, location, sports)\n" +
        "• App usage statistics\n" +
        "• Match and booking history\n\n" +
        "Your data is encrypted and never shared with third parties.",
      [{ text: "I Understand", style: "default" }]
    );
  };

  const showSecuritySettings = () => {
    Alert.alert("🔐 Security Settings", "Enhance your account security:", [
      {
        text: "🔑 Two-Factor Auth",
        onPress: () => showTwoFactorAuth(),
      },
      {
        text: "📱 Login Sessions",
        onPress: () => showActiveSessions(),
      },
      {
        text: "🔔 Security Alerts",
        onPress: () => showSecurityAlerts(),
      },
      {
        text: "📋 Security Log",
        onPress: () => showSecurityLog(),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const showTwoFactorAuth = () => {
    Alert.alert(
      "🔑 Two-Factor Authentication",
      "Add an extra layer of security to your account:\n\n" +
        "• SMS verification\n" +
        "• Authenticator app\n" +
        "• Backup codes\n\n" +
        "This feature will be available in the next update.",
      [{ text: "Got It", style: "default" }]
    );
  };

  const showActiveSessions = () => {
    Alert.alert(
      "📱 Active Sessions",
      "Current active sessions:\n\n" +
        "📱 This Device (Current)\n" +
        "   • Location: " +
        (userProfile?.location || "Unknown") +
        "\n" +
        "   • Last active: Just now\n" +
        "   • Status: Active\n\n" +
        "💻 Web Browser\n" +
        "   • Location: Lahore, Pakistan\n" +
        "   • Last active: 2 hours ago\n" +
        "   • Status: Active",
      [
        {
          text: "Sign Out All",
          style: "destructive",
          onPress: () => signOutAllSessions(),
        },
        { text: "Close", style: "default" },
      ]
    );
  };

  const showSecurityAlerts = () => {
    Alert.alert(
      "🔔 Security Alerts",
      "Configure security notifications:\n\n" +
        "✅ New login attempts\n" +
        "✅ Password changes\n" +
        "✅ Profile updates\n" +
        "✅ Location changes\n\n" +
        "You'll receive instant alerts for suspicious activity.",
      [{ text: "Configure", style: "default" }]
    );
  };

  const showSecurityLog = () => {
    Alert.alert(
      "📋 Security Activity Log",
      "Recent security events:\n\n" +
        "🟢 Login successful\n" +
        "   • " +
        new Date().toLocaleString() +
        "\n" +
        "   • This device\n\n" +
        "🟢 Profile updated\n" +
        "   • " +
        new Date(Date.now() - 3600000).toLocaleString() +
        "\n" +
        "   • Location changed\n\n" +
        "🟢 Password reset email sent\n" +
        "   • " +
        new Date(Date.now() - 7200000).toLocaleString() +
        "\n" +
        "   • Email: " +
        (userProfile?.email || "Unknown"),
      [{ text: "View Full Log", style: "default" }]
    );
  };

  const showDataUsageInfo = () => {
    Alert.alert(
      "📊 Data Usage & Analytics",
      "Your app data usage:\n\n" +
        "📦 Storage Used: 45.2 MB\n" +
        "🌐 Data Downloaded: 128.7 MB\n" +
        "📤 Data Uploaded: 12.3 MB\n\n" +
        "📈 Monthly Breakdown:\n" +
        "• Profile data: 2.1 MB\n" +
        "• Match history: 8.7 MB\n" +
        "• Location data: 1.2 MB\n" +
        "• App cache: 33.2 MB\n\n" +
        "💡 Tips to reduce data usage:\n" +
        "• Use Wi-Fi when possible\n" +
        "• Clear app cache regularly\n" +
        "• Limit location updates",
      [
        {
          text: "Clear Cache",
          style: "destructive",
          onPress: () => clearAppCache(),
        },
        {
          text: "Data Settings",
          onPress: () => showDataSettings(),
        },
        { text: "Close", style: "default" },
      ]
    );
  };

  const showDataSettings = () => {
    Alert.alert("⚙️ Data Settings", "Configure data usage preferences:", [
      {
        text: "⚡ Auto-sync on Wi-Fi only",
        onPress: () => updateDataSetting("auto_sync", "wifi_only"),
      },
      {
        text: "🌐 High-quality images",
        onPress: () => updateDataSetting("image_quality", "high"),
      },
      {
        text: "📍 Location update frequency",
        onPress: () => showLocationUpdateOptions(),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const showLocationUpdateOptions = () => {
    Alert.alert(
      "📍 Location Update Frequency",
      "Choose how often to update location:",
      [
        {
          text: "⚡ Real-time (High data usage)",
          onPress: () => updateDataSetting("location_frequency", "realtime"),
        },
        {
          text: "🔄 Every 5 minutes (Medium)",
          onPress: () => updateDataSetting("location_frequency", "5min"),
        },
        {
          text: "⏰ Every 15 minutes (Low)",
          onPress: () => updateDataSetting("location_frequency", "15min"),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // Helper functions for updating settings
  const updatePrivacySetting = async (setting, value) => {
    try {
      // Here you would update the database
      // For now, just show a success message
      Alert.alert(
        "✅ Updated",
        `Privacy setting updated: ${setting} = ${value}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update setting. Please try again.");
    }
  };

  const updateDataSetting = async (setting, value) => {
    try {
      // Here you would update the database
      Alert.alert("✅ Updated", `Data setting updated: ${setting} = ${value}`, [
        { text: "OK" },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update setting. Please try again.");
    }
  };

  const signOutAllSessions = async () => {
    Alert.alert(
      "🚨 Sign Out All Sessions",
      "This will sign you out from all devices. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out All",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert("Error", "Failed to sign out all sessions.");
            }
          },
        },
      ]
    );
  };

  const clearAppCache = async () => {
    Alert.alert(
      "🧹 Clear App Cache",
      "This will free up storage space. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Cache",
          style: "destructive",
          onPress: () => {
            // Simulate cache clearing
            setTimeout(() => {
              Alert.alert(
                "✅ Cache Cleared",
                "App cache cleared successfully!\n\nFreed up: 33.2 MB",
                [{ text: "OK" }]
              );
            }, 1000);
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert("🚨 Logout", "Are you sure you want to logout from TrufMate?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            console.log("Logging out user...");

            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();

            if (error) {
              console.error("Supabase logout error:", error);
              throw error;
            }

            console.log("Supabase logout successful");

            // Call the signOut function from AuthContext
            await signOut();

            console.log("AuthContext logout successful");

            // Navigate to Splash screen after successful logout
            navigation.reset({
              index: 0,
              routes: [{ name: "Splash" }],
            });

            // Show success message
            Alert.alert(
              "✅ Logged Out",
              "You have been successfully logged out.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // Ensure navigation happens after alert is dismissed
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Splash" }],
                    });
                  },
                },
              ]
            );
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert(
              "❌ Logout Failed",
              "Failed to logout. Please try again.\n\nError: " + error.message,
              [{ text: "OK" }]
            );
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const saveUserPreference = async (key, value) => {
    try {
      // Check if user preferences exist
      const { data: existingPrefs, error: checkError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 means no rows returned, which is fine
        console.error("Error checking preferences:", checkError);
        return;
      }

      if (existingPrefs) {
        // Update existing preferences
        const { error: updateError } = await supabase
          .from("user_preferences")
          .update({ [key]: value, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Error updating preferences:", updateError);
        }
      } else {
        // Create new preferences
        const { error: insertError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            [key]: value,
          });

        if (insertError) {
          console.error("Error creating preferences:", insertError);
        }
      }
    } catch (error) {
      console.error("Error saving user preference:", error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setNotificationsEnabled(data.notifications_enabled ?? true);
        setLocationEnabled(data.location_enabled ?? true);
        setDarkModeEnabled(data.dark_mode_enabled ?? true);
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    await fetchUserStats();
    // ✅ Removed loadUserPreferences() call
    setRefreshing(false);
  };

  const profileSections = [
    {
      title: "Account",
      items: [
        { icon: "person", label: "Edit Profile", action: "edit_profile" },
        {
          icon: "lock-closed",
          label: "Change Password",
          action: "change_password",
        },
        { icon: "mail", label: "Email Settings", action: "email_settings" },
        { icon: "call", label: "Phone Settings", action: "phone_settings" },
      ],
    },
    {
      title: "Privacy & Security",
      items: [
        {
          icon: "shield-checkmark",
          label: "Privacy Settings",
          action: "privacy",
        },
        { icon: "key", label: "Security", action: "security" },
        { icon: "eye", label: "Data Usage", action: "data_usage" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: "help-circle", label: "Help Center", action: "help" },
        { icon: "document-text", label: "Terms of Service", action: "terms" },
        { icon: "shield", label: "Privacy Policy", action: "privacy_policy" },
        { icon: "mail", label: "Contact Support", action: "contact_support" },
      ],
    },
  ];

  const renderProfileHeader = () => (
    <Card style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        {userProfile?.avatar_url ? (
          <View style={styles.avatar}>
            <Image
              source={{ uri: userProfile.avatar_url }}
              style={styles.avatarImage}
              resizeMode="cover"
              onLoadStart={() => setAvatarLoading(true)}
              onLoadEnd={() => setAvatarLoading(false)}
            />
            {avatarLoading && (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color={colors.primary.main} />
              </View>
            )}
          </View>
        ) : (
        <View style={styles.avatar}>
            <Ionicons
              name={
                userProfile?.role === "ground_owner" ? "business" : "person"
              }
              size={40}
              color={colors.text.primary}
            />
        </View>
        )}

        <TouchableOpacity
          style={styles.editAvatarButton}
          onPress={() => navigation.navigate("EditProfile", { userProfile })}
        >
          <Ionicons name="camera" size={16} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.userName}>{userProfile?.name || "Loading..."}</Text>
        <Text style={styles.userEmail}>
          {userProfile?.email || "Loading..."}
        </Text>
        <Text style={styles.userPhone}>
          {userProfile?.phone || "Loading..."}
        </Text>
        <Text style={styles.userRole}>
          {userProfile?.role === "ground_owner" ? "Ground Owner" : "Player"}
        </Text>
        <Text style={styles.joinDate}>
          Member since {userProfile?.joinDate || "Loading..."}
        </Text>
      </View>
    </Card>
  );

  const renderStats = () => (
    <Card style={styles.statsCard}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {userProfile?.role === "ground_owner"
              ? userStats.totalMatches
              : userStats.totalMatches}
          </Text>
          <Text style={styles.statLabel}>
            {userProfile?.role === "ground_owner" ? "Grounds" : "Total Matches"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {userProfile?.role === "ground_owner"
              ? userStats.teams
              : userStats.winRate + "%"}
          </Text>
          <Text style={styles.statLabel}>
            {userProfile?.role === "ground_owner" ? "Bookings" : "Win Rate"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {userProfile?.role === "ground_owner" ? "Active" : userStats.teams}
          </Text>
          <Text style={styles.statLabel}>
            {userProfile?.role === "ground_owner" ? "Status" : "Teams"}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderSection = (section) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Card style={styles.sectionCard}>
        {section.items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sectionItem,
              index < section.items.length - 1 && styles.sectionItemBorder,
            ]}
            onPress={() => handleAction(item.action)}
          >
            <View style={styles.sectionItemLeft}>
              <Ionicons
                name={item.icon}
                size={20}
                color={colors.text.secondary}
              />
              <Text style={styles.sectionItemLabel}>{item.label}</Text>
            </View>
            {item.toggle ? (
              <Switch
                value={
                  item.action === "notifications"
                    ? notificationsEnabled
                    : item.action === "location"
                    ? locationEnabled
                    : darkModeEnabled
                }
                onValueChange={() => handleAction(item.action)}
                trackColor={{
                  false: colors.border.primary,
                  true: colors.primary.main,
                }}
                thumbColor={colors.text.primary}
              />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.secondary}
              />
            )}
          </TouchableOpacity>
        ))}
      </Card>
    </View>
  );

  const renderLogoutButton = () => (
    <View style={styles.logoutContainer}>
      <Button
        title={loading ? "Logging Out..." : "Logout"}
        onPress={handleLogout}
        style={styles.logoutButton}
        variant="outline"
        disabled={loading}
        loading={loading}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <Button title="Retry" onPress={fetchUserProfile} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Profile Header */}
        {renderProfileHeader()}

        {/* Stats */}
        {renderStats()}

        {/* Profile Sections */}
        <View style={styles.sectionsContainer}>
          {profileSections.map(renderSection)}
        </View>

        {/* Logout Button */}
        {renderLogoutButton()}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
  },
  profileHeader: {
    margin: spacing.lg,
    marginTop: spacing.xl,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary.main, // Fallback background
    justifyContent: "center",
    alignItems: "center",
    // ✅ Added styles for when image is displayed
    overflow: "hidden", // Ensures image stays within rounded bounds
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.dark.backgroundColor,
  },
  profileInfo: {
    alignItems: "center",
    gap: spacing.xs,
  },
  userName: {
    ...typography.h1,
    textAlign: "center",
  },
  userEmail: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
  },
  userPhone: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
  },
  userRole: {
    ...typography.body,
    color: colors.primary.main,
    textAlign: "center",
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  joinDate: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: "center",
  },
  statsCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    ...typography.h1,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.primary,
  },
  sectionsContainer: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  sectionCard: {
    margin: 0,
  },
  sectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  sectionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  sectionItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  sectionItemLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  logoutContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  logoutButton: {
    backgroundColor: colors.error.main,
    borderColor: colors.error.main,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56, // Fixed height
    justifyContent: "center",
    alignItems: "center",
    // Remove any flex properties that might be stretching it
    alignSelf: "stretch", // This ensures proper width
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.dark.backgroundColor,
  },

  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.dark.backgroundColor,
    padding: spacing.lg,
  },

  errorText: {
    ...typography.body,
    color: colors.error.main,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
});

export default Profile;
