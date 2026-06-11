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

const ManageGrounds = ({ navigation }) => {
  const [grounds, setGrounds] = useState([
    {
      id: "1",
      name: "Main Football Pitch",
      sport: "Football",
      location: "Karachi",
      hourlyRate: 800,
      capacity: 22,
      status: "active",
      image: "https://via.placeholder.com/300x200",
      amenities: ["Parking", "Lighting", "Changing Rooms"],
      totalBookings: 45,
      rating: 4.5,
    },
    {
      id: "2",
      name: "Cricket Ground",
      sport: "Cricket",
      location: "Lahore",
      hourlyRate: 1200,
      capacity: 30,
      status: "active",
      image: "https://via.placeholder.com/300x200",
      amenities: ["Parking", "Seating", "Refreshments"],
      totalBookings: 32,
      rating: 4.8,
    },
    {
      id: "3",
      name: "Tennis Court",
      sport: "Tennis",
      location: "Islamabad",
      hourlyRate: 600,
      capacity: 4,
      status: "maintenance",
      image: "https://via.placeholder.com/300x200",
      amenities: ["Equipment Rental", "Lighting"],
      totalBookings: 18,
      rating: 4.2,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");

  const handleEditGround = (ground) => {
    // TODO: Navigate to edit ground screen
    Alert.alert("Edit Ground", `Edit ${ground.name}`);
  };

  const handleToggleStatus = (groundId) => {
    setGrounds((prev) =>
      prev.map((ground) =>
        ground.id === groundId
          ? {
              ...ground,
              status: ground.status === "active" ? "inactive" : "active",
            }
          : ground
      )
    );
  };

  const handleDeleteGround = (groundId) => {
    Alert.alert(
      "Delete Ground",
      "Are you sure you want to delete this ground?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setGrounds((prev) =>
              prev.filter((ground) => ground.id !== groundId)
            );
          },
        },
      ]
    );
  };

  const handleViewBookings = (ground) => {
    // TODO: Navigate to ground bookings screen
    Alert.alert("View Bookings", `View bookings for ${ground.name}`);
  };

  const handleViewAnalytics = (ground) => {
    // TODO: Navigate to ground analytics screen
    Alert.alert("View Analytics", `View analytics for ${ground.name}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return colors.success.main;
      case "inactive":
        return colors.error.main;
      case "maintenance":
        return colors.warning.main;
      default:
        return colors.onSurface + "60";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "maintenance":
        return "Maintenance";
      default:
        return "Unknown";
    }
  };

  const filteredGrounds = grounds.filter((ground) => {
    if (filterStatus === "all") return true;
    return ground.status === filterStatus;
  });

  const renderGroundCard = (ground) => (
    <Card key={ground.id} style={styles.groundCard}>
      <View style={styles.groundHeader}>
        <Image source={{ uri: ground.image }} style={styles.groundImage} />
        <View style={styles.groundInfo}>
          <Text style={styles.groundName}>{ground.name}</Text>
          <Text style={styles.groundSport}>{ground.sport}</Text>
          <Text style={styles.groundLocation}>{ground.location}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(ground.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(ground.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.groundDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.onSurface + "80"}
            />
            <Text style={styles.detailText}>PKR {ground.hourlyRate}/hr</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="people-outline"
              size={16}
              color={colors.onSurface + "80"}
            />
            <Text style={styles.detailText}>{ground.capacity} players</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.onSurface + "80"}
            />
            <Text style={styles.detailText}>
              {ground.totalBookings} bookings
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="star" size={16} color={colors.warning.main} />
            <Text style={styles.detailText}>{ground.rating}</Text>
          </View>
        </View>

        <View style={styles.amenitiesContainer}>
          <Text style={styles.amenitiesTitle}>Amenities:</Text>
          <View style={styles.amenitiesList}>
            {ground.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {ground.amenities.length > 3 && (
              <Text style={styles.moreAmenities}>
                +{ground.amenities.length - 3} more
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => handleViewBookings(ground)}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.primary.contrastText}
          />
          <Text style={styles.actionButtonText}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => handleViewAnalytics(ground)}
        >
          <Ionicons
            name="analytics-outline"
            size={16}
            color={colors.secondary.contrastText}
          />
          <Text style={styles.actionButtonText}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditGround(ground)}
        >
          <Ionicons name="create-outline" size={16} color={colors.onSurface} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => handleToggleStatus(ground.id)}
        >
          <Ionicons
            name={ground.status === "active" ? "pause-outline" : "play-outline"}
            size={16}
            color={colors.onSurface}
          />
          <Text style={styles.actionButtonText}>
            {ground.status === "active" ? "Pause" : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteGround(ground.id)}
      >
        <Ionicons name="trash-outline" size={16} color={colors.error.main} />
        <Text style={styles.deleteButtonText}>Delete Ground</Text>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Manage Grounds</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddGround")}
        >
          <Ionicons name="add" size={24} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["all", "active", "inactive", "maintenance"].map((status) => (
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredGrounds.length > 0 ? (
          filteredGrounds.map(renderGroundCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="football-outline"
              size={64}
              color={colors.onSurface + "40"}
            />
            <Text style={styles.emptyStateTitle}>No grounds found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {filterStatus === "all"
                ? "You haven't added any grounds yet"
                : `No grounds with ${filterStatus} status`}
            </Text>
            {filterStatus === "all" && (
              <Button
                title="Add Your First Ground"
                onPress={() => navigation.navigate("AddGround")}
                style={styles.addFirstGroundButton}
              />
            )}
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
  addButton: {
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  groundCard: {
    marginTop: spacing.lg,
  },
  groundHeader: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  groundImage: {
    width: 80,
    height: 60,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  groundInfo: {
    flex: 1,
    justifyContent: "center",
  },
  groundName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  groundSport: {
    ...typography.body,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  groundLocation: {
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
  },
  statusText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "500",
  },
  groundDetails: {
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
  amenitiesContainer: {
    marginTop: spacing.sm,
  },
  amenitiesTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  amenitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  amenityTag: {
    backgroundColor: colors.primary.main + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  amenityText: {
    ...typography.caption,
    color: colors.primary.main,
  },
  moreAmenities: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: colors.secondary.main,
  },
  editButton: {
    backgroundColor: colors.dark.backgroundColor,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  toggleButton: {
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
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  deleteButtonText: {
    ...typography.body,
    color: colors.error.main,
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
    marginBottom: spacing.lg,
  },
  addFirstGroundButton: {
    backgroundColor: colors.primary.main,
  },
});

export default ManageGrounds;
