import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "../components";
import { colors, typography, spacing } from "../constants/theme";

const SplashScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    // Navigate to role selection
    navigation.navigate("RoleSelection");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.dark.backgroundColor}
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.dark.backgroundColor, colors.dark.surfaceColor]}
        style={styles.gradient}
      >
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons
              name="football-outline"
              size={60}
              color={colors.primary.main}
            />
          </View>
          <Text style={styles.appName}>TrufMate</Text>
          <Text style={styles.tagline}>Connect. Play. Compete.</Text>
        </View>

        {/* Welcome Card */}
        <Card style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to TrufMate</Text>
          <Text style={styles.welcomeDescription}>
            Your ultimate sports community platform. Join teams, book grounds,
            schedule matches, and connect with fellow players and ground owners.
          </Text>

          <View style={styles.featuresContainer}>
            <FeatureItem icon="people-outline" text="Join & Create Teams" />
            <FeatureItem icon="location-outline" text="Book Sports Grounds" />
            <FeatureItem icon="trophy-outline" text="Schedule Matches" />
            <FeatureItem icon="chatbubbles-outline" text="Real-time Chat" />
          </View>
        </Card>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            style={styles.getStartedButton}
          />

          {/* Development Button - Remove in production */}
          <Button
            title="🧪 Screen Tester (Dev)"
            onPress={() => navigation.navigate("ScreenTester")}
            style={styles.devButton}
            textStyle={styles.devButtonText}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={20} color={colors.primary.main} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
  },

  gradient: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  logoContainer: {
    alignItems: "center",
    marginTop: spacing.xxxl * 2,
    marginBottom: spacing.xxxl,
  },

  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.dark.surfaceColor,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },

  appName: {
    ...typography.h1,
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  tagline: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 16,
  },

  welcomeCard: {
    marginBottom: spacing.xl,
  },

  welcomeTitle: {
    ...typography.h2,
    textAlign: "center",
    marginBottom: spacing.lg,
    color: colors.text.primary,
  },

  welcomeDescription: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
    color: colors.text.secondary,
  },

  featuresContainer: {
    gap: spacing.md,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },

  featureText: {
    ...typography.body,
    marginLeft: spacing.md,
    color: colors.text.primary,
  },

  buttonContainer: {
    paddingBottom: spacing.xxxl,
  },

  getStartedButton: {
    marginTop: "auto",
  },

  devButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },

  devButtonText: {
    color: colors.dark.backgroundColor,
  },
});

export default SplashScreen;
