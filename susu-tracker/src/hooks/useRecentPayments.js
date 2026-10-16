import { useCallback, useEffect, useId, useState } from "react";
import supabase from "../lib/supabase";

// Payments for the group: everything since `fromDate`, plus any flagged ones of any date.
export default function useRecentPayments(groupId, fromDate) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const instanceId = useId();

  const reload = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("payments")
      .select(
        "id, amount, status, date_received, time_received, members!inner(name, group_id)",
      )
      .eq("members.group_id", groupId)
      .or(`status.eq.flagged,date_received.gte.${fromDate}`)
      .order("time_received", { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setPayments(data);
      setError("");
    }
    setLoading(false);
  }, [groupId, fromDate]);

  useEffect(() => {
    if (!groupId) return;

    setLoading(true);
    reload();

    const channel = supabase
      .channel(`payments-screen-${groupId}-${instanceId}`)
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

  return { payments, loading, error, reload };
}
