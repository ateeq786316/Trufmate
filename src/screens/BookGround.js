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

const BookGround = ({ navigation, route }) => {
  // Default ground data if none provided (for testing purposes)
  const defaultGround = {
    name: "Central Football Ground",
    location: "123 Sports Complex, City Center",
    sport: "Football",
    price: 1500,
  };

  const { ground = defaultGround } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("18:00");
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");

  const timeSlots = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];

  const durations = [1, 2, 3, 4, 5, 6];

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: "card" },
    { id: "cash", name: "Cash on Arrival", icon: "cash" },
    { id: "mobile", name: "Mobile Payment", icon: "phone-portrait" },
  ];

  const calculateTotalPrice = () => {
    return ground.price * selectedDuration;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleBooking = () => {
    Alert.alert(
      "Confirm Booking",
      `Book ${
        ground.name
      } for ${selectedDuration} hour(s) on ${selectedDate.toDateString()} at ${selectedTime}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert(
              "Booking Confirmed!",
              "Your ground has been booked successfully. You will receive a confirmation email shortly.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // Navigate back to the previous screen instead of hardcoded PlayerHome
                    navigation.goBack();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderTimeSlot = (time) => (
    <TouchableOpacity
      key={time}
      style={[styles.timeSlot, selectedTime === time && styles.timeSlotActive]}
      onPress={() => handleTimeChange(time)}
    >
      <Text
        style={[
          styles.timeSlotText,
          selectedTime === time && styles.timeSlotTextActive,
        ]}
      >
        {time}
      </Text>
    </TouchableOpacity>
  );

  const renderDurationOption = (duration) => (
    <TouchableOpacity
      key={duration}
      style={[
        styles.durationOption,
        selectedDuration === duration && styles.durationOptionActive,
      ]}
      onPress={() => handleDurationChange(duration)}
    >
      <Text
        style={[
          styles.durationText,
          selectedDuration === duration && styles.durationTextActive,
        ]}
      >
        {duration} {duration === 1 ? "Hour" : "Hours"}
      </Text>
    </TouchableOpacity>
  );

  const renderPaymentMethod = (method) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        selectedPaymentMethod === method.id && styles.paymentMethodActive,
      ]}
      onPress={() => handlePaymentMethodChange(method.id)}
    >
      <Ionicons
        name={method.icon}
        size={24}
        color={
          selectedPaymentMethod === method.id
            ? colors.primary.main
            : colors.text.secondary
        }
      />
      <Text
        style={[
          styles.paymentMethodText,
          selectedPaymentMethod === method.id && styles.paymentMethodTextActive,
        ]}
      >
        {method.name}
      </Text>
      {selectedPaymentMethod === method.id && (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={colors.primary.main}
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Development Note */}
        {!route.params?.ground && (
          <View style={styles.devNote}>
            <Text style={styles.devNoteText}>
              🧪 Using default ground data for testing
            </Text>
          </View>
        )}

        {/* Ground Info Card */}
        <Card style={styles.groundInfoCard}>
          <View style={styles.groundImageContainer}>
            <View style={styles.groundImagePlaceholder}>
              <Ionicons name="image" size={40} color={colors.text.secondary} />
            </View>
          </View>
          <View style={styles.groundContent}>
            <Text style={styles.groundName}>{ground.name}</Text>
            <View style={styles.groundLocation}>
              <Ionicons
                name="location"
                size={16}
                color={colors.text.secondary}
              />
              <Text style={styles.locationText}>{ground.location}</Text>
            </View>
            <View style={styles.groundSport}>
              <Ionicons name="football" size={16} color={colors.primary.main} />
              <Text style={styles.sportText}>{ground.sport}</Text>
            </View>
            <Text style={styles.priceText}>Rs. {ground.price}/hour</Text>
          </View>
        </Card>

        {/* Date Selection */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity style={styles.dateButton}>
              <Ionicons name="calendar" size={20} color={colors.primary.main} />
              <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Time Selection */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeContainer}>
            {timeSlots.map(renderTimeSlot)}
          </View>
        </Card>

        {/* Duration Selection */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Duration</Text>
          <View style={styles.durationContainer}>
            {durations.map(renderDurationOption)}
          </View>
        </Card>

        {/* Payment Method */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentContainer}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
        </Card>

        {/* Booking Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ground:</Text>
            <Text style={styles.summaryValue}>{ground.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>
              {selectedDate.toDateString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>{selectedTime}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration:</Text>
            <Text style={styles.summaryValue}>
              {selectedDuration} {selectedDuration === 1 ? "Hour" : "Hours"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price per Hour:</Text>
            <Text style={styles.summaryValue}>Rs. {ground.price}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>Rs. {calculateTotalPrice()}</Text>
          </View>
        </Card>

        {/* Book Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={`Book Now - Rs. ${calculateTotalPrice()}`}
            onPress={handleBooking}
            style={styles.bookButton}
          />
        </View>

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
  devNote: {
    backgroundColor: colors.warning.main + "10",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    margin: spacing.lg,
    marginTop: spacing.xl,
    alignItems: "center",
  },
  devNoteText: {
    ...typography.body,
    color: colors.warning.main,
    fontWeight: "600",
  },
  groundInfoCard: {
    margin: spacing.lg,
    marginTop: spacing.xl,
  },
  groundImageContainer: {
    height: 150,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  groundImagePlaceholder: {
    flex: 1,
    backgroundColor: colors.dark.surfaceColor,
    justifyContent: "center",
    alignItems: "center",
  },
  groundContent: {
    gap: spacing.sm,
  },
  groundName: {
    ...typography.h2,
  },
  groundLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  locationText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  groundSport: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sportText: {
    ...typography.body,
    color: colors.primary.main,
  },
  priceText: {
    ...typography.h3,
    color: colors.success.main,
  },
  sectionCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  dateContainer: {
    alignItems: "center",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  dateText: {
    ...typography.body,
    color: colors.text.primary,
  },
  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    minWidth: 80,
    alignItems: "center",
  },
  timeSlotActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  timeSlotText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  timeSlotTextActive: {
    color: colors.text.primary,
  },
  durationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  durationOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  durationOptionActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  durationText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  durationTextActive: {
    color: colors.text.primary,
  },
  paymentContainer: {
    gap: spacing.sm,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.md,
  },
  paymentMethodActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + "20",
  },
  paymentMethodText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  paymentMethodTextActive: {
    color: colors.text.primary,
  },
  checkIcon: {
    marginLeft: "auto",
  },
  summaryCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "600",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: spacing.md,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.h2,
    color: colors.success.main,
  },
  buttonContainer: {
    padding: spacing.lg,
  },
  bookButton: {
    width: "100%",
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default BookGround;
