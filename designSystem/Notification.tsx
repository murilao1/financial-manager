// components/Notification.tsx
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useTheme } from "react-native-paper";

type NotificationProps = {
  message: string;
  type?: "error" | "success" | "info";
  duration?: number; // tempo em ms
  onHide?: () => void;
};

export default function Notification({ message, type = "info", duration = 3000, onHide }: NotificationProps) {
  const theme = useTheme();
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    // animação de entrada
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    // animação de saída
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const backgroundColor =
    type === "error" ? theme.colors.error :
      type === "success" ? theme.colors.primary :
        theme.colors.secondary;

  return (
    <Animated.View style={[styles.container, { backgroundColor, opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    zIndex: 2000,
    elevation: 6,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
