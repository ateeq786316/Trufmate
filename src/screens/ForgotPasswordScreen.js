import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Input } from "../components";
import { colors, typography, spacing } from "../constants/theme";
import { AuthService } from "../services/authService";

const ForgotPasswordScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const { error } = await AuthService.resetPassword(email);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setEmailSent(true);
        Alert.alert(
          "Reset Email Sent",
          "We've sent a password reset link to your email. Please check your inbox and follow the instructions."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setEmail("");
    setErrors({});
  };

  if (emailSent) {
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
              <Text style={styles.headerTitle}>Reset Password</Text>
            </View>

            {/* Success Content */}
            <Card style={styles.mainCard}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={80}
                  color={colors.success.main}
                />
              </View>

              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a password reset link to:
              </Text>
              <Text style={styles.email}>{email}</Text>

              <Text style={styles.description}>
                Click the link in your email to reset your password and regain
                access to your account.
              </Text>

              <View style={styles.buttonContainer}>
                <Button
                  title="Resend Email"
                  onPress={handleResendEmail}
                  variant="secondary"
                  style={styles.secondaryButton}
                />

                <Button
                  title="Back to Login"
                  onPress={() => navigation.navigate("Login")}
                  style={styles.primaryButton}
                />
              </View>

              {/* Help Section */}
              <View style={styles.helpContainer}>
                <Text style={styles.helpTitle}>Need Help?</Text>
                <Text style={styles.helpText}>
                  • Check your spam/junk folder{"\n"}• Make sure you entered the
                  correct email{"\n"}• Wait a few minutes for the email to
                  arrive{"\n"}• Contact support if you continue to have issues
                </Text>
              </View>
            </Card>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.headerTitle}>Forgot Password</Text>
          </View>

          {/* Main Content */}
          <Card style={styles.mainCard}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={80}
                color={colors.primary.main}
              />
            </View>

            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>

            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              style={styles.input}
            />

            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.primaryButton}
            />

            {/* Help Section */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>Remember Your Password?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.helpLink}>Sign In Instead</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  input: {
    width: "100%",
    marginBottom: spacing.xl,
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
  helpContainer: {
    backgroundColor: colors.dark.surfaceColor,
    padding: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: "center",
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
    textAlign: "center",
  },
  helpLink: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default ForgotPasswordScreen;
