import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import supabase from "../lib/supabase";
import a from "../styles/globalStyles";
import { colors, radius } from "../styles/theme";
import useActiveGroup from "../hooks/useActiveGroup";
import useRecentPayments from "../hooks/useRecentPayments";
import { getInitials } from "../utils/initials";
import { getNextUnpaidDay } from "../lib/days";
import MenuButton from "../components/MenuButton";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ["2026-10-15", "2026-10-14", "2026-10-13"]  (today first)
const lastDays = (n) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    return d.toISOString().slice(0, 10);
  });

const labelFor = (dateStr, index) => {
  if (index === 0) return "Today";
  if (index === 1) return "Yesterday";
  const [, m, d] = dateStr.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
};

// "2026-10-15T09:42:00+00:00" -> "09:42" (Ghana is UTC+0)
const timeOf = (iso) => iso.slice(11, 16);

const smallBtn = {
  flex: 1,
  height: 38,
  borderRadius: radius.pill,
  borderWidth: 1,
  borderColor: colors.navy,
  alignItems: "center",
  justifyContent: "center",
};

export default function PaymentsScreen() {
  const { group, loading: groupLoading, error: groupError } = useActiveGroup();
  const days = lastDays(3);
  const { payments, loading, error, reload } = useRecentPayments(
    group?.id,
    days[2],
  );

  const [dayIndex, setDayIndex] = useState(0);
  const [resolvingId, setResolvingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  // --- derived lists (payments arrive newest first) ---
  const flagged = payments.filter((p) => p.status === "needs_review");
  const matched = payments.filter((p) => p.status === "matched");
  const latest = matched[0];
  const selectedDate = days[dayIndex];
  const dayPayments = matched.filter((p) => p.date_received === selectedDate);

  //resolving the flag status with a function
  const resolveFlagged = async (payment, newStatus) => {
    let changes = { status: newStatus };

    if (newStatus === "matched") {
      const { day, error: dayErr } = await getNextUnpaidDay(payment.member_id);
      if (dayErr) return Alert.alert("Error", dayErr);
      const check = await isDayOpen(group, day);
      if (!check.open) return Alert.alert("Round is full", check.error);
    }

    const { error: err } = await supabase
      .from("payments")
      .update(changes)
      .eq("id", payment.id);
    return err;
  };

  //calculating the total amount collected in a day using reduce method
  const dayTotal = dayPayments.reduce((sum, p) => sum + p.amount, 0); // replace this

  const handleResolve = (payment, newStatus) => {
    const run = async () => {
      setResolvingId(payment.id);
      const err = await resolveFlagged(p, newStatus);
      if (err) Alert.alert("Could not update payment", err.message);
      else await reload();
      setResolvingId(null);
    };

    if (newStatus === "ignored") {
      Alert.alert(
        "Dismiss this payment?",
        `GHS ${payment.amount} from ${payment.members.name} will not count as paid.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Dismiss", style: "destructive", onPress: run },
        ],
      );
    } else {
      run();
    }
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
          <Text style={a.title}>Payments</Text>
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
          <Text style={[a.headerTitle, { fontWeight: 700 }]}>Payments</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Needs review: flagged SMS payments */}
        {flagged.length > 0 && (
          <View style={[a.cardGold, { gap: 12, padding: 10 }]}>
            <View style={a.rowBetween}>
              <Text style={[a.textSemibold, a.gold, { letterSpacing: 1 }]}>
                NEEDS REVIEW
              </Text>
              <View
                style={[
                  a.pill,
                  a.pillAuto,
                  { backgroundColor: colors.bgSurface },
                ]}
              >
                <Text style={[a.pillText, a.pillAutoText]}>
                  {flagged.length}
                </Text>
              </View>
            </View>

            {flagged.map((p) => {
              const busy = resolvingId === p.id;
              return (
                <View
                  key={p.id}
                  style={{
                    backgroundColor: colors.bgSurface,
                    borderRadius: radius.md,
                    padding: 12,
                    gap: 12,
                  }}
                >
                  <View style={a.row}>
                    <View style={a.avatar}>
                      <Text style={a.avatarText}>
                        {getInitials(p.members.name)}
                      </Text>
                    </View>
                    <View style={a.grow}>
                      <View style={a.rowBetween}>
                        <Text
                          style={[
                            a.headerTitle,
                            { marginBottom: 5, fontWeight: 800 },
                          ]}
                        >
                          REVIEW PAYMENT
                        </Text>
                        <Text
                          style={[a.textSemibold, { textAlignVertical: "top" }]}
                        >
                          {timeOf(p.time_received)}
                        </Text>
                      </View>
                      <Text style={a.textMedium}>
                        {p.members.name} tried to make a payment of {p.amount}{" "}
                        on {p.date_received}
                      </Text>
                    </View>
                  </View>
                  <View style={a.row}>
                    <TouchableOpacity
                      style={[
                        smallBtn,
                        { backgroundColor: colors.navy },
                        busy && a.btnDisabled,
                      ]}
                      disabled={busy}
                      onPress={() => handleResolve(p, "matched")}
                    >
                      <Text style={[a.btnLabel, a.btnLabelPrimary]}>
                        Confirm
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[smallBtn, busy && a.btnDisabled]}
                      disabled={busy}
                      onPress={() => handleResolve(p, "ignored")}
                    >
                      <Text style={[a.btnLabel, a.btnLabelOutline]}>
                        Dismiss
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Latest detected */}
        {latest && (
          <View style={[a.card, { gap: 12 }]}>
            <View style={a.rowBetween}>
              <Text
                style={[
                  a.textSemibold,
                  a.gold,
                  { fontSize: 11, letterSpacing: 1 },
                ]}
              >
                LATEST DETECTED
              </Text>
              <Text style={a.muted}>
                {latest.date_received === days[0]
                  ? "Today"
                  : latest.date_received}{" "}
                · {timeOf(latest.time_received)}
              </Text>
            </View>
            <View style={a.row}>
              <View style={a.avatar}>
                <Text style={a.avatarText}>
                  {getInitials(latest.members.name)}
                </Text>
              </View>
              <View style={a.grow}>
                <Text style={a.textMedium}>{latest.members.name}</Text>
                <Text style={a.muted}>GHS {latest.amount}</Text>
              </View>
              <View style={[a.pill, a.pillPaid]}>
                <Text style={[a.pillText, a.pillPaidText]}>Paid</Text>
              </View>
            </View>
          </View>
        )}

        {/* Day tabs */}
        <View style={a.segmented}>
          {days.map((d, i) => {
            const active = dayIndex === i;
            return (
              <TouchableOpacity
                key={d}
                style={[a.segmentedTab, active && a.segmentedTabActive]}
                onPress={() => setDayIndex(i)}
              >
                <Text
                  style={[a.segmentedLabel, active && a.segmentedLabelActive]}
                >
                  {labelFor(d, i)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Day total + list */}
        <View style={a.rowBetween}>
          <Text style={a.title}>Collected</Text>
          <Text style={[a.textSemibold, a.paidText]}>GHS {dayTotal}</Text>
        </View>

        {dayPayments.length === 0 ? (
          <Text style={a.muted}>No payments on this day.</Text>
        ) : (
          <View style={a.listCard}>
            {dayPayments.map((p, index) => (
              <View key={p.id}>
                {index > 0 && <View style={a.divider} />}
                <View style={a.listRow}>
                  <View style={a.avatar}>
                    <Text style={a.avatarText}>
                      {getInitials(p.members.name)}
                    </Text>
                  </View>
                  <View style={a.grow}>
                    <Text style={a.textMedium}>{p.members.name}</Text>
                    <Text style={a.muted}>{timeOf(p.time_received)}</Text>
                  </View>
                  <Text style={[a.textSemibold, a.paidText]}>
                    +GHS {p.amount}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
