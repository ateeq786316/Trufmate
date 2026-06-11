import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../constants/theme";
import { Card, Button } from "../components";
import { Ionicons } from "@expo/vector-icons";

const GroundOwnerHome = ({ navigation }) => {
  const [stats] = useState({
    totalBookings: 24,
    pendingBookings: 3,
    completedBookings: 18,
    totalRevenue: 12500,
    thisMonth: 3200,
  });

  const [upcomingMatches] = useState([
    {
      id: "1",
      teamA: "Thunder Hawks",
      teamB: "Lightning Strikers",
      date: "2025-08-15",
      time: "18:00",
      ground: "Main Pitch",
      sport: "Football",
      status: "confirmed",
    },
    {
      id: "2",
      teamA: "City Warriors",
      teamB: "Dragon Riders",
      date: "2025-08-16",
      time: "20:00",
      ground: "Cricket Ground",
      sport: "Cricket",
      status: "pending",
    },
  ]);

  const [recentBookings] = useState([
    {
      id: "1",
      player: "Ahmed Khan",
      sport: "Football",
      date: "2025-08-15",
      time: "18:00-20:00",
      amount: 800,
      status: "confirmed",
    },
    {
      id: "2",
      player: "Sara Ahmed",
      sport: "Cricket",
      date: "2025-08-16",
      time: "20:00-22:00",
      amount: 1200,
      status: "pending",
    },
  ]);

  const [notifications] = useState([
    {
      id: "1",
      type: "booking",
      message: "New booking request from Ahmed Khan",
      time: "2 hours ago",
    },
    {
      id: "2",
      type: "review",
      message: "New review received for Main Pitch",
      time: "1 day ago",
    },
  ]);

  const handleQuickAction = (action) => {
    switch (action) {
      case "addGround":
        navigation.navigate("AddGround");
        break;
      case "manageGrounds":
        navigation.navigate("ManageGrounds");
        break;
      case "bookings":
        navigation.navigate("BookingRequests");
        break;
      case "schedule":
        navigation.navigate("ManageSchedule");
        break;
      default:
        break;
    }
  };

  const renderQuickActionButton = (
    icon,
    title,
    action,
    color = colors.primary.main
  ) => (
    <TouchableOpacity
      style={[styles.quickActionButton, { backgroundColor: color }]}
      onPress={() => handleQuickAction(action)}
    >
      <Ionicons name={icon} size={24} color={colors.text.primary} />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  const renderStatCard = (
    title,
    value,
    subtitle,
    icon,
    color = colors.primary.main
  ) => (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={20} color={colors.text.primary} />
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </Card>
  );

  const renderMatchCard = (match) => (
    <Card key={match.id} style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Text style={styles.matchSport}>{match.sport}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                match.status === "confirmed"
                  ? colors.success.main
                  : colors.warning.main,
            },
          ]}
        >
          <Text style={styles.statusText}>{match.status}</Text>
        </View>
      </View>
      <View style={styles.matchTeams}>
        <Text style={styles.teamName}>{match.teamA}</Text>
        <Text style={styles.vsText}>vs</Text>
        <Text style={styles.teamName}>{match.teamB}</Text>
      </View>
      <View style={styles.matchDetails}>
        <Text style={styles.matchTime}>{match.time}</Text>
        <Text style={styles.matchGround}>{match.ground}</Text>
      </View>
      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </Card>
  );

  const renderBookingCard = (booking) => (
    <Card key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingPlayer}>{booking.player}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                booking.status === "confirmed"
                  ? colors.success.main
                  : colors.warning.main,
            },
          ]}
        >
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>
      <Text style={styles.bookingSport}>{booking.sport}</Text>
      <View style={styles.bookingDetails}>
        <Text style={styles.bookingDate}>{booking.date}</Text>
        <Text style={styles.bookingTime}>{booking.time}</Text>
      </View>
      <View style={styles.bookingFooter}>
        <Text style={styles.bookingAmount}>Rs. {booking.amount}</Text>
        {booking.status === "pending" && (
          <View style={styles.bookingActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => Alert.alert("Accept Booking", "Booking accepted!")}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => Alert.alert("Reject Booking", "Booking rejected")}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );

  const renderNotification = (notification) => (
    <View key={notification.id} style={styles.notificationItem}>
      <View
        style={[
          styles.notificationIcon,
          {
            backgroundColor:
              notification.type === "booking"
                ? colors.primary.main
                : colors.success.main,
          },
        ]}
      >
        <Ionicons
          name={notification.type === "booking" ? "calendar" : "star"}
          size={16}
          color={colors.text.primary}
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Heading */}
      <View style={styles.topHeading}>
        <Text style={styles.topHeadingText}>GROUND OWNER DASHBOARD</Text>
        <Text style={styles.topHeadingSubtext}>Manage Your Sports Empire</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subtitleText}>
          Manage your grounds and bookings
        </Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {renderStatCard(
            "Total Bookings",
            stats.totalBookings,
            "All time",
            "calendar",
            colors.primary.main
          )}
          {renderStatCard(
            "Pending",
            stats.pendingBookings,
            "Awaiting approval",
            "time",
            colors.warning.main
          )}
          {renderStatCard(
            "Completed",
            stats.completedBookings,
            "This month",
            "checkmark-circle",
            colors.success.main
          )}
          {renderStatCard(
            "Revenue",
            `Rs. ${stats.totalRevenue}`,
            `Rs. ${stats.thisMonth} this month`,
            "cash",
            colors.secondary.main
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {renderQuickActionButton(
            "add",
            "Add Ground",
            "addGround",
            colors.success.main
          )}
          {renderQuickActionButton(
            "settings",
            "Manage Grounds",
            "manageGrounds"
          )}
          {renderQuickActionButton(
            "calendar",
            "Booking Requests",
            "bookings",
            colors.warning.main
          )}
          {renderQuickActionButton(
            "time",
            "Manage Schedule",
            "schedule",
            colors.secondary.main
          )}
        </View>
      </View>

      {/* Upcoming Matches */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Matches</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("ManageSchedule")}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {upcomingMatches.map(renderMatchCard)}
      </View>

      {/* Recent Bookings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("BookingRequests")}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentBookings.map(renderBookingCard)}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {notifications.map(renderNotification)}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
  },
  topHeading: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
  },
  topHeadingText: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: "center",
  },
  topHeadingSubtext: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.md, // Adjusted padding to make space for top heading
  },
  welcomeText: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitleText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  statsContainer: {
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  statCard: {
    width: "48%",
    marginBottom: spacing.md,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  statTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  statValue: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  statSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  quickActionsContainer: {
    padding: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  quickActionButton: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    ...shadows.button,
  },
  quickActionText: {
    ...typography.body,
    color: colors.text.primary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
  },
  seeAllText: {
    ...typography.body,
    color: colors.primary.main,
  },
  matchCard: {
    marginBottom: spacing.md,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  matchSport: {
    ...typography.h3,
    color: colors.primary.main,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  matchTeams: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  teamName: {
    ...typography.h3,
    flex: 1,
    textAlign: "center",
  },
  vsText: {
    ...typography.body,
    color: colors.text.secondary,
    marginHorizontal: spacing.sm,
  },
  matchDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  matchTime: {
    ...typography.body,
    color: colors.text.secondary,
  },
  matchGround: {
    ...typography.body,
    color: colors.text.secondary,
  },
  viewDetailsButton: {
    alignSelf: "flex-end",
  },
  viewDetailsText: {
    ...typography.body,
    color: colors.primary.main,
  },
  bookingCard: {
    marginBottom: spacing.md,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  bookingPlayer: {
    ...typography.h3,
  },
  bookingSport: {
    ...typography.body,
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  bookingDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  bookingDate: {
    ...typography.body,
    color: colors.text.secondary,
  },
  bookingTime: {
    ...typography.body,
    color: colors.text.secondary,
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingAmount: {
    ...typography.h3,
    color: colors.success.main,
  },
  bookingActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  acceptButton: {
    backgroundColor: colors.success.main,
  },
  rejectButton: {
    backgroundColor: colors.error.main,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default GroundOwnerHome;
