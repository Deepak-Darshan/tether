import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/query-client";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

type Props = NativeStackScreenProps<any, "Chat">;

export default function ChatScreen({ route }: Props) {
  const { matchId, userName } = route.params as {
    matchId: string;
    userName: string;
  };
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const theme = Colors.dark;
  const flatListRef = useRef<FlatList>(null);

  const [messageText, setMessageText] = useState("");

  const { data: messagesData = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/matches", matchId, "messages"],
    queryFn: async () => {
      const baseUrl = getApiUrl();
      const url = `${baseUrl.replace(/\/$/, "")}/api/matches/${matchId}/messages`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!token && !!matchId,
    refetchInterval: 3000,
  });

  const messages = [...messagesData].reverse();

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const baseUrl = getApiUrl();
      const url = `${baseUrl.replace(/\/$/, "")}/api/matches/${matchId}/messages`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to send message");
      }
      return response.json();
    },
    onMutate: async (content: string) => {
      // Clear input immediately
      setMessageText("");

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["/api/matches", matchId, "messages"],
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData([
        "/api/matches",
        matchId,
        "messages",
      ]);

      // Optimistically update with new message
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        senderId: user?.id || "",
        content,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["/api/matches", matchId, "messages"],
        (old: Message[] = []) => [...old, optimisticMessage],
      );

      return { previousMessages };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["/api/matches", matchId, "messages"],
          context.previousMessages,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/matches", matchId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () =>
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true }),
        100,
      );
    }
  }, [messages.length]);

  function handleSend() {
    if (!messageText.trim()) return;
    sendMutation.mutate(messageText.trim());
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === user?.id;
    return (
      <View style={[styles.messageRow, isOwn ? styles.ownMessageRow : null]}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isOwn ? "#00f0ff" : "#334155",
              opacity: 1,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              {
                color: isOwn ? "#0f172a" : "#FFFFFF",
                opacity: 1,
              },
            ]}
          >
            {item.content}
          </ThemedText>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ThemedView style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messagesList,
            { paddingTop: Spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
          inverted
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText
                style={[styles.emptyText, { color: theme.textSecondary }]}
              >
                Start the conversation with {userName}
              </ThemedText>
            </View>
          }
        />

        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: insets.bottom + Spacing.md,
              backgroundColor: theme.backgroundRoot,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.border },
            ]}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[
              styles.sendButton,
              {
                backgroundColor: messageText.trim()
                  ? theme.primary
                  : theme.backgroundSecondary,
              },
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Feather
              name="send"
              size={20}
              color={
                messageText.trim() ? theme.backgroundRoot : theme.textSecondary
              }
            />
          </Pressable>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
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
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  ownMessageRow: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    opacity: 1,
  },
  messageText: {
    fontSize: 16,
    opacity: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  emptyText: {
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    marginRight: Spacing.md,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
