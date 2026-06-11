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
import { Card } from "../components";
import { Ionicons } from "@expo/vector-icons";

const Notifications = ({ navigation }) => {
  const [notifications] = useState([
    {
      id: "1",
      type: "match", // match, team, ground, system
      title: "Match Reminder",
      message: "Your match against Lightning United starts in 2 hours",
      timestamp: "2 min ago",
      isRead: false,
      action: "view_match",
      actionData: { matchId: "123" },
      icon: "football",
      iconColor: colors.primary.main,
    },
    {
      id: "2",
      type: "team",
      title: "Team Invitation",
      message: "Thunder FC has invited you to join their team",
      timestamp: "1 hour ago",
      isRead: false,
      action: "view_invitation",
      actionData: { teamId: "456" },
      icon: "people",
      iconColor: colors.secondary.main,
    },
    {
      id: "3",
      type: "ground",
      title: "Booking Confirmed",
      message: "Your booking for Central Turf has been confirmed for tomorrow",
      timestamp: "3 hours ago",
      isRead: true,
      action: "view_booking",
      actionData: { bookingId: "789" },
      icon: "location",
      iconColor: colors.success.main,
    },
    {
      id: "4",
      type: "system",
      title: "App Update",
      message: "New version available with improved performance and features",
      timestamp: "1 day ago",
      isRead: true,
      action: "update_app",
      actionData: {},
      icon: "refresh",
      iconColor: colors.warning.main,
    },
    {
      id: "5",
      type: "match",
      title: "Match Result",
      message: "Your team won against City United! Final score: 3-1",
      timestamp: "2 days ago",
      isRead: true,
      action: "view_result",
      actionData: { matchId: "101" },
      icon: "trophy",
      iconColor: colors.success.main,
    },
    {
      id: "6",
      type: "team",
      title: "Team Update",
      message: "New player Sara Ahmed has joined Thunder FC",
      timestamp: "3 days ago",
      isRead: true,
      action: "view_team",
      actionData: { teamId: "456" },
      icon: "person-add",
      iconColor: colors.primary.main,
    },
    {
      id: "7",
      type: "ground",
      title: "Ground Maintenance",
      message: "Central Turf will be closed for maintenance on Friday",
      timestamp: "1 week ago",
      isRead: true,
      action: "view_ground",
      actionData: { groundId: "111" },
      icon: "construct",
      iconColor: colors.warning.main,
    },
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "match":
        return "football";
      case "team":
        return "people";
      case "ground":
        return "location";
      case "system":
        return "settings";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "match":
        return colors.primary.main;
      case "team":
        return colors.secondary.main;
      case "ground":
        return colors.success.main;
      case "system":
        return colors.warning.main;
      default:
        return colors.text.secondary;
    }
  };

  const handleNotificationPress = (notification) => {
    if (!notification.isRead) {
      // Mark as read logic would go here
      console.log("Marking notification as read:", notification.id);
    }

    switch (notification.action) {
      case "view_match":
        Alert.alert("View Match", "Opening match details...");
        // navigation.navigate("MatchDetails", { matchId: notification.actionData.matchId });
        break;
      case "view_invitation":
        Alert.alert("Team Invitation", "Opening team invitation...");
        // navigation.navigate("TeamInvitation", { teamId: notification.actionData.teamId });
        break;
      case "view_booking":
        Alert.alert("View Booking", "Opening booking details...");
        // navigation.navigate("BookingDetails", { bookingId: notification.actionData.bookingId });
        break;
      case "update_app":
        Alert.alert("App Update", "Redirecting to app store...");
        break;
      case "view_result":
        Alert.alert("Match Result", "Opening match result...");
        // navigation.navigate("MatchResult", { matchId: notification.actionData.matchId });
        break;
      case "view_team":
        Alert.alert("Team Update", "Opening team details...");
        // navigation.navigate("TeamDetails", { teamId: notification.actionData.teamId });
        break;
      case "view_ground":
        Alert.alert("Ground Info", "Opening ground details...");
        // navigation.navigate("GroundDetails", { groundId: notification.actionData.groundId });
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      "Mark All as Read",
      "Are you sure you want to mark all notifications as read?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark All",
          onPress: () => {
            Alert.alert("Success", "All notifications marked as read!");
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "All notifications cleared!");
          },
        },
      ]
    );
  };

  const renderNotification = (notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons
          name={notification.icon}
          size={24}
          color={notification.iconColor}
        />
        {!notification.isRead && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.timestamp}>{notification.timestamp}</Text>
        </View>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
      </View>

      <TouchableOpacity style={styles.moreButton}>
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color={colors.text.secondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="notifications-off"
        size={64}
        color={colors.text.secondary}
      />
      <Text style={styles.emptyStateTitle}>No notifications</Text>
      <Text style={styles.emptyStateText}>
        You're all caught up! Check back later for new updates.
      </Text>
    </View>
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMarkAllAsRead}
          >
            <Ionicons
              name="checkmark-done"
              size={20}
              color={colors.primary.main}
            />
            <Text style={styles.actionButtonText}>Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearAll}
          >
            <Ionicons name="trash" size={20} color={colors.error.main} />
            <Text style={styles.actionButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length > 0
          ? notifications.map(renderNotification)
          : renderEmptyState()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.dark.surfaceColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    ...typography.h1,
  },
  unreadBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  unreadCount: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  unreadNotification: {
    backgroundColor: colors.primary.main + "10",
  },
  notificationIcon: {
    position: "relative",
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  notificationContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  notificationMessage: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  moreButton: {
    padding: spacing.sm,
    marginTop: -spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xxl,
    marginTop: spacing.xl,
  },
  emptyStateTitle: {
    ...typography.h2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default Notifications;
