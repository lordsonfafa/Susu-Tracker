import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import a from "../styles/globalStyles";
import { colors } from "../styles/theme";
import useActiveGroup from "../hooks/useActiveGroup";
import useMemberDetail from "../hooks/useMemberDetail";
// import { isPaid } from "../utils/isPaid";
import { getInitials } from "../utils/initials";
import { Alert } from "react-native"; // add to your react-native import
import supabase from "../lib/supabase";
import useSusuStats from "../hooks/useSusuStats";
import { getNextUnpaidDay, isDayOpen } from "../lib/days";
import { useState } from "react";
import { isPaid } from "../utils/isPaid"; // named import
import { receiptText, sendWhatsApp } from "../lib/sms";

const STATUS = {
  matched: { label: "Paid", pill: a.pillPaid, text: a.pillPaidText },
  flagged: { label: "Review", pill: a.pillAuto, text: a.pillAutoText },
  ignored: { label: "Dismissed", pill: a.pillUnpaid, text: a.pillUnpaidText },
};

export default function MemberDetailScreen({ route, navigation }) {
  const { memberId } = route.params;
  const { group, loading: groupLoading } = useActiveGroup();
  const {
    member,
    loading: memberLoading,
    error,
    reload,
  } = useMemberDetail(memberId);

  const { stats, loading: statsLoading } = useSusuStats(group);
  const [recording, setRecording] = useState(false); // add useState to the react import

  if (groupLoading || memberLoading || statsLoading || !group || !stats) {
    return (
      <SafeAreaView style={a.screen} edges={["top"]}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.navy} />
      </SafeAreaView>
    );
  }

  //checking the number of days user has. paid and calculating the next day
  const currentDay = stats.currentDay;
  //   const daysPaid = new Set(
  //     member.payments.filter((p) => p.status === "matched").map((p) => p.id),
  //   ).size;
  //   let nextDay = 1;
  //   while (daysPaid >= currentDay) {
  //     nextDay++;
  //   }
  const match = member.payments.filter((p) => p.status === "matched");

  // Map to numeric day_numbers (NOT database primary key p.id)
  const paidDaysSet = new Set(
    match.filter((p) => p.day_number != null).map((p) => Number(p.day_number)),
  );

  // Count of distinct days covered
  const daysPaid = paidDaysSet.size;
  //setting next day
  const nextDay = daysPaid + 1;

  const paidToday = isPaid(member, currentDay);
  let arrears = 0;
  for (let d = 1; d < currentDay; d++) if (daysPaid < d) arrears++;
  const upToDate = nextDay > currentDay;

  console.log(member.payments[0]);
  console.log(daysPaid, paidToday, upToDate, nextDay);
  const recordPayment = () => {
    const run = async () => {
      setRecording(true);

      const { day, error: dayError } = await getNextUnpaidDay(member.id);
      if (dayError) {
        Alert.alert(
          "Could not record payment",
          typeof dayError === "string" ? dayError : dayError.message,
        );
        setRecording(false);
        return;
      }

      // the round must still be open for this day
      const check = await isDayOpen(group, day);
      if (!check.open) {
        Alert.alert("Round is full", check.error);
        setRecording(false);
        return;
      }

      const { error: insertError } = await supabase.from("payments").insert({
        member_id: member.id,
        amount: dailyAmount,
        status: "matched",
        date_received: new Date().toISOString().slice(0, 10),
        day_number: day,
        group_id: group.id,
        source: "manual",
      });

      if (insertError) {
        Alert.alert("Could not record payment", insertError.message);
        setRecording(false);
        return;
      }

      reload();
      Alert.alert("Payment recorded", "Send a receipt to this member?", [
        { text: "Not now", style: "cancel" },
        {
          text: "Send receipt",
          onPress: () =>
            sendWhatsApp(
              member.phone,
              receiptText({
                name: member.name,
                amount: dailyAmount,
                day,
                groupName: group.name,
                daysPaid: day, // simple version; see note below
                totalDays: stats?.totalDays ?? "",
              }),
            ),
        },
      ]); // <- use your hook's reload function
      setRecording(false);
    };

    Alert.alert(
      "Record payment?",
      `GHS ${dailyAmount} will be recorded for ${member.name} for Day ${nextDay}.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Record", onPress: run },
      ],
    );
  };

  const goBack = () => navigation.goBack();

  const header = (
    <View style={a.rowBetween}>
      <TouchableOpacity onPress={goBack} hitSlop={12} style={{ width: 40 }}>
        <Svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.navy}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M15 18l-6-6 6-6" />
        </Svg>
      </TouchableOpacity>
      <Text style={a.headerTitle}>Member</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  if (memberLoading) {
    return (
      <SafeAreaView style={a.screen} edges={["top"]}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.navy} />
      </SafeAreaView>
    );
  }

  if (error || !member) {
    return (
      <SafeAreaView style={a.screen} edges={["top"]}>
        <View style={a.body}>
          {header}
          <Text style={[a.muted, a.unpaidText]}>
            {error || "Member not found."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const slotAmount = group?.slot_amount ?? 0;
  const dailyAmount = member.slots * slotAmount;
  const today = new Date().toISOString().slice(0, 10); // e.g. "2026-10-16" (UTC, same as Ghana time)

  //finding total amount paid by member and the number of days theyve paid for
  const matched = member.payments.filter((p) => p.status === "matched");
  const totalPaid = matched.reduce((sum, p) => sum + p.amount, 0);
  //   const daysPaid = new Set(matched.map((p) => p.id)).size;

  //variables that will be used for progresbar and sorted array of payments made
  const received = member.payouts.length;
  const slotsLeft = member.slots - received;
  const history = [...member.payments].sort(
    (x, y) => y.date_received.localeCompare(x.date_received) || y.id - x.id,
  );

  const receivedPct = member.slots === 0 ? 0 : (received / member.slots) * 100;

  return (
    <SafeAreaView style={a.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {header}

        {/* Profile */}
        <View style={[a.cardDark, { alignItems: "center", gap: 10 }]}>
          <View style={[a.avatar, a.avatarLg]}>
            <Text style={[a.avatarText, { fontSize: 18 }]}>
              {getInitials(member.name)}
            </Text>
          </View>
          <Text style={[a.title, { color: "white" }]}>{member.name}</Text>
          <Text style={[a.muted, a.headerTitle, { color: colors.gold }]}>
            {/* {member.slots} slot{member.slots === 1 ? "" : "s"} · GHS{" "} */}
            GHS {dailyAmount} per day
          </Text>
        </View>

        {arrears > 0 && (
          <View style={[a.cardGold, { gap: 4 }]}>
            <Text style={a.textMedium}>
              Owes {arrears} day{arrears === 1 ? "" : "s"}
            </Text>
            <Text style={a.muted}>GHS {arrears * dailyAmount} to catch up</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            a.btn,
            a.btnPrimary,
            (upToDate || recording) && a.btnDisabled,
          ]}
          disabled={upToDate || recording}
          onPress={recordPayment}
        >
          <Text style={[a.btnLabel, a.btnLabelPrimary]}>
            {upToDate
              ? `Paid up for Day ${currentDay}`
              : `Record Day ${nextDay} payment`}
          </Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={a.row}>
          <View style={[a.card, a.grow, { gap: 4 }]}>
            <Text style={[a.textSemibold, { fontWeight: 500 }]}>
              Total paid
            </Text>
            <Text style={[a.textSemibold]}>GHS {totalPaid}</Text>
          </View>
          <View style={[a.card, a.grow, { gap: 4 }]}>
            <Text style={[a.textSemibold, { fontWeight: 500 }]}>Days paid</Text>
            <Text style={[a.textSemibold]}>{daysPaid}</Text>
          </View>
        </View>

        {/* Payout status */}
        <View style={[a.cardDark, { gap: 10 }]}>
          <View style={a.rowBetween}>
            <Text style={[a.textMedium, { color: "white" }]}>
              Payouts received
            </Text>
            <Text style={a.textSemibold}>
              {received} of {member.slots}
            </Text>
          </View>
          <View style={a.progressTrack}>
            <View
              style={[
                a.progressFill,
                { width: `${receivedPct}%`, backgroundColor: colors.gold },
              ]}
            />
          </View>
          <Text style={a.muted}>
            {slotsLeft === 0
              ? "All slots have been paid out."
              : `${slotsLeft} slot${slotsLeft === 1 ? "" : "s"} still waiting to receive`}
          </Text>
        </View>

        {/* History */}
        <Text style={a.sectionTitle}>Payment history</Text>
        {history.length === 0 ? (
          <Text style={a.muted}>No payments yet.</Text>
        ) : (
          <View style={a.listCard}>
            {history.map((p, index) => {
              const s = STATUS[p.status] ?? STATUS.ignored;
              return (
                <View key={p.id}>
                  {index > 0 && <View style={a.divider} />}
                  <View style={a.listRow}>
                    <View style={a.grow}>
                      <Text style={a.textMedium}>GHS {p.amount}</Text>
                      <Text style={a.muted}>{p.date_received}</Text>
                    </View>
                    <View style={[a.pill, s.pill]}>
                      <Text style={[a.pillText, s.text]}>{s.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
