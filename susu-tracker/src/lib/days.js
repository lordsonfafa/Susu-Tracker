import supabase from "./supabase";

// the first day this member has no confirmed payment for
export async function getNextUnpaidDay(memberId) {
  const { data, error } = await supabase
    .from("payments")
    .select("day_number")
    .eq("member_id", memberId)
    .eq("status", "matched");

  if (error) return { error };

  const taken = new Set(data.map((r) => r.day_number));
  let day = 1;
  while (taken.has(day)) day++;
  return { day };
}

export async function isDayOpen(group, day) {
  const { count, error } = await supabase
    .from("payouts")
    .select("id", { count: "exact", head: true })
    .eq("group_id", group.id);
  if (error) return { error: error.message };
  const roundEnd = ((count ?? 0) + 1) * (group.payout_every_days ?? 1);
  return day <= roundEnd
    ? { open: true }
    : {
        open: false,
        error:
          "This round is full. Record the payout first, then payments for the next round open.",
      };
}
