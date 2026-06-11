import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "../components";
import { colors, typography, spacing } from "../constants/theme";
import { AuthService } from "../services/authService";

const DebugScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [debugResults, setDebugResults] = useState({});

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      const result = await AuthService.debugSupabaseConnection();
      setDebugResults((prev) => ({ ...prev, connection: result }));
      Alert.alert(
        "Connection Test",
        result.connected ? "✅ Connected" : "❌ Failed"
      );
    } catch (error) {
      Alert.alert("Connection Test Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const runAuthConfigTest = async () => {
    setLoading(true);
    try {
      const result = await AuthService.debugAuthConfig();
      setDebugResults((prev) => ({ ...prev, auth: result }));
      Alert.alert(
        "Auth Config Test",
        result.configured ? "✅ Configured" : "❌ Failed"
      );
    } catch (error) {
      Alert.alert("Auth Config Test Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const runEmailTest = async () => {
    setLoading(true);
    try {
      const result = await AuthService.debugEmailSettings();
      setDebugResults((prev) => ({ ...prev, email: result }));
      Alert.alert(
        "Email Test",
        result.emailWorking ? "✅ Working" : "❌ Failed"
      );
    } catch (error) {
      Alert.alert("Email Test Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const runFullSignupTest = async () => {
    setLoading(true);
    try {
      const testEmail = `test${Date.now()}@example.com`;
      const testData = {
        name: "Test User",
        phone: "1234567890",
        role: "player",
      };

      console.log("🔍 DEBUG: Running full signup test...");
      const result = await AuthService.signUp(
        testEmail,
        "testpass123",
        testData
      );

      if (result.error) {
        Alert.alert("Signup Test Failed", result.error.message);
      } else {
        Alert.alert("Signup Test Success", "Check console for detailed logs");
      }
    } catch (error) {
      Alert.alert("Signup Test Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.dark.backgroundColor, colors.dark.surfaceColor]}
        style={styles.gradient}
      >
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>🔍 Debug Panel</Text>
            <Text style={styles.subtitle}>System Diagnostics & Testing</Text>
          </View>

          <Card style={styles.debugCard}>
            <Text style={styles.sectionTitle}>Connection Tests</Text>

            <Button
              title="Test Supabase Connection"
              onPress={runConnectionTest}
              loading={loading}
              style={styles.debugButton}
            />

            <Button
              title="Test Auth Configuration"
              onPress={runAuthConfigTest}
              loading={loading}
              style={styles.debugButton}
            />

            <Button
              title="Test Email Service"
              onPress={runEmailTest}
              loading={loading}
              style={styles.debugButton}
            />

            <Button
              title="Run Full Signup Test"
              onPress={runFullSignupTest}
              loading={loading}
              style={styles.debugButton}
              variant="secondary"
            />
          </Card>

          <Card style={styles.resultsCard}>
            <Text style={styles.sectionTitle}>Debug Results</Text>
            <Text style={styles.resultText}>
              Connection: {debugResults.connection?.connected ? "✅" : "❌"}
            </Text>
            <Text style={styles.resultText}>
              Auth Config: {debugResults.auth?.configured ? "✅" : "❌"}
            </Text>
            <Text style={styles.resultText}>
              Email Service: {debugResults.email?.emailWorking ? "✅" : "❌"}
            </Text>
          </Card>

          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>🔍 How to Use:</Text>
            <Text style={styles.helpText}>
              1. Run "Test Supabase Connection" first{"\n"}
              2. Then "Test Auth Configuration"{"\n"}
              3. Then "Test Email Service"{"\n"}
              4. Finally "Run Full Signup Test"{"\n"}
              5. Check console logs for detailed info
            </Text>
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
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  debugCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  debugButton: {
    marginBottom: spacing.sm,
  },
  resultsCard: {
    marginBottom: spacing.lg,
  },
  resultText: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  helpSection: {
    backgroundColor: colors.dark.surfaceColor,
    padding: spacing.lg,
    borderRadius: spacing.sm,
  },
  helpTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  helpText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default DebugScreen;
