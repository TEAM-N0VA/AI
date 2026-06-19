import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ChatBubble } from "../components/ChatBubble";
import { chat } from "../lib/api";
import { ChatMsg } from "../lib/types";

type UiMsg = ChatMsg & { id: string };

const quickChips = [
  "식후 1시간 145인데 다음 식사는?",
  "식후 2시간 125인데 괜찮아?",
  "공복 102인데 뭐 조절해?",
  "외식 중인데 주문 팁",
  "편의점 간식 추천",
];

export default function FaqChat() {
  const listRef = useRef<FlatList<UiMsg>>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [messages, setMessages] = useState<UiMsg[]>([
    { id: "a0", role: "assistant", content: "안녕하세요! 임당 FAQ 챗이에요. 공복/식후 시점과 수치를 같이 적어주면 더 정확해요." },
  ]);

  const historyForServer = useMemo<ChatMsg[]>(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  useEffect(() => {
    // 메시지 추가될 때 아래로 스크롤
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const user: UiMsg = { id: `u_${Date.now()}`, role: "user", content: trimmed };
    setMessages((prev) => [...prev, user]);
    setInput("");
    setLoading(true);

    try {
      const res = await chat(trimmed, historyForServer);
      const bot: UiMsg = { id: `b_${Date.now()}`, role: "assistant", content: res.answer };
      setMessages((prev) => [...prev, bot]);
      setEvidence(res.evidence ?? []);
    } catch (e: any) {
      const bot: UiMsg = {
        id: `b_${Date.now()}`,
        role: "assistant",
        content: `에러가 발생했어요.\n${e?.message ?? ""}\n\n(backend 주소/포트, 네트워크를 확인해주세요.)`,
      };
      setMessages((prev) => [...prev, bot]);
      setEvidence([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8EEF6" }}>
      <LinearGradient
        colors={["#F8EEF6", "#FFFFFF"]}
        locations={[0, 0.45]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1}}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
      >
        {/* Message list area */}
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <ChatBubble role={item.role} text={item.content} />}
            contentContainerStyle={{ paddingBottom: 14 }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          />

        </View>

        {/* Input area (always visible) */}
        <View style={{ paddingHorizontal: 14, paddingBottom: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F0E6EF" }}>
          {/* prettier chips */}
          <FlatList
            horizontal
            data={quickChips}
            keyExtractor={(x) => x}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => send(item)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: "#ffffff",
                  borderWidth: 1,
                  borderColor: "#E9D5E5",
                }}
              >
                <Text style={{ color: "#6B4F6B", fontWeight: "600" }}>{item}</Text>
              </Pressable>
            )}
          />

          <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-end" }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="예: 식후 1시간 145 / 외식 중(메뉴: …)"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#E9D5E5",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: "#ffffff",
                maxHeight: 120,
              }}
              multiline
              blurOnSubmit={false}
            />

            <Pressable
              onPress={() => send(input)}
              disabled={loading}
              style={{
                width: 62,
                height: 56,
                borderRadius: 16,
                backgroundColor: loading ? "#C4B5C4" : "#8B5C8B",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: "white", fontWeight: "700" }}>전송</Text>}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}