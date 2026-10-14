export function computeStats(members, group, today) {
  const slotAmount = Number(group.slot_amount);
  const totalSlots = members.reduce((sum, m) => sum + m.slots, 0);
  const totalDays = totalSlots * group.payout_every_days;

  let collectedToday = 0;
  let paidCount = 0;
  let completedDays = Infinity;

  for (const m of members) {
    const matched = m.payments.filter((p) => p.status === "matched");
    const totalPaid = matched.reduce((sum, p) => sum + Number(p.amount), 0);
    const paidToday = matched
      .filter((p) => p.date_received === today)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const perDay = m.slots * slotAmount;

    collectedToday += paidToday;
    if (paidToday >= perDay) paidCount += 1;
    completedDays = Math.min(completedDays, Math.floor(totalPaid / perDay));
  }

  if (members.length === 0) completedDays = 0;

  return {
    expectedToday: totalSlots * slotAmount,
    collectedToday,
    paidCount,
    totalDays,
    currentDay: Math.min(completedDays + 1, totalDays),
  };
}
