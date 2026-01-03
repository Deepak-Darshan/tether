import React, { useState, useCallback } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/theme";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import ChatScreen from "@/screens/ChatScreen";
import MatchModal from "@/screens/MatchModal";

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Chat: { matchId: string; userName: string };
};

interface MatchedUser {
  id: string;
  name: string;
  headline?: string | null;
  avatarUrl?: string | null;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user, isLoading } = useAuth();
  const theme = Colors.dark;

  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);

  const handleMatch = useCallback((user: MatchedUser | null | undefined) => {
    if (user) {
      setMatchedUser(user);
    }
  }, []);

  const closeMatchModal = useCallback(() => {
    setMatchedUser(null);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Navigator screenOptions={screenOptions}>
        {user ? (
          <>
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {() => <MainTabNavigator onMatch={handleMatch} />}
            </Stack.Screen>
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }) => ({
                headerTitle: (route.params as any)?.userName || "Chat",
              })}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>

      {matchedUser ? (
        <MatchModal matchedUser={matchedUser} onClose={closeMatchModal} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
