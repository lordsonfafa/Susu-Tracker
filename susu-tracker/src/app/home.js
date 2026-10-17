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
import { Alert } from "react-native"; // add Alert to your existing react-native import
// import { sendSms, reminderText } from "../lib/sms";
import { useState } from "react";
import { Modal } from "react-native";
import { sendWhatsApp, reminderText } from "../lib/sms";

export default function Home() {
  const { group, loading: groupLoading, error: groupError } = useActiveGroup();
  const { members, stats, loading, error, reload } = useSusuStats(group);

  const [remindOpen, setRemindOpen] = useState(false);
  const [reminded, setReminded] = useState({}); // member id -> true

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

  const remind = async (m) => {
    const { error: err } = await sendWhatsApp(
      m.phone,
      reminderText({
        name: m.name,
        amount: m.slots * group.slot_amount,
        day: stats.currentDay,
        groupName: group.name,
      }),
    );
    if (err) Alert.alert("Could not send", err);
    else setReminded((prev) => ({ ...prev, [m.id]: true }));
  };

  const totalSlots = members.reduce((sum, m) => sum + m.slots, 0);

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
        <View style={a.rowBetween}>
          <Text style={a.title}>{group.name}</Text>
          <Text style={a.headerTitle}>SLOTS : {totalSlots}</Text>
        </View>

        <View style={[a.cardDark, { gap: 14 }]}>
          <View style={a.rowBetween}>
            <Text style={[a.muted, { color: colors.textOnDarkMuted }]}>
              Today's collection
            </Text>
            <View
              style={[a.pill, { borderWidth: 1, borderColor: colors.gold }]}
            >
              {stats.totalDays > 0 ? (
                <Text style={[a.pillText, a.pillAutoText]}>
                  Day {stats.currentDay} of {stats.totalDays}
                </Text>
              ) : (
                <Text style={[a.pillText, a.pillAutoText]}>
                  Day {stats.totalDays}
                </Text>
              )}
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
        {/* 
        <Buttons /> */}
        {unpaid.length > 0 && (
          <TouchableOpacity
            style={[a.btn, a.btnOutline]}
            onPress={() => setRemindOpen(true)}
          >
            <Text style={[a.btnLabel, a.btnLabelOutline]}>
              Remind {unpaid.length} member{unpaid.length === 1 ? "" : "s"}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={a.headerTitle}>Still To Pay</Text>
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
      <Modal
        visible={remindOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setRemindOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(27,42,65,0.45)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.bgSurface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: 32,
              gap: 14,
              maxHeight: "75%",
            }}
          >
            <Text style={a.title}>Send reminders</Text>
            <Text style={a.muted}>
              Tap Send to open WhatsApp for each member.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {unpaid.map((m, i) => (
                <View key={m.id}>
                  {i > 0 && <View style={a.divider} />}
                  <View style={a.listRow}>
                    <View style={a.grow}>
                      <Text style={a.textMedium}>{m.name}</Text>
                      <Text style={a.muted}>
                        {m.phone || "No phone number"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      disabled={!m.phone}
                      onPress={() => remind(m)}
                      style={[
                        a.pill,
                        reminded[m.id] ? a.pillPaid : a.pillUnpaid,
                        !m.phone && { opacity: 0.4 },
                      ]}
                    >
                      <Text
                        style={[
                          a.pillText,
                          reminded[m.id] ? a.pillPaidText : a.pillUnpaidText,
                        ]}
                      >
                        {reminded[m.id] ? "Sent" : "Send"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[a.btn, a.btnOutline]}
              onPress={() => setRemindOpen(false)}
            >
              <Text style={[a.btnLabel, a.btnLabelOutline]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
