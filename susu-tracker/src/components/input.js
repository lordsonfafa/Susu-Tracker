import React, { useState } from "react";
import { StyleSheet, TextInput, View, Text } from "react-native";
import a from "../styles/globalStyles";

const Input = ({ type, placeholder, secure, icon, action, error }) => {
  const [active, setActive] = useState(false);
  return (
    <View>
      <View
        style={[
          a.input,
          active && a.inputFocused,
          Boolean(error) && a.inputError,
        ]}
      >
        <View>{icon}</View>
        <TextInput
          style={a.inputText}
          keyboardType={type}
          placeholder={placeholder}
          secureTextEntry={secure}
          onChangeText={action}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
        />
      </View>
      {Boolean(error) && (
        <Text style={[a.muted, a.unpaidText, { marginTop: 4 }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    padding: 20,
  },
});
export default Input;
