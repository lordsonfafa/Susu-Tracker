// `payments` only holds today's matched payments (see useTodayMembers)
export const isPaid = (member) =>
  member.payments.some((p) => p.status === "matched");
