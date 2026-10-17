import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import a from "../styles/globalStyles";
import { colors } from "../styles/theme";
import useActiveGroup from "../hooks/useActiveGroup";
import useSusuStats from "../hooks/useSusuStats";
import { isPaid } from "../utils/isPaid";
import ListCards from "../components/listcards";
import MenuButton from "../components/MenuButton";

const TABS = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "unpaid", label: "Unpaid" },
];

const Icon = ({ children, color }) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);

export default function MembersScreen({ navigation }) {
  const { group, loading: groupLoading, error: groupError } = useActiveGroup();
  // const { members, loading, error, reload } = useTodayMembers(group?.id);

  const { members, stats, loading, error, reload } = useSusuStats(group);
  const day = stats?.currentDay;
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  //reloading the screen after visiting add member screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", reload);
    return unsubscribe;
  }, [navigation, reload]);

  //deciding which data to show based on the tab chosen
  let visible;
  if (tab === "all") {
    visible = members.filter((m) =>
      m.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
  } else if (tab === "paid") {
    visible = members.filter(
      (m) =>
        isPaid(m, day) &&
        m.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
  } else {
    visible = members.filter(
      (m) =>
        !isPaid(m, day) &&
        m.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }

  //updating counts of the different tabs
  const counts = {
    all: members.length,
    paid: members.filter((m) => isPaid(m, day)).length,
    unpaid: members.filter((m) => !isPaid(m, day)).length,
  };

  if (groupLoading || (group && (loading || !stats))) {
    return (
      <SafeAreaView style={a.screen} edges={["top"]}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.navy} />
      </SafeAreaView>
    );
  }

  if (groupError || !group || error) {
    return (
      <SafeAreaView style={a.screen} edges={["top"]}>
        <View style={a.body}>
          <Text style={a.title}>Members</Text>
          {groupError || error ? (
            <TouchableOpacity onPress={reload}>
              <Text style={[a.muted, a.unpaidText]}>
                {groupError || error} Tap to retry.
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={a.muted}>No group yet.</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={a.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.navy}
          />
        }
      >
        <View style={a.rowBetween}>
          <View style={{ width: 40 }}>
            <MenuButton />
          </View>
          <Text style={[a.headerTitle, { fontWeight: 700 }]}>Members</Text>
          <TouchableOpacity
            style={{ width: 40, alignItems: "flex-end" }}
            onPress={() => navigation.navigate("AddMember")}
          >
            <Icon style={{ width: 30, height: 30 }} color={colors.navy}>
              <Path d="M12 5v14M5 12h14" />
            </Icon>
          </TouchableOpacity>
        </View>

        <View style={[a.input, { height: 46 }]}>
          <Icon color={colors.textSecondary}>
            <Circle cx="11" cy="11" r="7" />
            <Path d="m20 20-3.5-3.5" />
          </Icon>
          <TextInput
            style={a.inputText}
            placeholder="Search by MoMo name"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={a.segmented}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[a.segmentedTab, active && a.segmentedTabActive]}
                onPress={() => setTab(t.key)}
              >
                <Text
                  style={[a.segmentedLabel, active && a.segmentedLabelActive]}
                >
                  {t.label} · {counts[t.key]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ListCards
          members={visible}
          currentDay={day}
          slotAmount={group.slot_amount}
          emptyText={
            members.length === 0
              ? "No members in this group yet."
              : "No members match your search."
          }
          onPressMember={(m) =>
            navigation.navigate("MemberDetail", { memberId: m.id })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
