import supabase from "./supabase";

export async function getGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("time_created", { ascending: true });
  return { groups: data ?? [], error: error?.message ?? "" };
}

export async function createGroup({ name, slotAmount, payoutEveryDays }) {
  const { data, error } = await supabase
    .from("groups")
    .insert({
      name,
      slot_amount: slotAmount,
      payout_every_days: payoutEveryDays,
    })
    .select()
    .single();
  return { group: data, error: error?.message ?? "" };
}

export async function renameGroup(id, name) {
  const { error } = await supabase.from("groups").update({ name }).eq("id", id);
  return error?.message ?? "";
}
