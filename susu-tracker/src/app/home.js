import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import a from "../styles/globalStyles";
import supabase from "../lib/supabase";

export default function Home() {
  return (
    <SafeAreaView style={a.screen} edges={["top"]}>
      <View style={a.body}>
        <Text style={a.headerTitle}>Home</Text>
        <Text style={a.title}>Welcome Back!</Text>
        <view style={[a.card, a.cardDark]}>
          <View style={a.rowBetween}>
            <Text style={a.title}>Today's Collection</Text>
            <View style={a.pill}>
              <Text style={a.pillAutoText}>Day 7 of 20</Text>
            </View>
          </View>
          <View>
            <Text style={a.sectionTitle}>GHS 70</Text>
            <Text style={[a.textSemibold, a, nuted]}>of GHS 100</Text>
          </View>
        </view>
      </View>
    </SafeAreaView>
  );
}

// <TouchableOpacity
//   style={[g.btn, g.btnOutline]}
//   onPress={() => supabase.auth.signOut()}
// >
{
  /* <Text style={[g.btnLabel, g.btnLabelOutline]}>SIGN OUT</Text>
</TouchableOpacity> */
}
