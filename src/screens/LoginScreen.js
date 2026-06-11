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
// ✅ Fix the import path
import { supabase } from "../config/supabase";

const LoginScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { signIn } = useAuth();

  // Get selected role from previous screen
  const selectedRole = route.params?.role || "player";

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        throw error;
      }

      // ✅ Navigate based on user role from AuthService
      if (data.user?.role === "player") {
        navigation.navigate("PlayerMain");
      } else if (data.user?.role === "ground_owner") {
        navigation.navigate("GroundOwnerMain");
      } else {
        // Fallback to selected role if no role found
        if (selectedRole === "player") {
          navigation.navigate("PlayerMain");
        } else if (selectedRole === "ground_owner") {
          navigation.navigate("GroundOwnerMain");
        } else {
          navigation.navigate("PlayerMain"); // Default fallback
        }
      }
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error.message || "Failed to sign in. Please try again."
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
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.roleText}>
                {selectedRole === "player" ? "Player" : "Ground Owner"} Login
              </Text>
            </View>
          </View>

          {/* Login Form */}
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Sign In</Text>
            <Text style={styles.formSubtitle}>
              Access your{" "}
              {selectedRole === "player" ? "Player" : "Ground Owner"} account
            </Text>

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
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              style={styles.submitButton}
            />

            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ForgotPassword", { role: selectedRole })
                }
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("SignUp", { role: selectedRole })
              }
            >
              <Text style={styles.signupLink}>Sign Up</Text>
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

  forgotPasswordButton: {
    alignItems: "center",
    marginTop: spacing.lg,
  },

  forgotPasswordText: {
    ...typography.body,
    color: colors.primary.main,
    fontSize: 14,
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
  },

  signupText: {
    ...typography.body,
    color: colors.text.secondary,
  },

  signupLink: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: "600",
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  forgotPasswordText: {
    ...typography.body,
    color: colors.primary.main,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
