import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  Platform,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/query-client";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function ProfileScreen() {
  const { user, token, logout, updateUser } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const theme = Colors.dark;

  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(user?.skills || "");
  const [isEditing, setIsEditing] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; headline: string; bio: string; skills: string }) => {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/users/me", baseUrl).href, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: (data) => {
      updateUser(data);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update profile");
    },
  });

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    updateMutation.mutate({ name: name.trim(), headline: headline.trim(), bio: bio.trim(), skills: skills.trim() });
  }

  async function handleLogout() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (confirmed) {
        await logout();
      }
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: logout },
        ]
      );
    }
  }

  if (!user) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="h1" style={{ color: theme.primary }}>
              {user.name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText type="h3" style={styles.name}>
            {user.name}
          </ThemedText>
          <ThemedText style={[styles.username, { color: theme.textSecondary }]}>
            @{user.username}
          </ThemedText>
        </View>

        <BlurView intensity={30} tint="dark" style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4">Profile</ThemedText>
            <Pressable
              onPress={() => setIsEditing(!isEditing)}
              style={[styles.editButton, { backgroundColor: "rgba(0, 240, 255, 0.2)" }]}
            >
              <Feather
                name={isEditing ? "x" : "edit-2"}
                size={18}
                color={theme.primary}
              />
            </Pressable>
          </View>

          <View style={styles.field}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Name
            </ThemedText>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={theme.textSecondary}
              />
            ) : (
              <ThemedText>{user.name}</ThemedText>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Headline
            </ThemedText>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                value={headline}
                onChangeText={setHeadline}
                placeholder="e.g. Senior Software Engineer at Google"
                placeholderTextColor={theme.textSecondary}
              />
            ) : (
              <ThemedText>{user.headline || "Not set"}</ThemedText>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Bio
            </ThemedText>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell others about yourself..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            ) : (
              <ThemedText>{user.bio || "Not set"}</ThemedText>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Skills
            </ThemedText>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                value={skills}
                onChangeText={setSkills}
                placeholder="e.g. React, TypeScript, Node.js"
                placeholderTextColor={theme.textSecondary}
              />
            ) : (
              <ThemedText>{user.skills || "Not set"}</ThemedText>
            )}
          </View>

          {isEditing ? (
            <Button
              onPress={handleSave}
              disabled={updateMutation.isPending}
              style={styles.saveButton}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color={theme.buttonText} />
              ) : (
                "Save Changes"
              )}
            </Button>
          ) : null}
        </BlurView>

        <BlurView intensity={30} tint="dark" style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Account
          </ThemedText>

          <Pressable
            style={[styles.menuItem, { borderColor: theme.border }]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color={theme.error} />
            <ThemedText style={[styles.menuText, { color: theme.error }]}>
              Logout
            </ThemedText>
          </Pressable>
        </BlurView>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
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
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  name: {
    marginBottom: Spacing.xs,
  },
  username: {},
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 12,
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: Spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
  },
  menuText: {
    marginLeft: Spacing.md,
    fontSize: 16,
  },
});
