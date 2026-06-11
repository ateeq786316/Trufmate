import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  Modal,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Linking,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { Button, Card, Input } from "../components";
import { colors, typography, spacing } from "../constants/theme";
import { supabase } from "../config/supabase";
import { useAuth } from "../contexts/AuthContext";

// Pakistan Location Data
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
      "Nishat Colony", // ✅ Added this
      "Cantt Area", // ✅ Added this for better Cantt matching
      "Cantt Extension", // ✅ Added this
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

const EditProfile = ({ navigation, route }) => {
  const { user } = useAuth();
  const { userProfile } = route.params || {};

  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    phone: userProfile?.phone || "",
    location: userProfile?.location || "",
    bio: userProfile?.bio || "",
    sports_pref: userProfile?.sports_pref || [],
    social_media: userProfile?.social_media || "",
    avatar_url: userProfile?.avatar_url || "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Location picker state
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  // Add useEffect to fetch fresh data when component mounts
  useEffect(() => {
    fetchUserProfile();
    checkLocationPermission();
  }, []);

  // Enhanced function to fetch fresh user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching user profile for:", user.id);

      // Fetch user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Error fetching profile:", profileError);
        Alert.alert("Error", "Failed to load profile data. Please try again.");
        return;
      }

      console.log("✅ Profile data loaded:", profileData);

      // Handle location format - convert JSON to string if needed
      let locationString = "";
      if (profileData?.location) {
        if (
          typeof profileData.location === "object" &&
          profileData.location !== null
        ) {
          // Convert JSON location object to string
          const { area, city, province } = profileData.location;
          locationString =
            area && city && province ? `${area}, ${city}, ${province}` : "";
          console.log("🔄 Converted JSON location to string:", locationString);
        } else {
          locationString = profileData.location;
        }
      }

      // Update form data with fresh data from database
      setFormData({
        name: profileData?.name || "",
        phone: profileData?.phone || "",
        location: locationString,
        bio: profileData?.bio || "",
        sports_pref: profileData?.sports_pref || [],
        social_media: profileData?.social_media || "",
        avatar_url: profileData?.avatar_url || "",
      });
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      Alert.alert("Error", "Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          setFormData((prev) => ({ ...prev, location: detectedLocation }));
          Alert.alert(
            "Location Detected! 🎉",
            `Your location has been automatically detected:\n\n${detectedLocation}`,
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

  // Enhanced form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits";
    }

    // Validate social media if provided
    if (formData.social_media && !isValidSocialMedia(formData.social_media)) {
      newErrors.social_media =
        "Please enter a valid social media handle or URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced social media validation
  const isValidSocialMedia = (input) => {
    // Allow @username format or valid URLs
    if (input.startsWith("@")) {
      return input.length >= 2;
    }

    // Check if it's a valid URL
    try {
      new URL(input.startsWith("http") ? input : `https://${input}`);
      return true;
    } catch {
      return false;
    }
  };

  // Profile Picture Functions
  const requestImagePermission = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library to select a profile picture.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting image permission:", error);
      return false;
    }
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your camera to take a profile picture.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      return false;
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Profile Picture",
      "Choose how you want to set your profile picture",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Take Photo",
          onPress: () => takePhoto(),
        },
        {
          text: "Choose from Library",
          onPress: () => pickImage(),
        },
        formData.avatar_url
          ? {
              text: "Remove Current",
              style: "destructive",
              onPress: () => removeProfilePicture(),
            }
          : null,
      ].filter(Boolean)
    );
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Fixed: Use MediaTypeOptions.Images
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestImagePermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Fixed: Use MediaTypeOptions.Images
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadProfilePicture = async (imageUri) => {
    try {
      setImageLoading(true);
      console.log("📸 Starting simple upload...");

      // Convert image to base64 (simpler approach)
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onload = async () => {
        const base64Data = reader.result;

        // For now, just store the base64 data (temporary solution)
        setFormData((prev) => ({
          ...prev,
          avatar_url: base64Data,
        }));

        console.log("✅ Base64 image stored temporarily");
        Alert.alert(
          "Success",
          "Profile picture updated! (Note: This is a temporary solution)"
        );
        setImageLoading(false);
      };
    } catch (error) {
      console.error("❌ Simple upload error:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
      setImageLoading(false);
    }
  };

  const removeProfilePicture = () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setImageLoading(true);
              console.log("🗑️ Removing profile picture...");

              // Update form data
              setFormData((prev) => ({
                ...prev,
                avatar_url: "",
              }));

              Alert.alert("Success", "Profile picture removed successfully!");
            } catch (error) {
              console.error("❌ Error removing image:", error);
              Alert.alert("Error", "Failed to remove profile picture.");
            } finally {
              setImageLoading(false);
            }
          },
        },
      ]
    );
  };

  // Enhanced save function with profile picture
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log("💾 Saving profile data:", formData);

      // Convert location string back to JSON format for database
      let locationData = null;
      if (formData.location && formData.location.trim()) {
        const locationParts = formData.location
          .split(",")
          .map((part) => part.trim());
        if (locationParts.length >= 3) {
          locationData = {
            area: locationParts[0],
            city: locationParts[1],
            province: locationParts[2],
          };
        } else if (locationParts.length === 2) {
          locationData = {
            city: locationParts[0],
            province: locationParts[1],
          };
        } else {
          locationData = formData.location;
        }
      }

      console.log("📍 Location data to save:", locationData);

      // Update user profile in database
      const { error: profileError } = await supabase
        .from("users")
        .update({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          location: locationData,
          bio: formData.bio?.trim() || null,
          sports_pref:
            formData.sports_pref.length > 0 ? formData.sports_pref : null,
          social_media: formData.social_media?.trim() || null,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("❌ Database error:", profileError);
        throw new Error(`Database error: ${profileError.message}`);
      }

      console.log("✅ Profile updated successfully");

      // Fetch fresh data after successful update
      await fetchUserProfile();

      Alert.alert(
        "Success! 🎉",
        "Your profile has been updated successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      Alert.alert(
        "Update Failed",
        `Failed to update profile: ${error.message}`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sports preference management - Fixed for Android
  const addSportPreference = () => {
    // Create a custom input modal since Alert.prompt is not available on Android
    setShowAddSportModal(true);
  };

  const handleAddSport = () => {
    if (newSport && newSport.trim()) {
      const trimmedSport = newSport.trim();

      // Check if sport already exists
      if (formData.sports_pref.includes(trimmedSport)) {
        Alert.alert("Already Added", "This sport is already in your list.");
        return;
      }

      // Validate sport name
      if (trimmedSport.length < 2) {
        Alert.alert(
          "Invalid Sport",
          "Sport name must be at least 2 characters long."
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        sports_pref: [...prev.sports_pref, trimmedSport],
      }));

      console.log("✅ Sport added:", trimmedSport);

      // Clear input and close modal
      setNewSport("");
      setShowAddSportModal(false);
    }
  };

  const removeSportPreference = (index) => {
    const sportToRemove = formData.sports_pref[index];
    Alert.alert(
      "Remove Sport",
      `Are you sure you want to remove "${sportToRemove}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setFormData((prev) => ({
              ...prev,
              sports_pref: prev.sports_pref.filter((_, i) => i !== index),
            }));
            console.log("✅ Sport removed:", sportToRemove);
          },
        },
      ]
    );
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
    setFormData((prev) => ({ ...prev, location: fullLocation }));
    setShowLocationPicker(false);
  };

  // Enhanced location picker with auto-detection
  const renderLocationPicker = () => (
    <Modal
      visible={showLocationPicker}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Location</Text>
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

  // Add new state for sport modal
  const [showAddSportModal, setShowAddSportModal] = useState(false);
  const [newSport, setNewSport] = useState("");

  // Add Sport Modal
  const renderAddSportModal = () => (
    <Modal visible={showAddSportModal} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Sport</Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddSportModal(false);
                setNewSport("");
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalSubtitle}>
              Enter a sport you're interested in:
            </Text>

            <TextInput
              style={styles.sportInput}
              placeholder="e.g., Cricket, Football, Tennis..."
              value={newSport}
              onChangeText={setNewSport}
              autoFocus={true}
              autoCapitalize="words"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddSportModal(false);
                  setNewSport("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddSport}
                disabled={!newSport.trim()}
              >
                <Text style={styles.addButtonText}>Add Sport</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Enhanced location display function
  const getLocationDisplayText = () => {
    if (!formData.location) {
      return "Select your location (Province/City/Area)";
    }

    // Handle both string and object formats
    if (typeof formData.location === "object" && formData.location !== null) {
      const { area, city, province } = formData.location;
      if (area && city && province) {
        return `${area}, ${city}, ${province}`;
      } else if (city && province) {
        return `${city}, ${province}`;
      } else {
        return "Invalid location format";
      }
    }

    return formData.location;
  };

  // Profile Picture Display Component
  const renderProfilePicture = () => (
    <View style={styles.profilePictureContainer}>
      <Text style={styles.inputLabel}>Profile Picture</Text>

      <TouchableOpacity
        style={styles.profilePictureButton}
        onPress={showImagePickerOptions}
        disabled={imageLoading}
      >
        {formData.avatar_url ? (
          <Image
            source={{ uri: formData.avatar_url }}
            style={styles.profilePicture}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.profilePicturePlaceholder}>
            <Ionicons name="person" size={40} color={colors.text.secondary} />
          </View>
        )}

        {imageLoading && (
          <View style={styles.imageLoadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary.main} />
          </View>
        )}

        <View style={styles.profilePictureEditIcon}>
          <Ionicons name="camera" size={20} color={colors.primary.main} />
        </View>
      </TouchableOpacity>

      <Text style={styles.profilePictureHelpText}>
        Tap to change your profile picture
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.dark.backgroundColor}
      />

      <LinearGradient
        colors={[colors.dark.backgroundColor, colors.dark.surfaceColor]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>Edit Profile</Text>
              <Text style={styles.roleText}>
                Update your personal information and preferences
              </Text>
            </View>
          </View>

          {/* Profile Picture */}
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Profile Picture</Text>
            {renderProfilePicture()}
          </Card>

          {/* Personal Information */}
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Personal Information</Text>

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
              error={errors.name}
            />

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              error={errors.phone}
            />

            {/* Location Picker - Fixed */}
            <View style={styles.locationContainer}>
              <Text style={styles.inputLabel}>Location</Text>
              <TouchableOpacity
                style={styles.locationPickerButton}
                onPress={openLocationPicker}
              >
                <Text
                  style={[
                    styles.locationPickerText,
                    formData.location
                      ? styles.locationSelected
                      : styles.locationPlaceholder,
                  ]}
                >
                  {getLocationDisplayText()}
                </Text>
                <Ionicons
                  name="location"
                  size={20}
                  color={colors.primary.main}
                />
              </TouchableOpacity>
            </View>

            <Input
              label="Bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              multiline
              numberOfLines={3}
              style={styles.bioInput}
            />
          </Card>

          {/* Sports Preferences - Fixed */}
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Sports Preferences</Text>
            <Text style={styles.formSubtitle}>
              Add sports you're interested in playing or watching
            </Text>

            {formData.sports_pref.length === 0 && (
              <View style={styles.emptySportsContainer}>
                <Ionicons
                  name="basketball-outline"
                  size={40}
                  color={colors.text.secondary}
                />
                <Text style={styles.emptySportsText}>
                  No sports added yet. Tap "Add Sport" to get started!
                </Text>
              </View>
            )}

            <View style={styles.sportsContainer}>
              {formData.sports_pref.map((sport, index) => (
                <View key={index} style={styles.sportTag}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.success.main}
                    style={styles.sportIcon}
                  />
                  <Text style={styles.sportText}>{sport}</Text>
                  <TouchableOpacity
                    onPress={() => removeSportPreference(index)}
                    style={styles.removeSportButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.error.main}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.addSportButton}
              onPress={addSportPreference}
            >
              <View style={styles.addSportButtonContent}>
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={colors.primary.main}
                />
                <Text style={styles.addSportButtonText}>Add Sport</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.sportsHelpText}>
              Add sports like: Football, Cricket, Basketball, Tennis, Badminton,
              etc.
            </Text>
          </Card>

          {/* Social Media */}
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Social Media</Text>

            <Input
              label="Social Media"
              placeholder="@username or profile URL"
              value={formData.social_media}
              onChangeText={(text) =>
                setFormData({ ...formData, social_media: text })
              }
              error={errors.social_media}
            />
          </Card>

          {/* Info Note */}
          <View style={styles.infoContainer}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.warning.main}
            />
            <Text style={styles.infoText}>
              Email address cannot be changed. Contact support if needed.
            </Text>
          </View>

          {/* Save Button */}
          <Button
            title={loading ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            loading={loading}
            style={styles.submitButton}
            disabled={loading}
          />
        </ScrollView>
      </LinearGradient>

      {/* Location Picker Modal */}
      {renderLocationPicker()}

      {/* Add Sport Modal */}
      {renderAddSportModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    ...typography.h1,
    fontSize: 26,
    marginBottom: spacing.xs,
  },
  roleText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 16,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  formSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    fontSize: 14,
  },
  locationContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
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
  bioInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  sportsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sportTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.main + "20",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary.main,
    minWidth: 120,
  },
  sportIcon: {
    marginRight: spacing.xs,
  },
  sportText: {
    ...typography.body,
    color: colors.primary.main,
    marginRight: spacing.sm,
    flex: 1,
    fontWeight: "500",
  },
  removeSportButton: {
    padding: spacing.xs,
  },
  addSportButton: {
    backgroundColor: colors.primary.main + "20",
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    alignItems: "center",
  },
  addSportButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addSportButtonText: {
    ...typography.body,
    color: colors.primary.main,
    marginLeft: spacing.sm,
    fontWeight: "500",
  },
  sportsHelpText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  preferenceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  preferenceLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.warning.main + "20",
    borderRadius: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.warning.main,
    fontSize: 12,
    marginLeft: spacing.sm,
    flex: 1,
  },
  // Location Picker Modal Styles
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
  // Enhanced sports styles
  emptySportsContainer: {
    alignItems: "center",
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  emptySportsText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
    fontSize: 14,
  },
  // Modal styles for add sport
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: spacing.lg,
    width: "80%",
    maxWidth: 400,
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
  modalBody: {
    padding: spacing.lg,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  sportInput: {
    backgroundColor: colors.dark.backgroundColor,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.dark.backgroundColor,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: colors.primary.main,
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary.contrastText,
    fontWeight: "500",
  },
  // Profile Picture Styles
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  profilePictureButton: {
    position: "relative",
    marginBottom: spacing.sm,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary.main,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.dark.backgroundColor,
    borderWidth: 3,
    borderColor: colors.border.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  profilePictureEditIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.dark.surfaceColor,
  },
  imageLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  profilePictureHelpText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default EditProfile;
 