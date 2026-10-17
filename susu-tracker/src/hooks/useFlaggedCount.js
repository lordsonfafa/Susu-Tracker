import { useCallback, useEffect, useId, useState } from "react";
import supabase from "../lib/supabase";

export default function useFlaggedCount(groupId) {
  const [count, setCount] = useState(0);
  const instanceId = useId();

  const reload = useCallback(async () => {
    const { count: n, error } = await supabase
      .from("payments")
      .select("id, members!inner(group_id)", { count: "exact", head: true })
      .eq("status", "flagged")
      .eq("members.group_id", groupId);
    if (!error) setCount(n ?? 0);
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    reload();
    const channel = supabase
      .channel(`flagged-${groupId}-${instanceId}`)
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

  return count;
}
