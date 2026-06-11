import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "../components";
import { colors, typography, spacing } from "../constants/theme";
import { AuthService } from "../services/authService";

const EmailVerificationScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { email, role } = route.params || {};

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      const { error } = await AuthService.sendMagicLink(email, role);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "Email Sent",
          "A new verification email has been sent to your inbox."
        );
        setCountdown(60); // 60 second cooldown
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      // Check if user is verified
      const {
        data: { user },
        error,
      } = await AuthService.getCurrentUser();

      if (error) {
        throw error;
      }

      if (user?.email_confirmed_at) {
        Alert.alert(
          "Email Verified!",
          "Your email has been verified successfully. You can now sign in to your account.",
          [
            {
              text: "Sign In",
              onPress: () => navigation.navigate("Login", { role }),
            },
          ]
        );
      } else {
        Alert.alert(
          "Not Verified Yet",
          "Your email hasn't been verified yet. Please check your inbox and click the verification link."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to check verification status.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate("Login", { role });
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
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Verify Your Email</Text>
          </View>

          {/* Main Content */}
          <Card style={styles.mainCard}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="mail-outline"
                size={80}
                color={colors.primary.main}
              />
            </View>

            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification link to:
            </Text>
            <Text style={styles.email}>{email}</Text>

            <Text style={styles.description}>
              Click the link in your email to verify your account and start
              using TrufMate.
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title="I've Verified My Email"
                onPress={handleCheckVerification}
                loading={loading}
                style={styles.primaryButton}
              />

              <Button
                title="Resend Verification Email"
                onPress={handleResendEmail}
                loading={resendLoading}
                variant="secondary"
                style={styles.secondaryButton}
                disabled={countdown > 0}
              />

              {countdown > 0 && (
                <Text style={styles.countdown}>
                  Resend available in {countdown} seconds
                </Text>
              )}
            </View>

            {/* Help Section */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpText}>
                • Check your spam/junk folder{"\n"}• Make sure you entered the
                correct email{"\n"}• Wait a few minutes for the email to arrive
              </Text>
            </View>
          </Card>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already verified? </Text>
            <TouchableOpacity onPress={handleGoToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
    fontSize: 24,
  },
  mainCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  email: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    textAlign: "center",
    color: colors.text.secondary,
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: spacing.xl,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
  secondaryButton: {
    marginBottom: spacing.md,
  },
  countdown: {
    ...typography.caption,
    textAlign: "center",
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  helpContainer: {
    backgroundColor: colors.dark.surfaceColor,
    padding: spacing.lg,
    borderRadius: spacing.sm,
    marginBottom: spacing.lg,
  },
  helpTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  helpText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  loginText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  loginLink: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: "600",
  },
});

export default EmailVerificationScreen;
