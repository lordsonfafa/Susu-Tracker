// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { supabase } from "./lib/supabase";

export default function App() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    async function test() {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: process.env.EXPO_PUBLIC_TEST_EMAIL,
        password: process.env.EXPO_PUBLIC_TEST_PASSWORD,
      });
      if (signInError)
        return setMessage("Sign-in failed: " + signInError.message);

      const { data, error } = await supabase.from("groups").select("*");
      if (error) return setMessage("Query failed: " + error.message);
      setMessage("Groups found: " + data.length);
    }
    test();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{message}</Text>
    </View>
  );
}
