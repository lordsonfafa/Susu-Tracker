import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "../styles/theme";
import HomeScreen from "../app/home";
import MembersScreen from "../app/members";
import PayoutsScreen from "../app/payouts";
import PaymentScreen from "../app/payments";

const Tab = createBottomTabNavigator();

const ICONS = {
  home: (
    <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  ),
  users: (
    <>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  receipt: (
    <>
      <Path d="M4 3h16v18l-3-2-2.5 2L12 19l-2.5 2L7 19l-3 2z" />
      <Path d="M8 8h8M8 12h8" />
    </>
  ),
  wallet: (
    <>
      <Path d="M3 7a2 2 0 0 1 2-2h14v4" />
      <Path d="M3 7v11a2 2 0 0 0 2 2h16V9H5a2 2 0 0 1-2-2z" />
      <Circle cx="17" cy="14.5" r="1.2" />
    </>
  ),
};

const icon =
  (name) =>
  ({ color, size }) => (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </Svg>
  );

export default function Tabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.bgSurface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: icon("home") }}
      />
      <Tab.Screen
        name="Members"
        component={MembersScreen}
        options={{ tabBarIcon: icon("users") }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentScreen}
        options={{ tabBarIcon: icon("receipt") }}
      />
      <Tab.Screen
        name="Payouts"
        component={PayoutsScreen}
        options={{ tabBarIcon: icon("wallet") }}
      />
    </Tab.Navigator>
  );
}
