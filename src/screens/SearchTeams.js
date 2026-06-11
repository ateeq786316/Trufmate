import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
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

const SearchTeams = ({ navigation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const debounceRef = useRef(null);

  // Challenge flow state
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [challengeTargetTeam, setChallengeTargetTeam] = useState(null);
  const [myManagerTeams, setMyManagerTeams] = useState([]); // teams where user is captain/vice_captain
  const [selectedMyTeamId, setSelectedMyTeamId] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeDate, setChallengeDate] = useState(""); // YYYY-MM-DD
  const [challengeTime, setChallengeTime] = useState(""); // HH:mm
  const [challengeCity, setChallengeCity] = useState("");
  const [groundQuery, setGroundQuery] = useState("");
  const [groundOptions, setGroundOptions] = useState([]);
  const [selectedGround, setSelectedGround] = useState(null);
  const [cities, setCities] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const groundDebounceRef = useRef(null);

  const sports = [
    { id: "all", name: "All Sports", icon: "football" },
    { id: "football", name: "Football", icon: "football" },
    { id: "cricket", name: "Cricket", icon: "baseball" },
    { id: "basketball", name: "Basketball", icon: "basketball" },
    { id: "tennis", name: "Tennis", icon: "tennisball" },
  ];

  const skillLevels = [
    { id: "all", name: "All Levels" },
    { id: "beginner", name: "Beginner" },
    { id: "intermediate", name: "Intermediate" },
    { id: "advanced", name: "Advanced" },
  ];

  const locations = [
    { id: "all", name: "All Locations" },
    { id: "lahore", name: "Lahore" },
    { id: "karachi", name: "Karachi" },
    { id: "islamabad", name: "Islamabad" },
    { id: "rawalpindi", name: "Rawalpindi" },
    { id: "faisalabad", name: "Faisalabad" },
    { id: "multan", name: "Multan" },
    { id: "gujranwala", name: "Gujranwala" },
    { id: "sialkot", name: "Sialkot" },
    { id: "bahawalpur", name: "Bahawalpur" },
    { id: "sargodha", name: "Sargodha" },
    { id: "sheikhupura", name: "Sheikhupura" },
    { id: "jhelum", name: "Jhelum" },
    { id: "gujrat", name: "Gujrat" },
    { id: "sahiwal", name: "Sahiwal" },
    { id: "okara", name: "Okara" },
    { id: "kasur", name: "Kasur" },
    { id: "pakpattan", name: "Pakpattan" },
    { id: "vehari", name: "Vehari" },
    { id: "khanewal", name: "Khanewal" },
    { id: "lodhran", name: "Lodhran" },
    { id: "bahawalnagar", name: "Bahawalnagar" },
    { id: "chakwal", name: "Chakwal" },
    { id: "attock", name: "Attock" },
    { id: "mianwali", name: "Mianwali" },
    { id: "khushab", name: "Khushab" },
    { id: "bhalwal", name: "Bhalwal" },
    { id: "nankana-sahib", name: "Nankana Sahib" },
    { id: "chichawatni", name: "Chichawatni" },
    { id: "arifwala", name: "Arifwala" },
    { id: "gojra", name: "Gojra" },
    { id: "toba-tek-singh", name: "Toba Tek Singh" },
    { id: "jaranwala", name: "Jaranwala" },
    { id: "daska", name: "Daska" },
    { id: "wazirabad", name: "Wazirabad" },
    { id: "kamoke", name: "Kamoke" },
    { id: "hafizabad", name: "Hafizabad" },
    { id: "mandi-bahauddin", name: "Mandi Bahauddin" },
    { id: "jatoi", name: "Jatoi" },
    { id: "alipur", name: "Alipur" },
    { id: "kot-addu", name: "Kot Addu" },
    { id: "taunsa", name: "Taunsa" },
    { id: "dera-ghazi-khan", name: "Dera Ghazi Khan" },
    { id: "layyah", name: "Layyah" },
    { id: "kot-sultan", name: "Kot Sultan" },
    { id: "rajanpur", name: "Rajanpur" },
    { id: "dera-murad-jamali", name: "Dera Murad Jamali" },
    { id: "sibi", name: "Sibi" },
    { id: "quetta", name: "Quetta" },
    { id: "peshawar", name: "Peshawar" },
    { id: "mardan", name: "Mardan" },
    { id: "abbottabad", name: "Abbottabad" },
    { id: "mansehra", name: "Mansehra" },
    { id: "swat", name: "Swat" },
    { id: "bannu", name: "Bannu" },
    { id: "kohat", name: "Kohat" },
    { id: "d-i-khan", name: "D.I. Khan" },
    { id: "tank", name: "Tank" },
    { id: "lakki-marwat", name: "Lakki Marwat" },
    { id: "charsadda", name: "Charsadda" },
    { id: "nowshera", name: "Nowshera" },
    { id: "swabi", name: "Swabi" },
    { id: "haripur", name: "Haripur" },
    { id: "batagram", name: "Batagram" },
    { id: "tor-ghar", name: "Tor Ghar" },
    { id: "buner", name: "Buner" },
    { id: "shangla", name: "Shangla" },
    { id: "upper-dir", name: "Upper Dir" },
    { id: "lower-dir", name: "Lower Dir" },
    { id: "malakand", name: "Malakand" },
    { id: "hangu", name: "Hangu" },
    { id: "karak", name: "Karak" },
    { id: "kohistan", name: "Kohistan" },
    { id: "chitral", name: "Chitral" },
    { id: "khyber", name: "Khyber" },
    { id: "kurram", name: "Kurram" },
    { id: "north-waziristan", name: "North Waziristan" },
    { id: "south-waziristan", name: "South Waziristan" },
    { id: "orakzai", name: "Orakzai" },
    { id: "bajaur", name: "Bajaur" },
    { id: "mohmand", name: "Mohmand" },
    { id: "hyderabad", name: "Hyderabad" },
    { id: "sukkur", name: "Sukkur" },
    { id: "larkana", name: "Larkana" },
    { id: "nawabshah", name: "Nawabshah" },
    { id: "mirpurkhas", name: "Mirpurkhas" },
    { id: "jacobabad", name: "Jacobabad" },
    { id: "shikarpur", name: "Shikarpur" },
    { id: "dadu", name: "Dadu" },
    { id: "badin", name: "Badin" },
    { id: "thatta", name: "Thatta" },
    { id: "sanghar", name: "Sanghar" },
    { id: "naushahro-feroze", name: "Naushahro Feroze" },
    { id: "ghotki", name: "Ghotki" },
    { id: "khairpur", name: "Khairpur" },
    { id: "umerkot", name: "Umerkot" },
    { id: "tando-allahyar", name: "Tando Allahyar" },
    { id: "tando-muhammad-khan", name: "Tando Muhammad Khan" },
    { id: "matiari", name: "Matiari" },
    { id: "jamshoro", name: "Jamshoro" },
    { id: "tharparkar", name: "Tharparkar" },
    { id: "kashmore", name: "Kashmore" },
    { id: "shahdadkot", name: "Shahdadkot" },
    { id: "qambar-shahdadkot", name: "Qambar Shahdadkot" },
    { id: "sujawal", name: "Sujawal" },
    { id: "tando-adam", name: "Tando Adam" },
    { id: "hala", name: "Hala" },
    { id: "kotri", name: "Kotri" },
    { id: "moro", name: "Moro" },
    { id: "sakrand", name: "Sakrand" },
    { id: "shahdadpur", name: "Shahdadpur" },
    { id: "pano-aqil", name: "Pano Aqil" },
    { id: "mirpur-mathilo", name: "Mirpur Mathilo" },
    { id: "digri", name: "Digri" },
    { id: "tando-jam", name: "Tando Jam" },
  ];

  const fetchTeams = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("teams")
        .select(
          `
          id, name, sport, skill_level, max_members, member_count, location, description, status, created_at, created_by,
          captain:team_members!inner(
            user:users(id, name, email)
          )
        `
        )
        .eq("status", "active")
        .eq("team_members.role_in_team", "captain")
        .order("created_at", { ascending: false })
        .limit(50);

      // Exclude the user's own teams: teams they created or are a member of
      if (user) {
        // Exclude teams created by this user
        query = query.neq("created_by", user.id);

        // Exclude teams where the user is already a member
        const { data: myMemberships, error: myTeamsErr } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("user_id", user.id);
        if (myTeamsErr) {
          console.error("Error fetching user's memberships", myTeamsErr);
        }
        const excludeTeamIds = (myMemberships || [])
          .map((m) => m.team_id)
          .filter(Boolean);
        if (excludeTeamIds.length > 0) {
          // PostgREST expects a parenthesized, comma-separated list for NOT IN on UUID columns (no single quotes)
          const list = `(${excludeTeamIds.join(",")})`;
          query = query.not("id", "in", list);
        }
      }

      if (selectedSport !== "all") {
        query = query.eq("sport", selectedSport);
      }
      if (selectedSkill !== "all") {
        query = query.eq("skill_level", selectedSkill);
      }
      if (selectedLocation !== "all") {
        // Filter by location - check if location contains the selected city
        const selectedLocationName = locations.find(
          (loc) => loc.id === selectedLocation
        )?.name;
        if (selectedLocationName) {
          query = query.ilike("location", `%${selectedLocationName}%`);
        }
      }
      if (searchQuery && searchQuery.trim().length > 0) {
        const q = `%${searchQuery.trim()}%`;
        query = query.or(
          `name.ilike.${q},description.ilike.${q},location.ilike.${q}`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      const normalized = (data || []).map((t) => ({
        id: t.id,
        name: t.name,
        sport: t.sport,
        skillLevel: t.skill_level || "",
        members: t.member_count || 0,
        maxMembers: t.max_members || 0,
        location: t.location || "",
        description: t.description || "",
        available: (t.member_count || 0) < (t.max_members || 0),
        createdAt: t.created_at || null,
        createdBy: t.created_by || null,
        captain: t.captain?.[0]?.user || null, // Get captain information
      }));

      // Detect duplicates by id and by name (for debugging)
      const idCounts = normalized.reduce((acc, t) => {
        acc[t.id] = (acc[t.id] || 0) + 1;
        return acc;
      }, {});
      const duplicateIds = Object.keys(idCounts).filter((k) => idCounts[k] > 1);
      if (duplicateIds.length > 0) {
        console.warn("Duplicate IDs detected", duplicateIds);
      }
      const nameCounts = normalized.reduce((acc, t) => {
        const nm = (t.name || "").trim();
        acc[nm] = (acc[nm] || 0) + 1;
        return acc;
      }, {});
      const duplicateNames = Object.keys(nameCounts).filter(
        (k) => nameCounts[k] > 1
      );
      if (duplicateNames.length > 0) {
        console.warn(
          "Duplicate names detected",
          duplicateNames.map((n) => ({ name: n, count: nameCounts[n] }))
        );
      }

      // Temporary guard: de-duplicate by id to avoid duplicate rendering
      const uniqueById = Array.from(
        new Map(normalized.map((t) => [t.id, t])).values()
      );
      if (uniqueById.length !== normalized.length) {
        console.warn("De-duplicated by id", {
          before: normalized.length,
          after: uniqueById.length,
          removed: normalized.length - uniqueById.length,
        });
      }

      // Additional guard: de-duplicate by normalized name (case/trim), keep most recent createdAt
      const byName = new Map();
      for (const t of uniqueById) {
        const key = (t.name || "").trim().toLowerCase();
        if (!byName.has(key)) {
          byName.set(key, t);
        } else {
          const existing = byName.get(key);
          const existingTs = existing.createdAt
            ? Date.parse(existing.createdAt)
            : 0;
          const currentTs = t.createdAt ? Date.parse(t.createdAt) : 0;
          if (currentTs > existingTs) {
            byName.set(key, t);
          }
        }
      }
      const uniqueByName = Array.from(byName.values());
      if (uniqueByName.length !== uniqueById.length) {
        console.warn("De-duplicated by name (keeping latest)", {
          before: uniqueById.length,
          after: uniqueByName.length,
          removed: uniqueById.length - uniqueByName.length,
        });
      }

      setTeams(uniqueByName);
    } catch (err) {
      console.error("Error fetching teams:", err);
      Alert.alert("Error", "Failed to load teams. Please try again.");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search/filtering to avoid excessive calls
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchTeams, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selectedSport, selectedSkill, selectedLocation]);

  const handleTeamPress = (team) => {
    navigation.navigate("TeamDetails", { team });
  };

  const handleJoinTeam = async (team) => {
    try {
      if (!user) {
        Alert.alert(
          "Sign in required",
          "Please sign in to request to join a team."
        );
        return;
      }
      if (!team.available) {
        Alert.alert(
          "Team Full",
          "This team is not accepting new members at the moment."
        );
        return;
      }

      // Check if already a member
      const { data: existingMember, error: memberErr } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", team.id)
        .eq("user_id", user.id)
        .single();
      if (!memberErr && existingMember) {
        Alert.alert(
          "Already a member",
          "You are already a member of this team."
        );
        return;
      }

      // Check for existing pending request
      const { data: existingReq, error: reqErr } = await supabase
        .from("team_join_requests")
        .select("id,status")
        .eq("team_id", team.id)
        .eq("user_id", user.id)
        .in("status", ["pending"]) // if accepted exists, user should already be a member
        .maybeSingle();

      if (!reqErr && existingReq) {
        Alert.alert(
          "Request exists",
          "You already have a pending request for this team."
        );
        return;
      }

      Alert.alert("Join Team", `Send a join request to ${team.name}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            const { error: insertErr } = await supabase
              .from("team_join_requests")
              .insert({
                team_id: team.id,
                user_id: user.id,
                message: "I'd like to join your team.",
                status: "pending",
              });
            if (insertErr) throw insertErr;
            Alert.alert("Requested", "Your join request has been sent.");
          },
        },
      ]);
    } catch (err) {
      console.error("Error creating join request:", err);
      Alert.alert("Error", "Could not send join request. Please try again.");
    }
  };

  // Challenge: open modal and prepare my manageable teams
  const openChallengeModal = async (opponentTeam) => {
    try {
      if (!user) {
        Alert.alert("Sign in required", "Please sign in to challenge a team.");
        return;
      }
      setChallengeTargetTeam(opponentTeam);
      setChallengeLoading(true);
      setChallengeDate("");
      setChallengeTime("");
      setGroundQuery("");
      setGroundOptions([]);
      setSelectedGround(null);

      // Try to prefill city from opponent team location if it's JSON
      try {
        const loc =
          opponentTeam?.location && typeof opponentTeam.location === "string"
            ? JSON.parse(opponentTeam.location)
            : opponentTeam?.location || null;
        if (loc && typeof loc === "object" && (loc.city || loc.City)) {
          setChallengeCity(loc.city || loc.City);
        } else {
          setChallengeCity("");
        }
      } catch (e) {
        setChallengeCity("");
      }

      // Prefetch cities list from DB (filtered by sport when available)
      await fetchCities(opponentTeam?.sport);
      await fetchGroundOptions();

      // Find teams where current user is captain (required by RLS to create matches)
      const { data: myMemberships, error: membershipsErr } = await supabase
        .from("team_members")
        .select("team_id, role_in_team")
        .eq("user_id", user.id)
        .in("role_in_team", ["captain"]);
      if (membershipsErr) throw membershipsErr;
      const myTeamIds = (myMemberships || []).map((m) => m.team_id);

      if (myTeamIds.length === 0) {
        setChallengeLoading(false);
        Alert.alert(
          "No manageable team",
          "You must be a captain of a team to send a challenge."
        );
        return;
      }

      const { data: myTeams, error: myTeamsErr } = await supabase
        .from("teams")
        .select("id, name, sport, skill_level")
        .in("id", myTeamIds);
      if (myTeamsErr) throw myTeamsErr;

      setMyManagerTeams(myTeams || []);
      setSelectedMyTeamId((myTeams && myTeams[0] && myTeams[0].id) || null);
      setChallengeModalVisible(true);
    } catch (e) {
      console.error("Error preparing challenge:", e);
      Alert.alert("Error", "Could not prepare challenge. Please try again.");
    } finally {
      setChallengeLoading(false);
    }
  };

  const sendChallenge = async () => {
    try {
      if (!selectedMyTeamId || !challengeTargetTeam) return;
      // Validate date/time/ground
      if (!challengeDate || !/^\d{4}-\d{2}-\d{2}$/.test(challengeDate)) {
        Alert.alert("Missing date", "Please enter a valid date as YYYY-MM-DD.");
        return;
      }
      if (!challengeTime || !/^\d{2}:\d{2}$/.test(challengeTime)) {
        Alert.alert("Missing time", "Please enter a valid time as HH:MM.");
        return;
      }
      if (!selectedGround) {
        Alert.alert(
          "Select ground",
          "Please select a ground for this challenge."
        );
        return;
      }
      // Ensure sport alignment
      const myTeam = myManagerTeams.find((t) => t.id === selectedMyTeamId);
      if (
        myTeam &&
        challengeTargetTeam &&
        myTeam.sport !== challengeTargetTeam.sport
      ) {
        Alert.alert(
          "Sport mismatch",
          `Your team plays ${myTeam.sport} but opponent plays ${challengeTargetTeam.sport}. Please choose a team with the same sport.`
        );
        return;
      }
      setChallengeLoading(true);

      // Create match record (team_a = my team, team_b = opponent). Date/time/ground optional.
      const { error: insertErr } = await supabase.from("matches").insert({
        team_a_id: selectedMyTeamId,
        team_b_id: challengeTargetTeam.id,
        date: challengeDate,
        time: challengeTime,
        ground_id: selectedGround?.id || null,
        status: "proposed",
      });
      if (insertErr) throw insertErr;

      setChallengeModalVisible(false);
      setChallengeTargetTeam(null);
      Alert.alert("Challenge sent", "Your challenge has been created.");
    } catch (e) {
      console.error("Error sending challenge:", e);
      Alert.alert("Error", "Could not send challenge. Please try again.");
    } finally {
      setChallengeLoading(false);
    }
  };

  // Fetch grounds helper
  const fetchGroundOptions = async () => {
    try {
      let q = supabase
        .from("grounds")
        .select("id, name, location, sports, price_per_hour")
        .order("rating_avg", { ascending: false })
        .limit(25);

      if (challengeCity && challengeCity.trim().length > 0) {
        // Prefer exact contains on city when available
        q = q.contains("location", { city: challengeCity.trim() });
      }
      const opponentSport = challengeTargetTeam?.sport;
      if (opponentSport) {
        q = q.contains("sports", [opponentSport]);
      }
      if (groundQuery && groundQuery.trim().length > 0) {
        q = q.ilike("name", `%${groundQuery.trim()}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      setGroundOptions(data || []);
    } catch (err) {
      console.error("Error fetching grounds:", err);
      setGroundOptions([]);
    }
  };

  // Fetch unique cities from grounds
  const fetchCities = async (sport) => {
    try {
      let q = supabase.from("grounds").select("location, sports").limit(500);
      if (sport) {
        q = q.contains("sports", [sport]);
      }
      const { data, error } = await q;
      if (error) throw error;
      const citySet = new Set();
      (data || []).forEach((g) => {
        const loc = g.location;
        const city =
          loc && typeof loc === "object" ? loc.city || loc.City : null;
        if (city && typeof city === "string" && city.trim().length > 0)
          citySet.add(city.trim());
      });
      const list = Array.from(citySet).sort();
      setCities(list);
    } catch (e) {
      console.error("Error fetching cities:", e);
      setCities([]);
    }
  };

  const onPickDate = (_, date) => {
    setShowDatePicker(false);
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      setChallengeDate(`${y}-${m}-${d}`);
    }
  };

  const onPickTime = (_, time) => {
    setShowTimePicker(false);
    if (time) {
      const hh = String(time.getHours()).padStart(2, "0");
      const mm = String(time.getMinutes()).padStart(2, "0");
      setChallengeTime(`${hh}:${mm}`);
    }
  };

  // Auto-fetch grounds when city or query changes (debounced) while modal is open
  useEffect(() => {
    if (!challengeModalVisible) return;
    if (groundDebounceRef.current) clearTimeout(groundDebounceRef.current);
    groundDebounceRef.current = setTimeout(() => {
      fetchGroundOptions();
    }, 300);
    return () => {
      if (groundDebounceRef.current) clearTimeout(groundDebounceRef.current);
    };
  }, [challengeCity, groundQuery, challengeModalVisible]);

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

  const renderTeamCard = (team) => (
    <Card key={team.id} style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          {/* Rating hidden - not available in current schema */}
        </View>
        <View
          style={[
            styles.availabilityBadge,
            {
              backgroundColor: team.available
                ? colors.success.main
                : colors.error.main,
            },
          ]}
        >
          <Text style={styles.availabilityText}>
            {team.available ? "Open" : "Full"}
          </Text>
        </View>
      </View>

      <View style={styles.teamDetails}>
        <View style={styles.teamRow}>
          <Ionicons name="football" size={16} color={colors.primary.main} />
          <Text style={styles.detailText}>{team.sport}</Text>
          <View style={styles.separator} />
          <Ionicons name="trophy" size={16} color={colors.warning.main} />
          <Text style={styles.detailText}>{team.skillLevel || "Not set"}</Text>
        </View>

        <View style={styles.teamRow}>
          <Ionicons name="location" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{team.location || ""}</Text>
          <View style={styles.separator} />
          <Ionicons name="people" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>
            {team.members}/{team.maxMembers} members
          </Text>
        </View>

        <Text style={styles.descriptionText}>{team.description}</Text>
        {/* Captain information */}
        {team.captain && (
          <View style={styles.captainInfo}>
            <Ionicons name="person" size={16} color={colors.primary.main} />
            <Text style={styles.captainText}>Captain: {team.captain.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.teamFooter}>
        {/* <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => handleTeamPress(team)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity> */}
        <Button
          title="Challenge"
          onPress={() => openChallengeModal(team)}
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
            placeholder="Search teams by name, sport, or location..."
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
            skillLevels,
            selectedSkill,
            setSelectedSkill,
            "Skill Level"
          )}
          {renderFilterChip(
            locations,
            selectedLocation,
            setSelectedLocation,
            "Location"
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
            {teams.length} Team{teams.length !== 1 ? "s" : ""} Found
          </Text>
          {showFilters && (
            <TouchableOpacity
              onPress={() => {
                setSelectedSport("all");
                setSelectedSkill("all");
                setSelectedLocation("all");
              }}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={{ padding: spacing.xl, alignItems: "center" }}>
            <Ionicons name="refresh" size={24} color={colors.text.secondary} />
            <Text
              style={{
                ...typography.body,
                color: colors.text.secondary,
                marginTop: spacing.sm,
              }}
            >
              Loading teams...
            </Text>
          </View>
        ) : teams.length > 0 ? (
          teams.map(renderTeamCard)
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color={colors.text.secondary} />
            <Text style={styles.noResultsTitle}>No teams found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your search criteria or filters
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Challenge Modal */}
      <Modal
        transparent
        visible={challengeModalVisible}
        animationType="fade"
        onRequestClose={() => setChallengeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Challenge Team</Text>
            {challengeTargetTeam && (
              <Text style={styles.modalSubtitle}>
                Opponent: {challengeTargetTeam.name}
              </Text>
            )}
            <Text style={styles.modalSectionTitle}>Choose your team</Text>
            <View style={{ maxHeight: 240 }}>
              <ScrollView>
                {myManagerTeams.map((t) => {
                  const selected = selectedMyTeamId === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        styles.modalTeamItem,
                        selected && styles.modalTeamItemSelected,
                      ]}
                      onPress={() => setSelectedMyTeamId(t.id)}
                    >
                      <Ionicons
                        name={selected ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={
                          selected ? colors.primary.main : colors.text.secondary
                        }
                      />
                      <Text style={styles.modalTeamName}>{t.name}</Text>
                      <Text style={styles.modalTeamMeta}>
                        {t.sport} {t.skill_level ? `• ${t.skill_level}` : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <Text style={[styles.modalSectionTitle, { marginTop: spacing.md }]}>
              Match details
            </Text>
            <View style={{ gap: spacing.sm }}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.textInput}
              >
                <Text
                  style={{
                    color: challengeDate
                      ? colors.text.primary
                      : colors.text.secondary,
                  }}
                >
                  {challengeDate || "Select date"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={styles.textInput}
              >
                <Text
                  style={{
                    color: challengeTime
                      ? colors.text.primary
                      : colors.text.secondary,
                  }}
                >
                  {challengeTime ? challengeTime : "Select time"}
                </Text>
              </TouchableOpacity>
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
              <View style={[styles.textInput, { paddingVertical: 0 }]}>
                <Picker
                  selectedValue={challengeCity}
                  onValueChange={(val) => setChallengeCity(val)}
                  dropdownIconColor={colors.text.secondary}
                  style={{ color: colors.text.primary }}
                >
                  <Picker.Item
                    label="Select city"
                    value=""
                    color={colors.text.secondary}
                  />
                  {cities.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    placeholder="Search ground by name"
                    placeholderTextColor={colors.text.secondary}
                    value={groundQuery}
                    onChangeText={setGroundQuery}
                    style={styles.textInput}
                  />
                </View>
                <Button
                  title="Find"
                  onPress={fetchGroundOptions}
                  style={{ minWidth: 100 }}
                />
              </View>
              <View style={{ maxHeight: 200 }}>
                <ScrollView>
                  {groundOptions.map((g) => {
                    const selected = selectedGround?.id === g.id;
                    const loc = g.location;
                    const city =
                      loc && typeof loc === "object" && (loc.city || loc.City)
                        ? loc.city || loc.City
                        : "";
                    return (
                      <TouchableOpacity
                        key={g.id}
                        style={[
                          styles.modalTeamItem,
                          selected && styles.modalTeamItemSelected,
                        ]}
                        onPress={() => setSelectedGround(g)}
                      >
                        <Ionicons
                          name={
                            selected ? "radio-button-on" : "radio-button-off"
                          }
                          size={20}
                          color={
                            selected
                              ? colors.primary.main
                              : colors.text.secondary
                          }
                        />
                        <Text style={styles.modalTeamName}>{g.name}</Text>
                        <Text style={styles.modalTeamMeta}>{city}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setChallengeModalVisible(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title={challengeLoading ? "Sending..." : "Send Challenge"}
                onPress={sendChallenge}
                disabled={!selectedMyTeamId || challengeLoading}
                style={{ flex: 1, marginLeft: spacing.sm }}
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
  availabilityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  availabilityText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
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
    marginTop: spacing.sm,
  },
  captainText: {
    ...typography.body,
    color: colors.primary.main,
  },
  teamFooter: {
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    width: "100%",
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  modalTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  modalSectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  modalTeamItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  modalTeamItemSelected: {
    backgroundColor: "rgba(91,97,249,0.12)",
  },
  modalTeamName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  modalTeamMeta: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  modalActions: {
    flexDirection: "row",
    marginTop: spacing.lg,
  },
  textInput: {
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
    color: colors.text.primary,
    fontSize: typography.body.fontSize,
  },
});

export default SearchTeams;
