import { useCallback, useEffect, useState } from "react";
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
import supabase from "../lib/supabase";
import Buttons from "../components/buttons";
import { computeStats } from "../lib/susuStats";
import useActiveGroup from "../hooks/useActiveGroup";
import ListCards from "../components/listcards";

export default function Home() {
  const { group, loading, error: groupError } = useActiveGroup();
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  const loadStats = useCallback(async () => {
    const { data, error } = await supabase
      .from("members")
      .select("id, slots, payments(amount, status, date_received)")
      .eq("group_id", group.id);

    if (error) {
      setStatsError(error.message);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    setStats(computeStats(data, group, today));
    setStatsError("");
  }, [group]);

  useEffect(() => {
    if (!group) return;

    loadStats();

    // refresh the summary whenever a payment is added or changed
    const channel = supabase
      .channel(`home-${group.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => loadStats(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [group, loadStats]);

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} color={colors.navy} />;
  if (groupError)
    return <Text style={[a.muted, a.unpaidText]}>{groupError}</Text>;
  if (!group) return <Text style={a.muted}>No group yet.</Text>;
  if (statsError) {
    return (
      <TouchableOpacity onPress={loadStats}>
        <Text style={[a.muted, a.unpaidText]}>{statsError} Tap to retry.</Text>
      </TouchableOpacity>
    );
  }
  if (!stats)
    return <ActivityIndicator style={{ flex: 1 }} color={colors.navy} />;

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
        <Text style={a.headerTitle}>Home</Text>
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

        <Text style={a.sectionTitle}>Still to pay</Text>
        <ListCards groupId={group.id} slotAmount={group.slot_amount} />
      </ScrollView>
    </SafeAreaView>
  );
}
