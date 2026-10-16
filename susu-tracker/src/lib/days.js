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
