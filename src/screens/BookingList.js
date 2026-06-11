import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../constants/theme";

const BookingList = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with actual API call
  const mockBookings = [
    {
      id: "1",
      groundName: "Central Football Ground",
      playerName: "John Doe",
      date: "2024-01-15",
      time: "18:00",
      duration: "2 hours",
      status: "confirmed",
      amount: 1500,
    },
    {
      id: "2",
      groundName: "Central Football Ground",
      playerName: "Jane Smith",
      date: "2024-01-16",
      time: "19:00",
      duration: "1.5 hours",
      status: "pending",
      amount: 1200,
    },
    {
      id: "3",
      groundName: "Central Football Ground",
      playerName: "Mike Johnson",
      date: "2024-01-17",
      time: "20:00",
      duration: "2 hours",
      status: "cancelled",
      amount: 1500,
    },
  ];

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setBookings(mockBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return colors.success.main;
      case "pending":
        return colors.warning.main;
      case "cancelled":
        return colors.error.main;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleBookingAction = (booking, action) => {
    Alert.alert(
      `${action} Booking`,
      `Are you sure you want to ${action.toLowerCase()} this booking?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: action, onPress: () => performBookingAction(booking, action) },
      ]
    );
  };

  const performBookingAction = async (booking, action) => {
    try {
      // TODO: Implement actual API call
      console.log(`${action} booking:`, booking.id);
      Alert.alert("Success", `Booking ${action.toLowerCase()} successfully`);
      loadBookings(); // Reload the list
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing booking:`, error);
      Alert.alert("Error", `Failed to ${action.toLowerCase()} booking`);
    }
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.groundName}>{item.groundName}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons
            name="person-outline"
            size={16}
            color={colors.text.secondary}
          />
          <Text style={styles.detailText}>{item.playerName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.text.secondary}
          />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.text.secondary}
          />
          <Text style={styles.detailText}>
            {item.time} ({item.duration})
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="cash-outline"
            size={16}
            color={colors.text.secondary}
          />
          <Text style={styles.detailText}>₹{item.amount}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        {item.status === "pending" && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleBookingAction(item, "Confirm")}
            >
              <Text style={styles.actionButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleBookingAction(item, "Reject")}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === "confirmed" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleBookingAction(item, "Cancel")}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => navigation.navigate("MatchDetails", { booking: item })}
        >
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="calendar-outline"
        size={64}
        color={colors.text.secondary}
      />
      <Text style={styles.emptyStateTitle}>No Bookings Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        When players book your grounds, they will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking List</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() =>
            Alert.alert("Filter", "Filter functionality coming soon")
          }
        >
          <Ionicons
            name="filter-outline"
            size={24}
            color={colors.primary.main}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  filterButton: {
    padding: spacing.sm,
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  bookingCard: {
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  groundName: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
  },
  bookingDetails: {
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    minWidth: 80,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: colors.success.main,
  },
  rejectButton: {
    backgroundColor: colors.error.main,
  },
  cancelButton: {
    backgroundColor: colors.warning.main,
  },
  viewButton: {
    backgroundColor: colors.primary.main,
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
  },
  emptyStateTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
});

export default BookingList;
