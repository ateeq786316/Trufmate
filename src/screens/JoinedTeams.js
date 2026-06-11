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

const JoinedTeams = ({ navigation }) => {
  const [teams] = useState([
    {
      id: "1",
      name: "Elite Warriors",
      sport: "Football",
      skillLevel: "Advanced",
      members: 8,
      maxMembers: 11,
      location: "Karachi",
      description: "Competitive football team looking for skilled players",
      captain: "Ahmed Khan",
      rating: 4.5,
      reviews: 12,
      joinedDate: "2024-01-15",
      role: "Member",
      upcomingMatches: 2,
    },
    {
      id: "2",
      name: "City Strikers",
      sport: "Football",
      skillLevel: "Intermediate",
      members: 6,
      maxMembers: 11,
      location: "Lahore",
      description: "Friendly team for casual players",
      captain: "Sara Ahmed",
      rating: 4.2,
      reviews: 8,
      joinedDate: "2024-01-10",
      role: "Vice Captain",
      upcomingMatches: 1,
    },
    {
      id: "3",
      name: "Thunder Bolts",
      sport: "Cricket",
      skillLevel: "Beginner",
      members: 9,
      maxMembers: 15,
      location: "Islamabad",
      description: "New team welcoming all skill levels",
      captain: "Usman Ali",
      rating: 4.0,
      reviews: 5,
      joinedDate: "2024-01-05",
      role: "Member",
      upcomingMatches: 0,
    },
  ]);

  const handleTeamPress = (team) => {
    navigation.navigate("TeamDetails", { team });
  };

  const handleLeaveTeam = (team) => {
    Alert.alert("Leave Team", `Are you sure you want to leave ${team.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          Alert.alert("Success", `You have left ${team.name}`);
          // Here you would typically update the database
        },
      },
    ]);
  };

  const handleViewMatches = (team) => {
    navigation.navigate("TeamMatches", { team });
  };

  const handleChat = (team) => {
    navigation.navigate("ChatRoom", { team });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Captain":
        return colors.warning.main;
      case "Vice Captain":
        return colors.secondary.main;
      default:
        return colors.text.secondary;
    }
  };

  const renderTeamCard = (team) => (
    <Card key={team.id} style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={styles.roleContainer}>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleColor(team.role) },
              ]}
            >
              <Text style={styles.roleText}>{team.role}</Text>
            </View>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={colors.warning.main} />
          <Text style={styles.ratingText}>{team.rating}</Text>
          <Text style={styles.reviewsText}>({team.reviews})</Text>
        </View>
      </View>

      <View style={styles.teamDetails}>
        <View style={styles.teamRow}>
          <Ionicons name="football" size={16} color={colors.primary.main} />
          <Text style={styles.detailText}>{team.sport}</Text>
          <View style={styles.separator} />
          <Ionicons name="trophy" size={16} color={colors.warning.main} />
          <Text style={styles.detailText}>{team.skillLevel}</Text>
        </View>

        <View style={styles.teamRow}>
          <Ionicons name="location" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{team.location}</Text>
          <View style={styles.separator} />
          <Ionicons name="people" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>
            {team.members}/{team.maxMembers} members
          </Text>
        </View>

        <Text style={styles.descriptionText}>{team.description}</Text>

        <View style={styles.captainInfo}>
          <Ionicons name="person" size={16} color={colors.primary.main} />
          <Text style={styles.captainText}>Captain: {team.captain}</Text>
        </View>

        <View style={styles.joinedInfo}>
          <Ionicons name="calendar" size={16} color={colors.text.secondary} />
          <Text style={styles.joinedText}>
            Joined: {new Date(team.joinedDate).toLocaleDateString()}
          </Text>
        </View>

        {team.upcomingMatches > 0 && (
          <View style={styles.matchesInfo}>
            <Ionicons
              name="game-controller"
              size={16}
              color={colors.success.main}
            />
            <Text style={styles.matchesText}>
              {team.upcomingMatches} upcoming match
              {team.upcomingMatches !== 1 ? "es" : ""}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.teamActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewMatches(team)}
        >
          <Ionicons
            name="game-controller"
            size={16}
            color={colors.primary.main}
          />
          <Text style={styles.actionButtonText}>Matches</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleChat(team)}
        >
          <Ionicons
            name="chatbubbles"
            size={16}
            color={colors.secondary.main}
          />
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTeamPress(team)}
        >
          <Ionicons
            name="information-circle"
            size={16}
            color={colors.text.secondary}
          />
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.teamFooter}>
        <Button
          title="Leave Team"
          onPress={() => handleLeaveTeam(team)}
          style={styles.leaveButton}
        />
      </View>
    </Card>
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
        <Text style={styles.headerTitle}>My Teams</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate("SearchTeams")}
        >
          <Ionicons name="search" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {teams.length > 0 ? (
          teams.map(renderTeamCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>No teams joined yet</Text>
            <Text style={styles.emptyText}>
              Join teams to start playing and connecting with other players
            </Text>
            <Button
              title="Search Teams"
              onPress={() => navigation.navigate("SearchTeams")}
              style={styles.searchTeamsButton}
            />
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
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  teamCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  roleText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
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
  teamDetails: {
    gap: spacing.sm,
  },
  teamRow: {
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
  captainInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  captainText: {
    ...typography.body,
    color: colors.primary.main,
  },
  joinedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  joinedText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  matchesInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  matchesText: {
    ...typography.body,
    color: colors.success.main,
  },
  teamActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  actionButton: {
    alignItems: "center",
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  teamFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  leaveButton: {
    backgroundColor: colors.error.main,
  },
  emptyContainer: {
    alignItems: "center",
    padding: spacing.xxl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  searchTeamsButton: {
    backgroundColor: colors.primary.main,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default JoinedTeams;
