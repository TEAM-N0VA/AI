import React from "react";
import { Text, View } from "react-native";
import { ChatRole } from "../lib/types";

export function ChatBubble({ role, text }: { role: ChatRole; text: string }) {
  const isUser = role === "user";
  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "86%",
        marginVertical: 6,
        padding: 12,
        borderRadius: 16,
        backgroundColor: isUser ? "#2B2F3A" : "#ffffff",
        
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <Text style={{ color: isUser ? "white" : "#111827", lineHeight: 20 }}>{text}</Text>
    </View>
  );
}