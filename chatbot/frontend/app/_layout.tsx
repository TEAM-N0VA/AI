/*import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "MealDang" }} />
      <Stack.Screen name="faq-chat" options={{ title: "임당 FAQ 챗" }} />
    </Stack>
  );
}*/

import { Stack } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#F8EEF6",
        },
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerTintColor: "#4B3B4B",

        headerBackTitle: "",

        headerTitle: () => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#4B3B4B",
                marginRight: 6,
              }}
            >
              밀당
            </Text>

            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </View>
        ),
      }}
    >
      <Stack.Screen name="index" options={{}} />
      <Stack.Screen name="faq-chat" options={{}} />
    </Stack>
  );
}