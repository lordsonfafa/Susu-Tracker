import { useCallback, useEffect, useId, useState } from "react";
import supabase from "../lib/supabase";

export default function useTodayMembers(groupId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const instanceId = useId(); // so two screens never share one realtime channel

  const reload = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);

    const { data, error: queryError } = await supabase
      .from("members")
      .select("id, name, slots, payments(amount, status, date_received)")
      .eq("group_id", groupId)
      .eq("payments.status", "matched")
      .eq("payments.date_received", today)
      .order("name", { ascending: true });

    if (queryError) {
      setError(queryError.message);
    } else {
      setMembers(data);
      setError("");
    }
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;

    setMembers([]);
    setLoading(true);
    reload();

    const channel = supabase
      .channel(`members-today-${groupId}-${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => reload(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, reload, instanceId]);

  return { members, loading, error, reload };
}
