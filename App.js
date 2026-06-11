import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import { NavigationProvider } from "./src/contexts/NavigationContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/constants/theme";

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <StatusBar
          style="light"
          backgroundColor={colors.dark.backgroundColor}
        />
        <AppNavigator />
      </NavigationProvider>
    </AuthProvider>
  );
}
