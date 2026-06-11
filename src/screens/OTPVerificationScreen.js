import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "../components";
import { colors, typography, spacing } from "../constants/theme";
import { AuthService } from "../services/authService";

const OTPVerificationScreen = ({ navigation, route }) => {
  // Change from 4 to 6 digits
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { email, role } = route.params || {};

  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input (change from 3 to 5)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");

    // Change from 4 to 6 digits
    if (otpString.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      // Verify OTP with Supabase
      const { data, error } = await AuthService.verifyOTP(email, otpString);

      if (error) {
        throw error;
      }

      // ✅ SUCCESS: Navigate directly to dashboard based on role
      // Remove the Alert.alert that might be blocking navigation

      if (role === "player") {
        navigation.replace("PlayerMain");
      } else if (role === "ground_owner") {
        navigation.replace("GroundOwnerMain");
      } else {
        navigation.replace("PlayerMain");
      }

      // Show success message AFTER navigation
      setTimeout(() => {
        Alert.alert(
          "🎉 Welcome to TRUFMATE!",
          "Your email has been verified successfully. Welcome to your dashboard!",
          [{ text: "Great!" }]
        );
      }, 100);
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      const { error } = await AuthService.resendOTP(email, role);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "OTP Sent",
          "A new verification code has been sent to your email."
        );
        setCountdown(60); // 60 second cooldown
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
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
                name="shield-checkmark-outline"
                size={80}
                color={colors.primary.main}
              />
            </View>

            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>We've sent a 6-digit code to:</Text>
            <Text style={styles.email}>{email}</Text>

            {/* OTP Input Fields - Update to 6 fields */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title="Verify Email"
                onPress={handleVerifyOTP}
                loading={loading}
                style={styles.primaryButton}
              />

              <Button
                title="Resend Code"
                onPress={handleResendOTP}
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
                {"\n"}• Enter all 6 digits of the verification code{"\n"}•
                Contact support if you continue to have issues
              </Text>
            </View>
          </Card>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already verified? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login", { role })}
            >
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
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%", // Change from 80% to 100%
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.md, // Add padding for better spacing
  },
  otpInput: {
    width: 45, // Reduce from 60 to 45 to fit 6 digits
    height: 60,
    borderWidth: 2,
    borderColor: colors.border.primary,
    borderRadius: spacing.sm,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    backgroundColor: colors.dark.surfaceColor,
    marginHorizontal: 2, // Add small margin between inputs
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

export default OTPVerificationScreen;
