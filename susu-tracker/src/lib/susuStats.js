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
export function computeDayStats(members, group, payoutCount = 0) {
  const slotAmount = group.slot_amount ?? 0;
  const everyDays = group.payout_every_days ?? 1;

  const totalSlots = members.reduce((sum, m) => sum + m.slots, 0);
  const totalDays = totalSlots * everyDays;

  // for each member: the set of days they have a confirmed payment for
  const paidDays = new Map(
    members.map((m) => [
      m.id,
      new Set(
        m.payments
          .filter((p) => p.status === "matched")
          .map((p) => p.day_number),
      ),
    ]),
  );

  // a day is complete when everyone who had already joined has paid it
  let completedDays = 0;
  while (completedDays < totalDays) {
    const d = completedDays + 1;
    const due = members.filter((m) => (m.joined_day ?? 1) <= d);
    if (!due.every((m) => paidDays.get(m.id).has(d))) break;
    completedDays = d;
  }

  // ---- ROUNDS: one payout row = one finished round ----
  const roundsPaid = payoutCount;
  const roundNumber = roundsPaid + 1;
  const roundEnd = Math.min(roundNumber * everyDays, totalDays); // last day of this round
  const susuComplete = totalSlots > 0 && roundsPaid >= totalSlots;

  // the day only moves forward inside the current round.
  // after the round's last day it stays put until the payout is recorded.
  const currentDay = Math.max(1, Math.min(completedDays + 1, roundEnd || 1));

  // ---- CALENDAR DAY (your code, renamed) ----
  const startDate = group?.start_date ? new Date(group.start_date) : new Date();
  const today = new Date();
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const daysElapsed = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const calendarDay = Math.min(
    Math.max(1, daysElapsed + 1),
    Math.max(1, totalDays),
  );
  const daysBehind = Math.max(0, calendarDay - currentDay);

  const paidCount = members.filter((m) =>
    paidDays.get(m.id).has(currentDay),
  ).length;

  const collectedToday = members.reduce(
    (sum, m) =>
      sum +
      m.payments
        .filter((p) => p.status === "matched" && p.day_number === currentDay)
        .reduce((s, p) => s + Number(p.amount), 0),
    0,
  );

  const expectedToday = totalSlots * slotAmount;

  // unpaid days before the current day, across all members
  let totalArrears = 0;
  members.forEach((m) => {
    const set = paidDays.get(m.id) || new Set();
    for (let d = 1; d < currentDay; d++) {
      if (!set.has(d)) totalArrears++;
    }
  });

  // payout opens only when every day of this round is fully paid, arrears included
  const payoutReady =
    !susuComplete &&
    totalSlots > 0 &&
    completedDays >= roundEnd &&
    totalArrears === 0;

  return {
    completedDays,
    currentDay,
    calendarDay,
    daysBehind,
    totalDays,
    paidCount,
    collectedToday,
    expectedToday,
    totalArrears,
    roundsPaid,
    roundNumber,
    roundEnd,
    payoutReady,
    susuComplete,
  };
}
