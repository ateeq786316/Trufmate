import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

const MatchDetails = ({ navigation, route }) => {
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamAMembers, setTeamAMembers] = useState([]);
  const [teamBMembers, setTeamBMembers] = useState([]);

  // ✅ New: Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    ground_id: null,
  });
  const [grounds, setGrounds] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get match ID from route params
  const matchId = route.params?.matchId;

  // ✅ New: Debug editForm changes
  useEffect(() => {
    console.log("🔍 [MatchDetails] Edit form state changed:", editForm);
  }, [editForm]);

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
    } else {
      setLoading(false);
    }
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      console.log("🔍 [MatchDetails] Fetching match details for ID:", matchId);
      setLoading(true);

      // Add cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      console.log("🔍 [MatchDetails] Fetch timestamp:", timestamp);

      // Fetch match details with team and ground information
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select(
          `
          *,
          team_a:teams!matches_team_a_id_fkey(
            id, name, sport, skill_level, description, location,
            members:team_members(
              role_in_team,
              user:users(id, name, email, phone)
            )
          ),
          team_b:teams!matches_team_b_id_fkey(
            id, name, sport, skill_level, description, location,
            members:team_members(
              role_in_team,
              user:users(id, name, email, phone)
            )
          ),
          ground:grounds(
            id, name, location, sports, amenities, price_per_hour, rating_avg
          )
        `
        )
        .eq("id", matchId)
        .single();

      if (matchError) {
        console.error("❌ [MatchDetails] Error fetching match:", matchError);
        throw matchError;
      }

      console.log("✅ [MatchDetails] Match data fetched:", {
        id: matchData?.id,
        date: matchData?.date,
        time: matchData?.time,
        ground_id: matchData?.ground_id,
        ground_name: matchData?.ground?.name,
        status: matchData?.status,
        updated_at: matchData?.updated_at,
      });

      // ✅ New: Test simple fetch to verify basic data
      console.log("🔍 [MatchDetails] Testing simple fetch...");
      const { data: simpleData, error: simpleError } = await supabase
        .from("matches")
        .select("id, date, time, ground_id, updated_at")
        .eq("id", matchId)
        .single();

      if (simpleError) {
        console.error("❌ [MatchDetails] Simple fetch error:", simpleError);
      } else {
        console.log("✅ [MatchDetails] Simple fetch result:", simpleData);
      }

      if (matchData) {
        setMatch(matchData);

        // Transform team members data
        const teamAMembersList = (matchData.team_a?.members || []).map(
          (member) => ({
            id: member.user?.id,
            name: member.user?.name || "Unknown",
            email: member.user?.email,
            phone: member.user?.phone,
            position: member.role_in_team,
            status: "confirmed", // All team members are confirmed
          })
        );

        const teamBMembersList = (matchData.team_b?.members || []).map(
          (member) => ({
            id: member.user?.id,
            name: member.user?.name || "Unknown",
            email: member.user?.email,
            phone: member.user?.phone,
            position: member.role_in_team,
            status: "confirmed", // All team members are confirmed
          })
        );

        console.log("✅ [MatchDetails] Team members processed:", {
          teamA: teamAMembersList.length,
          teamB: teamBMembersList.length,
        });

        setTeamAMembers(teamAMembersList);
        setTeamBMembers(teamBMembersList);
      }
    } catch (error) {
      console.error("❌ [MatchDetails] Error fetching match details:", error);
      Alert.alert("Error", "Failed to load match details. Please try again.");
    } finally {
      setLoading(false);
      console.log("✅ [MatchDetails] Match details fetch completed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return colors.warning.main;
      case "ongoing":
        return colors.primary.main;
      case "completed":
        return colors.success.main;
      case "cancelled":
        return colors.error.main;
      case "proposed":
        return colors.warning.main;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "ongoing":
        return "Ongoing";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "proposed":
        return "Proposed";
      default:
        return "Unknown";
    }
  };

  const getPlayerStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return colors.success.main;
      case "pending":
        return colors.warning.main;
      case "declined":
        return colors.error.main;
      default:
        return colors.text.secondary;
    }
  };

  const handleJoinTeam = (teamId) => {
    Alert.alert(
      "Join Team",
      `Are you sure you want to join ${
        teamId === "team1" ? match.team_a?.name : match.team_b?.name
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Join",
          onPress: () => {
            Alert.alert("Success", "You have joined the team successfully!");
          },
        },
      ]
    );
  };

  const handleLeaveMatch = () => {
    Alert.alert("Leave Match", "Are you sure you want to leave this match?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          Alert.alert("Left Match", "You have left the match successfully.");
          navigation.goBack();
        },
      },
    ]);
  };

  // ✅ New: Check if user can edit this match
  const canEditMatch = () => {
    if (!match || !user) return false;

    // Check if user is captain of either team
    const teamAMembers = match.team_a?.members || [];
    const teamBMembers = match.team_b?.members || [];

    const isTeamACaptain = teamAMembers.some(
      (member) =>
        member.user?.id === user.id && member.role_in_team === "captain"
    );

    const isTeamBCaptain = teamBMembers.some(
      (member) =>
        member.user?.id === user.id && member.role_in_team === "captain"
    );

    console.log("🔍 [MatchDetails] canEditMatch check:", {
      userId: user?.id,
      teamAMembers: teamAMembers.length,
      teamBMembers: teamBMembers.length,
      isTeamACaptain,
      isTeamBCaptain,
      canEdit: isTeamACaptain || isTeamBCaptain,
    });

    return isTeamACaptain || isTeamBCaptain;
  };

  // ✅ New: Fetch available grounds
  const fetchGrounds = async () => {
    try {
      console.log("🔍 [MatchDetails] Fetching grounds...");
      const { data, error } = await supabase
        .from("grounds")
        .select("id, name, location, sports, price_per_hour, rating_avg")
        .order("rating_avg", { ascending: false })
        .limit(50);

      if (error) throw error;

      console.log(
        "✅ [MatchDetails] Grounds fetched:",
        data?.length || 0,
        "grounds"
      );
      setGrounds(data || []);
    } catch (error) {
      console.error("❌ [MatchDetails] Error fetching grounds:", error);
      Alert.alert("Error", "Failed to load grounds. Please try again.");
    }
  };

  // ✅ New: Handle edit mode toggle
  const handleEditToggle = () => {
    console.log(
      "🔍 [MatchDetails] Edit toggle called, current editMode:",
      editMode
    );

    if (!editMode) {
      // Entering edit mode
      console.log("🔍 [MatchDetails] Entering edit mode, current match data:", {
        date: match.date,
        time: match.time,
        ground_id: match.ground_id,
      });

      setEditForm({
        date: match.date || "",
        time: match.time || "",
        ground_id: match.ground_id || null,
      });
      fetchGrounds();
    }
    setEditMode(!editMode);
    console.log("✅ [MatchDetails] Edit mode set to:", !editMode);
  };

  // ✅ New: Handle date picker
  const onPickDate = (_, date) => {
    console.log("🔍 [MatchDetails] Date picker result:", date);
    setShowDatePicker(false);
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const dateString = `${y}-${m}-${d}`;
      console.log("✅ [MatchDetails] Date formatted:", dateString);
      setEditForm((prev) => ({ ...prev, date: dateString }));
    }
  };

  // ✅ New: Handle time picker
  const onPickTime = (_, time) => {
    console.log("🔍 [MatchDetails] Time picker result:", time);
    setShowTimePicker(false);
    if (time) {
      const hh = String(time.getHours()).padStart(2, "0");
      const mm = String(time.getMinutes()).padStart(2, "0");
      const timeString = `${hh}:${mm}`;
      console.log("✅ [MatchDetails] Time formatted:", timeString);
      setEditForm((prev) => ({ ...prev, time: timeString }));
    }
  };

  // ✅ New: Save match changes
  const handleSaveChanges = async () => {
    try {
      console.log("🔍 [MatchDetails] Starting save changes...");
      console.log("🔍 [MatchDetails] Edit form data:", editForm);
      console.log("🔍 [MatchDetails] Match ID:", matchId);
      console.log("🔍 [MatchDetails] Current user ID:", user?.id);

      setSaving(true);

      const updateData = {
        date: editForm.date || null,
        time: editForm.time || null,
        ground_id: editForm.ground_id || null,
        updated_at: new Date().toISOString(),
      };

      console.log("🔍 [MatchDetails] Update data to send:", updateData);

      // First, let's check the current state in database
      console.log("🔍 [MatchDetails] Checking current database state...");
      const { data: currentData, error: currentError } = await supabase
        .from("matches")
        .select("id, date, time, ground_id, updated_at")
        .eq("id", matchId)
        .single();

      if (currentError) {
        console.error(
          "❌ [MatchDetails] Error fetching current data:",
          currentError
        );
      } else {
        console.log("🔍 [MatchDetails] Current database state:", currentData);
      }

      // ✅ New: Test if we can update this specific match
      console.log("🔍 [MatchDetails] Testing update permissions...");
      const { data: testUpdate, error: testError } = await supabase
        .from("matches")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", matchId)
        .select("id, updated_at");

      if (testError) {
        console.error("❌ [MatchDetails] Test update failed:", testError);
        throw new Error(`Update permission test failed: ${testError.message}`);
      } else {
        console.log("✅ [MatchDetails] Test update successful:", testUpdate);
      }

      // Perform the actual update
      console.log("🔍 [MatchDetails] Performing actual update...");
      const { data, error } = await supabase
        .from("matches")
        .update(updateData)
        .eq("id", matchId)
        .select(); // Add select to get updated data

      if (error) {
        console.error("❌ [MatchDetails] Database update error:", error);
        throw error;
      }

      console.log("✅ [MatchDetails] Database update successful:", data);

      // Verify the update was applied by fetching again
      console.log("🔍 [MatchDetails] Verifying update was applied...");
      const { data: verifyData, error: verifyError } = await supabase
        .from("matches")
        .select("id, date, time, ground_id, updated_at")
        .eq("id", matchId)
        .single();

      if (verifyError) {
        console.error("❌ [MatchDetails] Error verifying update:", verifyError);
      } else {
        console.log(
          "🔍 [MatchDetails] Verified database state after update:",
          verifyData
        );

        // Check if the update actually changed anything
        const dateChanged = verifyData.date !== currentData.date;
        const timeChanged = verifyData.time !== currentData.time;
        const groundChanged = verifyData.ground_id !== currentData.ground_id;

        console.log("🔍 [MatchDetails] Change verification:", {
          dateChanged,
          timeChanged,
          groundChanged,
          expectedDate: updateData.date,
          actualDate: verifyData.date,
        });
      }

      Alert.alert("Success", "Match details updated successfully!");
      setEditMode(false);

      console.log("🔍 [MatchDetails] Refreshing match details...");
      await fetchMatchDetails(); // Refresh match data
    } catch (error) {
      console.error("❌ [MatchDetails] Error updating match:", error);

      // Check if it's an RLS policy issue
      if (error.code === "42501") {
        Alert.alert(
          "Permission Error",
          "You don't have permission to update this match. This might be due to Row Level Security policies."
        );
      } else {
        Alert.alert(
          "Error",
          `Failed to update match details: ${error.message}`
        );
      }
    } finally {
      setSaving(false);
      console.log("✅ [MatchDetails] Save operation completed");
    }
  };

  // ✅ New: Cancel edit mode
  const handleCancelEdit = () => {
    console.log("🔍 [MatchDetails] Cancelling edit mode");
    setEditMode(false);
    setEditForm({
      date: "",
      time: "",
      ground_id: null,
    });
  };

  /*
  🔧 RLS POLICY FIX NEEDED:
  
  The update is failing due to Row Level Security policies. Run this SQL in your Supabase SQL Editor:
  
  -- Drop existing update policy if it exists
  DROP POLICY IF EXISTS "Users can update matches they are captains of" ON matches;
  
  -- Create new update policy for team captains
  CREATE POLICY "Users can update matches they are captains of" ON matches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = matches.team_a_id 
      AND tm.user_id = auth.uid() 
      AND tm.role_in_team = 'captain'
    ) OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = matches.team_b_id 
      AND tm.user_id = auth.uid() 
      AND tm.role_in_team = 'captain'
    )
  );
  
  -- Also ensure RLS is enabled
  ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
  */

  const renderPlayer = (player) => (
    <View key={player.id} style={styles.playerItem}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerPosition}>{player.position}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getPlayerStatusColor(player.status) },
        ]}
      >
        <Text style={styles.statusText}>
          {player.status.charAt(0).toUpperCase() + player.status.slice(1)}
        </Text>
      </View>
    </View>
  );

  const renderTeam = (team, teamId, members) => (
    <Card key={teamId} style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{team?.name || "Unknown Team"}</Text>
        <Text style={styles.teamScore}>0</Text>
      </View>
      <View style={styles.teamInfo}>
        <Text style={styles.teamSport}>{team?.sport || "Unknown Sport"}</Text>
        <Text style={styles.teamSkillLevel}>
          Skill Level: {team?.skill_level || "Not set"}
        </Text>
        {team?.description && (
          <Text style={styles.teamDescription}>{team.description}</Text>
        )}
      </View>
      <View style={styles.playersList}>
        {members.length > 0 ? (
          members.map(renderPlayer)
        ) : (
          <Text style={styles.noPlayersText}>No players found</Text>
        )}
      </View>
      <View style={styles.teamFooter}>
        <Text style={styles.playerCount}>{members.length} Players</Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading match details...</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={colors.error.main} />
        <Text style={styles.errorTitle}>Match Not Found</Text>
        <Text style={styles.errorText}>
          The match you're looking for doesn't exist or has been removed.
        </Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Match Header */}
        <View style={styles.matchHeader}>
          <View style={styles.matchTitleContainer}>
            <Text style={styles.matchTitle}>
              {match.team_a?.name || "Team A"} vs{" "}
              {match.team_b?.name || "Team B"}
            </Text>
            <View style={styles.headerActions}>
              {canEditMatch() && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditToggle}
                >
                  <Ionicons
                    name="create"
                    size={20}
                    color={colors.text.primary}
                  />
                </TouchableOpacity>
              )}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(match.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(match.status)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.matchDateTime}>
            {match.date && (
              <View style={styles.dateTimeItem}>
                <Ionicons
                  name="calendar"
                  size={16}
                  color={colors.text.secondary}
                />
                <Text style={styles.dateTimeText}>
                  {new Date(match.date).toDateString()}
                </Text>
              </View>
            )}
            {match.time && (
              <View style={styles.dateTimeItem}>
                <Ionicons name="time" size={16} color={colors.text.secondary} />
                <Text style={styles.dateTimeText}>{match.time}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Ground Information */}
        {match.ground && (
          <Card style={styles.groundCard}>
            <Text style={styles.sectionTitle}>Ground Details</Text>
            <View style={styles.groundInfo}>
              <View style={styles.groundImageContainer}>
                <View style={styles.groundImagePlaceholder}>
                  <Ionicons
                    name="image"
                    size={40}
                    color={colors.text.secondary}
                  />
                </View>
              </View>
              <View style={styles.groundDetails}>
                <Text style={styles.groundName}>{match.ground.name}</Text>
                <View style={styles.groundLocation}>
                  <Ionicons
                    name="location"
                    size={16}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.locationText}>
                    {match.ground.location?.city || ""}
                    {match.ground.location?.area &&
                      `, ${match.ground.location.area}`}
                  </Text>
                </View>
                {match.ground.price_per_hour && (
                  <Text style={styles.groundPrice}>
                    Rs. {match.ground.price_per_hour}/hour
                  </Text>
                )}
                {match.ground.rating_avg && (
                  <View style={styles.ratingContainer}>
                    <Ionicons
                      name="star"
                      size={16}
                      color={colors.warning.main}
                    />
                    <Text style={styles.ratingText}>
                      {match.ground.rating_avg}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Teams */}
        <View style={styles.teamsContainer}>
          <Text style={styles.sectionTitle}>Teams</Text>
          {renderTeam(match.team_a, "team1", teamAMembers)}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          {renderTeam(match.team_b, "team2", teamBMembers)}
        </View>

        {/* Match Rules */}
        <Card style={styles.rulesCard}>
          <Text style={styles.sectionTitle}>Match Rules</Text>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success.main}
              />
              <Text style={styles.ruleText}>Standard match rules apply</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success.main}
              />
              <Text style={styles.ruleText}>
                Fair play and sportsmanship expected
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success.main}
              />
              <Text style={styles.ruleText}>Referee decisions are final</Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Chat with Team"
            onPress={() =>
              navigation.navigate("ChatRoom", { matchId: match.id })
            }
            style={styles.chatButton}
          />
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveMatch}
          >
            <Text style={styles.leaveButtonText}>Leave Match</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* ✅ New: Edit Match Modal */}
      <Modal
        visible={editMode}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Match Details</Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Date Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Match Date</Text>
                <TouchableOpacity
                  style={styles.dateTimeInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={{
                      color: editForm.date
                        ? colors.text.primary
                        : colors.text.secondary,
                    }}
                  >
                    {editForm.date || "Select date"}
                  </Text>
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Time Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Match Time</Text>
                <TouchableOpacity
                  style={styles.dateTimeInput}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text
                    style={{
                      color: editForm.time
                        ? colors.text.primary
                        : colors.text.secondary,
                    }}
                  >
                    {editForm.time || "Select time"}
                  </Text>
                  <Ionicons
                    name="time"
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Ground Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Ground</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={editForm.ground_id}
                    onValueChange={(value) => {
                      console.log(
                        "🔍 [MatchDetails] Ground picker value changed:",
                        value
                      );
                      setEditForm((prev) => ({ ...prev, ground_id: value }));
                    }}
                    style={styles.picker}
                    dropdownIconColor={colors.text.secondary}
                  >
                    <Picker.Item
                      label="Select ground"
                      value={null}
                      color={colors.text.secondary}
                    />
                    {grounds.map((ground) => (
                      <Picker.Item
                        key={ground.id}
                        label={`${ground.name} - ${
                          ground.location?.city || ""
                        }`}
                        value={ground.id}
                        color={colors.text.primary}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={handleCancelEdit}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={saving ? "Saving..." : "Save Changes"}
                onPress={handleSaveChanges}
                disabled={saving}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Date and Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onPickDate}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          is24Hour={false}
          onChange={onPickTime}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
  },
  matchHeader: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.dark.surfaceColor,
    marginBottom: spacing.lg,
  },
  matchTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  matchTitle: {
    ...typography.h1,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
  },
  matchDateTime: {
    gap: spacing.sm,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dateTimeText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  groundCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  groundInfo: {
    flexDirection: "row",
    gap: spacing.md,
  },
  groundImageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  groundImagePlaceholder: {
    flex: 1,
    backgroundColor: colors.dark.surfaceColor,
    justifyContent: "center",
    alignItems: "center",
  },
  groundDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  groundName: {
    ...typography.h3,
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
  groundPrice: {
    ...typography.body,
    color: colors.success.main,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  ratingText: {
    ...typography.body,
    color: colors.warning.main,
    fontWeight: "600",
  },
  teamsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  teamCard: {
    marginBottom: spacing.md,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  teamName: {
    ...typography.h3,
  },
  teamScore: {
    ...typography.h1,
    color: colors.primary.main,
  },
  teamInfo: {
    marginBottom: spacing.md,
  },
  teamSport: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  teamSkillLevel: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  teamDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  playersList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...typography.body,
    fontWeight: "600",
  },
  playerPosition: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  teamFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  playerCount: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  joinButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
  },
  joinButtonText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
  },
  vsContainer: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  vsText: {
    ...typography.h2,
    color: colors.text.secondary,
    fontWeight: "bold",
  },
  rulesCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  rulesList: {
    gap: spacing.sm,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  ruleText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  notesCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  notesText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  actionButtons: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  chatButton: {
    width: "100%",
  },
  leaveButton: {
    padding: spacing.md,
    backgroundColor: colors.error.main,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  leaveButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.dark.backgroundColor,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.dark.backgroundColor,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  errorButton: {
    width: "100%",
  },
  noPlayersText: {
    ...typography.body,
    color: colors.text.secondary,
    fontStyle: "italic",
    textAlign: "center",
    padding: spacing.md,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  editButton: {
    padding: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.lg,
    width: "90%",
    maxWidth: 400,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    flex: 1,
  },
  modalBody: {
    marginBottom: spacing.md,
  },
  formSection: {
    marginBottom: spacing.md,
  },
  formLabel: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  dateTimeInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  pickerContainer: {
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  picker: {
    color: colors.text.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
});

export default MatchDetails;
