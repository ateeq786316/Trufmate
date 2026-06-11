import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
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

const SearchGrounds = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [grounds] = useState([
    {
      id: "1",
      name: "Central Turf",
      location: "Gulshan-e-Iqbal, Karachi",
      sport: "Football",
      price: 800,
      rating: 4.5,
      reviews: 24,
      amenities: ["Free Parking", "Toilets", "Showers"],
      images: ["https://example.com/turf1.jpg"],
      available: true,
    },
    {
      id: "2",
      name: "Sports Complex",
      location: "Clifton, Karachi",
      sport: "Cricket",
      price: 1200,
      rating: 4.8,
      reviews: 31,
      amenities: ["Free Parking", "Toilets", "Cafeteria"],
      images: ["https://example.com/complex1.jpg"],
      available: true,
    },
    {
      id: "3",
      name: "Elite Ground",
      location: "Defence, Karachi",
      sport: "Football",
      price: 1000,
      rating: 4.2,
      reviews: 18,
      amenities: ["Free Parking", "Toilets"],
      images: ["https://example.com/elite1.jpg"],
      available: false,
    },
    {
      id: "4",
      name: "City Arena",
      location: "North Nazimabad, Karachi",
      sport: "Basketball",
      price: 600,
      rating: 4.0,
      reviews: 15,
      amenities: ["Free Parking", "Toilets", "Equipment"],
      images: ["https://example.com/arena1.jpg"],
      available: true,
    },
  ]);

  const sports = [
    { id: "all", name: "All Sports", icon: "football" },
    { id: "football", name: "Football", icon: "football" },
    { id: "cricket", name: "Cricket", icon: "baseball" },
    { id: "basketball", name: "Basketball", icon: "basketball" },
    { id: "tennis", name: "Tennis", icon: "tennisball" },
  ];

  const priceRanges = [
    { id: "all", name: "All Prices" },
    { id: "low", name: "Under Rs. 500" },
    { id: "medium", name: "Rs. 500 - 1000" },
    { id: "high", name: "Above Rs. 1000" },
  ];

  const ratings = [
    { id: "all", name: "All Ratings" },
    { id: "4.5", name: "4.5+ Stars" },
    { id: "4.0", name: "4.0+ Stars" },
    { id: "3.5", name: "3.5+ Stars" },
  ];

  const filteredGrounds = grounds.filter((ground) => {
    const matchesSearch =
      ground.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ground.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport =
      selectedSport === "all" || ground.sport.toLowerCase() === selectedSport;
    const matchesPrice =
      selectedPriceRange === "all" ||
      (selectedPriceRange === "low" && ground.price < 500) ||
      (selectedPriceRange === "medium" &&
        ground.price >= 500 &&
        ground.price <= 1000) ||
      (selectedPriceRange === "high" && ground.price > 1000);
    const matchesRating =
      selectedRating === "all" || ground.rating >= parseFloat(selectedRating);

    return matchesSearch && matchesSport && matchesPrice && matchesRating;
  });

  const handleGroundPress = (ground) => {
    navigation.navigate("GroundDetails", { ground });
  };

  const handleBookNow = (ground) => {
    if (ground.available) {
      navigation.navigate("BookGround", { ground });
    } else {
      Alert.alert(
        "Not Available",
        "This ground is not available for booking at the moment."
      );
    }
  };

  const renderFilterChip = (items, selectedValue, onSelect, title) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterChips}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.filterChip,
              selectedValue === item.id && styles.filterChipActive,
            ]}
            onPress={() => onSelect(item.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedValue === item.id && styles.filterChipTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderGroundCard = (ground) => (
    <Card key={ground.id} style={styles.groundCard}>
      <View style={styles.groundImageContainer}>
        <View style={styles.groundImagePlaceholder}>
          <Ionicons name="image" size={40} color={colors.text.secondary} />
        </View>
        <View
          style={[
            styles.availabilityBadge,
            {
              backgroundColor: ground.available
                ? colors.success.main
                : colors.error.main,
            },
          ]}
        >
          <Text style={styles.availabilityText}>
            {ground.available ? "Available" : "Not Available"}
          </Text>
        </View>
      </View>

      <View style={styles.groundContent}>
        <View style={styles.groundHeader}>
          <Text style={styles.groundName}>{ground.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.warning.main} />
            <Text style={styles.ratingText}>{ground.rating}</Text>
            <Text style={styles.reviewsText}>({ground.reviews})</Text>
          </View>
        </View>

        <View style={styles.groundLocation}>
          <Ionicons name="location" size={16} color={colors.text.secondary} />
          <Text style={styles.locationText}>{ground.location}</Text>
        </View>

        <View style={styles.groundSport}>
          <Ionicons name="football" size={16} color={colors.primary.main} />
          <Text style={styles.sportText}>{ground.sport}</Text>
        </View>

        <View style={styles.amenitiesContainer}>
          {ground.amenities.slice(0, 3).map((amenity, index) => (
            <View key={index} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
          {ground.amenities.length > 3 && (
            <Text style={styles.moreAmenitiesText}>
              +{ground.amenities.length - 3} more
            </Text>
          )}
        </View>

        <View style={styles.groundFooter}>
          <Text style={styles.priceText}>Rs. {ground.price}/hour</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => handleGroundPress(ground)}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
            <Button
              title="Book Now"
              onPress={() => handleBookNow(ground)}
              disabled={!ground.available}
              style={styles.bookButton}
            />
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.text.secondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search grounds by name or location..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {renderFilterChip(
            sports,
            selectedSport,
            setSelectedSport,
            "Sport Type"
          )}
          {renderFilterChip(
            priceRanges,
            selectedPriceRange,
            setSelectedPriceRange,
            "Price Range"
          )}
          {renderFilterChip(
            ratings,
            selectedRating,
            setSelectedRating,
            "Rating"
          )}
        </View>
      )}

      {/* Results */}
      <ScrollView
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {filteredGrounds.length} Ground
            {filteredGrounds.length !== 1 ? "s" : ""} Found
          </Text>
          {showFilters && (
            <TouchableOpacity
              onPress={() => {
                setSelectedSport("all");
                setSelectedPriceRange("all");
                setSelectedRating("all");
              }}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredGrounds.length > 0 ? (
          filteredGrounds.map(renderGroundCard)
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color={colors.text.secondary} />
            <Text style={styles.noResultsTitle}>No grounds found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your search criteria or filters
            </Text>
          </View>
        )}

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
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.body.fontSize,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  filterChips: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.primary,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  resultsTitle: {
    ...typography.h2,
  },
  clearFiltersText: {
    ...typography.body,
    color: colors.primary.main,
  },
  groundCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  groundImageContainer: {
    position: "relative",
    height: 200,
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
  availabilityBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  availabilityText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
  },
  groundContent: {
    gap: spacing.sm,
  },
  groundHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groundName: {
    ...typography.h2,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  ratingText: {
    ...typography.body,
    fontWeight: "600",
  },
  reviewsText: {
    ...typography.caption,
    color: colors.text.secondary,
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
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    alignItems: "center",
  },
  amenityChip: {
    backgroundColor: colors.dark.surfaceColor,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  amenityText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  moreAmenitiesText: {
    ...typography.caption,
    color: colors.primary.main,
  },
  groundFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  priceText: {
    ...typography.h3,
    color: colors.success.main,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  viewDetailsButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  viewDetailsText: {
    ...typography.body,
    color: colors.primary.main,
  },
  bookButton: {
    minWidth: 100,
  },
  noResultsContainer: {
    alignItems: "center",
    padding: spacing.xxl,
    marginTop: spacing.xl,
  },
  noResultsTitle: {
    ...typography.h2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  noResultsText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default SearchGrounds;
