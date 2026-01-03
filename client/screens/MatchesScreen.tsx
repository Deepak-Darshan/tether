import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/query-client";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface MatchData {
  matchId: string;
  user: {
    id: string;
    username: string;
    name: string;
    headline?: string | null;
    bio?: string | null;
    skills?: string | null;
    avatarUrl?: string | null;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  createdAt: string;
}

export default function MatchesScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const tabBarHeight = useBottomTabBarHeight();
  const theme = Colors.dark;

  const { data: matches = [], isLoading, refetch } = useQuery<MatchData[]>({
    queryKey: ["/api/matches"],
    queryFn: async () => {
      const baseUrl = getApiUrl();
      const url = `${baseUrl.replace(/\/$/, "")}/api/matches`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch matches");
      return response.json();
    },
    enabled: !!token,
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: 5000,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  function handlePress(match: MatchData) {
    navigation.navigate("Chat", { matchId: match.matchId, userName: match.user.name });
  }

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  if (matches.length === 0) {
    return (
      <ThemedView
        style={[
          styles.container,
          styles.centered,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
      >
        <Feather name="users" size={64} color={theme.textSecondary} />
        <ThemedText type="h3" style={styles.emptyText}>
          No connections yet
        </ThemedText>
        <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
          Start swiping to make professional connections
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.matchId}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        renderItem={({ item }) => (
          <MatchCard match={item} theme={theme} onPress={() => handlePress(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
    </ThemedView>
  );
}

function MatchCard({
  match,
  theme,
  onPress,
}: {
  match: MatchData;
  theme: typeof Colors.dark;
  onPress: () => void;
}) {
  const { user } = useAuth();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
      <BlurView intensity={30} tint="dark" style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText type="h4" style={{ color: theme.primary }}>
            {match.user.name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>

        <View style={styles.info}>
          <ThemedText type="h4" numberOfLines={1}>
            {match.user.name}
          </ThemedText>
          {match.lastMessage ? (
            <ThemedText
              style={[styles.lastMessage, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {match.lastMessage.senderId === user?.id ? "You: " : ""}
              {match.lastMessage.content}
            </ThemedText>
          ) : match.user.headline ? (
            <ThemedText
              style={[styles.headline, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {match.user.headline}
            </ThemedText>
          ) : null}
        </View>

        <View style={[styles.messageIcon, { backgroundColor: "rgba(0, 240, 255, 0.2)" }]}>
          <Feather name="message-circle" size={18} color={theme.primary} />
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  headline: {
    marginTop: Spacing.xs,
  },
  lastMessage: {
    marginTop: Spacing.xs,
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: Spacing.xl,
  },
  emptySubtext: {
    marginTop: Spacing.sm,
    textAlign: "center",
    paddingHorizontal: Spacing["3xl"],
  },
});
