export const isPaid = (member, currentDay) =>
  member.payments.some(
    (p) => p.status === "matched" && p.day_number === currentDay,
  );
