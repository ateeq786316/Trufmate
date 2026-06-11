import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../constants/theme";
import { Card } from "../components";
import { Ionicons } from "@expo/vector-icons";

const ChatList = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chats] = useState([
    {
      id: "1",
      type: "team", // team, player, ground_owner
      name: "Thunder FC",
      lastMessage: "See you at the ground tomorrow!",
      timestamp: "2 min ago",
      unreadCount: 2,
      avatar: "https://example.com/team1.jpg",
      isOnline: true,
      lastMessageType: "text", // text, image, location
    },
    {
      id: "2",
      type: "player",
      name: "Ahmed Khan",
      lastMessage: "I'll be there at 5 PM",
      timestamp: "1 hour ago",
      unreadCount: 0,
      avatar: "https://example.com/player1.jpg",
      isOnline: false,
      lastMessageType: "text",
    },
    {
      id: "3",
      type: "ground_owner",
      name: "Central Turf",
      lastMessage: "Your booking is confirmed for tomorrow",
      timestamp: "3 hours ago",
      unreadCount: 1,
      avatar: "https://example.com/ground1.jpg",
      isOnline: false,
      lastMessageType: "text",
    },
    {
      id: "4",
      type: "team",
      name: "Lightning United",
      lastMessage: "Great game today!",
      timestamp: "1 day ago",
      unreadCount: 0,
      avatar: "https://example.com/team2.jpg",
      isOnline: true,
      lastMessageType: "text",
    },
    {
      id: "5",
      type: "player",
      name: "Sara Ahmed",
      lastMessage: "Can't wait for the next match!",
      timestamp: "2 days ago",
      unreadCount: 0,
      avatar: "https://example.com/player2.jpg",
      isOnline: false,
      lastMessageType: "text",
    },
    {
      id: "6",
      type: "ground_owner",
      name: "Sports Complex",
      lastMessage: "Ground maintenance scheduled for next week",
      timestamp: "1 week ago",
      unreadCount: 0,
      avatar: "https://example.com/ground2.jpg",
      isOnline: false,
      lastMessageType: "text",
    },
  ]);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChatIcon = (type) => {
    switch (type) {
      case "team":
        return "people";
      case "player":
        return "person";
      case "ground_owner":
        return "business";
      default:
        return "chatbubble";
    }
  };

  const getChatTypeColor = (type) => {
    switch (type) {
      case "team":
        return colors.primary.main;
      case "player":
        return colors.secondary.main;
      case "ground_owner":
        return colors.success.main;
      default:
        return colors.text.secondary;
    }
  };

  const handleChatPress = (chat) => {
    navigation.navigate("ChatRoom", { chatId: chat.id, chatName: chat.name });
  };

  const renderChatItem = (chat) => (
    <TouchableOpacity
      key={chat.id}
      style={styles.chatItem}
      onPress={() => handleChatPress(chat)}
    >
      <View style={styles.avatarContainer}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: getChatTypeColor(chat.type) },
          ]}
        >
          <Ionicons
            name={getChatIcon(chat.type)}
            size={24}
            color={colors.text.primary}
          />
        </View>
        {chat.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{chat.name}</Text>
          <Text style={styles.timestamp}>{chat.timestamp}</Text>
        </View>
        <View style={styles.chatFooter}>
          <View style={styles.lastMessageContainer}>
            {chat.lastMessageType === "image" && (
              <Ionicons name="image" size={16} color={colors.text.secondary} />
            )}
            {chat.lastMessageType === "location" && (
              <Ionicons
                name="location"
                size={16}
                color={colors.text.secondary}
              />
            )}
            <Text
              style={styles.lastMessage}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {chat.lastMessage}
            </Text>
          </View>
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyStateTitle}>No chats yet</Text>
      <Text style={styles.emptyStateText}>
        Start a conversation with teams, players, or ground owners
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.text.secondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chat List */}
      <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
        {filteredChats.length > 0
          ? filteredChats.map(renderChatItem)
          : renderEmptyState()}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* New Chat Button */}
      <TouchableOpacity style={styles.newChatButton}>
        <Ionicons name="add" size={24} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
  },
  searchHeader: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark.surfaceColor,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.body.fontSize,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  avatarContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success.main,
    borderWidth: 2,
    borderColor: colors.dark.backgroundColor,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  chatName: {
    ...typography.h3,
    flex: 1,
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.xs,
  },
  lastMessage: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  unreadCount: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xxl,
    marginTop: spacing.xl,
  },
  emptyStateTitle: {
    ...typography.h2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  newChatButton: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    backgroundColor: colors.primary.main,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.button,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default ChatList;
