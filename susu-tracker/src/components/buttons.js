import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import a from "../styles/globalStyles";

const Buttons = () => {
  return (
    <View style={a.rowBetween}>
      <TouchableOpacity
        onPress={() => pass}
        style={[a.btn, a.btnOutline, { width: "50%" }]}
      >
        <Text style={a.btnLabelOutline}>Send Reminders</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => pass}
        style={[a.btn, a.btnPrimary, { width: "45%" }]}
      >
        <Text style={a.btnLabelPrimary}>Mark Paid</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Buttons;
