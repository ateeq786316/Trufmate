import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import all screens
import SplashScreen from "../screens/SplashScreen";
import RoleSelectionScreen from "../screens/RoleSelectionScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import EmailVerificationScreen from "../screens/EmailVerificationScreen";
import SupabaseTestScreen from "../screens/SupabaseTestScreen";
import EditProfile from "../screens/EditProfile";
import ChangePassword from "../screens/ChangePassword";

// Player Flow Screens
import PlayerHome from "../screens/PlayerHome";
import SearchTeams from "../screens/SearchTeams";
import SearchGrounds from "../screens/SearchGrounds";
import CreateTeam from "../screens/CreateTeam";
import EditMyTeams from "../screens/EditMyTeams";
import JoinedTeams from "../screens/JoinedTeams";
import ReadyForMatch from "../screens/ReadyForMatch";
import BookGround from "../screens/BookGround";
import MatchDetails from "../screens/MatchDetails";
import ChatList from "../screens/ChatList";
import ChatRoom from "../screens/ChatRoom";
import Profile from "../screens/Profile";
import Notifications from "../screens/Notifications";

// Ground Owner Flow Screens
import GroundOwnerHome from "../screens/GroundOwnerHome";
import AddGround from "../screens/AddGround";
import ManageGrounds from "../screens/ManageGrounds";
import ManageSchedule from "../screens/ManageSchedule";
import BookingRequests from "../screens/BookingRequests";
import BookingList from "../screens/BookingList";

// Development Components
import ScreenTester from "../components/ScreenTester";
import DebugScreen from "../screens/DebugScreen";
import OTPVerificationScreen from "../screens/OTPVerificationScreen";

import { colors, typography } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Player Tab Navigator
const PlayerTabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "PlayerHome") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "SearchTeams") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "SearchGrounds") {
            iconName = focused ? "location" : "location-outline";
          } else if (route.name === "ChatList") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.disabled,
        tabBarStyle: {
          backgroundColor: colors.dark.surfaceColor,
          borderTopColor: colors.border.primary,
          borderTopWidth: 1,
          paddingBottom: Math.max(10, insets.bottom),
          paddingTop: 8,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: colors.dark.backgroundColor,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        contentStyle: {
          backgroundColor: colors.dark.backgroundColor,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="PlayerHome"
        component={PlayerHome}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="SearchTeams"
        component={SearchTeams}
        options={{ title: "Teams" }}
      />
      <Tab.Screen
        name="SearchGrounds"
        component={SearchGrounds}
        options={{ title: "Grounds" }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatList}
        options={{ title: "Chats" }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

// Ground Owner Tab Navigator
const GroundOwnerTabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "GroundOwnerHome") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "ManageGrounds") {
            iconName = focused ? "business" : "business-outline";
          } else if (route.name === "BookingRequests") {
            iconName = focused ? "notifications" : "notifications-outline";
          } else if (route.name === "ChatList") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.disabled,
        tabBarStyle: {
          backgroundColor: colors.dark.surfaceColor,
          borderTopColor: colors.border.primary,
          borderTopWidth: 1,
          paddingBottom: Math.max(10, insets.bottom),
          paddingTop: 8,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: colors.dark.backgroundColor,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        contentStyle: {
          backgroundColor: colors.dark.backgroundColor,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="GroundOwnerHome"
        component={GroundOwnerHome}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="ManageGrounds"
        component={ManageGrounds}
        options={{ title: "Grounds" }}
      />
      <Tab.Screen
        name="BookingRequests"
        component={BookingRequests}
        options={{ title: "Requests" }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatList}
        options={{ title: "Chats" }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.dark.backgroundColor,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: colors.dark.backgroundColor,
          },
        }}
      >
        {/* Authentication Screens */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RoleSelection"
          component={RoleSelectionScreen}
          options={{
            title: "Get Started",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: "Sign In",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{
            title: "Create Account",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            title: "Reset Password",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="EmailVerification"
          component={EmailVerificationScreen}
          options={{
            title: "Email Verification",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="OTPVerification"
          component={OTPVerificationScreen}
          options={{
            title: "Verify OTP",
            headerBackTitle: "Back",
          }}
        />

        {/* Player Flow Screens */}
        <Stack.Screen
          name="PlayerMain"
          component={PlayerTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateTeam"
          component={CreateTeam}
          options={{
            title: "Create Team",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="EditMyTeams"
          component={EditMyTeams}
          options={{
            title: "Edit Teams",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="JoinedTeams"
          component={JoinedTeams}
          options={{
            title: "Joined Teams",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="ReadyForMatch"
          component={ReadyForMatch}
          options={{
            title: "Ready for Match",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="BookGround"
          component={BookGround}
          options={{
            title: "Book Ground",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="MatchDetails"
          component={MatchDetails}
          options={{
            title: "Match Details",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoom}
          options={{
            title: "Chat",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{
            title: "Notifications",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{
            title: "Edit Profile",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{
            headerShown: false,
          }}
        />

        {/* Ground Owner Flow Screens */}
        <Stack.Screen
          name="GroundOwnerMain"
          component={GroundOwnerTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddGround"
          component={AddGround}
          options={{
            title: "Add Ground",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="ManageGrounds"
          component={ManageGrounds}
          options={{
            title: "Manage Grounds",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="ManageSchedule"
          component={ManageSchedule}
          options={{
            title: "Manage Schedule",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="BookingRequests"
          component={BookingRequests}
          options={{
            title: "Booking Requests",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="BookingList"
          component={BookingList}
          options={{
            title: "Booking List",
            headerBackTitle: "Back",
          }}
        />

        {/* Test Screen */}
        <Stack.Screen
          name="SupabaseTest"
          component={SupabaseTestScreen}
          options={{
            title: "Supabase Test",
            headerBackTitle: "Back",
          }}
        />

        {/* Development Components */}
        <Stack.Screen
          name="ScreenTester"
          component={ScreenTester}
          options={{
            title: "Screen Tester",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="Debug"
          component={DebugScreen}
          options={{
            title: "Debug Panel",
            headerBackTitle: "Back",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
