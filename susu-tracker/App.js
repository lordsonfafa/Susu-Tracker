import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import supabase from "./src/lib/supabase";
import LoginScreen from "./src/app/login";
import Tabs from "./src/navigation/Tabs";
import { GroupProvider } from "./src/context/GroupContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setChecking(false));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {session ? (
        <GroupProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </GroupProvider>
      ) : (
        <LoginScreen />
      )}
    </SafeAreaProvider>
  );
}
