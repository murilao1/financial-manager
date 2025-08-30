import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ViewStyle,
} from "react-native";
import { TextInput, useTheme } from 'react-native-paper';
import { useIsFocused } from "@react-navigation/native";

type Option = { label: string; value: string };

type SelectProps = {
  label: string;
  options: Option[];
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: ViewStyle; // estilo do container
  mode?: "outlined" | "flat";
  disabled?: boolean;
  error?: boolean;
};

export default function Select({
                                 label,
                                 options,
                                 value = null,
                                 onChange,
                                 placeholder = "Selecione...",
                                 style,
                                 mode = "outlined",
                                 disabled = false,
                                 error = false,
                               }: SelectProps) {
  const [visible, setVisible] = useState(false);
  const [inputWidth, setInputWidth] = useState(0);
  const isFocused = useIsFocused();
  const theme = useTheme();

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  useEffect(() => {
    if (!isFocused) {
      setVisible(false);
    }
  }, [isFocused]);

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={styles.anchor}
        onLayout={(e) => setInputWidth(e.nativeEvent.layout.width)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => !disabled && setVisible(!visible)}
        >
        <TextInput
          mode={mode}
          label={label}
          value={selectedLabel || ""}
          placeholder={selectedLabel ? undefined : placeholder}
          editable={false}
          pointerEvents="none"
          right={{ icon: "menu-down" }}
          error={error}
          disabled={disabled}
          style={styles.input}
          onPressIn={() => !disabled && setVisible(true)}
        />
        </TouchableOpacity>
        {visible && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setVisible(false)}
          />
        )}
      </View>

      {visible && (
        <View style={[styles.dropdown, {
          width: inputWidth,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.primary
        }]}>
          <FlatList
            data={options}
            scrollEnabled={false}
            keyExtractor={(item) => item.value}
            style={[styles.flatList, { backgroundColor: theme.colors.surface }]}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: theme.colors.primary }]} />
            )}
            renderItem={({ item }) => {
              const selected = item.value === value;
              return (
                <TouchableOpacity
                  style={[
                    styles.option,
                    selected && { backgroundColor: theme.colors.surface },
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      { color: theme.colors.primary },
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    position: "relative",
  },
  anchor: {
    width: "100%",
  },
  input: {
    width: "100%",
  },
  dropdown: {
    position: "absolute",
    top: 55,
    borderRadius: 4,
    zIndex: 1000,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    paddingBottom: 0
  },
  flatList: {
    maxHeight: 320,
    borderRadius: 4,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  optionTextSelected: {
    fontWeight: "bold",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 8,
  },
});
