// theme.js – design tokens for Susu Tracker (matches the Figma "Susu Colors" variables)

export const colors = {
  bgApp: "#F7F8FA",
  bgSurface: "#FFFFFF",
  bgTrack: "#ECEEF3",

  textPrimary: "#1B2A41",
  textSecondary: "#8A94A6",
  textOnDark: "#FFFFFF",
  textOnDarkMuted: "#A9B4C6",

  border: "#E6E9EF",

  navy: "#1B2A41",
  gold: "#C9A24B",
  goldSoft: "#F6EEDC",

  paid: "#1FA971",
  paidSoft: "#E1F5EC",
  unpaid: "#E5383B",
  unpaidSoft: "#FDE9E9",

  tabInactive: "#A3ACBB",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  pill: 999,
};

// Load these with @expo-google-fonts/inter (useFonts) in App.js.
// Until the fonts are loaded, remove the fontFamily lines or the text will fall back/crash.
export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const fontSize = {
  xs: 14,
  sm: 15,
  base: 17,
  md: 19,
  lg: 21,
  xl: 27,
  xxl: 39,
};

export const shadow = {
  card: {
    shadowColor: "#1B2A41",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3, // Android
  },
};

export const theme = { colors, spacing, radius, fonts, fontSize, shadow };
export default theme;
