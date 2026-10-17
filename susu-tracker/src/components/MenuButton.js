import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import supabase from "../lib/supabase";
import a from "../styles/globalStyles";
import { colors, radius } from "../styles/theme";
import { useGroups } from "../context/GroupContext";
import useFlaggedCount from "../hooks/useFlaggedCount";

const Row = ({ label, sub, right, onPress, danger }) => (
  <TouchableOpacity style={a.listRow} onPress={onPress}>
    <View style={a.grow}>
      <Text style={[a.textMedium, danger && a.unpaidText]}>{label}</Text>
      {!!sub && <Text style={a.muted}>{sub}</Text>}
    </View>
    {right}
  </TouchableOpacity>
);

export default function MenuButton() {
  const navigation = useNavigation();
  const { groups, group, selectGroup } = useGroups();
  const flagged = useFlaggedCount(group?.id);
  const [open, setOpen] = useState(false);

  // close the sheet first, then navigate (avoids a glitch on iOS)
  const go = (screen) => {
    setOpen(false);
    setTimeout(() => navigation.navigate(screen), 300);
  };

  const signOut = () => {
    Alert.alert("Sign out?", "You will need to log in again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          setOpen(false);
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} hitSlop={12}>
        <Svg
          width={40}
          height={40}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.navy}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M4 7h16M4 12h16M4 17h16" />
        </Svg>
        {flagged > 0 && (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 9,
              height: 9,
              borderRadius: 5,
              backgroundColor: colors.unpaid,
            }}
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
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
              gap: 8,
              maxHeight: "85%",
            }}
          >
            <Text style={a.title}>Menu</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[a.headerTitle, { marginTop: 8, fontWeight: 600 }]}>
                YOUR SUSU GROUPS
              </Text>
              {groups.map((g) => {
                const active = group && String(g.id) === String(group.id);
                return (
                  <Row
                    style={[
                      {
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        justifyContent: "centre",
                      },
                    ]}
                    key={g.id}
                    label={<Text style={a.headerTitle}>{g.name}</Text>}
                    sub={
                      <View
                        style={[a.rowBetween, { marginTop: 2, width: "100%" }]}
                      >
                        <Text style={a.muted}>GHS {g.slot_amount} / slot</Text>
                        <Text style={a.muted}>
                          Every {g.payout_every_days} day
                          {g.payout_every_days === 1 ? "" : "s"}
                        </Text>
                      </View>
                    }
                    onPress={() => {
                      selectGroup(g.id);
                      setOpen(false);
                    }}
                    right={
                      active ? (
                        <Svg
                          width={20}
                          height={20}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={colors.paid}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <Path d="M20 6 9 17l-5-5" />
                        </Svg>
                      ) : null
                    }
                  />
                );
              })}
              <View style={a.divider} />
              <Row
                label={<Text style={a.headerTitle}>Create new susu</Text>}
                onPress={() => go("CreateGroup")}
              />
              <View style={a.divider} />
              <Row
                label={<Text style={a.headerTitle}>Group Settings</Text>}
                onPress={() => go("GroupSettings")}
              />
              <View style={a.divider} />
              <Row
                label={<Text style={a.headerTitle}>Flagged Payments</Text>}
                sub="Payments to review"
                onPress={() => go("Payments")}
                right={
                  flagged > 0 ? (
                    <View style={[a.pill, a.pillUnpaid]}>
                      <Text style={[a.pillText, a.pillUnpaidText]}>
                        {flagged}
                      </Text>
                    </View>
                  ) : null
                }
              />
              <View style={a.divider} />
              <Row label="Sign out" danger onPress={signOut} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
