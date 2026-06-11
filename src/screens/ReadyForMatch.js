import React, { useState, useEffect } from "react";
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
import { supabase } from "../config/supabase";
import { useAuth } from "../contexts/AuthContext";

const ReadyForMatch = ({ navigation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [incomingChallenges, setIncomingChallenges] = useState([]);
  const [sentChallenges, setSentChallenges] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);

  const [matches] = useState([
    {
      id: "1",
      title: "Weekend Football Match",
      sport: "Football",
      location: "Central Turf, Karachi",
      date: "2024-01-20",
      time: "18:00",
      duration: "2 hours",
      playersNeeded: 4,
      maxPlayers: 22,
      skillLevel: "Mixed",
      price: 800,
      organizer: "Ahmed Khan",
      description: "Casual weekend football match. All skill levels welcome!",
      amenities: ["Free Parking", "Toilets", "Showers"],
      status: "open",
    },
    {
      id: "2",
      title: "Competitive Cricket League",
      sport: "Cricket",
      location: "Sports Complex, Lahore",
      date: "2024-01-22",
      time: "14:00",
      duration: "4 hours",
      playersNeeded: 8,
      maxPlayers: 30,
      skillLevel: "Advanced",
      price: 1200,
      organizer: "Sara Ahmed",
      description:
        "Competitive cricket match. Looking for experienced players.",
      amenities: ["Free Parking", "Toilets", "Cafeteria"],
      status: "open",
    },
    {
      id: "3",
      title: "Basketball Pickup Game",
      sport: "Basketball",
      location: "City Arena, Islamabad",
      date: "2024-01-19",
      time: "20:00",
      duration: "1.5 hours",
      playersNeeded: 2,
      maxPlayers: 10,
      skillLevel: "Intermediate",
      price: 600,
      organizer: "Usman Ali",
      description: "Quick basketball game. Come join the fun!",
      amenities: ["Free Parking", "Toilets"],
      status: "full",
    },
    {
      id: "4",
      title: "Tennis Doubles",
      sport: "Tennis",
      location: "Elite Club, Karachi",
      date: "2024-01-21",
      time: "16:00",
      duration: "1 hour",
      playersNeeded: 1,
      maxPlayers: 4,
      skillLevel: "Intermediate",
      price: 1000,
      organizer: "Fatima Zahra",
      description: "Tennis doubles match. Need one more player.",
      amenities: ["Free Parking", "Toilets", "Equipment"],
      status: "open",
    },
  ]);

  const sports = [
    { id: "all", name: "All Sports", icon: "football" },
    { id: "football", name: "Football", icon: "football" },
    { id: "cricket", name: "Cricket", icon: "baseball" },
    { id: "basketball", name: "Basketball", icon: "basketball" },
    { id: "tennis", name: "Tennis", icon: "tennisball" },
  ];

  const locations = [
    { id: "all", name: "All Locations" },
    { id: "karachi", name: "Karachi" },
    { id: "lahore", name: "Lahore" },
    { id: "islamabad", name: "Islamabad" },
  ];

  const dates = [
    { id: "all", name: "All Dates" },
    { id: "today", name: "Today" },
    { id: "tomorrow", name: "Tomorrow" },
    { id: "weekend", name: "This Weekend" },
  ];

  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport =
      selectedSport === "all" || match.sport.toLowerCase() === selectedSport;
    const matchesLocation =
      selectedLocation === "all" ||
      match.location.toLowerCase().includes(selectedLocation);
    const matchesDate =
      selectedDate === "all" ||
      (selectedDate === "today" &&
        match.date === new Date().toISOString().split("T")[0]) ||
      (selectedDate === "tomorrow" &&
        match.date ===
          new Date(Date.now() + 86400000).toISOString().split("T")[0]) ||
      (selectedDate === "weekend" && isWeekend(match.date));

    return matchesSearch && matchesSport && matchesLocation && matchesDate;
  });

  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const handleMatchPress = (match) => {
    navigation.navigate("MatchDetails", { match });
  };

  // Challenges: fetch lists
  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (!user) return;
        setLoading(true);
        const { data: memberships, error: memErr } = await supabase
          .from("team_members")
          .select("team_id, role_in_team")
          .eq("user_id", user.id);
        if (memErr) throw memErr;
        const myCaptainTeamIds = (memberships || [])
          .filter((m) => m.role_in_team === "captain")
          .map((m) => m.team_id);

        if (myCaptainTeamIds.length === 0) {
          setIncomingChallenges([]);
          setSentChallenges([]);
          setAcceptedMatches([]);
          return;
        }

        // Build IN lists
        const inList = `(${myCaptainTeamIds.join(",")})`;

        // Incoming (proposed) where any of my captain teams is team_b
        const { data: incoming, error: incErr } = await supabase
          .from("matches")
          .select(
            `id, team_a_id, team_b_id, date, time, status, ground_id, team_a:teams!matches_team_a_id_fkey(id, name, sport), team_b:teams!matches_team_b_id_fkey(id, name, sport), ground:grounds(id, name, location)`
          )
          .eq("status", "proposed")
          .in("team_b_id", myCaptainTeamIds)
          .order("created_at", { ascending: false });
        if (incErr) throw incErr;

        // Sent (proposed) where any of my captain teams is team_a
        const { data: sent, error: sentErr } = await supabase
          .from("matches")
          .select(
            `id, team_a_id, team_b_id, date, time, status, ground_id, team_a:teams!matches_team_a_id_fkey(id, name, sport), team_b:teams!matches_team_b_id_fkey(id, name, sport), ground:grounds(id, name, location)`
          )
          .eq("status", "proposed")
          .in("team_a_id", myCaptainTeamIds)
          .order("created_at", { ascending: false });
        if (sentErr) throw sentErr;

        // Accepted (upcoming) where any of my captain teams is team_a or team_b
        const { data: acceptedA, error: accErrA } = await supabase
          .from("matches")
          .select(
            `id, team_a_id, team_b_id, date, time, status, ground_id, team_a:teams!matches_team_a_id_fkey(id, name, sport), team_b:teams!matches_team_b_id_fkey(id, name, sport), ground:grounds(id, name, location)`
          )
          .eq("status", "upcoming")
          .in("team_a_id", myCaptainTeamIds)
          .order("created_at", { ascending: false });
        if (accErrA) throw accErrA;
        const { data: acceptedB, error: accErrB } = await supabase
          .from("matches")
          .select(
            `id, team_a_id, team_b_id, date, time, status, ground_id, team_a:teams!matches_team_a_id_fkey(id, name, sport), team_b:teams!matches_team_b_id_fkey(id, name, sport), ground:grounds(id, name, location)`
          )
          .eq("status", "upcoming")
          .in("team_b_id", myCaptainTeamIds)
          .order("created_at", { ascending: false });

        // Merge accepted (dedupe by id)
        const mergedAccepted = Array.from(
          new Map(
            [...(acceptedA || []), ...(acceptedB || [])].map((m) => [m.id, m])
          ).values()
        );

        setIncomingChallenges(incoming || []);
        setSentChallenges(sent || []);
        setAcceptedMatches(mergedAccepted);
      } catch (e) {
        console.error("Error fetching challenges:", e);
        setIncomingChallenges([]);
        setSentChallenges([]);
        setAcceptedMatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const handleAcceptChallenge = async (matchId) => {
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "upcoming" })
        .eq("id", matchId);
      if (error) throw error;
      Alert.alert("Accepted", "Challenge accepted.");
      // Quick refresh
      const { data: memberships } = await supabase
        .from("team_members")
        .select("team_id, role_in_team")
        .eq("user_id", user.id);
      const myCaptainTeamIds = (memberships || [])
        .filter((m) => m.role_in_team === "captain")
        .map((m) => m.team_id);
      if (myCaptainTeamIds.length > 0) {
        const { data: incoming } = await supabase
          .from("matches")
          .select(
            `id, team_a_id, team_b_id, date, time, status,
                   team_a:teams!matches_team_a_id_fkey(id, name, sport),
                   team_b:teams!matches_team_b_id_fkey(id, name, sport)`
          )
          .eq("status", "proposed")
          .in("team_b_id", myCaptainTeamIds);
        const { data: acceptedA } = await supabase
          .from("matches")
          .select(
            `id, team_a_id, team_b_id, date, time, status,
                   team_a:teams!matches_team_a_id_fkey(id, name, sport),
                   team_b:teams!matches_team_b_id_fkey(id, name, sport)`
          )
          .eq("status", "upcoming")
          .in("team_a_id", myCaptainTeamIds);
        const { data: acceptedB } = await supabase
          .from("matches")
          .select(
            `id, team_a_id, team_b_id, date, time, status,
                   team_a:teams!matches_team_a_id_fkey(id, name, sport),
                   team_b:teams!matches_team_b_id_fkey(id, name, sport)`
          )
          .eq("status", "upcoming")
          .in("team_b_id", myCaptainTeamIds);
        const mergedAccepted = Array.from(
          new Map(
            [...(acceptedA || []), ...(acceptedB || [])].map((m) => [m.id, m])
          ).values()
        );
        setIncomingChallenges(incoming || []);
        setAcceptedMatches(mergedAccepted);
      }
    } catch (e) {
      Alert.alert("Error", "Could not accept challenge.");
    }
  };

  const handleRejectOrCancelChallenge = async (matchId) => {
    try {
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", matchId);
      if (error) throw error;
      Alert.alert("Done", "Challenge removed.");
      // Quick refresh after delete
      setIncomingChallenges((prev) => prev.filter((m) => m.id !== matchId));
      setSentChallenges((prev) => prev.filter((m) => m.id !== matchId));
    } catch (e) {
      Alert.alert("Error", "Could not update challenge.");
    }
  };

  const handleJoinMatch = (match) => {
    if (match.status === "open" && match.playersNeeded > 0) {
      Alert.alert(
        "Join Match",
        `Are you sure you want to join ${match.title}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Join",
            onPress: () => {
              Alert.alert("Success", "You have joined the match!");
              // Here you would typically update the database
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Match Full",
        "This match is not accepting new players at the moment."
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return colors.success.main;
      case "full":
        return colors.error.main;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "open":
        return "Open";
      case "full":
        return "Full";
      default:
        return "Unknown";
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

  const renderMatchCard = (match) => (
    <Card key={match.id} style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.matchInfo}>
          <Text style={styles.matchTitle}>{match.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(match.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(match.status)}</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>Rs. {match.price}</Text>
        </View>
      </View>

      <View style={styles.matchDetails}>
        <View style={styles.matchRow}>
          <Ionicons name="football" size={16} color={colors.primary.main} />
          <Text style={styles.detailText}>{match.sport}</Text>
          <View style={styles.separator} />
          <Ionicons name="trophy" size={16} color={colors.warning.main} />
          <Text style={styles.detailText}>{match.skillLevel}</Text>
        </View>

        <View style={styles.matchRow}>
          <Ionicons name="location" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{match.location}</Text>
        </View>

        <View style={styles.matchRow}>
          <Ionicons name="calendar" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>
            {new Date(match.date).toLocaleDateString()} at {match.time}
          </Text>
          <View style={styles.separator} />
          <Ionicons name="time" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{match.duration}</Text>
        </View>

        <View style={styles.matchRow}>
          <Ionicons name="people" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>
            {match.playersNeeded} players needed (
            {match.maxPlayers - (match.maxPlayers - match.playersNeeded)}/
            {match.maxPlayers})
          </Text>
        </View>

        <Text style={styles.descriptionText}>{match.description}</Text>

        <View style={styles.organizerInfo}>
          <Ionicons name="person" size={16} color={colors.primary.main} />
          <Text style={styles.organizerText}>
            Organized by: {match.organizer}
          </Text>
        </View>

        <View style={styles.amenitiesContainer}>
          {match.amenities.slice(0, 3).map((amenity, index) => (
            <View key={index} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
          {match.amenities.length > 3 && (
            <Text style={styles.moreAmenitiesText}>
              +{match.amenities.length - 3} more
            </Text>
          )}
        </View>
      </View>

      <View style={styles.matchFooter}>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => handleMatchPress(match)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
        <Button
          title="Join Match"
          onPress={() => handleJoinMatch(match)}
          disabled={match.status !== "open" || match.playersNeeded <= 0}
          style={styles.joinButton}
        />
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
            placeholder="Search matches by title, sport, or location..."
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
            locations,
            selectedLocation,
            setSelectedLocation,
            "Location"
          )}
          {renderFilterChip(dates, selectedDate, setSelectedDate, "Date")}
        </View>
      )}

      {/* Challenges */}
      <ScrollView
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={{ padding: spacing.xl, alignItems: "center" }}>
            <Ionicons name="refresh" size={24} color={colors.text.secondary} />
            <Text
              style={{
                ...typography.body,
                color: colors.text.secondary,
                marginTop: spacing.sm,
              }}
            >
              Loading...
            </Text>
          </View>
        )}

        {incomingChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.resultsTitle}>Incoming Challenges</Text>
            {incomingChallenges.map((m) => (
              <Card key={m.id} style={styles.matchCard}>
                <View style={styles.matchHeader}>
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchTitle}>
                      {m.team_a?.name || "Team A"} →{" "}
                      {m.team_b?.name || "Team B"}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: colors.warning.main },
                      ]}
                    >
                      <Text style={styles.statusText}>Proposed</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.matchDetails}>
                  <View style={styles.matchRow}>
                    <Ionicons
                      name="football"
                      size={16}
                      color={colors.primary.main}
                    />
                    <Text style={styles.detailText}>
                      {m.team_a?.sport || m.team_b?.sport || ""}
                    </Text>
                  </View>
                  {(m.date || m.time) && (
                    <View style={styles.matchRow}>
                      <Ionicons
                        name="calendar"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.detailText}>
                        {m.date ? new Date(m.date).toLocaleDateString() : ""}{" "}
                        {m.time || ""}
                      </Text>
                    </View>
                  )}
                  {m.ground && (
                    <View style={styles.matchRow}>
                      <Ionicons
                        name="location"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.detailText}>
                        {m.ground.name}
                        {m.ground.location &&
                          m.ground.location.city &&
                          ` • ${m.ground.location.city}`}
                        {m.ground.location &&
                          m.ground.location.area &&
                          `, ${m.ground.location.area}`}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.matchFooter}>
                  <Button
                    title="Accept"
                    onPress={() => handleAcceptChallenge(m.id)}
                    style={{ flex: 1, marginRight: spacing.sm }}
                  />
                  <Button
                    title="Reject"
                    onPress={() => handleRejectOrCancelChallenge(m.id)}
                    style={{ flex: 1, marginLeft: spacing.sm }}
                    variant="outline"
                  />
                  <Button
                    title="View Details"
                    onPress={() =>
                      navigation.navigate("MatchDetails", { matchId: m.id })
                    }
                    style={{ flex: 1, marginLeft: spacing.sm }}
                    variant="outline"
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {sentChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.resultsTitle}>Sent Challenges</Text>
            {sentChallenges.map((m) => (
              <Card key={m.id} style={styles.matchCard}>
                <View style={styles.matchHeader}>
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchTitle}>
                      {m.team_a?.name || "Team A"} →{" "}
                      {m.team_b?.name || "Team B"}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: colors.warning.main },
                      ]}
                    >
                      <Text style={styles.statusText}>Proposed</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.matchDetails}>
                  <View style={styles.matchRow}>
                    <Ionicons
                      name="football"
                      size={16}
                      color={colors.primary.main}
                    />
                    <Text style={styles.detailText}>
                      {m.team_a?.sport || m.team_b?.sport || ""}
                    </Text>
                  </View>
                  {(m.date || m.time) && (
                    <View style={styles.matchRow}>
                      <Ionicons
                        name="calendar"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.detailText}>
                        {m.date ? new Date(m.date).toLocaleDateString() : ""}{" "}
                        {m.time || ""}
                      </Text>
                    </View>
                  )}
                  {m.ground && (
                    <View style={styles.matchRow}>
                      <Ionicons
                        name="location"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.detailText}>
                        {m.ground.name}
                        {m.ground.location &&
                          m.ground.location.city &&
                          ` • ${m.ground.location.city}`}
                        {m.ground.location &&
                          m.ground.location.area &&
                          `, ${m.ground.location.area}`}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.matchFooter}>
                  <Button
                    title="Cancel"
                    onPress={() => handleRejectOrCancelChallenge(m.id)}
                    style={{ minWidth: 120 }}
                    variant="outline"
                  />
                  <Button
                    title="View Details"
                    onPress={() =>
                      navigation.navigate("MatchDetails", { matchId: m.id })
                    }
                    style={{ minWidth: 120, marginLeft: spacing.sm }}
                    variant="outline"
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {acceptedMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.resultsTitle}>Accepted Matches</Text>
            {acceptedMatches.map((m) => (
              <Card key={m.id} style={styles.matchCard}>
                <View style={styles.matchHeader}>
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchTitle}>
                      {m.team_a?.name || "Team A"} vs{" "}
                      {m.team_b?.name || "Team B"}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: colors.success.main },
                      ]}
                    >
                      <Text style={styles.statusText}>Upcoming</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.matchDetails}>
                  <View style={styles.matchRow}>
                    <Ionicons
                      name="football"
                      size={16}
                      color={colors.primary.main}
                    />
                    <Text style={styles.detailText}>
                      {m.team_a?.sport || m.team_b?.sport || ""}
                    </Text>
                  </View>
                  {(m.date || m.time) && (
                    <View style={styles.matchRow}>
                      <Ionicons
                        name="calendar"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.detailText}>
                        {m.date ? new Date(m.date).toLocaleDateString() : ""}{" "}
                        {m.time || ""}
                      </Text>
                    </View>
                  )}
                  {m.ground && (
                    <View style={styles.matchRow}>
                      <Ionicons
                        name="location"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.detailText}>
                        {m.ground.name}
                        {m.ground.location &&
                          m.ground.location.city &&
                          ` • ${m.ground.location.city}`}
                        {m.ground.location &&
                          m.ground.location.area &&
                          `, ${m.ground.location.area}`}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.matchFooter}>
                  <Button
                    title="View Details"
                    onPress={() =>
                      navigation.navigate("MatchDetails", { matchId: m.id })
                    }
                    style={{ minWidth: 120 }}
                    variant="outline"
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Fallback to old results if no challenges */}
        {incomingChallenges.length === 0 &&
          sentChallenges.length === 0 &&
          acceptedMatches.length === 0 && (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  {filteredMatches.length} Match
                  {filteredMatches.length !== 1 ? "es" : ""} Found
                </Text>
                {showFilters && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedSport("all");
                      setSelectedLocation("all");
                      setSelectedDate("all");
                    }}
                  >
                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
              {filteredMatches.length > 0 ? (
                filteredMatches.map(renderMatchCard)
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons
                    name="search"
                    size={48}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.noResultsTitle}>No matches found</Text>
                  <Text style={styles.noResultsText}>
                    Try adjusting your search criteria or filters
                  </Text>
                </View>
              )}
            </>
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
  matchCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceText: {
    ...typography.h3,
    color: colors.success.main,
    fontWeight: "600",
  },
  matchDetails: {
    gap: spacing.sm,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  detailText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: colors.border.primary,
    marginHorizontal: spacing.sm,
  },
  descriptionText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  organizerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  organizerText: {
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
  matchFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
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
  joinButton: {
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
  section: {
    marginBottom: spacing.md,
  },
});

export default ReadyForMatch;
