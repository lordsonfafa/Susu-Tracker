import supabase from "./supabase";

export async function getGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("time_created");
  if (error) throw error;
  return data;
}
