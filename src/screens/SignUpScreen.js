import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Input } from "../components";
import { colors, typography, spacing } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";

const SignUpScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { signUp } = useAuth();

  // Get selected role from previous screen
  const selectedRole = route.params?.role || "player";

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        role: selectedRole,
      });

      if (error) {
        throw error;
      }

      // Simple success message
      Alert.alert(
        "Account Created!",
        `We've sent a verification email to ${formData.email}. Please check your inbox and click the verification link to activate your account.`,
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("OTPVerification", {
                email: formData.email,
                role: selectedRole,
              }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Signup Failed",
        error.message || "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
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

            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>Join TrufMate</Text>
              <Text style={styles.roleText}>
                {selectedRole === "player" ? "Player" : "Ground Owner"} Account
              </Text>
            </View>
          </View>

          {/* Sign Up Form */}
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>
              Join TrufMate as a{" "}
              {selectedRole === "player" ? "Player" : "Ground Owner"}
            </Text>

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
              error={errors.name}
            />

            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, confirmPassword: text })
              }
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              style={styles.submitButton}
            />

            {/* Email Verification Notice */}
            <View style={styles.noticeContainer}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.warning.main}
              />
              <Text style={styles.noticeText}>
                You'll receive a verification email. Your account will be
                activated after email verification.
              </Text>
            </View>
          </Card>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Login", { role: selectedRole })
              }
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },

  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },

  headerContent: {
    flex: 1,
  },

  welcomeText: {
    ...typography.h1,
    fontSize: 28,
    marginBottom: spacing.xs,
  },

  roleText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 16,
  },

  formCard: {
    marginBottom: spacing.xl,
  },

  formTitle: {
    ...typography.h2,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  formSubtitle: {
    ...typography.body,
    textAlign: "center",
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },

  submitButton: {
    marginTop: spacing.sm,
  },

  noticeContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.warning.main + "20",
    borderRadius: spacing.sm,
  },

  noticeText: {
    ...typography.body,
    color: colors.warning.main,
    fontSize: 12,
    marginLeft: spacing.sm,
    flex: 1,
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
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

export default SignUpScreen;
