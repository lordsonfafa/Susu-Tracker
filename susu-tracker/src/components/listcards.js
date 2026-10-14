import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import supabase from "../lib/supabase";
import a from "../styles/globalStyles";
import { colors } from "../styles/theme";
import { getInitials } from "../utils/initials";

const ListCards = ({ groupId, slotAmount = 10 }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);

    const { data, error: queryError } = await supabase
      .from("members")
      .select("*, payments(amount, status, date_received)")
      .eq("group_id", groupId)
      .eq("payments.status", "matched")
      .eq("payments.date_received", today)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setMembers(data);
      setError("");
    }
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchMembers();

    // Refresh the list whenever a payment is added or changed
    const channel = supabase
      .channel(`payments-${groupId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => fetchMembers(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, fetchMembers]);

  // members with no matched payment today
  const unpaid = members.filter(
    (m) => !m.payments.some((p) => p.status === "matched"),
  );

  if (loading) {
    return (
      <ActivityIndicator style={{ marginVertical: 24 }} color={colors.navy} />
    );
  }

  if (error) {
    return (
      <TouchableOpacity
        onPress={() => {
          setLoading(true);
          fetchMembers();
        }}
      >
        <Text style={[a.muted, a.unpaidText]}>{error} Tap to retry.</Text>
      </TouchableOpacity>
    );
  }

  if (members.length === 0) {
    return <Text style={a.muted}>No members in this group yet.</Text>;
  }

  if (unpaid.length === 0) {
    return <Text style={a.muted}>Everyone has paid today.</Text>;
  }

  return (
    <View style={a.listCard}>
      {unpaid.map((item, index) => (
        <View key={item.id}>
          {index > 0 && <View style={a.divider} />}
          <View style={a.listRow}>
            <View style={a.avatar}>
              <Text style={a.avatarText}>{getInitials(item.name)}</Text>
            </View>
            <View style={a.grow}>
              <Text style={a.textMedium}>{item.name}</Text>
              <Text style={a.muted}>
                GHS {item.slots * slotAmount} / day · {item.slots}{" "}
                {item.slots > 1 ? "slots" : "slot"}
              </Text>
            </View>
            <View style={[a.pill, a.pillUnpaid]}>
              <Text style={[a.pillText, a.pillUnpaidText]}>Unpaid</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default ListCards;
