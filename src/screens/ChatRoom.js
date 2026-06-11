import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

const ChatRoom = ({ navigation, route }) => {
  const { chatId, chatName } = route.params;
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const [messages] = useState([
    {
      id: "1",
      text: "Hey! Are you ready for the match tomorrow?",
      sender: "them",
      timestamp: "10:30 AM",
      type: "text",
    },
    {
      id: "2",
      text: "Yes, I'm excited! What time should we meet?",
      sender: "me",
      timestamp: "10:32 AM",
      type: "text",
    },
    {
      id: "3",
      text: "Let's meet at 5 PM at the ground entrance",
      sender: "them",
      timestamp: "10:33 AM",
      type: "text",
    },
    {
      id: "4",
      text: "Perfect! I'll bring the team jerseys",
      sender: "me",
      timestamp: "10:35 AM",
      type: "text",
    },
    {
      id: "5",
      text: "Great! Don't forget the water bottles too",
      sender: "them",
      timestamp: "10:36 AM",
      type: "text",
    },
    {
      id: "6",
      text: "Sure thing! See you tomorrow",
      sender: "me",
      timestamp: "10:37 AM",
      type: "text",
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, you would send this message to your backend
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleAttachment = () => {
    // Handle file/image attachment
    console.log("Attachment pressed");
  };

  const handleLocation = () => {
    // Handle location sharing
    console.log("Location pressed");
  };

  const renderMessage = (msg) => (
    <View
      key={msg.id}
      style={[
        styles.messageContainer,
        msg.sender === "me" ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          msg.sender === "me" ? styles.myBubble : styles.theirBubble,
        ]}
      >
        {msg.type === "text" && (
          <Text
            style={[
              styles.messageText,
              msg.sender === "me"
                ? styles.myMessageText
                : styles.theirMessageText,
            ]}
          >
            {msg.text}
          </Text>
        )}
        {msg.type === "image" && (
          <View style={styles.imageMessage}>
            <Ionicons name="image" size={40} color={colors.text.secondary} />
            <Text style={styles.imageText}>Image</Text>
          </View>
        )}
        {msg.type === "location" && (
          <View style={styles.locationMessage}>
            <Ionicons name="location" size={40} color={colors.text.secondary} />
            <Text style={styles.locationText}>Location shared</Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.timestamp,
          msg.sender === "me" ? styles.myTimestamp : styles.theirTimestamp,
        ]}
      >
        {msg.timestamp}
      </Text>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.theirMessage]}>
      <View style={[styles.messageBubble, styles.theirBubble]}>
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Chat Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.chatName}>{chatName}</Text>
          <Text style={styles.chatStatus}>Online</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollViewRef.current.scrollToEnd({ animated: true })
        }
      >
        {messages.map(renderMessage)}
        {isTyping && renderTypingIndicator()}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={handleAttachment}
          >
            <Ionicons name="add" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.text.secondary}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleLocation}
          >
            <Ionicons name="location" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={
                message.trim() ? colors.text.primary : colors.text.disabled
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.dark.surfaceColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  chatName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  chatStatus: {
    ...typography.caption,
    color: colors.success.main,
  },
  moreButton: {
    padding: spacing.sm,
  },
  messagesContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  theirMessage: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  myBubble: {
    backgroundColor: colors.primary.main,
  },
  theirBubble: {
    backgroundColor: colors.dark.surfaceColor,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: colors.text.primary,
  },
  theirMessageText: {
    color: colors.text.primary,
  },
  imageMessage: {
    alignItems: "center",
    padding: spacing.md,
  },
  imageText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  locationMessage: {
    alignItems: "center",
    padding: spacing.md,
  },
  locationText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.secondary,
    alignSelf: "flex-end",
  },
  myTimestamp: {
    alignSelf: "flex-end",
  },
  theirTimestamp: {
    alignSelf: "flex-start",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.secondary,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  inputContainer: {
    padding: spacing.lg,
    backgroundColor: colors.dark.surfaceColor,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  attachmentButton: {
    padding: spacing.sm,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: colors.dark.backgroundColor,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    maxHeight: 100,
  },
  textInput: {
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: 16,
    textAlignVertical: "top",
  },
  locationButton: {
    padding: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary.main,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.dark.surfaceColor,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default ChatRoom;
