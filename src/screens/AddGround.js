import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
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

const AddGround = ({ navigation }) => {
  const [groundData, setGroundData] = useState({
    name: "",
    sport: "",
    location: "",
    address: "",
    description: "",
    hourlyRate: "",
    capacity: "",
    amenities: [],
    images: [],
  });

  const [selectedSport, setSelectedSport] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const sports = [
    "Football",
    "Cricket",
    "Tennis",
    "Basketball",
    "Volleyball",
    "Badminton",
    "Hockey",
    "Rugby",
  ];

  const availableAmenities = [
    "Parking",
    "Changing Rooms",
    "Showers",
    "Equipment Rental",
    "Lighting",
    "Seating",
    "Refreshments",
    "First Aid",
    "Security",
    "WiFi",
  ];

  const handleInputChange = (field, value) => {
    setGroundData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
    handleInputChange("sport", sport);
  };

  const handleAmenityToggle = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddImage = () => {
    // TODO: Implement image picker
    Alert.alert(
      "Image Picker",
      "Image picker functionality will be implemented"
    );
  };

  const handleSubmit = () => {
    if (!groundData.name || !groundData.sport || !groundData.location) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const finalData = {
      ...groundData,
      amenities: selectedAmenities,
    };

    // TODO: Submit to backend
    console.log("Ground Data:", finalData);
    Alert.alert("Success", "Ground added successfully!", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const renderSportOption = (sport) => (
    <TouchableOpacity
      key={sport}
      style={[
        styles.sportOption,
        selectedSport === sport && styles.selectedSportOption,
      ]}
      onPress={() => handleSportSelect(sport)}
    >
      <Text
        style={[
          styles.sportOptionText,
          selectedSport === sport && styles.selectedSportOptionText,
        ]}
      >
        {sport}
      </Text>
    </TouchableOpacity>
  );

  const renderAmenityOption = (amenity) => (
    <TouchableOpacity
      key={amenity}
      style={[
        styles.amenityOption,
        selectedAmenities.includes(amenity) && styles.selectedAmenityOption,
      ]}
      onPress={() => handleAmenityToggle(amenity)}
    >
      <Text
        style={[
          styles.amenityOptionText,
          selectedAmenities.includes(amenity) &&
            styles.selectedAmenityOptionText,
        ]}
      >
        {amenity}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Ground</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ground Name *</Text>
            <TextInput
              style={styles.textInput}
              value={groundData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              placeholder="Enter ground name"
              placeholderTextColor={colors.text.secondary + "60"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sport Type *</Text>
            <View style={styles.sportOptions}>
              {sports.map(renderSportOption)}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.textInput}
              value={groundData.location}
              onChangeText={(text) => handleInputChange("location", text)}
              placeholder="Enter location"
              placeholderTextColor={colors.text.secondary + "60"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Address</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={groundData.address}
              onChangeText={(text) => handleInputChange("address", text)}
              placeholder="Enter full address"
              placeholderTextColor={colors.text.secondary + "60"}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={groundData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              placeholder="Describe your ground"
              placeholderTextColor={colors.text.secondary + "60"}
              multiline
              numberOfLines={4}
            />
          </View>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Pricing & Capacity</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Hourly Rate (PKR)</Text>
              <TextInput
                style={styles.textInput}
                value={groundData.hourlyRate}
                onChangeText={(text) => handleInputChange("hourlyRate", text)}
                placeholder="0"
                placeholderTextColor={colors.text.secondary + "60"}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Capacity</Text>
              <TextInput
                style={styles.textInput}
                value={groundData.capacity}
                onChangeText={(text) => handleInputChange("capacity", text)}
                placeholder="Number of players"
                placeholderTextColor={colors.text.secondary + "60"}
                keyboardType="numeric"
              />
            </View>
          </View>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {availableAmenities.map(renderAmenityOption)}
          </View>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Images</Text>
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={handleAddImage}
          >
            <Ionicons
              name="camera-outline"
              size={32}
              color={colors.primary.main}
            />
            <Text style={styles.imageUploadText}>Add Ground Photos</Text>
            <Text style={styles.imageUploadSubtext}>Upload up to 5 images</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Add Ground"
            onPress={handleSubmit}
            style={styles.submitButton}
          />
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  formCard: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.dark.surfaceColor,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  sportOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  sportOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.dark.surfaceColor,
  },
  selectedSportOption: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  sportOptionText: {
    ...typography.body,
    color: colors.text.primary,
  },
  selectedSportOptionText: {
    color: colors.primary.contrastText,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  amenityOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.dark.surfaceColor,
  },
  selectedAmenityOption: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  amenityOptionText: {
    ...typography.body,
    color: colors.text.primary,
  },
  selectedAmenityOptionText: {
    color: colors.secondary.contrastText,
  },
  imageUploadButton: {
    alignItems: "center",
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primary.main + "40",
    borderStyle: "dashed",
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.main + "10",
  },
  imageUploadText: {
    ...typography.body,
    color: colors.primary.main,
    marginTop: spacing.sm,
    fontWeight: "500",
  },
  imageUploadSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  submitButton: {
    backgroundColor: colors.primary.main,
  },
});

export default AddGround;
