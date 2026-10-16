import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Tabs from "./Tabs";
import MemberDetailScreen from "../app/memberDetail";
import AddMemberScreen from "../app/addMember";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={Tabs} />
      <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
      <Stack.Screen name="AddMember" component={AddMemberScreen} />
    </Stack.Navigator>
  );
}
