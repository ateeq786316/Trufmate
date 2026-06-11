import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../constants/theme";
import { Card, Button, Input } from "../components";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { supabase } from "../config/supabase";
import { useAuth } from "../contexts/AuthContext";

// Pakistan Location Data (same as EditProfile.js)
const PAKISTAN_LOCATIONS = {
  Punjab: {
    Lahore: [
      "Gulberg",
      "Defence",
      "Model Town",
      "Johar Town",
      "Cantt",
      "Old City",
      "Bahria Town",
      "DHA",
      "Garden Town",
      "Faisal Town",
      "Nishat Colony",
      "Cantt Area",
      "Cantt Extension",
    ],
    Islamabad: [
      "F-6",
      "F-7",
      "F-8",
      "F-10",
      "F-11",
      "E-7",
      "E-8",
      "E-11",
      "Blue Area",
      "Sector G-6",
      "Sector G-7",
      "Sector G-8",
    ],
    Rawalpindi: [
      "Saddar",
      "Raja Bazar",
      "Commercial Market",
      "Chaklala",
      "Westridge",
      "Bahria Town",
      "DHA",
      "Gulraiz",
      "Satellite Town",
    ],
    Faisalabad: [
      "D Ground",
      "Railway Colony",
      "Madina Town",
      "Peoples Colony",
      "Jinnah Colony",
      "Gulberg",
      "Model Town",
    ],
    Multan: [
      "Gulgasht",
      "Bosan",
      "Shah Rukn-e-Alam",
      "Daulat Gate",
      "Pak Gate",
      "Haram Gate",
      "Delhi Gate",
    ],
    Gujranwala: [
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
      "Cantt",
      "Old City",
    ],
    Sialkot: [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
      "Old City",
    ],
    Bahawalpur: [
      "Model Town",
      "Cantt",
      "Civil Lines",
      "Satellite Town",
      "Old City",
      "Bahawalnagar",
    ],
    Sargodha: [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
    ],
    Sheikhupura: [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
    ],
  },
  Sindh: {
    Karachi: [
      "Clifton",
      "Defence",
      "DHA",
      "Gulshan-e-Iqbal",
      "North Nazimabad",
      "Gulistan-e-Jauhar",
      "Malir",
      "Korangi",
      "Landhi",
      "Saddar",
      "Lyari",
      "Keamari",
    ],
    Hyderabad: [
      "Latifabad",
      "Qasimabad",
      "Saddar",
      "Cantt",
      "Hirabad",
      "Shahbaz",
      "Gulshan-e-Iqbal",
      "Model Town",
    ],
    Sukkur: [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
      "Old City",
    ],
    Larkana: [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
    ],
    Nawabshah: [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
    ],
    "Mirpur Khas": [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
    ],
  },
  "Khyber Pakhtunkhwa": {
    Peshawar: [
      "University Town",
      "Hayatabad",
      "Cantt",
      "Sadar",
      "Gulbahar",
      "Charsadda Road",
      "Ring Road",
      "Kohat Road",
    ],
    Abbottabad: [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
      "Mansehra Road",
    ],
    Mardan: [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
    ],
    Swat: [
      "Mingora",
      "Saidu Sharif",
      "Kalam",
      "Malam Jabba",
      "Madyan",
      "Bahrain",
    ],
    Nowshera: [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
    ],
    Charsadda: [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
    ],
  },
  Balochistan: {
    Quetta: [
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Satellite Town",
      "Hanna Valley",
      "Ziarat Road",
    ],
    Gwadar: [
      "Port Area",
      "City Center",
      "Beach Area",
      "Fishing Village",
      "Industrial Zone",
    ],
    Turbat: [
      "City Center",
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
    ],
    Khuzdar: [
      "City Center",
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
    ],
  },
  "Gilgit-Baltistan": {
    Gilgit: [
      "City Center",
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Karakoram Highway",
    ],
    Skardu: [
      "City Center",
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Indus Valley",
    ],
    Hunza: ["Karimabad", "Aliabad", "Ganish", "Passu", "Gulmit", "Sost"],
  },
  "Azad Kashmir": {
    Muzaffarabad: [
      "City Center",
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Neelum Valley",
    ],
    Mirpur: [
      "City Center",
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Mangla Dam",
    ],
    Rawalakot: [
      "City Center",
      "Cantt",
      "Civil Lines",
      "Model Town",
      "Peoples Colony",
      "Poonch Valley",
    ],
  },
};

