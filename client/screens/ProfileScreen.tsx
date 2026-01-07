import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  Platform,
  ActionSheetIOS,
  Modal,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";

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
  const insets = useSafeAreaInsets();
  const theme = Colors.dark;

  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(user?.skills || "");
  const [isEditing, setIsEditing] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  // Debug logging
  const imageUrl = user?.avatarUrl
    ? `${getApiUrl().replace(/\/$/, "")}${user.avatarUrl}`
    : null;
  console.log("User avatarUrl:", user?.avatarUrl);
  console.log("Full image URL:", imageUrl || "no avatar");

  function handleViewImage() {
    if (imageUrl) {
      setShowImageViewer(true);
    }
  }

  async function handleImagePicker() {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Cancel",
            "Take Photo",
            "Choose from Library",
            user?.avatarUrl ? "Remove Photo" : "",
          ].filter(Boolean),
          cancelButtonIndex: 0,
          destructiveButtonIndex: user?.avatarUrl ? 3 : undefined,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await takePhoto();
          } else if (buttonIndex === 2) {
            await pickImage();
          } else if (buttonIndex === 3 && user?.avatarUrl) {
            await removePhoto();
          }
        },
      );
    } else {
      Alert.alert("Change Profile Picture", "Choose an option", [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
        ...(user?.avatarUrl
          ? [
              {
                text: "Remove Photo",
                onPress: removePhoto,
                style: "destructive" as const,
              },
            ]
          : []),
        { text: "Cancel", style: "cancel" },
      ]);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera permission is required to take photos",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  }

  async function pickImage() {
    try {
      const permission = await ImagePicker.getMediaLibraryPermissionsAsync();

      if (!permission.granted && permission.canAskAgain) {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Photo library permission is required to choose photos",
          );
          return;
        }
      } else if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Please enable photo library access in Settings",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to open image picker");
    }
  }

  async function uploadImage(uri: string) {
    try {
      const formData = new FormData();
      formData.append("avatar", {
        uri,
        type: "image/jpeg",
        name: "avatar.jpg",
      } as any);

      const baseUrl = getApiUrl();
      const url = `${baseUrl.replace(/\/$/, "")}/api/users/me/avatar`;
      console.log("Uploading to:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed:", errorText);
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      console.log("Upload successful:", data);
      updateUser(data);
      Alert.alert("Success", "Profile picture updated");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload image");
    }
  }

  async function removePhoto() {
    try {
      const baseUrl = getApiUrl();
      const url = `${baseUrl.replace(/\/$/, "")}/api/users/me/avatar`;
      console.log("Removing photo from:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Remove failed:", errorText);
        throw new Error("Failed to remove image");
      }

      const data = await response.json();
      console.log("Remove successful:", data);
      updateUser(data);
      Alert.alert("Success", "Profile picture removed");
    } catch (error) {
      console.error("Remove error:", error);
      Alert.alert("Error", "Failed to remove image");
    }
  }

  const updateMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      headline: string;
      bio: string;
      skills: string;
    }) => {
      const baseUrl = getApiUrl();
      const url = `${baseUrl.replace(/\/$/, "")}/api/users/me`;
      const response = await fetch(url, {
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
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update profile",
      );
    },
  });

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    updateMutation.mutate({
      name: name.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      skills: skills.trim(),
    });
  }

  async function handleLogout() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (confirmed) {
        await logout();
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout },
      ]);
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
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Pressable onPress={handleViewImage} style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.avatarImage}
                    contentFit="cover"
                    onLoad={() => console.log("Image loaded:", imageUrl)}
                    onError={(error) =>
                      console.error("Image load error:", error, imageUrl)
                    }
                  />
                ) : (
                  <ThemedText type="h1" style={{ color: theme.primary }}>
                    {user.name.charAt(0).toUpperCase()}
                  </ThemedText>
                )}
              </View>
            </Pressable>
            <Pressable
              onPress={handleImagePicker}
              style={[
                styles.editAvatarButton,
                { backgroundColor: theme.primary },
              ]}
            >
              <Feather name="edit-2" size={16} color={theme.backgroundRoot} />
            </Pressable>
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
              style={[
                styles.editButton,
                { backgroundColor: "rgba(0, 240, 255, 0.2)" },
              ]}
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
              NAME
            </ThemedText>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={theme.textSecondary}
              />
            ) : (
              <ThemedText style={styles.fieldValue}>{user.name}</ThemedText>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              HEADLINE
            </ThemedText>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
                value={headline}
                onChangeText={setHeadline}
                placeholder="e.g. Senior Software Engineer at Google"
                placeholderTextColor={theme.textSecondary}
              />
            ) : (
              <ThemedText
                style={[
                  styles.fieldValue,
                  !user.headline && { color: theme.textSecondary },
                ]}
              >
                {user.headline || "Not set"}
              </ThemedText>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              BIO
            </ThemedText>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: theme.text, borderColor: theme.border },
                ]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell others about yourself..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            ) : (
              <ThemedText
                style={[
                  styles.fieldValue,
                  !user.bio && { color: theme.textSecondary },
                ]}
              >
                {user.bio || "Not set"}
              </ThemedText>
            )}
          </View>

          <View style={[styles.field, { marginBottom: 0 }]}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              SKILLS
            </ThemedText>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
                value={skills}
                onChangeText={setSkills}
                placeholder="e.g. React, TypeScript, Node.js"
                placeholderTextColor={theme.textSecondary}
              />
            ) : (
              <ThemedText
                style={[
                  styles.fieldValue,
                  !user.skills && { color: theme.textSecondary },
                ]}
              >
                {user.skills || "Not set"}
              </ThemedText>
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

      <Modal
        visible={showImageViewer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageViewer(false)}
      >
        <View style={styles.imageViewerContainer}>
          <StatusBar barStyle="light-content" />
          <Pressable
            style={styles.imageViewerClose}
            onPress={() => setShowImageViewer(false)}
          >
            <Feather name="x" size={28} color="white" />
          </Pressable>
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.imageViewerImage}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>
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
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  editAvatarButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#0f172a",
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerClose: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  imageViewerImage: {
    width: "100%",
    height: "100%",
  },
  name: {
    marginBottom: Spacing.sm,
  },
  username: {},
  section: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.xl,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  field: {
    marginBottom: Spacing["2xl"],
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.7,
  },
  fieldValue: {
    fontSize: 17,
    lineHeight: 26,
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
    paddingVertical: Spacing.sm,
    borderTopWidth: 0,
  },
  menuText: {
    marginLeft: Spacing.md,
    fontSize: 16,
    fontWeight: "500",
  },
});
