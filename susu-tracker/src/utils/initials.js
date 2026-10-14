// utils/getInitials.js

export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "";

  const words = name.trim().split(/\s+/);

  if (words.length === 0 || !words[0]) return "";

  // Single name (e.g., "Kwame" -> "KW")
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  // First and last name initials (e.g., "Lordson Fafa Borngreat" -> "LB")
  const firstInitial = words[0].charAt(0);
  const lastInitial = words[words.length - 1].charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase();
};
