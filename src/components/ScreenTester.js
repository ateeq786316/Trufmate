import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../constants/theme";

const ScreenTester = ({ navigation }) => {
  const screens = {
    Authentication: [
      { name: "Splash", route: "Splash" },
      { name: "Role Selection", route: "RoleSelection" },
      { name: "Login", route: "Login", params: { role: "player" } },
      { name: "Sign Up", route: "SignUp", params: { role: "player" } },
      {
        name: "Forgot Password",
        route: "ForgotPassword",
        params: { role: "player" },
      },
      { name: "Email Verification", route: "EmailVerification" },
    ],
    "Player Flow (Direct Access)": [
      { name: "Create Team", route: "CreateTeam" },
      { name: "Edit My Teams", route: "EditMyTeams" },
      { name: "Joined Teams", route: "JoinedTeams" },
      { name: "Ready For Match", route: "ReadyForMatch" },
      {
        name: "Book Ground",
        route: "BookGround",
        params: {
          ground: {
            name: "Premium Football Ground",
            location: "456 Sports Arena, Downtown",
            sport: "Football",
            price: 2000,
          },
        },
      },
      { name: "Match Details", route: "MatchDetails" },
      { name: "Chat Room", route: "ChatRoom" },
      { name: "Notifications", route: "Notifications" },
    ],
    "Ground Owner Flow (Direct Access)": [
      { name: "Add Ground", route: "AddGround" },
      { name: "Manage Grounds", route: "ManageGrounds" },
      { name: "Manage Schedule", route: "ManageSchedule" },
      { name: "Booking Requests", route: "BookingRequests" },
      { name: "Booking List", route: "BookingList" },
    ],
    "Tab Navigators (Access via Main)": [
      { name: "Player Main (Tab Navigator)", route: "PlayerMain" },
      { name: "Ground Owner Main (Tab Navigator)", route: "GroundOwnerMain" },
    ],
    Development: [
      { name: "Supabase Test", route: "SupabaseTest" },
      { name: "Debug Panel", route: "Debug" },
    ],
  };

  const navigateToScreen = (route, params = {}) => {
    try {
      navigation.navigate(route, params);
    } catch (error) {
      console.error(`Navigation error to ${route}:`, error);
    }
  };

  const renderScreenGroup = (groupTitle, screenList) => (
    <View key={groupTitle} style={styles.screenGroup}>
      <Text style={styles.groupTitle}>{groupTitle}</Text>
      {screenList.map((screen) => (
        <TouchableOpacity
          key={screen.name}
          style={styles.screenButton}
          onPress={() => navigateToScreen(screen.route, screen.params)}
        >
          <Text style={styles.screenButtonText}>{screen.name}</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.secondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🧪 Screen Tester</Text>
          <Text style={styles.subtitle}>
            Navigate to any screen for UI testing
          </Text>
        </View>

        {Object.entries(screens).map(([groupTitle, screenList]) =>
          renderScreenGroup(groupTitle, screenList)
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Tip: Tab navigators contain Profile, ChatList, and other screens
            accessible via bottom tabs
          </Text>
        </View>
      </ScrollView>
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
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.dark.surfaceColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
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
  screenGroup: {
    marginBottom: spacing.lg,
  },
  groupTitle: {
    ...typography.h2,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  screenButton: {
    backgroundColor: colors.dark.surfaceColor,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "500",
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.dark.surfaceColor,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
  },
});

export default ScreenTester;
