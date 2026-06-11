import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { Button, Card } from "../components";
import { colors, typography, spacing } from "../constants/theme";

const RoleSelectionScreen = ({ navigation }) => {
  const handlePlayerSelection = () => {
    navigation.navigate("Login", { role: "player" });
  };

  const handleGroundOwnerSelection = () => {
    navigation.navigate("Login", { role: "ground_owner" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.dark.backgroundColor}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>Select how you want to use TrufMate</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>I'm a Player</Text>
          <Text style={styles.cardDescription}>
            Join teams, book grounds, and play sports
          </Text>
          <Button
            title="Continue as Player"
            onPress={handlePlayerSelection}
            style={styles.button}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>I'm a Ground Owner</Text>
          <Text style={styles.cardDescription}>
            Manage grounds, handle bookings, and connect with players
          </Text>
          <Button
            title="Continue as Ground Owner"
            onPress={handleGroundOwnerSelection}
            variant="secondary"
            style={styles.button}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
  },

  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },

  title: {
    ...typography.h1,
    fontSize: 28,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.body,
    textAlign: "center",
    color: colors.text.secondary,
    marginBottom: spacing.xxxl,
  },

  card: {
    marginBottom: spacing.xl,
  },

  cardTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },

  cardDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },

  button: {
    marginTop: spacing.sm,
  },
});

export default RoleSelectionScreen;