const CreateTeam = ({ navigation }) => {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState({
    name: "",
    sport: "",
    skillLevel: "",
    maxMembers: "",
    location: "",
    description: "",
    requirements: "",
  });

  const [selectedSport, setSelectedSport] = useState("");
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("");

  // Location picker state
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  // Add location loading state
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const sports = [
    { id: "football", name: "Football", icon: "football" },
    { id: "cricket", name: "Cricket", icon: "baseball" },
    { id: "basketball", name: "Basketball", icon: "basketball" },
    { id: "tennis", name: "Tennis", icon: "tennisball" },
    { id: "badminton", name: "Badminton", icon: "tennisball" },
  ];

  const skillLevels = [
    { id: "beginner", name: "Beginner" },
    { id: "intermediate", name: "Intermediate" },
    { id: "advanced", name: "Advanced" },
    { id: "mixed", name: "Mixed Levels" },
  ];

  const maxMembersOptions = [
    { id: "5", name: "5 players" },
    { id: "7", name: "7 players" },
    { id: "11", name: "11 players" },
    { id: "15", name: "15 players" },
    { id: "20", name: "20 players" },
  ];

  const handleInputChange = (field, value) => {
    setTeamData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
    setTeamData((prev) => ({ ...prev, sport }));
  };

  const handleSkillLevelSelect = (skillLevel) => {
    setSelectedSkillLevel(skillLevel);
    setTeamData((prev) => ({ ...prev, skillLevel }));
  };

  const handleMaxMembersSelect = (maxMembers) => {
    setTeamData((prev) => ({ ...prev, maxMembers }));
  };

  // Location picker functions
  const openLocationPicker = () => {
    setShowLocationPicker(true);
  };

  const selectProvince = (province) => {
    setSelectedProvince(province);
    setSelectedCity("");
    setSelectedArea("");
  };

  const selectCity = (city) => {
    setSelectedCity(city);
    setSelectedArea("");
  };

  const selectArea = (area) => {
    setSelectedArea(area);
    const fullLocation = `${area}, ${selectedCity}, ${selectedProvince}`;
    setTeamData((prev) => ({ ...prev, location: fullLocation }));
    setShowLocationPicker(false);
  };

  // Add location permission and detection functions
  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log("Current location permission status:", status);
      return status === "granted";
    } catch (error) {
      console.error("Error checking location permission:", error);
      return false;
    }
  };

  const requestLocationPermission = async () => {
    try {
      console.log("Requesting location permission...");

      // First check current status
      const currentStatus = await Location.getForegroundPermissionsAsync();
      console.log("Current permission status:", currentStatus.status);

      if (currentStatus.status === "granted") {
        console.log("Permission already granted");
        return true;
      }

      if (currentStatus.status === "denied") {
        // Show alert to guide user to settings
        Alert.alert(
          "Location Permission Required",
          "Location permission is required for this feature. Please go to Settings > Privacy > Location Services and enable it for this app.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return false;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Permission request result:", status);

      if (status === "granted") {
        console.log("Permission granted successfully");
        return true;
      } else {
        console.log("Permission denied");
        Alert.alert(
          "Permission Denied",
          "Location permission is required to automatically detect your location. You can still select your location manually.",
          [{ text: "OK" }]
        );
        return false;
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert(
        "Permission Error",
        "Failed to request location permission. Please try again or select location manually.",
        [{ text: "OK" }]
      );
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      console.log("Starting location detection...");

      // Check permission first
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log("Location permission not granted");
        return;
      }

      // Check if location services are enabled
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services in your device settings to use this feature.",
          [{ text: "OK" }]
        );
        return;
      }

      console.log("Getting current position...");

      // Get current position with better error handling
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 30000, // 30 seconds
        timeout: 20000, // 20 seconds
      });

      console.log("Location obtained:", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      // Reverse geocode to get address
      console.log("Reverse geocoding...");
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log("Address data:", address);

      if (address && address.length > 0) {
        const locationData = address[0];
        const detectedLocation = detectPakistanLocation(locationData);

        if (detectedLocation) {
          setTeamData((prev) => ({ ...prev, location: detectedLocation }));
          Alert.alert(
            "Location Detected! 🎉",
            `Your team location has been automatically detected:\n\n${detectedLocation}`,
            [{ text: "OK" }]
          );
        } else {
          // Try to provide helpful information
          const country = locationData.country || "Unknown";
          const city = locationData.city || locationData.subregion || "Unknown";

          if (country !== "Pakistan") {
            Alert.alert(
              "Location Not in Pakistan",
              `Detected location: ${city}, ${country}\n\nThis location is not within Pakistan. Please select your location manually from the list.`,
              [{ text: "OK" }]
            );
          } else {
            Alert.alert(
              "Location Detection Limited",
              `Detected: ${city}, Pakistan\n\nCould not find exact area match. Please select your specific area manually.`,
              [{ text: "OK" }]
            );
          }
        }
      } else {
        Alert.alert(
          "Location Detection Failed",
          "Could not get address information for your location. Please select your location manually.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error getting current location:", error);

      let errorMessage =
        "Failed to get your current location. Please select manually.";

      if (error.message.includes("timeout")) {
        errorMessage =
          "Location detection timed out. Please try again or select manually.";
      } else if (error.message.includes("network")) {
        errorMessage =
          "Network error during location detection. Please check your internet connection.";
      } else if (error.message.includes("permission")) {
        errorMessage =
          "Location permission denied. Please grant permission in settings.";
      }

      Alert.alert("Location Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setLocationLoading(false);
    }
  };

  // Enhanced location detection with better matching
  const detectPakistanLocation = (locationData) => {
    const { city, region, country, subregion, street, name, district } =
      locationData;

    console.log("Processing location data:", {
      city,
      region,
      country,
      subregion,
      street,
      name,
      district,
    });

    // Check if country is Pakistan
    if (country !== "Pakistan") {
      console.log("Country is not Pakistan:", country);
      return null;
    }

    // Try to find exact matches in our location data
    let bestMatch = null;
    let bestScore = 0;

    // Search through provinces
    Object.keys(PAKISTAN_LOCATIONS).forEach((province) => {
      // Check if province matches
      if (
        province.toLowerCase().includes(region?.toLowerCase() || "") ||
        region?.toLowerCase().includes(province.toLowerCase()) ||
        province.toLowerCase().includes(subregion?.toLowerCase() || "")
      ) {
        const match = `${city || "Unknown City"}, ${province}`;
        if (bestScore < 3) {
          bestMatch = match;
          bestScore = 3;
        }
      }

      // Search through cities in this province
      Object.keys(PAKISTAN_LOCATIONS[province]).forEach((cityName) => {
        if (
          cityName.toLowerCase().includes(city?.toLowerCase() || "") ||
          city?.toLowerCase().includes(cityName.toLowerCase()) ||
          cityName.toLowerCase().includes(subregion?.toLowerCase() || "")
        ) {
          const match = `${cityName}, ${province}`;
          if (bestScore < 4) {
            bestMatch = match;
            bestScore = 4;
          }

          // Search through areas in this city - IMPROVED LOGIC
          PAKISTAN_LOCATIONS[province][cityName].forEach((area) => {
            let areaScore = 0;

            // Check district first (highest priority)
            if (
              district &&
              area.toLowerCase().includes(district.toLowerCase())
            ) {
              areaScore = 10; // Highest score for district match
            }
            // Check street/name
            else if (
              street &&
              area.toLowerCase().includes(street.toLowerCase())
            ) {
              areaScore = 8;
            } else if (
              name &&
              area.toLowerCase().includes(name.toLowerCase())
            ) {
              areaScore = 7;
            }
            // Check if area name is contained in district
            else if (
              district &&
              district.toLowerCase().includes(area.toLowerCase())
            ) {
              areaScore = 6;
            }
            // Check if area is contained in district
            else if (
              district &&
              area.toLowerCase().includes(district.toLowerCase())
            ) {
              areaScore = 5;
            }

            if (areaScore > bestScore) {
              const match = `${area}, ${cityName}, ${province}`;
              bestMatch = match;
              bestScore = areaScore;
              console.log(
                `New best match: ${match} with score: ${areaScore} (area: ${area})`
              );
            }
          });
        }
      });
    });

    console.log("Best match found:", bestMatch, "with score:", bestScore);
    return bestMatch;
  };

  const validateForm = () => {
    if (!teamData.name.trim()) {
      Alert.alert("Error", "Please enter a team name");
      return false;
    }
    if (!teamData.sport) {
      Alert.alert("Error", "Please select a sport");
      return false;
    }
    if (!teamData.skillLevel) {
      Alert.alert("Error", "Please select a skill level");
      return false;
    }
    if (!teamData.maxMembers) {
      Alert.alert("Error", "Please select maximum members");
      return false;
    }
    if (!teamData.location.trim()) {
      Alert.alert("Error", "Please select a location");
      return false;
    }
    if (!teamData.description.trim()) {
      Alert.alert("Error", "Please enter a team description");
      return false;
    }
    return true;
  };

  const handleCreateTeam = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        console.log("🚀 Starting team creation process...");
        console.log(
          "📝 Form data to be inserted:",
          JSON.stringify(teamData, null, 2)
        );
        console.log(" User ID:", user.id);

        // Debug: Check what columns exist in teams table
        console.log("🔍 Checking teams table structure...");
        try {
          const { data: tableInfo, error: tableError } = await supabase
            .from("teams")
            .select("*")
            .limit(1);

          if (tableError) {
            console.error("❌ Error checking table structure:", tableError);
          } else {
            console.log("✅ Teams table accessible, sample data:", tableInfo);
          }
        } catch (checkError) {
          console.error("❌ Failed to check table structure:", checkError);
        }

        // Debug: Log the exact insert payload
        const insertPayload = {
          name: teamData.name,
          sport: teamData.sport, // Use 'sport' (new column name)
          skill_level: teamData.skillLevel,
          max_members: parseInt(teamData.maxMembers),
          location: teamData.location,
          description: teamData.description,
          requirements: teamData.requirements || null,
          created_by: user.id,
          member_count: 1,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log(
          "📤 Insert payload:",
          JSON.stringify(insertPayload, null, 2)
        );

        // Create the team in the database
        console.log("💾 Inserting team into database...");
        const { data: newTeam, error: teamError } = await supabase
          .from("teams")
          .insert(insertPayload)
          .select()
          .single();

        if (teamError) {
          console.error("❌ Team creation error:", teamError);
          console.error("❌ Error code:", teamError.code);
          console.error("❌ Error message:", teamError.message);
          console.error("❌ Error details:", teamError.details);
          throw teamError;
        }

        console.log("✅ Team created successfully:", newTeam);
        console.log(" New team ID:", newTeam.id);

        // Add the creator as the first team member (Captain)
        console.log(" Adding team member (Captain)...");

        // ✅ Fixed: Only include columns that exist in team_members table
        const memberPayload = {
          team_id: newTeam.id,
          user_id: user.id,
          role_in_team: "captain",
          joined_at: new Date().toISOString(),
        };

        console.log(
          "📤 Member insert payload:",
          JSON.stringify(memberPayload, null, 2)
        );

        const { error: memberError } = await supabase
          .from("team_members")
          .insert(memberPayload);

        if (memberError) {
          console.error("❌ Team member creation error:", memberError);
          console.error("❌ Error code:", memberError.code);
          console.error("❌ Error message:", memberError.message);
          throw memberError;
        }

        console.log("✅ Team member added successfully");

        Alert.alert(
          "Success! 🎉",
          "Team created successfully! You are now the Captain of this team.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } catch (error) {
        console.error("💥 CRITICAL ERROR in team creation:", error);
        console.error("💥 Error type:", typeof error);
        console.error("💥 Error constructor:", error.constructor.name);
        console.error("💥 Full error object:", JSON.stringify(error, null, 2));

        Alert.alert("Error", "Failed to create team. Please try again.", [
          { text: "OK" },
        ]);
      } finally {
        setLoading(false);
        console.log("🏁 Team creation process finished");
      }
    } else {
      console.log("❌ Form validation failed");
    }
  };

  // Debug function to check database schema
  const debugDatabaseSchema = async () => {
    console.log("DEBUGGING DATABASE SCHEMA...");

    try {
      // Check teams table
      console.log("📋 Checking teams table...");
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .limit(1);

      if (teamsError) {
        console.error("❌ Teams table error:", teamsError);
      } else {
        console.log("✅ Teams table accessible");
        if (teamsData && teamsData.length > 0) {
          console.log("📊 Sample team data:", teamsData[0]);
          console.log("🔑 Available columns:", Object.keys(teamsData[0]));
        }
      }

      // Check team_members table
      console.log("📋 Checking team_members table...");
      const { data: membersData, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .limit(1);

      if (membersError) {
        console.error("❌ Team members table error:", membersError);
      } else {
        console.log("✅ Team members table accessible");
        if (membersData && membersData.length > 0) {
          console.log("📊 Sample member data:", membersData[0]);
          console.log("🔑 Available columns:", Object.keys(membersData[0]));
        }
      }
    } catch (error) {
      console.error("❌ Schema check failed:", error);
    }
  };

  // Call debug function on component mount
  useEffect(() => {
    debugDatabaseSchema();
  }, []);

  const renderSelectionChips = (
    items,
    selectedValue,
    onSelect,
    title,
    placeholder
  ) => (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipContainer}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.selectionChip,
              selectedValue === item.id && styles.selectionChipActive,
            ]}
            onPress={() => onSelect(item.id)}
          >
            <Text
              style={[
                styles.selectionChipText,
                selectedValue === item.id && styles.selectionChipTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {!selectedValue && (
        <Text style={styles.placeholderText}>{placeholder}</Text>
      )}
    </View>
  );

  // Enhanced Location Picker Modal with Auto-Detection
  const renderLocationPicker = () => (
    <Modal
      visible={showLocationPicker}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Team Location</Text>
            <TouchableOpacity
              onPress={() => setShowLocationPicker(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Auto-Location Button */}
          <View style={styles.autoLocationContainer}>
            <TouchableOpacity
              style={styles.autoLocationButton}
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              <Ionicons name="navigate" size={20} color={colors.primary.main} />
              <Text style={styles.autoLocationText}>
                {locationLoading ? "Detecting..." : "Use Current Location"}
              </Text>
              {locationLoading && (
                <View style={styles.loadingSpinner}>
                  <ActivityIndicator size="small" color={colors.primary.main} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.locationScroll}>
            {!selectedProvince ? (
              // Show provinces
              <View>
                <Text style={styles.locationSectionTitle}>Select Province</Text>
                {Object.keys(PAKISTAN_LOCATIONS).map((province) => (
                  <TouchableOpacity
                    key={province}
                    style={styles.locationItem}
                    onPress={() => selectProvince(province)}
                  >
                    <Text style={styles.locationItemText}>{province}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : !selectedCity ? (
              // Show cities
              <View>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedProvince("")}
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color={colors.primary.main}
                  />
                  <Text style={styles.backButtonText}>Back to Provinces</Text>
                </TouchableOpacity>
                <Text style={styles.locationSectionTitle}>Select City</Text>
                {Object.keys(PAKISTAN_LOCATIONS[selectedProvince]).map(
                  (city) => (
                    <TouchableOpacity
                      key={city}
                      style={styles.locationItem}
                      onPress={() => selectCity(city)}
                    >
                      <Text style={styles.locationItemText}>{city}</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.text.secondary}
                      />
                    </TouchableOpacity>
                  )
                )}
              </View>
            ) : (
              // Show areas
              <View>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedCity("")}
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color={colors.primary.main}
                  />
                  <Text style={styles.backButtonText}>Back to Cities</Text>
                </TouchableOpacity>
                <Text style={styles.locationSectionTitle}>Select Area</Text>
                {PAKISTAN_LOCATIONS[selectedProvince][selectedCity].map(
                  (area) => (
                    <TouchableOpacity
                      key={area}
                      style={styles.locationItem}
                      onPress={() => selectArea(area)}
                    >
                      <Text style={styles.locationItemText}>{area}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Team</Text>
          <View style={styles.placeholder} />
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Team Information</Text>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Team Name *</Text>
            <Input
              placeholder="Enter team name"
              value={teamData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              style={styles.input}
            />
          </View>

          {renderSelectionChips(
            sports,
            selectedSport,
            handleSportSelect,
            "Sport *",
            "Select a sport"
          )}

          {renderSelectionChips(
            skillLevels,
            selectedSkillLevel,
            handleSkillLevelSelect,
            "Skill Level *",
            "Select skill level"
          )}

          {renderSelectionChips(
            maxMembersOptions,
            teamData.maxMembers,
            handleMaxMembersSelect,
            "Maximum Members *",
            "Select max members"
          )}

          {/* Location Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Location *</Text>
            <TouchableOpacity
              style={styles.locationPickerButton}
              onPress={openLocationPicker}
            >
              <Text
                style={[
                  styles.locationPickerText,
                  teamData.location
                    ? styles.locationSelected
                    : styles.locationPlaceholder,
                ]}
              >
                {teamData.location ||
                  "Select team location (Province/City/Area)"}
              </Text>
              <Ionicons name="location" size={20} color={colors.primary.main} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Team Description *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your team, goals, and what you're looking for..."
              placeholderTextColor={colors.text.secondary}
              value={teamData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Requirements (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Any specific requirements for joining the team..."
              placeholderTextColor={colors.text.secondary}
              value={teamData.requirements}
              onChangeText={(value) => handleInputChange("requirements", value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Creating Team..." : "Create Team"}
            onPress={() => {
              console.log("Create Team button pressed");
              console.log("📝 Current form data:", teamData);
              handleCreateTeam();
            }}
            style={styles.createButton}
            disabled={loading}
            loading={loading}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Location Picker Modal */}
      {renderLocationPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  headerTitle: {
    ...typography.h1,
    textAlign: "center",
  },
  placeholder: {
    width: 44,
  },
  formCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.dark.surfaceColor,
    borderColor: colors.border.primary,
  },
  chipContainer: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  selectionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectionChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  selectionChipText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  selectionChipTextActive: {
    color: colors.text.primary,
  },
  placeholderText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  textArea: {
    backgroundColor: colors.dark.surfaceColor,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.body.fontSize,
    minHeight: 80,
  },
  buttonContainer: {
    padding: spacing.lg,
  },
  createButton: {
    backgroundColor: colors.primary.main,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },

  // Location Picker Styles
  locationPickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  locationPickerText: {
    ...typography.body,
    flex: 1,
    marginRight: spacing.sm,
  },
  locationSelected: {
    color: colors.text.primary,
  },
  locationPlaceholder: {
    color: colors.text.secondary,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.dark.surfaceColor,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  locationScroll: {
    padding: spacing.lg,
  },
  locationSectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  locationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.dark.backgroundColor,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  locationItemText: {
    ...typography.body,
    color: colors.text.primary,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary.main,
    marginLeft: spacing.sm,
  },

  // New styles for auto-location
  autoLocationContainer: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  autoLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary.main + "20",
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  autoLocationText: {
    ...typography.body,
    color: colors.primary.main,
    marginLeft: spacing.sm,
    fontWeight: "500",
  },
  loadingSpinner: {
    marginLeft: spacing.sm,
  },
});

export default CreateTeam;
