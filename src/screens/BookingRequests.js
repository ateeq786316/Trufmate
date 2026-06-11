import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
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

const BookingRequests = ({ navigation }) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [bookingRequests, setBookingRequests] = useState([
    {
      id: "1",
      playerName: "Ahmed Khan",
      playerImage: "https://via.placeholder.com/50x50",
      teamName: "Thunder Hawks",
      sport: "Football",
      groundName: "Main Football Pitch",
      date: "2025-01-20",
      timeSlot: "18:00-20:00",
      duration: 2,
      amount: 800,
      status: "pending",
      requestTime: "2 hours ago",
      contact: "+92 300 1234567",
      players: 18,
      specialRequests: "Need extra balls and cones",
    },
    {
      id: "2",
      playerName: "Sara Ahmed",
      playerImage: "https://via.placeholder.com/50x50",
      teamName: "City Warriors",
      sport: "Cricket",
      groundName: "Cricket Ground",
      date: "2025-01-21",
      timeSlot: "20:00-22:00",
      duration: 2,
      amount: 1200,
      status: "pending",
      requestTime: "4 hours ago",
      contact: "+92 300 7654321",
      players: 22,
      specialRequests: "Lighting required",
    },
    {
      id: "3",
      playerName: "Muhammad Ali",
      playerImage: "https://via.placeholder.com/50x50",
      teamName: "Dragon Riders",
      sport: "Football",
      groundName: "Main Football Pitch",
      date: "2025-01-22",
      timeSlot: "16:00-18:00",
      duration: 2,
      amount: 800,
      status: "approved",
      requestTime: "1 day ago",
      contact: "+92 300 9876543",
      players: 20,
      specialRequests: null,
    },
    {
      id: "4",
      playerName: "Fatima Zahra",
      playerImage: "https://via.placeholder.com/50x50",
      teamName: "Lightning Strikers",
      sport: "Tennis",
      groundName: "Tennis Court",
      date: "2025-01-23",
      timeSlot: "10:00-12:00",
      duration: 2,
      amount: 600,
      status: "rejected",
      requestTime: "2 days ago",
      contact: "+92 300 4567890",
      players: 4,
      specialRequests: "Equipment rental needed",
      rejectionReason: "Court under maintenance",
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return colors.warning.main;
      case "approved":
        return colors.success.main;
      case "rejected":
        return colors.error.main;
      case "cancelled":
        return colors.onSurface + "60";
      default:
        return colors.onSurface + "60";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const handleApproveRequest = (requestId) => {
    setBookingRequests((prev) =>
      prev.map((request) =>
        request.id === requestId ? { ...request, status: "approved" } : request
      )
    );
    Alert.alert("Success", "Booking request approved!");
  };

  const handleRejectRequest = (requestId) => {
    Alert.prompt(
      "Reject Request",
      "Please provide a reason for rejection:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          onPress: (reason) => {
            setBookingRequests((prev) =>
              prev.map((request) =>
                request.id === requestId
                  ? {
                      ...request,
                      status: "rejected",
                      rejectionReason: reason || "No reason provided",
                    }
                  : request
              )
            );
            Alert.alert("Success", "Booking request rejected!");
          },
        },
      ],
      "plain-text"
    );
  };

  const handleContactPlayer = (contact) => {
    // TODO: Implement contact functionality
    Alert.alert("Contact", `Contact: ${contact}`);
  };

  const handleViewDetails = (request) => {
    // TODO: Navigate to detailed view
    Alert.alert("Booking Details", `View details for ${request.teamName}`);
  };

  const handleBulkAction = (action, selectedRequests) => {
    if (selectedRequests.length === 0) {
      Alert.alert("No Selection", "Please select requests first");
      return;
    }

    Alert.alert(
      "Bulk Action",
      `${action} ${selectedRequests.length} selected requests?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            if (action === "approve") {
              setBookingRequests((prev) =>
                prev.map((request) =>
                  selectedRequests.includes(request.id)
                    ? { ...request, status: "approved" }
                    : request
                )
              );
            } else if (action === "reject") {
              setBookingRequests((prev) =>
                prev.map((request) =>
                  selectedRequests.includes(request.id)
                    ? { ...request, status: "rejected" }
                    : request
                )
              );
            }
            Alert.alert("Success", `${action} completed successfully!`);
          },
        },
      ]
    );
  };

  const filteredRequests = bookingRequests.filter((request) => {
    if (filterStatus === "all") return true;
    return request.status === filterStatus;
  });

  const renderRequestCard = (request) => (
    <Card key={request.id} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.playerInfo}>
          <Image
            source={{ uri: request.playerImage }}
            style={styles.playerImage}
          />
          <View style={styles.playerDetails}>
            <Text style={styles.playerName}>{request.playerName}</Text>
            <Text style={styles.teamName}>{request.teamName}</Text>
            <Text style={styles.requestTime}>{request.requestTime}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(request.status) + "20" },
              { borderColor: getStatusColor(request.status) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(request.status) },
              ]}
            >
              {getStatusText(request.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="football-outline"
              size={16}
              color={colors.primary.main}
            />
            <Text style={styles.detailText}>{request.sport}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.secondary.main}
            />
            <Text style={styles.detailText}>{request.groundName}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.onSurface + "80"}
            />
            <Text style={styles.detailText}>{request.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.onSurface + "80"}
            />
            <Text style={styles.detailText}>{request.timeSlot}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="people-outline"
              size={16}
              color={colors.onSurface + "80"}
            />
            <Text style={styles.detailText}>{request.players} players</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="cash-outline"
              size={16}
              color={colors.success.main}
            />
            <Text style={styles.detailText}>PKR {request.amount}</Text>
          </View>
        </View>

        {request.specialRequests && (
          <View style={styles.specialRequests}>
            <Text style={styles.specialRequestsTitle}>Special Requests:</Text>
            <Text style={styles.specialRequestsText}>
              {request.specialRequests}
            </Text>
          </View>
        )}

        {request.rejectionReason && (
          <View style={styles.rejectionReason}>
            <Text style={styles.rejectionReasonTitle}>Rejection Reason:</Text>
            <Text style={styles.rejectionReasonText}>
              {request.rejectionReason}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        {request.status === "pending" && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApproveRequest(request.id)}
            >
              <Ionicons
                name="checkmark"
                size={16}
                color={colors.success.contrastText}
              />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectRequest(request.id)}
            >
              <Ionicons
                name="close"
                size={16}
                color={colors.error.contrastText}
              />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.contactButton]}
          onPress={() => handleContactPlayer(request.contact)}
        >
          <Ionicons name="call" size={16} color={colors.primary.main} />
          <Text style={styles.actionButtonText}>Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => handleViewDetails(request)}
        >
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.onSurface}
          />
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Requests</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => Alert.alert("Settings", "Booking request settings")}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={colors.primary.main}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["all", "pending", "approved", "rejected"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.activeFilterButton,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === status && styles.activeFilterButtonText,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.bulkActions}>
        <Text style={styles.bulkActionsTitle}>Bulk Actions:</Text>
        <View style={styles.bulkActionButtons}>
          <TouchableOpacity
            style={[styles.bulkActionButton, styles.approveButton]}
            onPress={() => handleBulkAction("approve", [])}
          >
            <Ionicons
              name="checkmark"
              size={16}
              color={colors.success.contrastText}
            />
            <Text style={styles.bulkActionButtonText}>Approve All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bulkActionButton, styles.rejectButton]}
            onPress={() => handleBulkAction("reject", [])}
          >
            <Ionicons
              name="close"
              size={16}
              color={colors.error.contrastText}
            />
            <Text style={styles.bulkActionButtonText}>Reject All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map(renderRequestCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="calendar-outline"
              size={64}
              color={colors.onSurface + "40"}
            />
            <Text style={styles.emptyStateTitle}>No booking requests</Text>
            <Text style={styles.emptyStateSubtitle}>
              {filterStatus === "all"
                ? "You don't have any booking requests yet"
                : `No ${filterStatus} requests found`}
            </Text>
          </View>
        )}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.dark.backgroundColor,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  activeFilterButton: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterButtonText: {
    ...typography.body,
    color: colors.text.primary,
  },
  activeFilterButtonText: {
    color: colors.primary.contrastText,
  },
  bulkActions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  bulkActionsTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "500",
    marginBottom: spacing.sm,
  },
  bulkActionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bulkActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    flex: 1,
    justifyContent: "center",
  },
  bulkActionButtonText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  requestCard: {
    marginTop: spacing.lg,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  playerInfo: {
    flexDirection: "row",
    flex: 1,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  teamName: {
    ...typography.body,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  requestTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "500",
  },
  bookingDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  specialRequests: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.primary.main + "10",
    borderRadius: borderRadius.sm,
  },
  specialRequestsTitle: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  specialRequestsText: {
    ...typography.body,
    color: colors.text.primary,
  },
  rejectionReason: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.error.main + "10",
    borderRadius: borderRadius.sm,
  },
  rejectionReasonTitle: {
    ...typography.body,
    color: colors.error.main,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  rejectionReasonText: {
    ...typography.body,
    color: colors.text.primary,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    flex: 1,
    minWidth: "45%",
    justifyContent: "center",
  },
  approveButton: {
    backgroundColor: colors.success.main,
  },
  rejectButton: {
    backgroundColor: colors.error.main,
  },
  contactButton: {
    backgroundColor: colors.dark.backgroundColor,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  detailsButton: {
    backgroundColor: colors.dark.backgroundColor,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
  },
});

export default BookingRequests;
