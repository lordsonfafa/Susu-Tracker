// import React from "react";
// import { Text, TouchableOpacity, View } from "react-native";
// import a from "../styles/globalStyles";
// import { getInitials } from "../utils/initials";
// import { isPaid } from "../utils/isPaid";

// const ListCards = ({
//   members,
//   slotAmount,
//   currentDay,
//   emptyText = "Nothing to show.",
//   onPressMember,
// }) => {
//   if (members.length === 0) {
//     return <Text style={a.muted}>{emptyText}</Text>;
//   }
//   const paid = isPaid(item, currentDay);
//   return (
//     <View style={a.listCard}>
//       {members.map((item, index) => {
//         const paid = isPaid(item);
//         return (
//           <View key={item.id}>
//             {index > 0 && <View style={a.divider} />}
//             <TouchableOpacity
//               style={a.listRow}
//               activeOpacity={0.6}
//               disabled={!onPressMember}
//               onPress={() => onPressMember?.(item)}
//             >
//               <View style={a.avatar}>
//                 <Text style={a.avatarText}>{getInitials(item.name)}</Text>
//               </View>
//               <View style={a.grow}>
//                 <Text style={a.textMedium}>{item.name}</Text>
//                 <Text style={a.muted}>GHS {item.slots * slotAmount}</Text>
//               </View>
//               <View style={[a.pill, paid ? a.pillPaid : a.pillUnpaid]}>
//                 <Text
//                   style={[a.pillText, paid ? a.pillPaidText : a.pillUnpaidText]}
//                 >
//                   {paid ? "Paid" : "Unpaid"}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           </View>
//         );
//       })}
//     </View>
//   );
// };

// export default ListCards;

import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import a from "../styles/globalStyles";
import { getInitials } from "../utils/initials";
import { isPaid } from "../utils/isPaid";

const ListCards = ({
  members = [],
  slotAmount = 0,
  currentDay,
  emptyText = "Nothing to show.",
  onPressMember,
}) => {
  if (!members || members.length === 0) {
    return <Text style={a.muted}>{emptyText}</Text>;
  }

  return (
    <View style={a.listCard}>
      {members.map((item, index) => {
        // Calculate paid status for this specific item inside the loop
        const paid = isPaid(item, currentDay);
        const totalAmount = (item.slots ?? 0) * (slotAmount ?? 0);

        return (
          <View key={item.id ?? index}>
            {index > 0 && <View style={a.divider} />}
            <TouchableOpacity
              style={a.listRow}
              activeOpacity={0.6}
              disabled={!onPressMember}
              onPress={() => onPressMember?.(item)}
            >
              <View style={a.avatar}>
                <Text style={a.avatarText}>{getInitials(item.name)}</Text>
              </View>
              <View style={a.grow}>
                <Text style={a.textMedium}>{item.name}</Text>
                <Text style={a.muted}>GHS {totalAmount}</Text>
              </View>
              <View style={[a.pill, paid ? a.pillPaid : a.pillUnpaid]}>
                <Text
                  style={[a.pillText, paid ? a.pillPaidText : a.pillUnpaidText]}
                >
                  {paid ? "Paid" : "Unpaid"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

export default ListCards;
