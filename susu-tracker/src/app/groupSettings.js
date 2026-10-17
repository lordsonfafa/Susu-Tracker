import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import a from "../styles/globalStyles";
import { colors } from "../styles/theme";
import { renameGroup } from "../lib/groups";
import { useGroups } from "../context/GroupContext";

export default function GroupSettingsScreen({ navigation }) {
  const { group, reload } = useGroups();
  const [name, setName] = useState(group?.name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (name.trim().length < 2) {
      Alert.alert("Name too short", "Enter at least 2 characters.");
      return;
    }
    setSaving(true);
    const error = await renameGroup(group.id, name.trim());
    if (error) {
      setSaving(false);
      Alert.alert("Could not save", error);
      return;
    }
    await reload();
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={a.screen} edges={["top", "bottom"]}>
      <View style={[a.body, { gap: 20 }]}>
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
          <Text style={a.headerTitle}>Group settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={a.textMedium}>Name</Text>
          <View style={a.input}>
            <TextInput
              style={a.inputText}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={[a.card, { gap: 6 }]}>
          <Text style={a.textMedium}>
            Amount per slot: GHS {group?.slot_amount}
          </Text>
          <Text style={a.textMedium}>
            Payout every {group?.payout_every_days} day(s)
          </Text>
          <Text style={a.muted}>
            These can't change once a susu has started, because every payout
            depends on them.
          </Text>
        </View>

        <TouchableOpacity
          style={[a.btn, a.btnPrimary, saving && a.btnDisabled]}
          disabled={saving}
          onPress={handleSave}
        >
          <Text style={[a.btnLabel, a.btnLabelPrimary]}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
