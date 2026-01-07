import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/query-client";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface DeckUser {
  id: string;
  username: string;
  name: string;
  headline?: string | null;
  bio?: string | null;
  skills?: string | null;
  avatarUrl?: string | null;
}

interface SwipeResponse {
  success: boolean;
  isMatch: boolean;
  matchedUser?: {
    id: string;
    name: string;
    headline?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export default function DeckScreen({
  onMatch,
}: {
  onMatch?: (user: SwipeResponse["matchedUser"]) => void;
}) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const theme = Colors.dark;

  const [currentIndex, setCurrentIndex] = useState(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  const { data: users = [], isLoading } = useQuery<DeckUser[]>({
    queryKey: ["/api/deck"],
    queryFn: async () => {
      const baseUrl = getApiUrl();
      const url = `${baseUrl.replace(/\/$/, "")}/api/deck`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch deck");
      return response.json();
    },
    enabled: !!token,
  });

  const swipeMutation = useMutation({
    mutationFn: async ({
      swipeeId,
      direction,
    }: {
      swipeeId: string;
      direction: "left" | "right";
    }) => {
      const baseUrl = getApiUrl();
      const url = `${baseUrl.replace(/\/$/, "")}/api/swipe`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ swipeeId, direction }),
      });
      if (!response.ok) throw new Error("Failed to swipe");
      return response.json() as Promise<SwipeResponse>;
    },
    onSuccess: (data) => {
      if (data.isMatch && data.matchedUser && onMatch) {
        onMatch(data.matchedUser);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
    },
  });

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];

  const moveToNextCard = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    translateX.value = 0;
    translateY.value = 0;
    rotation.value = 0;
  }, []);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!currentUser) return;

      const targetX =
        direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

      translateX.value = withTiming(targetX, { duration: 300 }, () => {
        runOnJS(moveToNextCard)();
      });

      swipeMutation.mutate({ swipeeId: currentUser.id, direction });
    },
    [currentUser, swipeMutation, moveToNextCard],
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-15, 0, 15],
        Extrapolation.CLAMP,
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? "right" : "left";
        runOnJS(handleSwipe)(direction);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  if (!currentUser) {
    return (
      <ThemedView
        style={[
          styles.container,
          styles.centered,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
      >
        <Feather name="users" size={64} color={theme.textSecondary} />
        <ThemedText type="h3" style={styles.emptyText}>
          No more profiles
        </ThemedText>
        <ThemedText
          style={[styles.emptySubtext, { color: theme.textSecondary }]}
        >
          Check back later for new connections
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["3xl"],
        },
      ]}
    >
      <View style={styles.cardContainer}>
        {nextUser ? (
          <View style={[styles.card, styles.nextCard]}>
            <ProfileCard user={nextUser} theme={theme} />
          </View>
        ) : null}

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.card, cardStyle]}>
            <ProfileCard user={currentUser} theme={theme} />

            <Animated.View
              style={[styles.stamp, styles.likeStamp, likeOpacity]}
            >
              <ThemedText style={styles.stampText}>CONNECT</ThemedText>
            </Animated.View>

            <Animated.View
              style={[styles.stamp, styles.nopeStamp, nopeOpacity]}
            >
              <ThemedText style={styles.stampText}>PASS</ThemedText>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: "rgba(239, 68, 68, 0.2)" },
          ]}
          onPress={() => handleSwipe("left")}
        >
          <Feather name="x" size={32} color={theme.error} />
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: "rgba(0, 240, 255, 0.2)" },
          ]}
          onPress={() => handleSwipe("right")}
        >
          <Feather name="check" size={32} color={theme.primary} />
        </Pressable>
      </View>
    </ThemedView>
  );
}

function ProfileCard({
  user,
  theme,
}: {
  user: DeckUser;
  theme: typeof Colors.dark;
}) {
  const skillsArray =
    user.skills
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) || [];
  const imageUrl = user.avatarUrl
    ? `${getApiUrl().replace(/\/$/, "")}${user.avatarUrl}`
    : null;

  return (
    <BlurView intensity={40} tint="dark" style={styles.cardContent}>
      <View
        style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.avatarImage}
            contentFit="cover"
          />
        ) : (
          <ThemedText type="h1" style={{ color: theme.primary }}>
            {user.name.charAt(0).toUpperCase()}
          </ThemedText>
        )}
      </View>

      <ThemedText type="h3" style={styles.name}>
        {user.name}
      </ThemedText>

      {user.headline ? (
        <ThemedText style={[styles.headline, { color: theme.primary }]}>
          {user.headline}
        </ThemedText>
      ) : null}

      {user.bio ? (
        <ThemedText
          style={[styles.bio, { color: theme.textSecondary }]}
          numberOfLines={4}
        >
          {user.bio}
        </ThemedText>
      ) : null}

      {skillsArray.length > 0 ? (
        <View style={styles.skills}>
          {skillsArray.slice(0, 5).map((skill, index) => (
            <View
              key={index}
              style={[
                styles.skillTag,
                { backgroundColor: "rgba(188, 19, 254, 0.2)" },
              ]}
            >
              <ThemedText
                style={[styles.skillText, { color: theme.secondary }]}
              >
                {skill}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}
    </BlurView>
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
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  card: {
    position: "absolute",
    width: "100%",
    aspectRatio: 0.7,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  nextCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  name: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  headline: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  bio: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  skills: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  skillTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  skillText: {
    fontSize: 12,
  },
  stamp: {
    position: "absolute",
    top: Spacing["3xl"],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 3,
    borderRadius: BorderRadius.xs,
    transform: [{ rotate: "-20deg" }],
  },
  likeStamp: {
    left: Spacing.xl,
    borderColor: "#00f0ff",
  },
  nopeStamp: {
    right: Spacing.xl,
    borderColor: "#ef4444",
    transform: [{ rotate: "20deg" }],
  },
  stampText: {
    fontSize: 24,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing["4xl"],
    paddingBottom: Spacing.lg,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: Spacing.xl,
  },
  emptySubtext: {
    marginTop: Spacing.sm,
  },
});
