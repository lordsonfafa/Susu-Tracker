import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import supabase from "../lib/supabase";
import a from "../styles/globalStyles";
import { colors, radius } from "../styles/theme";
import useActiveGroup from "../hooks/useActiveGroup";
import useSusuStats from "../hooks/useSusuStats";
import usePayouts from "../hooks/usePayouts";
import { getInitials } from "../utils/initials";
import MenuButton from "../components/MenuButton";

export default function PayoutsScreen() {
  const { group, loading: groupLoading, error: groupError } = useActiveGroup();
  const {
    members,
    stats,
    loading: statsLoading,
    error: statsError,
    reload: reloadStats,
  } = useSusuStats(group);
  const {
    payouts,
    loading: payoutsLoading,
    error: payoutsError,
    reload: reloadPayouts,
  } = usePayouts(group?.id);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- numbers worked out from the data ---
  const slotAmount = group?.slot_amount ?? 0;
  const everyDays = group?.payout_every_days ?? 1;
  const totalSlots = members.reduce((sum, m) => sum + m.slots, 0);
  const slotsPaidOut = payouts.length; // one payout row = one slot paid out
  const slotsWaiting = totalSlots - slotsPaidOut;
  const complete = totalSlots > 0 && slotsPaidOut >= totalSlots;
  const pot = totalSlots * slotAmount * everyDays; // e.g. 10 slots x 10 x 2 days = 200
  // const nextPayoutDay = (slotsPaidOut + 1) * everyDays; // e.g. 4th payout -> after day 8

  const reloadAll = () => Promise.all([reloadStats(), reloadPayouts()]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reloadAll();
    setRefreshing(false);
  };

  // const daysLeft = stats ? nextPayoutDay - stats.currentDay : 1;
  // const everyonePaid = stats ? stats.paidCount === members.length : false;
  // const roundDone = daysLeft < 0 || (daysLeft === 0 && everyonePaid);
  // const stillOwing = stats ? members.length - stats.paidCount : 0;
  const nextPayoutDay = stats?.roundEnd ?? everyDays;
  const roundDone = stats?.payoutReady ?? false;
  const daysLeft = stats
    ? Math.max(0, stats.roundEnd - stats.completedDays)
    : 1;
  const stillOwing = stats ? members.length - stats.paidCount : 0;

  // a function that will be used to check number of slots left for each member
  const slotsLeft = (member) => {
    return (
      member.slots - payouts.filter((p) => member.id === p.member_id).length
    );
  };

  // check for members who have more than one slot left
  const eligible = members.filter((m) => slotsLeft(m));

  // inserting a new row into the payouts table
  const recordPayout = async (memberId) => {
    if (!roundDone) {
      return { message: "Payments for this round are not complete yet." };
    }
    // console.log("recordPayout called", { memberId, pot, groupId: group.id });
    const target = members.find((m) => m.id === memberId);
    if (!target || slotsLeft(target) <= 0) {
      return { message: "This member has no slots left to pay out." };
    }

    const { data, error: err } = await supabase
      .from("payouts")
      .insert({
        member_id: memberId,
        amount: pot,
        group_id: group.id,
        date_paid: new Date().toISOString().slice(0, 10),
      })
      .select();
    console.log("insert result", { data, err });
    return err;
  };

  const handlePick = (member) => {
    const run = async () => {
      setSaving(true);
      const err = await recordPayout(member.id);
      if (err) {
        Alert.alert("Could not record payout", err.message);
      } else {
        setModalOpen(false);
        await reloadAll();
      }
      setSaving(false);
    };

    Alert.alert(
      "Record this payout?",
      `GHS ${pot} will be recorded as paid to ${member.name}.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Record", onPress: run },
      ],
    );
  };

  if (groupLoading || (group && (statsLoading || payoutsLoading))) {
    return (
      <SafeAreaView style={a.screen} edges={["top"]}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.navy} />
      </SafeAreaView>
    );
  }

  const toText = (e) =>
    !e ? "" : typeof e === "string" ? e : e.message || "Something went wrong";
  const errorText =
    toText(groupError) || toText(statsError) || toText(payoutsError);

  if (errorText || !group) {
    return (
      <SafeAreaView style={a.screen} edges={["top"]}>
        <View style={a.body}>
          <Text style={a.title}>Payouts</Text>
          {errorText ? (
            <TouchableOpacity onPress={reloadAll}>
              <Text style={[a.muted, a.unpaidText]}>
                {errorText} Tap to retry.
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={a.muted}>No group yet.</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const roundStart = (stats.roundNumber - 1) * everyDays;
  const pct = Math.min(
    100,
    Math.max(0, ((stats.completedDays - roundStart) / everyDays) * 100),
  );
  const roundText = roundDone
    ? "Payout is ready"
    : daysLeft > 0
      ? `Next payout in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`
      : "Waiting for payments";
  const slotsPct = totalSlots === 0 ? 0 : (slotsPaidOut / totalSlots) * 100;

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
          <Text style={[a.headerTitle, { weight: 700 }]}>Payouts</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Next payout */}
        <View style={[a.cardGold, { gap: 12 }]}>
          {complete ? (
            <>
              <Text style={[a.muted, { letterSpacing: 0.4 }]}>
                Susu complete
              </Text>
              <Text style={a.title}>Every slot has been paid out.</Text>
            </>
          ) : (
            <>
              <View style={a.rowBetween}>
                <Text style={[a.headerTitle]}>{roundText}</Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 34,
                  color: colors.textPrimary,
                }}
              >
                GHS {pot}
              </Text>
              <View
                style={[a.progressTrack, { backgroundColor: colors.bgSurface }]}
              >
                <View style={[a.progressFill, { width: `${pct}%` }]} />
              </View>
              {stats.totalDays > 0 ? (
                <Text style={[a.pillText, a.pillAutoText]}>
                  Day {stats.currentDay} of {stats.totalDays}
                </Text>
              ) : (
                <Text style={[a.pillText, a.pillAutoText]}>
                  Day {stats.totalDays}
                </Text>
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={[
            a.btn,
            a.btnPrimary,
            (complete || saving || !roundDone) && a.btnDisabled,
          ]}
          disabled={complete || saving || !roundDone}
          onPress={() => setModalOpen(true)}
        >
          <Text style={[a.btnLabel, a.btnLabelPrimary]}>Record payout</Text>
        </TouchableOpacity>

        {!complete && !roundDone && (
          <Text style={[a.muted, { textAlign: "center" }]}>
            {stats.totalArrears > 0
              ? `${stats.totalArrears} unpaid day${stats.totalArrears === 1 ? "" : "s"} from earlier must be cleared first.`
              : `Payout opens when everyone has paid Day ${nextPayoutDay}.`}
          </Text>
        )}

        {/* Slots paid out */}
        <View style={[a.card, { gap: 10 }]}>
          <View style={a.rowBetween}>
            <Text style={a.textMedium}>Slots paid out</Text>
            <Text style={a.textSemibold}>
              {slotsPaidOut} of {totalSlots}
            </Text>
          </View>
          <View style={a.progressTrack}>
            <View
              style={[
                a.progressFill,
                { width: `${slotsPct}%`, backgroundColor: colors.navy },
              ]}
            />
          </View>
          <Text style={a.muted}>
            {slotsWaiting} slot{slotsWaiting === 1 ? "" : "s"} still waiting to
            receive
          </Text>
        </View>

        {/* History */}
        <Text style={a.title}>Payout history</Text>
        {payouts.length === 0 ? (
          <Text style={a.muted}>No payouts recorded yet.</Text>
        ) : (
          <View style={a.listCard}>
            {payouts.map((p, index) => (
              <View key={p.id}>
                {index > 0 && <View style={a.divider} />}
                <View style={a.listRow}>
                  <View
                    style={[a.avatar, { backgroundColor: colors.paidSoft }]}
                  >
                    <Svg
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={colors.paid}
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <Path d="M20 6 9 17l-5-5" />
                    </Svg>
                  </View>
                  <View style={a.grow}>
                    <Text style={a.textMedium}>{p.members.name}</Text>
                    <Text style={a.muted}>{p.date_paid}</Text>
                  </View>
                  <View style={[a.pill, a.pillPaid]}>
                    <Text style={[a.pillText, a.pillPaidText]}>Sent</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Pick who receives the payout */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
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
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              padding: 20,
              paddingBottom: 32,
              gap: 14,
              maxHeight: "75%",
            }}
          >
            <Text style={a.title}>Who receives this payout?</Text>
            <Text style={a.muted}>GHS {pot} · one slot</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {eligible.length === 0 ? (
                <Text style={a.muted}>No members left to pay.</Text>
              ) : (
                eligible.map((m, index) => (
                  <View key={m.id}>
                    {index > 0 && <View style={a.divider} />}
                    <TouchableOpacity
                      style={a.listRow}
                      disabled={saving}
                      onPress={() => handlePick(m)}
                    >
                      <View style={a.avatar}>
                        <Text style={a.avatarText}>{getInitials(m.name)}</Text>
                      </View>
                      <View style={a.grow}>
                        <Text style={a.textMedium}>{m.name}</Text>
                        <Text style={a.muted}>
                          {slotsLeft(m)} slot{slotsLeft(m) === 1 ? "" : "s"}{" "}
                          waiting
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={[a.btn, a.btnOutline]}
              onPress={() => setModalOpen(false)}
            >
              <Text style={[a.btnLabel, a.btnLabelOutline]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
