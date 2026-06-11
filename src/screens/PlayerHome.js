import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
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

const PlayerHome = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Simple data states
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userStats, setUserStats] = useState({
    totalMatches: 0,
    wins: 0,
    winRate: 0,
    activeTeams: 0,
  });

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchPlayerData();
    }
  }, [user]);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (user) {
        fetchPlayerData();
      }
    });

    return unsubscribe;
  }, [navigation, user]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);

      // Fetch data in parallel for better performance
      await Promise.all([
        fetchUpcomingMatches(),
        fetchJoinedTeams(),
        fetchUserStats(),
      ]);
    } catch (error) {
      console.error("Error fetching player data:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingMatches = async () => {
    try {
      // Fetch matches where user is participating through team membership
      const { data: teamMemberships, error: teamError } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      if (teamError) throw teamError;

      if (!teamMemberships || teamMemberships.length === 0) {
        setUpcomingMatches([]);
        return;
      }

      const teamIds = teamMemberships.map((tm) => tm.team_id);

      // Fetch matches for user's teams
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select(
          `
          *,
          team_a:teams!matches_team_a_id_fkey(name, sport),
          team_b:teams!matches_team_b_id_fkey(name, sport),
          ground:grounds(name, location)
        `
        )
        .or(
          `team_a_id.in.(${teamIds.join(",")}),team_b_id.in.(${teamIds.join(
            ","
          )})`
        )
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(5);

      if (matchesError) throw matchesError;

      // Transform data for display
      const transformedMatches =
        matches?.map((match) => ({
          id: match.id,
          teamA: match.team_a?.name || "Unknown Team",
          teamB: match.team_b?.name || "Unknown Team",
          date: new Date(match.date).toLocaleDateString(),
          time: match.time,
          ground: match.ground?.name || "Unknown Ground",
          sport: match.team_a?.sport || "Unknown Sport",
          status: match.status,
          match_date: match.date,
        })) || [];

      setUpcomingMatches(transformedMatches);
    } catch (error) {
      console.error("Error fetching upcoming matches:", error);
      setUpcomingMatches([]);
    }
  };

  const fetchJoinedTeams = async () => {
    try {
      // Fetch teams where user is a member
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select(
          `
          *,
          team:teams(id, name, sport, member_count)
        `
        )
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false })
        .limit(3);

      if (membersError) throw membersError;

      const transformedTeams =
        members?.map((member) => ({
          id: member.team_id,
          name: member.team?.name || "Unknown Team",
          sport: member.team?.sport || "Unknown Sport",
          members: member.team?.member_count || 0,
          role: member.role_in_team || "Player",
          team_id: member.team_id,
        })) || [];

      setJoinedTeams(transformedTeams);
    } catch (error) {
      console.error("Error fetching joined teams:", error);
      setJoinedTeams([]);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Get user's team memberships
      const { data: teamMemberships, error: teamError } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      if (teamError) throw teamError;

      const teamIds = teamMemberships?.map((tm) => tm.team_id) || [];

      if (teamIds.length === 0) {
        setUserStats({
          totalMatches: 0,
          wins: 0,
          winRate: 0,
          activeTeams: teamIds.length,
        });
        return;
      }

      // Fetch completed matches for user's teams
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .or(
          `team_a_id.in.(${teamIds.join(",")}),team_b_id.in.(${teamIds.join(
            ","
          )})`
        )
        .eq("status", "completed");

      if (matchesError) throw matchesError;

      const totalMatches = matches?.length || 0;
      const wins =
        matches?.filter((match) => {
          if (teamIds.includes(match.team_a_id)) {
            return match.score_a > match.score_b;
          } else if (teamIds.includes(match.team_b_id)) {
            return match.score_b > match.score_a;
          }
          return false;
        }).length || 0;

      const winRate =
        totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

      setUserStats({
        totalMatches,
        wins,
        winRate,
        activeTeams: teamIds.length,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setUserStats({
        totalMatches: 0,
        wins: 0,
        winRate: 0,
        activeTeams: 0,
      });
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    return time.toLocaleDateString();
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "search":
        navigation.navigate("SearchGrounds");
        break;
      case "teams":
        navigation.navigate("SearchTeams");
        break;
      case "create_team":
        navigation.navigate("CreateTeam");
        break;
      case "matches":
        navigation.navigate("ReadyForMatch");
        break;
      case "bookings":
        navigation.navigate("BookGround");
        break;
      case "manage_teams":
        navigation.navigate("EditMyTeams");
        break;
      default:
        break;
    }
  };

  const handleChallengeResponse = async (challengeId, response) => {
    try {
      const { error } = await supabase
        .from("challenges")
        .update({
          status: response === "accept" ? "accepted" : "declined",
          updated_at: new Date().toISOString(),
        })
        .eq("id", challengeId);

      if (error) throw error;

      Alert.alert(
        "Challenge Updated",
        `Challenge ${
          response === "accept" ? "accepted" : "declined"
        } successfully!`
      );

      // Refresh challenges
      // fetchChallenges(); // This function is removed, so this line is removed
    } catch (error) {
      console.error("Error updating challenge:", error);
      Alert.alert("Error", "Failed to update challenge. Please try again.");
    }
  };

  const renderQuickActionButton = (
    icon,
    title,
    action,
    color = colors.primary.main
  ) => (
    <TouchableOpacity
      style={[styles.quickActionButton, { backgroundColor: color }]}
      onPress={() => handleQuickAction(action)}
    >
      <Ionicons name={icon} size={26} color={colors.text.primary} />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  const renderMatchCard = (match) => (
    <Card key={match.id} style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Text style={styles.matchSport}>{match.sport}</Text>
        <Text style={styles.statusText}>{match.status}</Text>
      </View>
      <View style={styles.matchTeams}>
        <Text style={styles.teamName}>{match.teamA}</Text>
        <Text style={styles.vsText}>vs</Text>
        <Text style={styles.teamName}>{match.teamB}</Text>
      </View>
      <View style={styles.matchDetails}>
        <View style={styles.matchDetailItem}>
          <Ionicons name="time" size={16} color={colors.text.secondary} />
          <Text style={styles.matchTime}>{match.time}</Text>
        </View>
        <View style={styles.matchDetailItem}>
          <Ionicons name="location" size={16} color={colors.text.secondary} />
          <Text style={styles.matchGround}>{match.ground}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() =>
          navigation.navigate("MatchDetails", { matchId: match.id })
        }
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.primary.main}
        />
      </TouchableOpacity>
    </Card>
  );

  const renderChallengeCard = (challenge) => (
    <Card key={challenge.id} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeFrom}>{challenge.from}</Text>
        <Text style={styles.sportText}>{challenge.sport}</Text>
      </View>
      <Text style={styles.challengeMessage}>{challenge.message}</Text>
      <Text style={styles.challengeDate}>{challenge.date}</Text>
      <View style={styles.challengeActions}>
        <Button
          title="Accept"
          onPress={() =>
            handleChallengeResponse(challenge.challenge_id, "accept")
          }
          style={styles.acceptButton}
        />
        <Button
          title="Decline"
          onPress={() =>
            handleChallengeResponse(challenge.challenge_id, "decline")
          }
          variant="outline"
          style={styles.declineButton}
        />
      </View>
    </Card>
  );

  const renderTeamCard = (team) => (
    <Card key={team.id} style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.roleText}>{team.role}</Text>
      </View>
      <Text style={styles.teamSport}>{team.sport}</Text>
      <Text style={styles.teamMembers}>{team.members} members</Text>
      <TouchableOpacity
        style={styles.manageTeamButton}
        onPress={() =>
          navigation.navigate("EditMyTeams", { teamId: team.team_id })
        }
      >
        <Text style={styles.manageTeamText}>Manage Team</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.primary.main}
        />
      </TouchableOpacity>
    </Card>
  );

  const renderNotification = (notification) => (
    <View key={notification.id} style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <Ionicons
          name="notifications"
          size={16}
          color={colors.text.secondary}
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
    </View>
  );

  const renderStatsSection = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color={colors.primary.main} />
          <Text style={styles.statNumber}>{userStats.totalMatches}</Text>
          <Text style={styles.statLabel}>Total Matches</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={colors.success.main}
          />
          <Text style={styles.statNumber}>{userStats.wins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons
            name="trending-up"
            size={26}
            color={colors.secondary.main}
          />
          <Text style={styles.statNumber}>{userStats.winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color={colors.warning.main} />
          <Text style={styles.statNumber}>{userStats.activeTeams}</Text>
          <Text style={styles.statLabel}>Active Teams</Text>
        </View>
      </View>
    </View>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlayerData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary.main]}
          tintColor={colors.primary.main}
        />
      }
    >
      {/* Top Heading */}
      <View style={styles.topHeading}>
        <Text style={styles.topHeadingText}>PLAYER DASHBOARD</Text>
        <Text style={styles.topHeadingSubtext}>Ready for the Game?</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subtitleText}>Ready for some action today?</Text>
      </View>

      {/* Stats Section */}
      {renderStatsSection()}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {renderQuickActionButton(
            "search",
            "Search Grounds",
            "search",
            colors.primary.main
          )}
          {renderQuickActionButton(
            "people",
            "Find Teams",
            "teams",
            colors.secondary.main
          )}
          {renderQuickActionButton(
            "add-circle",
            "Create Team",
            "create_team",
            colors.success.main
          )}
          {renderQuickActionButton(
            "settings",
            "Manage Teams",
            "manage_teams",
            colors.warning.main
          )}
          {renderQuickActionButton(
            "football",
            "Ready Matches",
            "matches",
            colors.secondary.main
          )}
          {renderQuickActionButton(
            "calendar",
            "My Bookings",
            "bookings",
            colors.primary.main
          )}
        </View>
      </View>

      {/* Team Management Section */}
      <View style={[styles.section, styles.sectionTightTop]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Team Management</Text>
          <TouchableOpacity onPress={() => navigation.navigate("EditMyTeams")}>
            <Text style={styles.seeAllText}>Manage All</Text>
          </TouchableOpacity>
        </View>

        {/* Create Team Card */}
        {/* <Card style={styles.createTeamCard}>
          <View style={styles.createTeamContent}>
            <Ionicons
              name="add-circle-outline"
              size={32}
              color={colors.primary.main}
            />
            <View style={styles.createTeamText}>
              <Text style={styles.createTeamTitle}>Create Your Own Team</Text>
              <Text style={styles.createTeamSubtitle}>
                Start a team and invite players to join
              </Text>
            </View>
          </View>
          <Button
            title="Create Team"
            onPress={() => navigation.navigate("CreateTeam")}
            style={styles.createTeamButton}
          />
        </Card> */}

        {/* My Teams */}
        {joinedTeams.length > 0 ? (
          joinedTeams.map(renderTeamCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No teams joined yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create a team or join existing ones to get started!
            </Text>
            <View style={styles.emptyStateActions}>
              <Button
                title="Create Team"
                onPress={() => navigation.navigate("CreateTeam")}
                style={styles.emptyStateButton}
              />
              <Button
                title="Find Teams"
                onPress={() => navigation.navigate("SearchTeams")}
                variant="outline"
                style={styles.emptyStateButton}
              />
            </View>
          </View>
        )}
      </View>

      {/* Upcoming Matches */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Matches</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("ReadyForMatch")}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {upcomingMatches.length > 0 ? (
          upcomingMatches.map(renderMatchCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming matches</Text>
            <Text style={styles.emptyStateSubtext}>
              Join a team or create one to start playing!
            </Text>
          </View>
        )}
      </View>

      {/* Challenges */}
      {/* Challenges section is removed as per the edit hint */}

      {/* Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {notifications.length > 0 ? (
          notifications.map(renderNotification)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No notifications</Text>
            <Text style={styles.emptyStateSubtext}>You're all caught up!</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
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
  topHeading: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
  },
  topHeadingText: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: "center",
  },
  topHeadingSubtext: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  welcomeText: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitleText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  statsSection: {
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  statCard: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.medium,
  },
  statNumber: {
    ...typography.h1,
    color: colors.text.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: "center",
  },
  quickActionsContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xs,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  quickActionButton: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.button,
  },
  quickActionText: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  section: {
    padding: spacing.sm,
  },
  sectionTightTop: {
    paddingTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
  },
  seeAllText: {
    ...typography.body,
    color: colors.primary.main,
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
  },
  emptyStateText: {
    ...typography.h3,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: "center",
  },
  matchCard: {
    marginBottom: spacing.md,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  matchSport: {
    ...typography.h3,
    color: colors.primary.main,
  },
  statusText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  matchTeams: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  teamName: {
    ...typography.h3,
    flex: 1,
    textAlign: "center",
  },
  vsText: {
    ...typography.body,
    color: colors.text.secondary,
    marginHorizontal: spacing.sm,
  },
  matchDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  matchDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  matchTime: {
    ...typography.body,
    color: colors.text.secondary,
  },
  matchGround: {
    ...typography.body,
    color: colors.text.secondary,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: spacing.xs,
  },
  viewDetailsText: {
    ...typography.body,
    color: colors.primary.main,
  },
  challengeCard: {
    marginBottom: spacing.md,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  challengeFrom: {
    ...typography.h3,
  },
  sportText: {
    ...typography.body,
    color: colors.primary.main,
  },
  challengeMessage: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  challengeDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  challengeActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acceptButton: {
    flex: 1,
  },
  declineButton: {
    flex: 1,
  },
  teamCard: {
    marginBottom: spacing.md,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  roleText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  teamSport: {
    ...typography.body,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  teamMembers: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  manageTeamButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: spacing.xs,
  },
  manageTeamText: {
    ...typography.body,
    color: colors.primary.main,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    backgroundColor: colors.dark.surfaceColor,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
  createTeamCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.primary.main + "10",
    borderColor: colors.primary.main + "30",
    borderWidth: 1,
  },
  createTeamContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  createTeamText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  createTeamTitle: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  createTeamSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  createTeamButton: {
    alignSelf: "flex-end",
  },
  emptyStateSubtext: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  emptyStateActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  emptyStateButton: {
    flex: 1,
  },
});

export default PlayerHome;
