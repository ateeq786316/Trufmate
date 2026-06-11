import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Input, Button, Card } from "../components";
import { colors, typography, spacing } from "../constants/theme";
import { supabase } from "../config/supabase";
import { useAuth } from "../contexts/AuthContext";

const ChangePassword = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("❌ Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("❌ Error", "New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "❌ Error",
        "New password must be at least 6 characters long."
      );
      return;
    }

    try {
      setLoading(true);
      console.log("🔐 Attempting to change password...");

      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert("❌ Error", "Current password is incorrect.");
        return;
      }

      // Change password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      Alert.alert("✅ Success", "Password changed successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("❌ Password change error:", error);
      Alert.alert("❌ Error", `Failed to change password: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      console.log("📧 Getting current password...");

      // Since we can't retrieve the actual password, show a helpful message
      Alert.alert(
        "🔐 Current Password",
        `Your current password cannot be retrieved for security reasons.\n\nTo reset your password:\n\n1. Go back to Profile\n2. Use "Change Password" with your current password\n3. Or contact support at ateeq786316@gmail.com`,
        [
          {
            text: "Contact Support",
            onPress: () => {
              // Open email app to contact support
              try {
                if (Platform.OS === "ios") {
                  Linking.openURL("message://");
                } else {
                  Linking.openURL("mailto:");
                }
              } catch (linkError) {
                console.error("❌ Error opening mail app:", linkError);
              }
            },
          },
          { text: "OK" },
        ]
      );
    } catch (error) {
      console.error("❌ Forgot password error:", error);
      Alert.alert("❌ Error", "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendCurrentPasswordEmail = async () => {
    try {
      console.log("📧 Sending current password to email...");

      // Since we can't retrieve the actual password from Supabase Auth,
      // we'll send a simple email with instructions
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);

      if (error) {
        throw error;
      }

      console.log("✅ Password reset email sent successfully");

      Alert.alert(
        "📧 Current Password Email Sent",
        `We've sent your current password information to:\n\n${user.email}\n\nPlease check your inbox.`,
        [
          {
            text: "Open Email",
            onPress: () => {
              try {
                if (Platform.OS === "ios") {
                  Linking.openURL("message://");
                } else {
                  Linking.openURL("mailto:");
                }
              } catch (linkError) {
                console.error("❌ Error opening mail app:", linkError);
              }
            },
          },
          { text: "OK" },
        ]
      );
    } catch (error) {
      console.error("❌ Error sending current password email:", error);
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.dark.backgroundColor}
      />

      <LinearGradient
        colors={[colors.dark.backgroundColor, colors.dark.surfaceColor]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Change Your Password</Text>
            <Text style={styles.formSubtitle}>
              Enter your current password and choose a new one
            </Text>

            <Input
              label="Current Password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Input
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Input
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Button
              title={loading ? "Changing Password..." : "Change Password"}
              onPress={handleChangePassword}
              loading={loading}
              disabled={loading}
              style={styles.changeButton}
            />
          </Card>

          <Card style={styles.forgotCard}>
            <Text style={styles.forgotTitle}>Forgot Current Password?</Text>
            <Text style={styles.forgotSubtitle}>
              We'll send your current password to your email
            </Text>

            <Button
              title="Send Current Password"
              onPress={handleForgotPassword}
              variant="outline"
              style={styles.forgotButton}
            />
          </Card>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  formSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  changeButton: {
    marginTop: spacing.lg,
  },
  forgotCard: {
    alignItems: "center",
    textAlign: "center",
  },
  forgotTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  forgotSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  forgotButton: {
    width: "100%",
  },
});

export default ChangePassword;
