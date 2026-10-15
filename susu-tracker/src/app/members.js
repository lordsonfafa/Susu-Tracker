import { useState } from "react";
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
import useTodayMembers from "../hooks/useTodayMembers";
import { isPaid } from "../utils/isPaid";
import ListCards from "../components/listcards";

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

export default function MembersScreen() {
  const { group, loading: groupLoading, error: groupError } = useActiveGroup();
  const { members, loading, error, reload } = useTodayMembers(group?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  //deciding which data to show based on the tab chosen
  let visible;
  if (tab === "all") {
    visible = members.filter((m) =>
      m.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
  } else if (tab === "paid") {
    visible = members.filter(
      (m) =>
        isPaid(m) && m.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
  } else {
    visible = members.filter(
      (m) =>
        !isPaid(m) && m.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }

  //updating counts of the different tabs
  const counts = {
    all: members.length,
    paid: members.filter((m) => isPaid(m)).length,
    unpaid: members.filter((m) => !isPaid(m)).length,
  };

  if (groupLoading || (group && loading)) {
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
          <View style={{ width: 40 }} />
          <Text style={a.headerTitle}>Members</Text>
          <TouchableOpacity
            style={{ width: 40, alignItems: "flex-end" }}
            onPress={() => {}}
          >
            <Icon color={colors.navy}>
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
          slotAmount={group.slot_amount}
          emptyText={
            members.length === 0
              ? "No members in this group yet."
              : "No members match your search."
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
