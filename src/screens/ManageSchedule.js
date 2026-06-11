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

const ManageSchedule = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedGround, setSelectedGround] = useState("all");
  const [viewMode, setViewMode] = useState("weekly"); // weekly, daily, monthly

  const [grounds] = useState([
    { id: "1", name: "Main Football Pitch", sport: "Football" },
    { id: "2", name: "Cricket Ground", sport: "Cricket" },
    { id: "3", name: "Tennis Court", sport: "Tennis" },
  ]);

  const [scheduleData] = useState({
    "2025-01-15": [
      {
        id: "1",
        groundId: "1",
        groundName: "Main Football Pitch",
        timeSlot: "09:00-11:00",
        status: "available",
        booking: null,
      },
      {
        id: "2",
        groundId: "1",
        groundName: "Main Football Pitch",
        timeSlot: "11:00-13:00",
        status: "booked",
        booking: {
          team: "Thunder Hawks",
          contact: "+92 300 1234567",
          amount: 800,
        },
      },
      {
        id: "3",
        groundId: "1",
        groundName: "Main Football Pitch",
        timeSlot: "13:00-15:00",
        status: "maintenance",
        booking: null,
      },
      {
        id: "4",
        groundId: "2",
        groundName: "Cricket Ground",
        timeSlot: "09:00-12:00",
        status: "booked",
        booking: {
          team: "City Warriors",
          contact: "+92 300 7654321",
          amount: 1200,
        },
      },
    ],
  });

  const timeSlots = [
    "06:00-08:00",
    "08:00-10:00",
    "10:00-12:00",
    "12:00-14:00",
    "14:00-16:00",
    "16:00-18:00",
    "18:00-20:00",
    "20:00-22:00",
  ];

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (date) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return colors.success.main;
      case "booked":
        return colors.primary.main;
      case "maintenance":
        return colors.warning.main;
      case "blocked":
        return colors.error.main;
      default:
        return colors.onSurface + "60";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Available";
      case "booked":
        return "Booked";
      case "maintenance":
        return "Maintenance";
      case "blocked":
        return "Blocked";
      default:
        return "Unknown";
    }
  };

  const handleTimeSlotPress = (timeSlot, groundId, status) => {
    if (status === "available") {
      Alert.alert("Block Time Slot", "Do you want to block this time slot?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Block",
          onPress: () => {
            // TODO: Implement block time slot
            Alert.alert("Success", "Time slot blocked successfully");
          },
        },
      ]);
    } else if (status === "booked") {
      // TODO: Navigate to booking details
      Alert.alert("Booking Details", "View booking details");
    }
  };

  const handleAddMaintenance = (groundId) => {
    // TODO: Navigate to maintenance scheduling
    Alert.alert("Maintenance", "Schedule maintenance");
  };

  const handleBulkAction = (action) => {
    Alert.alert("Bulk Action", `Perform ${action} on selected time slots`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: () => {
          // TODO: Implement bulk action
          Alert.alert("Success", `${action} completed successfully`);
        },
      },
    ]);
  };

  const renderDateHeader = () => (
    <View style={styles.dateHeader}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {getWeekDays().map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateButton,
              formatDate(date) === formatDate(selectedDate) &&
                styles.selectedDateButton,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[
                styles.dateButtonText,
                formatDate(date) === formatDate(selectedDate) &&
                  styles.selectedDateButtonText,
              ]}
            >
              {formatDisplayDate(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderGroundFilter = () => (
    <View style={styles.groundFilter}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.groundFilterButton,
            selectedGround === "all" && styles.selectedGroundFilterButton,
          ]}
          onPress={() => setSelectedGround("all")}
        >
          <Text
            style={[
              styles.groundFilterButtonText,
              selectedGround === "all" && styles.selectedGroundFilterButtonText,
            ]}
          >
            All Grounds
          </Text>
        </TouchableOpacity>
        {grounds.map((ground) => (
          <TouchableOpacity
            key={ground.id}
            style={[
              styles.groundFilterButton,
              selectedGround === ground.id && styles.selectedGroundFilterButton,
            ]}
            onPress={() => setSelectedGround(ground.id)}
          >
            <Text
              style={[
                styles.groundFilterButtonText,
                selectedGround === ground.id &&
                  styles.selectedGroundFilterButtonText,
              ]}
            >
              {ground.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderScheduleGrid = () => {
    const currentDate = formatDate(selectedDate);
    const daySchedule = scheduleData[currentDate] || [];

    return (
      <View style={styles.scheduleGrid}>
        <View style={styles.timeColumn}>
          <Text style={styles.columnHeader}>Time</Text>
          {timeSlots.map((timeSlot) => (
            <View key={timeSlot} style={styles.timeSlot}>
              <Text style={styles.timeSlotText}>{timeSlot}</Text>
            </View>
          ))}
        </View>

        {grounds.map((ground) => {
          if (selectedGround !== "all" && selectedGround !== ground.id)
            return null;

          return (
            <View key={ground.id} style={styles.groundColumn}>
              <Text style={styles.columnHeader}>{ground.name}</Text>
              {timeSlots.map((timeSlot) => {
                const slotData = daySchedule.find(
                  (slot) =>
                    slot.groundId === ground.id && slot.timeSlot === timeSlot
                );

                if (!slotData) {
                  return (
                    <TouchableOpacity
                      key={timeSlot}
                      style={[styles.scheduleSlot, styles.availableSlot]}
                      onPress={() =>
                        handleTimeSlotPress(timeSlot, ground.id, "available")
                      }
                    >
                      <Text style={styles.slotText}>Available</Text>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={timeSlot}
                    style={[
                      styles.scheduleSlot,
                      {
                        backgroundColor: getStatusColor(slotData.status) + "20",
                      },
                      { borderColor: getStatusColor(slotData.status) },
                    ]}
                    onPress={() =>
                      handleTimeSlotPress(timeSlot, ground.id, slotData.status)
                    }
                  >
                    <Text
                      style={[
                        styles.slotText,
                        { color: getStatusColor(slotData.status) },
                      ]}
                    >
                      {getStatusText(slotData.status)}
                    </Text>
                    {slotData.booking && (
                      <Text style={styles.bookingInfo}>
                        {slotData.booking.team}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Schedule</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => Alert.alert("Settings", "Schedule settings")}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={colors.primary.main}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <View style={styles.viewModeToggle}>
          {["weekly", "daily", "monthly"].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.viewModeButton,
                viewMode === mode && styles.activeViewModeButton,
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text
                style={[
                  styles.viewModeButtonText,
                  viewMode === mode && styles.activeViewModeButtonText,
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAddMaintenance()}
          >
            <Ionicons
              name="construct-outline"
              size={16}
              color={colors.warning.main}
            />
            <Text style={styles.actionButtonText}>Maintenance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleBulkAction("block")}
          >
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={colors.error.main}
            />
            <Text style={styles.actionButtonText}>Block Slots</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderDateHeader()}
      {renderGroundFilter()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.scheduleCard}>{renderScheduleGrid()}</Card>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors.success.main + "20" },
                ]}
              />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors.primary.main + "20" },
                ]}
              />
              <Text style={styles.legendText}>Booked</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors.warning.main + "20" },
                ]}
              />
              <Text style={styles.legendText}>Maintenance</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors.error.main + "20" },
                ]}
              />
              <Text style={styles.legendText}>Blocked</Text>
            </View>
          </View>
        </View>
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
  controls: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
  },
  viewModeToggle: {
    flexDirection: "row",
    backgroundColor: colors.dark.backgroundColor,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: borderRadius.sm,
  },
  activeViewModeButton: {
    backgroundColor: colors.primary.main,
  },
  viewModeButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "500",
  },
  activeViewModeButtonText: {
    color: colors.primary.contrastText,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dark.backgroundColor,
    borderWidth: 1,
    borderColor: colors.border.primary,
    flex: 1,
    justifyContent: "center",
  },
  actionButtonText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
  dateHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
  },
  dateButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dark.backgroundColor,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectedDateButton: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  dateButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "500",
  },
  selectedDateButtonText: {
    color: colors.primary.contrastText,
  },
  groundFilter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
  },
  groundFilterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dark.backgroundColor,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectedGroundFilterButton: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  groundFilterButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "500",
  },
  selectedGroundFilterButtonText: {
    color: colors.secondary.contrastText,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scheduleCard: {
    marginTop: spacing.lg,
  },
  scheduleGrid: {
    flexDirection: "row",
  },
  timeColumn: {
    width: 80,
    borderRightWidth: 1,
    borderRightColor: colors.border.primary,
  },
  groundColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.border.primary,
  },
  columnHeader: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: "center",
    paddingVertical: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  timeSlot: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
  },
  timeSlotText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: "center",
  },
  scheduleSlot: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
    borderLeftWidth: 1,
    borderLeftColor: colors.border.secondary,
    padding: spacing.xs,
  },
  availableSlot: {
    backgroundColor: colors.success.main + "20",
    borderColor: colors.success.main,
  },
  slotText: {
    ...typography.caption,
    fontWeight: "500",
    textAlign: "center",
  },
  bookingInfo: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  legend: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  legendTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: "45%",
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.xs,
    marginRight: spacing.sm,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.primary,
  },
});

export default ManageSchedule;
