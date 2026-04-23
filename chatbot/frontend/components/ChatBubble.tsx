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
        backgroundColor: isUser ? "#1f2937" : "#f3f4f6",
      }}
    >
      <Text style={{ color: isUser ? "white" : "#111827", lineHeight: 20 }}>{text}</Text>
    </View>
  );
}