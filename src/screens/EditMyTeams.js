import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
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
import { supabase } from "../config/supabase";
import { useAuth } from "../contexts/AuthContext";

const EditMyTeams = ({ navigation, route }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]); // ✅ New: filtered teams state
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]); // ✅ New state for sent invitations
  const [myPendingRequests, setMyPendingRequests] = useState([]); // ✅ New state for requests sent TO the current user
  // Challenges state
  const [incomingChallenges, setIncomingChallenges] = useState([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState([]);

  // ✅ New: Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterOwnership, setFilterOwnership] = useState("all"); // "all", "own", "joined"
  const [filterSport, setFilterSport] = useState("all");
  const [filterRole, setFilterRole] = useState("all"); // "all", "captain", "vice_captain", "player"

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    requirements: "",
    max_members: "",
  });

  const [inviteForm, setInviteForm] = useState({
    email: "",
    message: "",
  });

  // ✅ New: Filter options
  const ownershipOptions = [
    { id: "all", name: "All Teams" },
    { id: "own", name: "Teams I Created" },
    { id: "joined", name: "Teams I Joined" },
  ];

  const sportOptions = [
    { id: "all", name: "All Sports" },
    { id: "football", name: "Football" },
    { id: "cricket", name: "Cricket" },
    { id: "basketball", name: "Basketball" },
    { id: "tennis", name: "Tennis" },
  ];

  const roleOptions = [
    { id: "all", name: "All Roles" },
    { id: "captain", name: "Captain" },
    { id: "vice_captain", name: "Vice Captain" },
    { id: "player", name: "Player" },
  ];

  // Debug function
  const debugLog = (message, data = null) => {
    console.log(`🔍 [EditMyTeams] ${message}`, data ? data : "");
  };

  // Enhanced debug function for state changes
  const debugState = (stateName, stateValue) => {
    console.log(`📊 [EditMyTeams] STATE UPDATE - ${stateName}:`, stateValue);
  };

  // Debug function for API responses
  const debugAPI = (operation, response, error = null) => {
    if (error) {
      console.log(`❌ [EditMyTeams] API ERROR - ${operation}:`, error);
    } else {
      console.log(`✅ [EditMyTeams] API SUCCESS - ${operation}:`, response);
    }
  };

  // ✅ New: Filter teams based on current filter criteria
  const applyFilters = () => {
    debugLog("Applying filters...");
    debugLog("Filter criteria:", { filterOwnership, filterSport, filterRole });

    let filtered = [...teams];

    // Filter by ownership
    if (filterOwnership !== "all") {
      if (filterOwnership === "own") {
        filtered = filtered.filter((team) => team.created_by === user.id);
      } else if (filterOwnership === "joined") {
        filtered = filtered.filter((team) => team.created_by !== user.id);
      }
    }

    // Filter by sport
    if (filterSport !== "all") {
      filtered = filtered.filter((team) => team.sport === filterSport);
    }

    // Filter by role
    if (filterRole !== "all") {
      filtered = filtered.filter((team) => team.userRole === filterRole);
    }

    debugLog("Filtered teams count:", filtered.length);
    setFilteredTeams(filtered);
    debugState("filteredTeams", filtered);
  };

  // ✅ New: Clear all filters
  const clearFilters = () => {
    setFilterOwnership("all");
    setFilterSport("all");
    setFilterRole("all");
  };

  // ✅ New: Check if any filters are active
  const hasActiveFilters = () => {
    return (
      filterOwnership !== "all" || filterSport !== "all" || filterRole !== "all"
    );
  };

  // Fetch user's teams on component mount
  useEffect(() => {
    debugLog("Component mounted, fetching teams...");
    fetchUserTeams();
  }, []);

  // ✅ New: Apply filters whenever teams or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [teams, filterOwnership, filterSport, filterRole]);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      debugLog("Screen focused, refreshing data...");
      fetchUserTeams();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchUserTeams = async () => {
    try {
      debugLog("Fetching user teams...");
      debugLog("Current user ID:", user.id);
      setLoading(true);

      // Fetch teams where user is a member
      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select(
          `
          *,
          team:teams(
            *,
            members:team_members(
              *,
              user:users(id, name, email, phone)
            )
          )
        `
        )
        .eq("user_id", user.id);
      // ✅ Removed: .eq("status", "active") - status column doesn't exist

      if (membersError) {
        debugLog("Error fetching team members:", membersError);
        debugAPI("fetch_team_members", null, membersError);
        throw membersError;
      }

      debugLog("Team members fetched:", teamMembers);
      debugAPI("fetch_team_members", teamMembers);

      // Transform data for easier use
      const transformedTeams =
        teamMembers?.map((member) => ({
          ...member.team,
          userRole: member.role_in_team,
          userMemberId: member.id,
          members: member.team.members || [],
        })) || [];

      setTeams(transformedTeams);
      debugState("teams", transformedTeams);
      debugLog("Teams transformed and set:", transformedTeams);

      // Fetch pending join requests for teams where user is captain/vice-captain
      await fetchPendingRequests(transformedTeams);
      await fetchSentInvitations(transformedTeams); // ✅ New: Fetch sent invitations

      // ✅ New: Fetch pending requests where current user is the one being invited
      await fetchMyPendingRequests();

      // ✅ New: Fetch challenges
      await fetchChallenges(transformedTeams);
    } catch (error) {
      debugLog("Critical error fetching teams:", error);
      debugAPI("fetch_user_teams", null, error);
      Alert.alert("Error", "Failed to load teams. Please try again.");
    } finally {
      setLoading(false);
      debugLog("Loading state set to false");
    }
  };

  // ✅ New function to fetch pending requests where current user is the one being invited
  const fetchMyPendingRequests = async () => {
    try {
      debugLog("Fetching my pending requests...");
      debugLog("Looking for requests where user_id =", user.id);

      // First, let's see ALL requests for this user to debug
      const { data: allRequests, error: allRequestsError } = await supabase
        .from("team_join_requests")
        .select(
          `
          *,
          user:users!team_join_requests_sent_by_fkey(id, name, email, phone),
          team:teams(name)
        `
        )
        .eq("user_id", user.id);

      if (allRequestsError) {
        debugLog("Error fetching all requests:", allRequestsError);
        return;
      }

      debugLog("ALL requests for current user:", allRequests);

      // Now get only pending requests
      const { data: requests, error: requestsError } = await supabase
        .from("team_join_requests")
        .select(
          `
          *,
          user:users!team_join_requests_sent_by_fkey(id, name, email, phone),
          team:teams(name)
        `
        )
        .eq("user_id", user.id) // Requests sent TO the current user
        .eq("status", "pending"); // Only pending requests

      if (requestsError) {
        debugLog("Error fetching my pending requests:", requestsError);
        debugAPI("fetch_my_pending_requests", null, requestsError);
        return;
      }

      // Set to separate state for user's pending requests
      const myRequests = requests || [];
      debugLog("My pending requests fetched:", myRequests);
      debugAPI("fetch_my_pending_requests", myRequests);

      setMyPendingRequests(myRequests);
      debugState("myPendingRequests", myRequests);
    } catch (error) {
      debugLog("Error fetching my pending requests:", error);
      debugAPI("fetch_my_pending_requests", null, error);
    }
  };

  const fetchPendingRequests = async (userTeams) => {
    try {
      debugLog("Fetching pending requests...");
      debugLog("User teams for captain check:", userTeams);

      // ✅ Fixed: Fetch requests for teams where current user is captain/vice-captain
      const captainTeams = userTeams.filter(
        (team) =>
          team.userRole === "captain" || team.userRole === "vice_captain"
      );

      debugLog("Captain teams found:", captainTeams);

      if (captainTeams.length === 0) {
        debugLog("No captain teams found, setting empty pending requests");
        setPendingRequests([]);
        debugState("pendingRequests (empty)", []);
        return;
      }

      const teamIds = captainTeams.map((team) => team.id);
      debugLog("Team IDs for pending requests query:", teamIds);

      const { data: requests, error: requestsError } = await supabase
        .from("team_join_requests")
        .select(
          `
          *,
          user:users!team_join_requests_user_id_fkey(id, name, email, phone),
          team:teams(name)
        `
        )
        .in("team_id", teamIds) // Requests for teams where user is captain/vice-captain
        .eq("status", "pending")
        .neq("sent_by", user.id); // Exclude requests sent BY the current user (these are in sent invitations)

      if (requestsError) {
        debugLog("Error fetching pending requests:", requestsError);
        debugAPI("fetch_pending_requests", null, requestsError);
        return;
      }

      const captainRequests = requests || [];
      debugLog("Captain pending requests fetched:", captainRequests);
      debugAPI("fetch_pending_requests", captainRequests);

      setPendingRequests(captainRequests);
      debugState("pendingRequests (captain)", captainRequests);
    } catch (error) {
      debugLog("Error fetching pending requests:", error);
      debugAPI("fetch_pending_requests", null, error);
    }
  };

  // ✅ New function to fetch sent invitations
  const fetchSentInvitations = async (userTeams) => {
    try {
      debugLog("Fetching sent invitations...");
      debugLog("User teams for sent invitations check:", userTeams);

      const captainTeams = userTeams.filter(
        (team) =>
          team.userRole === "captain" || team.userRole === "vice_captain"
      );

      debugLog("Captain teams for sent invitations:", captainTeams);

      if (captainTeams.length === 0) {
        debugLog("No captain teams found, setting empty sent invitations");
        setSentInvitations([]);
        debugState("sentInvitations (empty)", []);
        return;
      }

      const teamIds = captainTeams.map((team) => team.id);
      debugLog("Team IDs for sent invitations query:", teamIds);

      // ✅ Fixed: Show invitations sent BY the current user
      const { data: invitations, error: invitationsError } = await supabase
        .from("team_join_requests")
        .select(
          `
          *,
          user:users!team_join_requests_user_id_fkey(id, name, email, phone),
          team:teams(name)
        `
        )
        .in("team_id", teamIds)
        .eq("status", "pending")
        .eq("sent_by", user.id); // Only requests sent BY the current user

      if (invitationsError) {
        debugLog("Error fetching sent invitations:", invitationsError);
        debugAPI("fetch_sent_invitations", null, invitationsError);
        return;
      }

      const sentInvitationsData = invitations || [];
      debugLog("Sent invitations fetched:", sentInvitationsData);
      debugAPI("fetch_sent_invitations", sentInvitationsData);

      setSentInvitations(sentInvitationsData);
      debugState("sentInvitations", sentInvitationsData);
    } catch (error) {
      debugLog("Error fetching sent invitations:", error);
      debugAPI("fetch_sent_invitations", null, error);
    }
  };

  // Fetch incoming/outgoing challenges (matches in proposed state)
  const fetchChallenges = async (userTeams) => {
    try {
      const captainTeams = userTeams.filter(
        (team) => team.userRole === "captain"
      );
      const captainTeamIds = captainTeams.map((t) => t.id);
      if (captainTeamIds.length === 0) {
        setIncomingChallenges([]);
        setOutgoingChallenges([]);
        return;
      }

      // Incoming: I'm captain of team_b
      const { data: incoming, error: incErr } = await supabase
        .from("matches")
        .select(
          `id, team_a_id, team_b_id, date, time, status, ground_id,
           team_a:teams!matches_team_a_id_fkey(id, name, sport),
           team_b:teams!matches_team_b_id_fkey(id, name, sport),
           ground:grounds(id, name, location)`
        )
        .eq("status", "proposed")
        .in("team_b_id", captainTeamIds)
        .order("created_at", { ascending: false });
      if (incErr) throw incErr;

      // Outgoing: I'm captain of team_a
      const { data: outgoing, error: outErr } = await supabase
        .from("matches")
        .select(
          `id, team_a_id, team_b_id, date, time, status, ground_id,
           team_a:teams!matches_team_a_id_fkey(id, name, sport),
           team_b:teams!matches_team_b_id_fkey(id, name, sport),
           ground:grounds(id, name, location)`
        )
        .eq("status", "proposed")
        .in("team_a_id", captainTeamIds)
        .order("created_at", { ascending: false });
      if (outErr) throw outErr;

      setIncomingChallenges(incoming || []);
      setOutgoingChallenges(outgoing || []);
    } catch (e) {
      debugLog("Error fetching challenges", e);
      setIncomingChallenges([]);
      setOutgoingChallenges([]);
    }
  };

  const handleAcceptChallenge = async (matchId) => {
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "upcoming" })
        .eq("id", matchId);
      if (error) throw error;
      Alert.alert("Accepted", "Challenge accepted.");
      await fetchUserTeams();
    } catch (e) {
      Alert.alert("Error", "Could not accept challenge.");
    }
  };

  const handleRejectChallenge = async (matchId) => {
    try {
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", matchId);
      if (error) throw error;
      Alert.alert("Rejected", "Challenge rejected.");
      await fetchUserTeams();
    } catch (e) {
      Alert.alert("Error", "Could not reject challenge.");
    }
  };

  const handleEditTeam = (team) => {
    debugLog("Editing team:", team);
    setSelectedTeam(team);
    setEditForm({
      name: team.name || "",
      description: team.description || "",
      requirements: team.requirements || "",
      max_members: team.max_members?.toString() || "",
    });
    setShowTeamModal(true);
  };

  const handleUpdateTeam = async () => {
    try {
      debugLog("Updating team:", selectedTeam.id);
      debugLog("Update form data:", editForm);

      const { error: updateError } = await supabase
        .from("teams")
        .update({
          name: editForm.name,
          description: editForm.description,
          requirements: editForm.requirements,
          max_members: parseInt(editForm.max_members),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedTeam.id);

      if (updateError) {
        debugLog("Error updating team:", updateError);
        throw updateError;
      }

      debugLog("Team updated successfully");
      Alert.alert("Success", "Team updated successfully!");
      setShowTeamModal(false);
      fetchUserTeams();
    } catch (error) {
      debugLog("Critical error updating team:", error);
      Alert.alert("Error", "Failed to update team. Please try again.");
    }
  };

  const handleDeleteTeam = async () => {
    try {
      debugLog("Deleting team:", selectedTeam.id);

      // Check if user is captain
      if (selectedTeam.userRole !== "captain") {
        Alert.alert("Error", "Only team captains can delete teams.");
        return;
      }

      // Delete team members first
      const { error: membersError } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", selectedTeam.id);

      if (membersError) {
        debugLog("Error deleting team members:", membersError);
        throw membersError;
      }

      // Delete the team
      const { error: teamError } = await supabase
        .from("teams")
        .delete()
        .eq("id", selectedTeam.id);

      if (teamError) {
        debugLog("Error deleting team:", teamError);
        throw teamError;
      }

      debugLog("Team deleted successfully");
      Alert.alert("Success", "Team deleted successfully!");
      setShowDeleteModal(false);
      fetchUserTeams();
    } catch (error) {
      debugLog("Critical error deleting team:", error);
      Alert.alert("Error", "Failed to delete team. Please try again.");
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      debugLog("Changing role for member:", memberId, "to:", newRole);

      const { error: updateError } = await supabase
        .from("team_members")
        .update({
          role_in_team: newRole,
          // ✅ Removed: updated_at column doesn't exist in team_members table
        })
        .eq("id", memberId);

      if (updateError) {
        debugLog("Error updating role:", updateError);
        throw updateError;
      }

      debugLog("Role updated successfully");
      Alert.alert("Success", "Role updated successfully!");
      fetchUserTeams();
    } catch (error) {
      debugLog("Critical error updating role:", error);
      Alert.alert("Error", "Failed to update role. Please try again.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      debugLog("Removing member:", memberId);

      const { error: removeError } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (removeError) {
        debugLog("Error removing member:", removeError);
        throw removeError;
      }

      debugLog("Member removed successfully");
      Alert.alert("Success", "Member removed from team!");
      fetchUserTeams();
    } catch (error) {
      debugLog("Critical error removing member:", error);
      Alert.alert("Error", "Failed to remove member. Please try again.");
    }
  };

  const handleJoinRequest = async (requestId, action) => {
    try {
      debugLog("=== HANDLE JOIN REQUEST START ===");
      debugLog("Request ID:", requestId);
      debugLog("Action:", action);
      debugLog("Current pending requests before action:", pendingRequests);

      // Find the request before removing it
      const requestToHandle = pendingRequests.find(
        (req) => req.id === requestId
      );
      debugLog("Request to handle:", requestToHandle);

      if (!requestToHandle) {
        debugLog("❌ ERROR: Request not found in pending requests!");
        Alert.alert(
          "Error",
          "Request not found. Please refresh and try again."
        );
        return;
      }

      // ✅ Improved UX: Immediately remove from pending list
      debugLog("Removing request from pending list immediately...");
      setPendingRequests((prev) => {
        const filtered = prev.filter((req) => req.id !== requestId);
        debugState("pendingRequests (after immediate removal)", filtered);
        debugLog("Pending requests after immediate removal:", filtered);
        return filtered;
      });

      if (action === "accept") {
        debugLog("Processing ACCEPT action...");
        // Add user to team
        const memberPayload = {
          team_id: requestToHandle.team_id,
          user_id: requestToHandle.user_id,
          role_in_team: "player",
          joined_at: new Date().toISOString(),
        };
        debugLog("Member payload for insertion:", memberPayload);

        // ✅ Fixed: Only include columns that exist in team_members table
        const { error: memberError } = await supabase
          .from("team_members")
          .insert(memberPayload);

        if (memberError) {
          debugLog("Error adding member:", memberError);
          debugAPI("add_team_member", null, memberError);
          throw memberError;
        }

        debugLog("✅ Member added to team successfully");
        debugAPI("add_team_member", "success");
      }

      // Update request status
      debugLog(
        "Updating request status to:",
        action === "accept" ? "accepted" : "rejected"
      );
      const { error: updateError } = await supabase
        .from("team_join_requests")
        .update({
          status: action === "accept" ? "accepted" : "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) {
        debugLog("Error updating request:", updateError);
        debugAPI("update_join_request", null, updateError);
        throw updateError;
      }

      debugLog("✅ Request status updated successfully");
      debugAPI("update_join_request", "success");

      // ✅ NEW: Delete the request after handling to prevent it from reappearing
      debugLog("Deleting request from database to prevent reappearance...");
      const { error: deleteError } = await supabase
        .from("team_join_requests")
        .delete()
        .eq("id", requestId);

      if (deleteError) {
        debugLog("Error deleting request:", deleteError);
        debugAPI("delete_join_request", null, deleteError);
        // Don't throw error here, as the main operation was successful
      } else {
        debugLog("✅ Request deleted successfully");
        debugAPI("delete_join_request", "success");
      }

      debugLog("Join request handled successfully");
      Alert.alert("Success", `Request ${action}ed successfully!`);

      // ✅ Fixed: Only refresh teams, not pending requests to avoid re-adding
      debugLog("Refreshing teams after successful action...");
      await refreshTeamsOnly();
    } catch (error) {
      debugLog("❌ CRITICAL ERROR in handleJoinRequest:", error);
      debugAPI("handle_join_request", null, error);
      Alert.alert("Error", "Failed to handle request. Please try again.");
      // ✅ Restore the request to the list if there was an error
      debugLog("Restoring request to list due to error...");
      await refreshTeamsOnly();
    } finally {
      debugLog("=== HANDLE JOIN REQUEST END ===");
    }
  };

  // ✅ New function to handle accepting/rejecting requests sent TO the current user
  const handleMyJoinRequest = async (requestId, action) => {
    try {
      debugLog("=== HANDLE MY JOIN REQUEST START ===");
      debugLog("Request ID:", requestId);
      debugLog("Action:", action);
      debugLog("Current my pending requests before action:", myPendingRequests);

      // Find the request before removing it
      const requestToHandle = myPendingRequests.find(
        (req) => req.id === requestId
      );
      debugLog("Request to handle:", requestToHandle);

      if (!requestToHandle) {
        debugLog("❌ ERROR: Request not found in my pending requests!");
        Alert.alert(
          "Error",
          "Request not found. Please refresh and try again."
        );
        return;
      }

      // ✅ Improved UX: Immediately remove from my pending list
      debugLog("Removing request from my pending list immediately...");
      setMyPendingRequests((prev) => {
        const filtered = prev.filter((req) => req.id !== requestId);
        debugState("myPendingRequests (after immediate removal)", filtered);
        debugLog("My pending requests after immediate removal:", filtered);
        return filtered;
      });

      if (action === "accept") {
        debugLog("Processing ACCEPT action for my request...");
        // Add user to team
        const memberPayload = {
          team_id: requestToHandle.team_id,
          user_id: user.id, // Current user is accepting the invitation
          role_in_team: "player",
          joined_at: new Date().toISOString(),
        };
        debugLog("Member payload for insertion:", memberPayload);

        // ✅ Fixed: Only include columns that exist in team_members table
        const { error: memberError } = await supabase
          .from("team_members")
          .insert(memberPayload);

        if (memberError) {
          debugLog("Error adding member:", memberError);
          debugAPI("add_team_member", null, memberError);
          throw memberError;
        }

        debugLog("✅ Member added to team successfully");
        debugAPI("add_team_member", "success");
      }

      // Update request status
      debugLog(
        "Updating request status to:",
        action === "accept" ? "accepted" : "rejected"
      );
      const { error: updateError } = await supabase
        .from("team_join_requests")
        .update({
          status: action === "accept" ? "accepted" : "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) {
        debugLog("Error updating request:", updateError);
        debugAPI("update_join_request", null, updateError);
        throw updateError;
      }

      debugLog("✅ Request status updated successfully");
      debugAPI("update_join_request", "success");

      // ✅ NEW: Delete the request after handling to prevent it from reappearing
      debugLog("Deleting request from database to prevent reappearance...");
      const { error: deleteError } = await supabase
        .from("team_join_requests")
        .delete()
        .eq("id", requestId);

      if (deleteError) {
        debugLog("Error deleting request:", deleteError);
        debugAPI("delete_join_request", null, deleteError);
        // Don't throw error here, as the main operation was successful
      } else {
        debugLog("✅ Request deleted successfully");
        debugAPI("delete_join_request", "success");
      }

      debugLog("My join request handled successfully");
      Alert.alert("Success", `Request ${action}ed successfully!`);

      // ✅ Fixed: Only refresh teams, not pending requests to avoid re-adding
      debugLog("Refreshing teams after successful action...");
      await refreshTeamsOnly();
    } catch (error) {
      debugLog("❌ CRITICAL ERROR in handleMyJoinRequest:", error);
      debugAPI("handle_my_join_request", null, error);
      Alert.alert("Error", "Failed to handle request. Please try again.");
      // ✅ Restore the request to the list if there was an error
      debugLog("Restoring request to list due to error...");
      await refreshTeamsOnly();
    } finally {
      debugLog("=== HANDLE MY JOIN REQUEST END ===");
    }
  };

  // ✅ New function to cancel sent invitations
  const handleCancelInvitation = async (invitationId) => {
    try {
      debugLog("=== HANDLE CANCEL INVITATION START ===");
      debugLog("Invitation ID:", invitationId);
      debugLog("Current sent invitations before cancel:", sentInvitations);

      // Find the invitation before removing it
      const invitationToCancel = sentInvitations.find(
        (inv) => inv.id === invitationId
      );
      debugLog("Invitation to cancel:", invitationToCancel);

      if (!invitationToCancel) {
        debugLog("❌ ERROR: Invitation not found in sent invitations!");
        Alert.alert(
          "Error",
          "Invitation not found. Please refresh and try again."
        );
        return;
      }

      // ✅ Improved UX: Immediately remove from sent invitations list
      debugLog("Removing invitation from sent invitations list immediately...");
      setSentInvitations((prev) => {
        const filtered = prev.filter((inv) => inv.id !== invitationId);
        debugState("sentInvitations (after immediate removal)", filtered);
        debugLog("Sent invitations after immediate removal:", filtered);
        return filtered;
      });

      debugLog("Updating invitation status to 'cancelled'...");
      const { error: updateError } = await supabase
        .from("team_join_requests")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitationId);

      if (updateError) {
        debugLog("Error canceling invitation:", updateError);
        debugAPI("cancel_invitation", null, updateError);
        throw updateError;
      }

      debugLog("✅ Invitation cancelled successfully");
      debugAPI("cancel_invitation", "success");

      // ✅ NEW: Delete the invitation after cancelling to prevent it from reappearing
      debugLog(
        "Deleting cancelled invitation from database to prevent reappearance..."
      );
      const { error: deleteError } = await supabase
        .from("team_join_requests")
        .delete()
        .eq("id", invitationId);

      if (deleteError) {
        debugLog("Error deleting cancelled invitation:", deleteError);
        debugAPI("delete_cancelled_invitation", null, deleteError);
        // Don't throw error here, as the main operation was successful
      } else {
        debugLog("✅ Cancelled invitation deleted successfully");
        debugAPI("delete_cancelled_invitation", "success");
      }

      debugLog("Invitation canceled successfully");
      Alert.alert("Success", "Invitation canceled successfully!");

      // ✅ Fixed: Refresh data to update the UI
      debugLog("Refreshing data after successful cancellation...");
      await fetchUserTeams();
    } catch (error) {
      debugLog("❌ CRITICAL ERROR in handleCancelInvitation:", error);
      debugAPI("handle_cancel_invitation", null, error);
      Alert.alert("Error", "Failed to cancel invitation. Please try again.");
      // ✅ Restore the invitation to the list if there was an error
      debugLog("Restoring invitation to list due to error...");
      await fetchUserTeams();
    } finally {
      debugLog("=== HANDLE CANCEL INVITATION END ===");
    }
  };

  const handleInvitePlayer = async () => {
    try {
      debugLog("=== HANDLE INVITE PLAYER START ===");
      debugLog("Inviting player:", inviteForm.email);
      debugLog("Selected team:", selectedTeam);

      // Check if user exists in public.users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email, phone, role")
        .eq("email", inviteForm.email)
        .single();

      if (userError) {
        debugLog("Error finding user:", userError);
        debugAPI("find_user", null, userError);

        if (userError.code === "PGRST116") {
          // No rows returned - user not found
          debugLog("User not found with email:", inviteForm.email);
          Alert.alert(
            "User Not Found",
            "No user found with this email. They need to:\n\n1. Sign up for TrufMate\n2. Complete their profile\n3. Set their role as 'Player'"
          );
        } else {
          Alert.alert("Error", "Failed to find user. Please try again.");
        }
        return;
      }

      if (!userData) {
        debugLog("User data is null");
        Alert.alert("Error", "User not found with this email.");
        return;
      }

      debugLog("User found:", userData);
      debugAPI("find_user", userData);

      // Check if user is a player
      if (userData.role !== "player") {
        debugLog("User is not a player, role:", userData.role);
        Alert.alert(
          "Wrong User Type",
          `This user is a ${
            userData.role === "ground_owner" ? "Ground Owner" : "Player"
          }, but only players can be invited to teams.`
        );
        return;
      }

      // Check if already a member
      const { data: existingMember, error: memberError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", selectedTeam.id)
        .eq("user_id", userData.id)
        .single();

      if (memberError && memberError.code !== "PGRST116") {
        debugLog("Error checking existing member:", memberError);
        debugAPI("check_existing_member", null, memberError);
        return;
      }

      if (existingMember) {
        debugLog("User is already a member of the team");
        Alert.alert("Error", "User is already a member of this team.");
        return;
      }

      // Check if there's already a pending request
      const { data: existingRequest, error: requestCheckError } = await supabase
        .from("team_join_requests")
        .select("id")
        .eq("team_id", selectedTeam.id)
        .eq("user_id", userData.id)
        .eq("status", "pending")
        .single();

      if (requestCheckError && requestCheckError.code !== "PGRST116") {
        debugLog("Error checking existing request:", requestCheckError);
        debugAPI("check_existing_request", null, requestCheckError);
        return;
      }

      if (existingRequest) {
        debugLog("User already has a pending request");
        Alert.alert(
          "Error",
          "User already has a pending request to join this team."
        );
        return;
      }

      // Create join request
      const requestPayload = {
        team_id: selectedTeam.id,
        user_id: userData.id,
        sent_by: user.id, // ✅ Add sent_by field
        message: inviteForm.message || "You've been invited to join our team!",
        status: "pending",
        created_at: new Date().toISOString(),
      };

      debugLog("Creating join request with payload:", requestPayload);

      const { error: requestError } = await supabase
        .from("team_join_requests")
        .insert(requestPayload);

      if (requestError) {
        debugLog("Error creating join request:", requestError);
        debugAPI("create_join_request", null, requestError);
        throw requestError;
      }

      debugLog("✅ Invitation sent successfully");
      debugAPI("create_join_request", "success");
      Alert.alert("Success", "Invitation sent successfully!");
      setShowInviteModal(false);
      setInviteForm({ email: "", message: "" });
      fetchUserTeams();
    } catch (error) {
      debugLog("❌ CRITICAL ERROR in handleInvitePlayer:", error);
      debugAPI("handle_invite_player", null, error);
      Alert.alert("Error", "Failed to send invitation. Please try again.");
    } finally {
      debugLog("=== HANDLE INVITE PLAYER END ===");
    }
  };

  const handleLeaveTeam = async (teamId, memberId) => {
    try {
      debugLog("=== HANDLE LEAVE TEAM START ===");
      debugLog("Team ID:", teamId);
      debugLog("Member ID:", memberId);

      // ✅ NEW: Show confirmation dialog before leaving team
      Alert.alert(
        "Leave Team",
        "Are you sure you want to leave this team?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              debugLog("User cancelled leaving team");
            },
          },
          {
            text: "Leave Team",
            style: "destructive",
            onPress: async () => {
              try {
                debugLog("User confirmed leaving team, proceeding...");

                const { error: leaveError } = await supabase
                  .from("team_members")
                  .delete()
                  .eq("id", memberId);

                if (leaveError) {
                  debugLog("Error leaving team:", leaveError);
                  debugAPI("leave_team", null, leaveError);
                  throw leaveError;
                }

                debugLog("✅ Left team successfully");
                debugAPI("leave_team", "success");
                Alert.alert("Success", "You have left the team.");
                fetchUserTeams();
              } catch (error) {
                debugLog("❌ CRITICAL ERROR in leave team:", error);
                debugAPI("leave_team", null, error);
                Alert.alert("Error", "Failed to leave team. Please try again.");
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      debugLog("❌ CRITICAL ERROR in handleLeaveTeam:", error);
      debugAPI("handle_leave_team", null, error);
      Alert.alert("Error", "Failed to leave team. Please try again.");
    } finally {
      debugLog("=== HANDLE LEAVE TEAM END ===");
    }
  };

  const renderTeamCard = (team) => (
    <Card key={team.id} style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamSport}>{team.sport}</Text>
          <Text style={styles.teamLocation}>{team.location}</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{team.userRole.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.teamStats}>
        <Text style={styles.statText}>
          {team.members.length} / {team.max_members || "∞"} members
        </Text>
        <Text style={styles.statText}>
          Skill: {team.skill_level || "Not set"}
        </Text>
      </View>

      {team.description && (
        <Text style={styles.teamDescription}>{team.description}</Text>
      )}

      <View style={styles.teamActions}>
        {team.userRole === "captain" && (
          <>
            <Button
              title="Edit Team"
              onPress={() => handleEditTeam(team)}
              style={styles.actionButton}
              variant="outline"
            />
            <Button
              title="Invite Player"
              onPress={() => {
                setSelectedTeam(team);
                setShowInviteModal(true);
              }}
              style={styles.actionButton}
              variant="outline"
            />
            <Button
              title="Delete Team"
              onPress={() => {
                setSelectedTeam(team);
                setShowDeleteModal(true);
              }}
              style={[styles.actionButton, styles.deleteButton]}
              variant="outline"
            />
          </>
        )}

        {(team.userRole === "captain" || team.userRole === "vice_captain") && (
          <Button
            title="Manage Members"
            onPress={() => {
              setSelectedTeam(team);
              setShowMemberModal(true);
            }}
            style={styles.actionButton}
            variant="outline"
          />
        )}

        {team.userRole !== "captain" && (
          <Button
            title="Leave Team"
            onPress={() => handleLeaveTeam(team.id, team.userMemberId)}
            style={[styles.actionButton, styles.leaveButton]}
            variant="outline"
          />
        )}
      </View>
    </Card>
  );

  const renderMemberItem = (member) => (
    <View key={member.id} style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {member.user?.name || "Unknown User"}
        </Text>
        <Text style={styles.memberEmail}>{member.user?.email}</Text>
        <Text style={styles.memberRole}>{member.role_in_team}</Text>
      </View>

      {(selectedTeam?.userRole === "captain" ||
        selectedTeam?.userRole === "vice_captain") && (
        <View style={styles.memberActions}>
          {member.role_in_team !== "captain" && (
            <>
              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => handleRoleChange(member.id, "vice_captain")}
              >
                <Text style={styles.roleButtonText}>Vice Captain</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => handleRoleChange(member.id, "player")}
              >
                <Text style={styles.roleButtonText}>Player</Text>
              </TouchableOpacity>
            </>
          )}

          {member.role_in_team !== "captain" && (
            <TouchableOpacity
              style={[styles.roleButton, styles.removeButton]}
              onPress={() => handleRemoveMember(member.id)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderPendingRequest = (request) => (
    <View key={request.id} style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>
          {request.user?.name || "Unknown User"}
        </Text>
        <Text style={styles.requestEmail}>{request.user?.email}</Text>
        <Text style={styles.requestMessage}>{request.message}</Text>
        <Text style={styles.requestTeam}>Team: {request.team?.name}</Text>
      </View>

      <View style={styles.requestActions}>
        <Button
          title="Accept"
          onPress={() => handleJoinRequest(request.id, "accept")}
          style={[styles.requestButton, styles.acceptButton]}
        />
        <Button
          title="Reject"
          onPress={() => handleJoinRequest(request.id, "reject")}
          style={[styles.requestButton, styles.rejectButton]}
          variant="outline"
        />
      </View>
    </View>
  );

  // ✅ New function to render sent invitations
  const renderSentInvitation = (invitation) => (
    <View key={invitation.id} style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>
          {invitation.user?.name || "Unknown User"}
        </Text>
        <Text style={styles.requestEmail}>{invitation.user?.email}</Text>
        <Text style={styles.requestMessage}>{invitation.message}</Text>
        <Text style={styles.requestTeam}>Team: {invitation.team?.name}</Text>
        <Text style={styles.requestStatus}>Status: Pending Response</Text>
      </View>

      <View style={styles.requestActions}>
        <Button
          title="Cancel Invitation"
          onPress={() => handleCancelInvitation(invitation.id)}
          style={[styles.requestButton, styles.cancelButton]}
          variant="outline"
        />
      </View>
    </View>
  );

  const renderMyPendingRequest = (request) => (
    <View key={request.id} style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>
          {request.user?.name || "Unknown User"}
        </Text>
        <Text style={styles.requestEmail}>{request.user?.email}</Text>
        <Text style={styles.requestMessage}>{request.message}</Text>
        <Text style={styles.requestTeam}>Team: {request.team?.name}</Text>
      </View>

      <View style={styles.requestActions}>
        <Button
          title="Accept"
          onPress={() => handleMyJoinRequest(request.id, "accept")}
          style={[styles.requestButton, styles.acceptButton]}
        />
        <Button
          title="Reject"
          onPress={() => handleMyJoinRequest(request.id, "reject")}
          style={[styles.requestButton, styles.rejectButton]}
          variant="outline"
        />
      </View>
    </View>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserTeams();
    setRefreshing(false);
  };

  // ✅ New function to refresh only teams without re-fetching pending requests
  const refreshTeamsOnly = async () => {
    try {
      debugLog("Refreshing teams only...");
      setLoading(true);

      // Fetch teams where user is a member
      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select(
          `
          *,
          team:teams(
            *,
            members:team_members(
              *,
              user:users(id, name, email, phone)
            )
          )
        `
        )
        .eq("user_id", user.id);

      if (membersError) {
        debugLog("Error fetching team members:", membersError);
        debugAPI("fetch_team_members", null, membersError);
        throw membersError;
      }

      debugLog("Team members fetched:", teamMembers);
      debugAPI("fetch_team_members", teamMembers);

      // Transform data for easier use
      const transformedTeams =
        teamMembers?.map((member) => ({
          ...member.team,
          userRole: member.role_in_team,
          userMemberId: member.id,
          members: member.team.members || [],
        })) || [];

      setTeams(transformedTeams);
      debugState("teams", transformedTeams);
      debugLog("Teams refreshed successfully");
    } catch (error) {
      debugLog("Error refreshing teams:", error);
      debugAPI("refresh_teams_only", null, error);
    } finally {
      setLoading(false);
      debugLog("Loading state set to false");
    }
  };

  // ✅ New: Render filter chip component
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

  // ✅ New: Render filter header
  const renderFilterHeader = () => (
    <View style={styles.filterHeader}>
      <View style={styles.filterHeaderTop}>
        <Text style={styles.filterHeaderTitle}>Filter Teams</Text>
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={showFilters ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {hasActiveFilters() && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>Active filters:</Text>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ✅ New: Render filter content
  const renderFilterContent = () => (
    <View style={styles.filtersContainer}>
      {renderFilterChip(
        ownershipOptions,
        filterOwnership,
        setFilterOwnership,
        "Ownership"
      )}
      {renderFilterChip(
        sportOptions,
        filterSport,
        setFilterSport,
        "Sport Type"
      )}
      {renderFilterChip(roleOptions, filterRole, setFilterRole, "Your Role")}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading your teams...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Teams</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Pending Requests Section (for captains) */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pending Join Requests (Captain)
            </Text>
            {pendingRequests.map(renderPendingRequest)}
          </View>
        )}

        {/* Incoming Challenges */}
        {incomingChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incoming Challenges</Text>
            {incomingChallenges.map((m) => (
              <View key={m.id} style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>
                    {m.team_a?.name || "Unknown"} →{" "}
                    {m.team_b?.name || "Unknown"}
                  </Text>
                  <Text style={styles.requestMessage}>
                    {m.team_a?.sport || "Unknown Sport"} • {m.status}
                  </Text>
                  {m.date && (
                    <Text style={styles.requestMessage}>
                      📅 {new Date(m.date).toLocaleDateString()}
                      {m.time && ` • 🕐 ${m.time}`}
                    </Text>
                  )}
                  {m.ground && (
                    <Text style={styles.requestMessage}>
                      🏟️ {m.ground.name}
                      {m.ground.location &&
                        m.ground.location.city &&
                        ` • 📍 ${m.ground.location.city}`}
                      {m.ground.location &&
                        m.ground.location.area &&
                        `, ${m.ground.location.area}`}
                    </Text>
                  )}
                </View>
                <View style={styles.requestActions}>
                  <Button
                    title="Accept"
                    onPress={() => handleAcceptChallenge(m.id)}
                    style={[styles.requestButton, styles.acceptButton]}
                  />
                  <Button
                    title="Reject"
                    onPress={() => handleRejectChallenge(m.id)}
                    style={[styles.requestButton, styles.rejectButton]}
                    variant="outline"
                  />
                  <Button
                    title="View Details"
                    onPress={() =>
                      navigation.navigate("MatchDetails", { matchId: m.id })
                    }
                    style={[styles.requestButton, styles.viewDetailsButton]}
                    variant="outline"
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Outgoing Challenges */}
        {outgoingChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sent Challenges</Text>
            {outgoingChallenges.map((m) => (
              <View key={m.id} style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>
                    {m.team_a?.name || "Unknown"} →{" "}
                    {m.team_b?.name || "Unknown"}
                  </Text>
                  <Text style={styles.requestMessage}>
                    {m.team_a?.sport || "Unknown Sport"} • {m.status}
                  </Text>
                  {m.date && (
                    <Text style={styles.requestMessage}>
                      📅 {new Date(m.date).toLocaleDateString()}
                      {m.time && ` • 🕐 ${m.time}`}
                    </Text>
                  )}
                  {m.ground && (
                    <Text style={styles.requestMessage}>
                      🏟️ {m.ground.name}
                      {m.ground.location &&
                        m.ground.location.city &&
                        ` • 📍 ${m.ground.location.city}`}
                      {m.ground.location &&
                        m.ground.location.area &&
                        `, ${m.ground.location.area}`}
                    </Text>
                  )}
                </View>
                <View style={styles.requestActions}>
                  <Button
                    title="Cancel"
                    onPress={() => handleRejectChallenge(m.id)}
                    style={[styles.requestButton, styles.cancelButton]}
                    variant="outline"
                  />
                  <Button
                    title="View Details"
                    onPress={() =>
                      navigation.navigate("MatchDetails", { matchId: m.id })
                    }
                    style={[styles.requestButton, styles.viewDetailsButton]}
                    variant="outline"
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* My Pending Requests Section (for users being invited) */}
        {myPendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Pending Join Requests</Text>
            {myPendingRequests.map(renderMyPendingRequest)}
          </View>
        )}

        {/* Sent Invitations Section */}
        {sentInvitations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sent Invitations</Text>
            {sentInvitations.map(renderSentInvitation)}
          </View>
        )}

        {/* Teams Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Teams</Text>

          {/* ✅ New: Filter UI */}
          {renderFilterHeader()}
          {showFilters && renderFilterContent()}

          {filteredTeams.length > 0 ? (
            filteredTeams.map(renderTeamCard)
          ) : teams.length > 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="filter-outline"
                size={64}
                color={colors.text.secondary}
              />
              <Text style={styles.emptyStateText}>
                No teams match your filters
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your filter criteria or clear all filters
              </Text>
              <Button
                title="Clear Filters"
                onPress={clearFilters}
                style={styles.emptyStateButton}
                variant="outline"
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={64}
                color={colors.text.secondary}
              />
              <Text style={styles.emptyStateText}>No teams yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create a team or join existing ones to get started!
              </Text>
              <Button
                title="Create Team"
                onPress={() => navigation.navigate("CreateTeam")}
                style={styles.emptyStateButton}
              />
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Edit Team Modal */}
      <Modal visible={showTeamModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Team</Text>
              <TouchableOpacity
                onPress={() => setShowTeamModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Team Name</Text>
                <Input
                  placeholder="Enter team name"
                  value={editForm.name}
                  onChangeText={(value) =>
                    setEditForm((prev) => ({ ...prev, name: value }))
                  }
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe your team..."
                  value={editForm.description}
                  onChangeText={(value) =>
                    setEditForm((prev) => ({ ...prev, description: value }))
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Requirements</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Any requirements for joining..."
                  value={editForm.requirements}
                  onChangeText={(value) =>
                    setEditForm((prev) => ({ ...prev, requirements: value }))
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Max Members</Text>
                <Input
                  placeholder="Maximum team size"
                  value={editForm.max_members}
                  onChangeText={(value) =>
                    setEditForm((prev) => ({ ...prev, max_members: value }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowTeamModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Update Team"
                onPress={handleUpdateTeam}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Manage Members Modal */}
      <Modal visible={showMemberModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Team Members</Text>
              <TouchableOpacity
                onPress={() => setShowMemberModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                {selectedTeam?.name} - {selectedTeam?.members.length} members
              </Text>
              {selectedTeam?.members.map(renderMemberItem)}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Close"
                onPress={() => setShowMemberModal(false)}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Invite Player Modal */}
      <Modal visible={showInviteModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Player</Text>
              <TouchableOpacity
                onPress={() => setShowInviteModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Player Email</Text>
                <Input
                  placeholder="Enter player's email"
                  value={inviteForm.email}
                  onChangeText={(value) =>
                    setInviteForm((prev) => ({ ...prev, email: value }))
                  }
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Message (Optional)</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Personal message for the player..."
                  value={inviteForm.message}
                  onChangeText={(value) =>
                    setInviteForm((prev) => ({ ...prev, message: value }))
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowInviteModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Send Invitation"
                onPress={handleInvitePlayer}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Team Confirmation Modal */}
      <Modal visible={showDeleteModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Team</Text>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.deleteWarning}>
                Are you sure you want to delete "{selectedTeam?.name}"?
              </Text>
              <Text style={styles.deleteWarning}>
                This action cannot be undone. All team members will be removed.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowDeleteModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Delete Team"
                onPress={handleDeleteTeam}
                style={[styles.modalButton, styles.deleteButton]}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  teamCard: {
    marginBottom: spacing.md,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  teamSport: {
    ...typography.body,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  teamLocation: {
    ...typography.body,
    color: colors.text.secondary,
  },
  roleBadge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  roleText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "bold",
  },
  teamStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  statText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  teamDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    fontStyle: "italic",
  },
  teamActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
  },
  deleteButton: {
    backgroundColor: colors.error.main,
    borderColor: colors.error.main,
  },
  leaveButton: {
    backgroundColor: colors.warning.main,
    borderColor: colors.warning.main,
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
  emptyStateSubtext: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  emptyStateButton: {
    backgroundColor: colors.primary.main,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },

  // Request styles
  requestItem: {
    backgroundColor: colors.dark.surfaceColor,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  requestInfo: {
    marginBottom: spacing.md,
  },
  requestName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  requestEmail: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  requestMessage: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  requestTeam: {
    ...typography.caption,
    color: colors.primary.main,
  },
  requestActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  requestButton: {
    flex: 1,
  },
  acceptButton: {
    backgroundColor: colors.success.main,
  },
  rejectButton: {
    borderColor: colors.error.main,
  },
  cancelButton: {
    borderColor: colors.error.main,
  },
  requestStatus: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  viewDetailsButton: {
    borderColor: colors.primary.main,
  },

  // Member styles
  memberItem: {
    backgroundColor: colors.dark.surfaceColor,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  memberInfo: {
    marginBottom: spacing.sm,
  },
  memberName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  memberEmail: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  memberRole: {
    ...typography.caption,
    color: colors.primary.main,
    fontWeight: "bold",
  },
  memberActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  roleButton: {
    backgroundColor: colors.dark.backgroundColor,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  roleButtonText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  removeButton: {
    borderColor: colors.error.main,
  },
  removeButtonText: {
    color: colors.error.main,
  },

  // Modal styles
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
  modalBody: {
    padding: spacing.lg,
  },
  modalSubtitle: {
    ...typography.h3,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  modalButton: {
    flex: 1,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.dark.backgroundColor,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.body.fontSize,
    minHeight: 80,
  },
  deleteWarning: {
    ...typography.body,
    color: colors.error.main,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  // ✅ New: Filter styles
  filterHeader: {
    backgroundColor: colors.dark.surfaceColor,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  filterHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterHeaderTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  filterToggleButton: {
    padding: spacing.sm,
  },
  activeFiltersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  activeFiltersText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  clearFiltersButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  clearFiltersText: {
    ...typography.caption,
    color: colors.primary.main,
    fontWeight: "bold",
  },
  filtersContainer: {
    backgroundColor: colors.dark.surfaceColor,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterTitle: {
    ...typography.h3,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  filterChips: {
    flexDirection: "row",
  },
  filterChip: {
    backgroundColor: colors.dark.backgroundColor,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
});

export default EditMyTeams;
