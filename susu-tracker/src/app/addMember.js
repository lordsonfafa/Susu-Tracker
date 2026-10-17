import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import supabase from "../lib/supabase";
import a from "../styles/globalStyles";
import { colors } from "../styles/theme";
import useActiveGroup from "../hooks/useActiveGroup";
import useTodayMembers from "../hooks/useTodayMembers";
import useSusuStats from "../hooks/useSusuStats";

export default function AddMemberScreen({ navigation }) {
  const { group } = useActiveGroup();
  const { members, stats } = useSusuStats(group); // used to spot duplicate names

  const [name, setName] = useState("");
  const [momoName, setMomoName] = useState("");
  const [momoFocused, setMomoFocused] = useState(false);
  const [slots, setSlots] = useState(1);
  const [nameError, setNameError] = useState("");
  const [momoError, setMomoError] = useState("");
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneFocused, setPhoneFocused] = useState(false);

  const slotAmount = group?.slot_amount ?? 0;

  //validating the two input arears
  const validate = (rawName, rawMomo, rawPhone, slotCount) => {
    const cleanName = rawName.trim();
    const momo = rawMomo.trim() || cleanName; // what will actually be saved

    let nameErr = "";
    if (cleanName === "") {
      nameErr = "Please enter a name";
    } else if (cleanName.length < 3) {
      nameErr = "This name looks too short";
    } else if (slotCount < 1) {
      nameErr = "A member needs at least 1 slot";
    }

    let momoErr = "";
    if (
      momo !== "" &&
      members.some(
        (m) => (m.momo_name || m.name).toLowerCase() === momo.toLowerCase(),
      )
    ) {
      momoErr = "Another member already uses this MoMo name";
    }

    let phoneErr = "";
    if (rawPhone.trim() === "") {
      phoneErr = "Please enter a phone number";
    } else if (normalizePhone(rawPhone) === "") {
      phoneErr = "Enter a valid number, e.g. 0241234567";
    }
    return { name: nameErr, momo: momoErr, phone: phoneErr };
  };

  // Inserting the new member into the database
  const insertMember = async (cleanName, cleanMomo, cleanPhone, slotCount) => {
    const { error: queryError } = await supabase.from("members").insert({
      name: cleanName,
      momo_name: cleanMomo,
      slots: slotCount,
      phone_number: cleanPhone,
      group_id: group.id,
      joined_day: stats.currentDay,
    });
    return queryError;
  };

  //normalizing phone numbers
  const normalizePhone = (raw) => {
    let cleaned = raw.trim().replace(/[\s\-()]/g, "");

    if (cleaned.startsWith("+233")) {
      cleaned = "0" + cleaned.slice(4);
    } else if (cleaned.startsWith("233") && cleaned.length === 12) {
      cleaned = "0" + cleaned.slice(3);
    }

    return /^0\d{9}$/.test(cleaned) ? cleaned : "";
  };

  const handleSave = async () => {
    const problems = validate(name, momoName, phone, slots);
    setNameError(problems.name);
    setMomoError(problems.momo);
    setPhoneError(problems.phone);
    if (problems.name || problems.momo || problems.phone) return;

    setSaving(true);
    const err = await insertMember(
      name.trim(),
      momoName.trim() || name.trim(),
      normalizePhone(phone),
      slots,
    );
    setSaving(false);
    if (err) {
      Alert.alert("Could not add member", err.message);
      return;
    }
    navigation.goBack();
  };

  const stepper = (label, onPress, disabled) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        a.avatar,
        { width: 44, height: 44, borderRadius: 22 },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Text style={[a.title, { lineHeight: 28 }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={a.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32,
            gap: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={a.rowBetween}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={12}
              style={{ width: 40 }}
            >
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
            <Text style={a.headerTitle}>Add Member</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Name */}
          <View style={{ gap: 8 }}>
            <Text style={a.textMedium}>Name</Text>
            <View
              style={[
                a.input,
                focused && a.inputFocused,
                !!nameError && a.inputError,
              ]}
            >
              <TextInput
                style={a.inputText}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError("");
                }}
                placeholder="e.g. Kwame Asante"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </View>
            {!!nameError && (
              <Text style={[a.muted, a.unpaidText]}>{nameError}</Text>
            )}
          </View>

          <View style={{ gap: 8 }}>
            <Text style={a.textMedium}>Phone number</Text>
            <View
              style={[
                a.input,
                phoneFocused && a.inputFocused,
                !!phoneError && a.inputError,
              ]}
            >
              <TextInput
                style={a.inputText}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (phoneError) setPhoneError("");
                }}
                placeholder="e.g. 0241234567"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                autoCorrect={false}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
              />
            </View>
            {phoneError ? (
              <Text style={[a.muted, a.unpaidText]}>{phoneError}</Text>
            ) : (
              <Text style={a.muted}>
                Used to send receipts and payment reminders.
              </Text>
            )}
          </View>

          <View style={{ gap: 8 }}>
            <Text style={a.textMedium}>MoMo name</Text>
            <View
              style={[
                a.input,
                momoFocused && a.inputFocused,
                !!momoError && a.inputError,
              ]}
            >
              <TextInput
                style={a.inputText}
                value={momoName}
                onChangeText={(text) => {
                  setMomoName(text);
                  if (momoError) setMomoError("");
                }}
                placeholder="Leave blank if it's the same"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
                onFocus={() => setMomoFocused(true)}
                onBlur={() => setMomoFocused(false)}
              />
            </View>
            {momoError ? (
              <Text style={[a.muted, a.unpaidText]}>{momoError}</Text>
            ) : (
              <Text style={a.muted}>
                Type it exactly as it appears in the MoMo message, so payments
                can be matched.
              </Text>
            )}
          </View>

          {/* Slots */}
          <View style={[a.card, { gap: 12 }]}>
            <Text style={a.textMedium}>Slots</Text>
            <View style={[a.row, { justifyContent: "center", gap: 24 }]}>
              {stepper("−", () => setSlots((s) => s - 1), slots <= 1)}
              <Text style={[a.title, { minWidth: 40, textAlign: "center" }]}>
                {slots}
              </Text>
              {stepper("+", () => setSlots((s) => s + 1), slots >= 100)}
            </View>
            <Text style={[a.muted, { textAlign: "center" }]}>
              GHS {slots * slotAmount} per day
            </Text>
          </View>

          <TouchableOpacity
            style={[a.btn, a.btnPrimary, (saving || !group) && a.btnDisabled]}
            disabled={saving || !group || !stats}
            onPress={handleSave}
          >
            <Text style={[a.btnLabel, a.btnLabelPrimary]}>
              {saving ? "Saving..." : "Add member"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
