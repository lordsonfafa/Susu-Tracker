import { useCallback, useEffect, useId, useState } from "react";
import supabase from "../lib/supabase";

export default function useMemberDetail(memberId) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const instanceId = useId();

  const reload = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("members")
      .select(
        "id, name, slots, payments(id, amount, status, date_received,day_number), payouts(id, amount, date_paid)",
      )
      .eq("id", memberId)
      .maybeSingle();

    if (queryError) {
      setError(queryError.message);
    } else {
      setMember(data);
      setError("");
    }
    setLoading(false);
  }, [memberId]);

  useEffect(() => {
    setLoading(true);
    reload();

    const channel = supabase
      .channel(`member-${memberId}-${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => reload(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payouts" },
        () => reload(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [memberId, reload, instanceId]);

  return { member, loading, error, reload };
}
