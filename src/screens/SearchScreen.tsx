import React, { useEffect, useRef } from "react";
import { StyleSheet, TextInput, View, Image } from "react-native";

export const SearchScreen: React.FC = () => {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300); // delay nhẹ cho chắc ăn khi vừa navigate
    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Image
          source={require("../../assets/searchIcon.png")}
          style={{ marginRight: 8, width: 20, height: 20 }}
        />
        <TextInput
          ref={inputRef}
          placeholder="Super sale 10.10 with 30% dea..."
          returnKeyType="search"
          style={styles.textInput}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
});
