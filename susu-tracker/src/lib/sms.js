import { Linking } from "react-native";

// 0551234567 or +233551234567 -> 233551234567 (what wa.me needs)
const toWhatsAppNumber = (phone) => {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0")) return "233" + digits.slice(1);
  return digits;
};

export async function sendWhatsApp(phone, message) {
  if (!phone) return { error: "This member has no phone number." };
  const url = `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(url);
    return { result: "opened" };
  } catch {
    return { error: "Could not open WhatsApp." };
  }
}

export const sendSms = sendWhatsApp; // old name still works

export const receiptText = ({
  name,
  amount,
  day,
  groupName,
  daysPaid,
  totalDays,
}) =>
  `Hi ${name}, we received GHS ${amount} for Day ${day} of ${groupName}. ` +
  `You have paid ${daysPaid} of ${totalDays} days. Thank you!`;

export const reminderText = ({ name, amount, day, groupName }) =>
  `Hi ${name}, a reminder that your GHS ${amount} for Day ${day} of ${groupName} is still due. ` +
  `Please send it on MoMo with the reference "susu". Thank you.`;
