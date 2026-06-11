import React, { createContext, useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";

const NavigationContext = createContext();

export const useNavigationContext = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      "useNavigationContext must be used within a NavigationProvider"
    );
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(null);

  const navigateToRoleFlow = (role) => {
    setCurrentRole(role);

    // Navigate to the appropriate main screen based on role
    if (role === "player") {
      // Navigate to PlayerMain which contains the PlayerTabNavigator
      return "PlayerMain";
    } else if (role === "ground_owner") {
      // Navigate to GroundOwnerMain which contains the GroundOwnerTabNavigator
      return "GroundOwnerMain";
    }

    return null;
  };

  const getRoleBasedNavigation = (role) => {
    switch (role) {
      case "player":
        return {
          home: "PlayerHome",
          searchTeams: "SearchTeams",
          searchGrounds: "SearchGrounds",
          createTeam: "CreateTeam",
          editTeams: "EditMyTeams",
          joinedTeams: "JoinedTeams",
          readyForMatch: "ReadyForMatch",
          bookGround: "BookGround",
          matchDetails: "MatchDetails",
          chatList: "ChatList",
          chatRoom: "ChatRoom",
          profile: "Profile",
          notifications: "Notifications",
        };

      case "ground_owner":
        return {
          home: "GroundOwnerHome",
          addGround: "AddGround",
          manageGrounds: "ManageGrounds",
          manageSchedule: "ManageSchedule",
          bookingRequests: "BookingRequests",
          bookingList: "BookingList",
          chatList: "ChatList",
          chatRoom: "ChatRoom",
          profile: "Profile",
          notifications: "Notifications",
        };

      default:
        return {};
    }
  };

  const value = {
    currentRole,
    setCurrentRole,
    navigateToRoleFlow,
    getRoleBasedNavigation,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
