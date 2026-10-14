// globalStyles.js – shared styles used across screens (the React Native equivalent of a global CSS file)
import { StyleSheet } from "react-native";
import { colors, spacing, radius, fonts, fontSize, shadow } from "./theme";

export const a = StyleSheet.create({
  // ---------- Screen ----------
  screen: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },

  // ---------- Layout helpers ----------
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  grow: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },

  // ---------- Text ----------
  title: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    fontWeight: 700,
  },
  headerTitle: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    letterSpacing: 0.6,
    fontWeight: 500,
  },
  sectionTitle: {
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    letterSpacing: 0.5,
    fontWeight: 800,
  },
  text: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  textMedium: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  textSemibold: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  gold: { color: colors.gold },
  paidText: { color: colors.paid },
  unpaidText: { color: colors.unpaid },

  // ---------- Cards ----------
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardDark: {
    backgroundColor: colors.navy,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadow.card,
  },
  cardGold: {
    backgroundColor: colors.goldSoft,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  listCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    ...shadow.card,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.border },

  // ---------- Buttons ----------
  btn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    width: "80%",
    alignSelf: "center",
  },
  btnPrimary: { backgroundColor: colors.navy },
  btnOutline: { backgroundColor: "transparent" },
  btnDisabled: { opacity: 0.5 },
  btnLabel: {
    fontSize: fontSize.sm,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  btnLabelPrimary: { color: colors.textOnDark },
  btnLabelOutline: { color: colors.navy },

  // ---------- Inputs ----------
  input: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  inputText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  inputFocused: { borderColor: colors.gold },
  inputError: { borderColor: colors.unpaid },

  // ---------- Pills ----------
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  pillText: { ontSize: fontSize.xs },
  pillPaid: { backgroundColor: colors.paidSoft },
  pillPaidText: { color: colors.paid },
  pillUnpaid: { backgroundColor: colors.unpaidSoft },
  pillUnpaidText: { color: colors.unpaid },
  pillAuto: { backgroundColor: colors.goldSoft },
  pillAutoText: { color: colors.gold },

  // ---------- Avatar ----------
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgTrack,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLg: { width: 56, height: 56, borderRadius: 28 },
  avatarText: { fontSize: 13, color: colors.navy },

  // ---------- Segmented control ----------
  segmented: {
    flexDirection: "row",
    padding: 4,
    backgroundColor: colors.bgTrack,
    borderRadius: radius.md,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  segmentedTabActive: { backgroundColor: colors.bgSurface },
  segmentedLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  segmentedLabelActive: { color: colors.navy },

  // ---------- Progress ----------
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgTrack,
    overflow: "hidden",
  },
  progressTrackDark: { backgroundColor: "rgba(255,255,255,0.16)" },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.gold },

  // ---------- Tab bar ----------
  tabBar: {
    height: 76,
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
});

export default a;
