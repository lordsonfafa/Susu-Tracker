import { useCallback, useEffect, useId, useState } from "react";
import supabase from "../lib/supabase";

export default function usePayouts(groupId) {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const instanceId = useId();

  const reload = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("payouts")
      .select("id, amount, date_paid, member_id, members!inner(name, group_id)")
      .eq("members.group_id", groupId)
      .order("date_paid", { ascending: false })
      .order("id", { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setPayouts(data);
      setError("");
    }
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;

    setLoading(true);
    reload();

    const channel = supabase
      .channel(`payouts-${groupId}-${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payouts" },
        () => reload(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, reload, instanceId]);

  return { payouts, loading, error, reload };
}
