import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Evidence } from "../lib/types";

export function EvidenceCard({ evidence }: { evidence: Evidence[] }) {
  const [open, setOpen] = useState(false);

  if (!evidence?.length) return null;

  return (
    <View style={{ marginTop: 10, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, overflow: "hidden" }}>
      <Pressable onPress={() => setOpen(!open)} style={{ padding: 12, backgroundColor: "#ffffff" }}>
        <Text style={{ fontWeight: "700", color: "#111827" }}>
          근거(FAQ) {open ? "숨기기" : "보기"} · {evidence.length}개
        </Text>
        <Text style={{ color: "#6b7280", marginTop: 4 }}>답변이 어떤 FAQ에서 왔는지 보여줘요.</Text>
      </Pressable>

      {open && (
        <View style={{ padding: 12, backgroundColor: "#fafafa", gap: 10 }}>
          {evidence.slice(0, 3).map((e, idx) => (
            <View key={idx} style={{ padding: 10, borderRadius: 12, backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb" }}>
              <Text style={{ fontWeight: "700", color: "#111827" }}>
                {e.meta?.qid ? `#${e.meta.qid}` : `근거 ${idx + 1}`} · {e.source ?? "curated_faq"}
              </Text>
              {!!e.snippet && <Text style={{ color: "#111827", marginTop: 6, lineHeight: 19 }}>{e.snippet}</Text>}
              {!!e.score && <Text style={{ color: "#6b7280", marginTop: 6 }}>score: {e.score.toFixed(3)}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}