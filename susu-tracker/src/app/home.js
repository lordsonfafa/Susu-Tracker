import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import a from "../styles/globalStyles";
import { colors, fonts } from "../styles/theme";
import Buttons from "../components/buttons";
import useActiveGroup from "../hooks/useActiveGroup";
import useSusuStats from "../hooks/useSusuStats";
import ListCards from "../components/listcards";
import { isPaid } from "../utils/isPaid";
import MenuButton from "../components/MenuButton";

export default function Home() {
  const { group, loading: groupLoading, error: groupError } = useActiveGroup();
  const { members, stats, loading, error, reload } = useSusuStats(group);

  if (groupLoading || (group && (loading || (!stats && !error)))) {
    return (
      <SafeAreaView style={a.screen} edges={["top"]}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.navy} />
      </SafeAreaView>
    );
  }

  if (groupError || error) {
    return (
      <SafeAreaView style={a.screen} edges={["top"]}>
        <View style={a.body}>
          <Text style={a.headerTitle}>Home</Text>
          <TouchableOpacity onPress={reload}>
            <Text style={[a.muted, a.unpaidText]}>
              {groupError || error} Tap to retry.
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!group || !stats) {
    return (
      <SafeAreaView style={a.screen} edges={["top"]}>
        <View style={a.body}>
          <Text style={a.headerTitle}>Home</Text>
          <Text style={a.muted}>No group yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unpaid = members.filter((m) => !isPaid(m, stats.currentDay));

  const pct =
    stats.expectedToday === 0
      ? 0
      : Math.min(100, (stats.collectedToday / stats.expectedToday) * 100);
  const toGo = Math.max(0, stats.expectedToday - stats.collectedToday);

  return (
    <SafeAreaView style={a.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={a.rowBetween}>
          <View style={{ width: 40 }}>
            <MenuButton />
          </View>
          <Text style={[a.headerTitle, { fontWeight: 700 }]}>Home</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={a.title}>{group.name}</Text>

        <View style={[a.cardDark, { gap: 14 }]}>
          <View style={a.rowBetween}>
            <Text style={[a.muted, { color: colors.textOnDarkMuted }]}>
              Today's collection
            </Text>
            <View
              style={[a.pill, { borderWidth: 1, borderColor: colors.gold }]}
            >
              <Text style={[a.pillText, a.pillAutoText]}>
                Day {stats.currentDay} of {stats.totalDays}
              </Text>
            </View>
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}
          >
            <Text
              style={{
                fontFamily: fonts.semibold,
                fontSize: 34,
                color: colors.textOnDark,
              }}
            >
              GHS {stats.collectedToday}
            </Text>
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: 14,
                color: colors.textOnDarkMuted,
                paddingBottom: 6,
              }}
            >
              of GHS {stats.expectedToday}
            </Text>
          </View>

          <View style={[a.progressTrack, a.progressTrackDark]}>
            <View style={[a.progressFill, { width: `${pct}%` }]} />
          </View>

          <View style={a.rowBetween}>
            <Text style={[a.muted, { color: colors.textOnDarkMuted }]}>
              {stats.paidCount} members paid
            </Text>
            <Text
              style={[
                a.muted,
                { color: colors.gold, fontFamily: fonts.medium },
              ]}
            >
              GHS {toGo} to go
            </Text>
          </View>
        </View>

        <Buttons />

        <Text style={a.sectionTitle}>Still To Pay</Text>
        <ListCards
          members={unpaid}
          slotAmount={group.slot_amount}
          currentDay={stats.currentDay}
          emptyText={
            members.length === 0
              ? "No members in this group yet."
              : `Everyone has paid Day ${stats.currentDay}.`
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
