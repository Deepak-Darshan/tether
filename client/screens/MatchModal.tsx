import React, { useEffect } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface MatchedUser {
  id: string;
  name: string;
  headline?: string | null;
  avatarUrl?: string | null;
}

interface MatchModalProps {
  matchedUser: MatchedUser | null;
  onClose: () => void;
}

export default function MatchModal({ matchedUser, onClose }: MatchModalProps) {
  const insets = useSafeAreaInsets();
  const theme = Colors.dark;

  const scale = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (matchedUser) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      opacity.value = withSpring(1);
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      iconScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.3, { damping: 10 }),
          withSpring(1, { damping: 15 })
        )
      );
    }
  }, [matchedUser]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!matchedUser) return null;

  return (
    <ThemedView style={styles.overlay}>
      <Animated.View style={[styles.backdrop, containerStyle]}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing["3xl"] },
          cardStyle,
        ]}
      >
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>

        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <View style={[styles.iconBg, { backgroundColor: theme.primary }]}>
            <Feather name="link" size={48} color={theme.backgroundRoot} />
          </View>
        </Animated.View>

        <ThemedText type="h2" style={styles.title}>
          Connection Established
        </ThemedText>

        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          You and {matchedUser.name} have matched!
        </ThemedText>

        <View style={[styles.matchCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={[styles.avatar, { backgroundColor: theme.backgroundTertiary }]}>
            <ThemedText type="h2" style={{ color: theme.primary }}>
              {matchedUser.name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>

          <ThemedText type="h4" style={styles.name}>
            {matchedUser.name}
          </ThemedText>

          {matchedUser.headline ? (
            <ThemedText style={[styles.headline, { color: theme.textSecondary }]}>
              {matchedUser.headline}
            </ThemedText>
          ) : null}
        </View>

        <Button onPress={onClose} style={styles.button}>
          Keep Swiping
        </Button>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: "85%",
    maxWidth: 360,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.xl,
    right: 0,
    padding: Spacing.sm,
  },
  iconContainer: {
    marginBottom: Spacing["3xl"],
  },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  matchCard: {
    width: "100%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  name: {
    marginBottom: Spacing.xs,
  },
  headline: {},
  button: {
    width: "100%",
  },
});
