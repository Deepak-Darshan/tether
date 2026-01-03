import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";

export function TetherHeaderTitle() {
  const theme = Colors.dark;

  return (
    <View style={styles.container}>
      <Feather name="link" size={24} color={theme.primary} />
      <ThemedText type="h4" style={styles.title}>
        Tether
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontWeight: "700",
  },
});
