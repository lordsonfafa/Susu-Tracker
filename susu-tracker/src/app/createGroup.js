import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import a from "../styles/globalStyles";
import { colors } from "../styles/theme";
import { createGroup } from "../lib/groups";
import { useGroups } from "../context/GroupContext";

const Field = ({ label, hint, error, ...props }) => (
  <View style={{ gap: 8 }}>
    <Text style={a.textMedium}>{label}</Text>
    <View style={[a.input, !!error && a.inputError]}>
      <TextInput
        style={a.inputText}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
    </View>
    {error ? (
      <Text style={[a.muted, a.unpaidText]}>{error}</Text>
    ) : hint ? (
      <Text style={a.muted}>{hint}</Text>
    ) : null}
  </View>
);

export default function CreateGroupScreen({ navigation }) {
  const { reload, selectGroup } = useGroups();
  const [name, setName] = useState("");
  const [slotAmount, setSlotAmount] = useState("10");
  const [everyDays, setEveryDays] = useState("2");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const amount = Number(slotAmount);
    const days = Number(everyDays);
    const next = {};
    if (name.trim().length < 2) next.name = "Enter a name for this susu";
    if (!Number.isFinite(amount) || amount <= 0)
      next.amount = "Enter an amount above 0";
    if (!Number.isInteger(days) || days < 1)
      next.days = "Enter a whole number of days (1 or more)";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const { group, error } = await createGroup({
      name: name.trim(),
      slotAmount: amount,
      payoutEveryDays: days,
    });
    if (error) {
      setSaving(false);
      Alert.alert("Could not create susu", error);
      return;
    }
    await reload();
    selectGroup(group.id);
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={a.screen} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
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
          <Text style={a.headerTitle}>New susu</Text>
          <View style={{ width: 40 }} />
        </View>

        <Field
          label="Name"
          placeholder="e.g. Mum's Susu"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          error={errors.name}
        />
        <Field
          label="Amount per slot per day (GHS)"
          value={slotAmount}
          onChangeText={setSlotAmount}
          keyboardType="numeric"
          error={errors.amount}
        />
        <Field
          label="Payout every (days)"
          value={everyDays}
          onChangeText={setEveryDays}
          keyboardType="number-pad"
          error={errors.days}
          hint="One member receives the pot after this many days."
        />

        <TouchableOpacity
          style={[a.btn, a.btnPrimary, saving && a.btnDisabled]}
          disabled={saving}
          onPress={handleSave}
        >
          <Text style={[a.btnLabel, a.btnLabelPrimary]}>
            {saving ? "Creating..." : "Create susu"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
