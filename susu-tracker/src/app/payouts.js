import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import g from "../styles/globalStyles";

export default function PayoutsScreen() {
  return (
    <SafeAreaView style={g.screen} edges={["top"]}>
      <View style={g.body}>
        <Text style={g.title}>Payouts</Text>
      </View>
    </SafeAreaView>
  );
}
