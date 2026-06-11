import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card } from "../components";
import { colors, spacing, typography } from "../constants/theme";
import { supabase } from "../config/supabase";

const SupabaseTestScreen = () => {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);

  const pushLog = (msg) => setLogs((prev) => [msg, ...prev]);

  const runTest = async () => {
    setRunning(true);
    setLogs([]);

    try {
      pushLog("Starting Supabase connectivity test...");

      // 1) Insert into temp_users (RLS: anyone can insert)
      const email = `test_${Date.now()}@example.com`;
      pushLog(`Inserting temp user: ${email}`);

      const { error: insertError } = await supabase.from("temp_users").insert({
        email,
        full_name: "Test User",
        contact_number: "0000000000",
        role: "player",
        password_hash: "demo",
      });

      if (insertError) {
        pushLog(`❌ Insert failed: ${insertError.message}`);
        return;
      }
      pushLog("✅ Insert succeeded (temp_users)");

      // 2) Call a simple RPC to verify DB functions accessible
      pushLog("Calling RPC: is_user_verified (should be false for temp user)");
      const { data: isVerified, error: rpcError } = await supabase.rpc(
        "is_user_verified",
        { user_email: email }
      );
      if (rpcError) {
        pushLog(`❌ RPC failed: ${rpcError.message}`);
      } else {
        pushLog(`✅ RPC succeeded. is_user_verified = ${String(isVerified)}`);
      }

      pushLog("All tests finished.");
    } catch (e) {
      pushLog(`❌ Unexpected error: ${e.message}`);
    } finally {
      setRunning(false);
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
        <View style={styles.header}>
          <Text style={styles.title}>Supabase Test</Text>
          <Text style={styles.subtitle}>Connectivity and basic data flow</Text>
        </View>

        <Card style={styles.card}>
          <Button
            title={running ? "Running..." : "Run Test"}
            onPress={runTest}
            disabled={running}
          />
        </Card>

        <Card style={styles.logCard}>
          <Text style={styles.logTitle}>Logs</Text>
          <ScrollView
            style={styles.logScroll}
            contentContainerStyle={styles.logContent}
          >
            {logs.length === 0 ? (
              <Text style={styles.logLineMuted}>Press "Run Test" to start</Text>
            ) : (
              logs.map((l, idx) => (
                <Text
                  key={idx}
                  style={
                    l.startsWith("❌") ? styles.logLineError : styles.logLine
                  }
                >
                  {l}
                </Text>
              ))
            )}
          </ScrollView>
        </Card>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.backgroundColor },
  gradient: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
  title: { ...typography.h1, fontSize: 24 },
  subtitle: { ...typography.body, color: colors.text.secondary },
  card: { marginBottom: spacing.lg },
  logCard: { flex: 1, minHeight: 200 },
  logTitle: { ...typography.h3, marginBottom: spacing.md },
  logScroll: { maxHeight: 360 },
  logContent: { paddingBottom: spacing.lg },
  logLine: { ...typography.body, color: colors.text.primary, marginBottom: 6 },
  logLineError: {
    ...typography.body,
    color: colors.error.main,
    marginBottom: 6,
  },
  logLineMuted: { ...typography.body, color: colors.text.secondary },
});

export default SupabaseTestScreen;
