export function paidDaysOf(member) {
  return new Set(
    member.filter((p) => p.status === "matched").map((p) => p.day_number),
  );
}
