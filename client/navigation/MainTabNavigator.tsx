import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors } from "@/constants/theme";

import DeckScreen from "@/screens/DeckScreen";
import MatchesScreen from "@/screens/MatchesScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { TetherHeaderTitle } from "@/components/HeaderTitle";

export type MainTabParamList = {
  DeckTab: undefined;
  MatchesTab: undefined;
  ProfileTab: undefined;
};

interface MatchedUser {
  id: string;
  name: string;
  headline?: string | null;
  avatarUrl?: string | null;
}

const Tab = createBottomTabNavigator<MainTabParamList>();

interface MainTabNavigatorProps {
  onMatch?: (user: MatchedUser | null | undefined) => void;
}

export default function MainTabNavigator({ onMatch }: MainTabNavigatorProps) {
  const screenOptions = useScreenOptions();
  const theme = Colors.dark;

  return (
    <Tab.Navigator
      initialRouteName="DeckTab"
      screenOptions={{
        ...screenOptions,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
            web: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tab.Screen
        name="DeckTab"
        options={{
          title: "Deck",
          headerTitle: () => <TetherHeaderTitle />,
          tabBarIcon: ({ color, size }) => (
            <Feather name="layers" size={size} color={color} />
          ),
        }}
      >
        {() => <DeckScreen onMatch={onMatch} />}
      </Tab.Screen>
      <Tab.Screen
        name="MatchesTab"
        component={MatchesScreen}
        options={{
          title: "Matches",
          headerTitle: "Connections",
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
