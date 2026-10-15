import React from "react";
import { Text, View } from "react-native";
import a from "../styles/globalStyles";
import { getInitials } from "../utils/initials";
import { isPaid } from "../utils/isPaid";

const ListCards = ({ members, slotAmount, emptyText = "Nothing to show." }) => {
  if (members.length === 0) {
    return <Text style={a.muted}>{emptyText}</Text>;
  }

  return (
    <View style={a.listCard}>
      {members.map((item, index) => {
        const paid = isPaid(item);
        return (
          <View key={item.id}>
            {index > 0 && <View style={a.divider} />}
            <View style={a.listRow}>
              <View style={a.avatar}>
                <Text style={a.avatarText}>{getInitials(item.name)}</Text>
              </View>
              <View style={a.grow}>
                <Text style={a.textMedium}>{item.name}</Text>
                <Text style={a.muted}>
                  GHS {item.slots * slotAmount}
                  {/* {item.slots > 1 ? "slots" : "slot"} */}
                </Text>
              </View>
              <View style={[a.pill, paid ? a.pillPaid : a.pillUnpaid]}>
                <Text
                  style={[a.pillText, paid ? a.pillPaidText : a.pillUnpaidText]}
                >
                  {paid ? "Paid" : "Unpaid"}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default ListCards;
