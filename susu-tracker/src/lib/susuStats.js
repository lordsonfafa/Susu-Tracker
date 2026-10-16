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
export function computeDayStats(members, group) {
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
    const due = members.filter((m) => m.joined_day <= d);
    if (!due.every((m) => paidDays.get(m.id).has(d))) break;
    completedDays = d;
  }

  //CALCULATING THE CURRENT DATE BY COUNTING THE NUMBER OF DAYS IT HAS BEEN SINCE THE SUSU STARTED
  // Ensure group has a valid start_date, fallback to today if missing
  const startDate = group?.start_date ? new Date(group.start_date) : new Date();
  const today = new Date();

  // Set both times to midnight (UTC or local) to ensure accurate calendar day counts
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Calculate elapsed milliseconds and convert to full days
  const diffInMs = today.getTime() - startDate.getTime();
  const daysElapsed = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Day 1 starts on the start_date itself
  const calculatedDay = daysElapsed + 1;

  // Clamp currentDay between Day 1 and totalDays
  const currentDay = Math.min(Math.max(1, calculatedDay), totalDays);

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
    for (let d = 1; d < currentDay; d++) {
      if (!paidDays.get(m.id).has(d)) totalArrears++;
    }
  });

  return {
    completedDays,
    currentDay,
    totalDays,
    paidCount,
    collectedToday,
    expectedToday,
    totalArrears,
  };
}
