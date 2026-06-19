// app/index.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 20, gap: 14, backgroundColor: "white" }}>
      <Text style={{ fontSize: 26, fontWeight: "800", color: "#111827" }}>밀당</Text>
      <Text style={{ color: "#6b7280", lineHeight: 20 }}>
        임신성 당뇨(GDM) FAQ 챗봇{"\n"}근거(FAQ) 기반 답변 · 한국어 전용
      </Text>

      <Pressable
        onPress={() => router.push("/faq-chat")}
        style={{ padding: 16, borderRadius: 16, backgroundColor: "#8B5C8B", alignItems: "center", marginTop: 10 }}
      >
        <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>FAQ 챗 시작하기</Text>
      </Pressable>

      <View style={{ marginTop: 18, padding: 14, borderRadius: 16, backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb" }}>
        <Text style={{ fontWeight: "800", color: "#111827" }}>사용 팁</Text>
        <Text style={{ marginTop: 8, color: "#374151", lineHeight: 20 }}>
          예) “식후 1시간 145”, “공복 102”, “외식 중(메뉴: …)”, “편의점 간식 추천”
        </Text>
      </View>
    </View>
  );
}