// import { useCallback, useEffect, useId, useState } from "react";
// import supabase from "../lib/supabase";
// import { computeDayStats } from "../lib/susuStats";

// export default function useSusuStats(group) {
//   const [members, setMembers] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const instanceId = useId();

//   const reload = useCallback(async () => {
//     const { data, error: queryError } = await supabase
//       .from("members")
//       .select(
//         "id, name, momo_name, slots, joined_day, payments(id, amount, status, day_number)",
//       )
//       .eq("group_id", group.id)
//       .order("name");

//     if (queryError) {
//       setError(queryError.message);
//     } else {
//       setMembers(data);
//       setStats(computeDayStats(data, group));
//       setError("");
//     }
//     setLoading(false);
//   }, [group]);

//   useEffect(() => {
//     if (!group) return;
//     setLoading(true);
//     reload();

//     const channel = supabase
//       .channel(`susu-stats-${group.id}-${instanceId}`)
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "payments" },
//         () => reload(),
//       )
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "members" },
//         () => reload(),
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [group, reload, instanceId]);

//   return { members, stats, loading, error, reload };
// }

import { useCallback, useEffect, useId, useState } from "react";
import supabase from "../lib/supabase";
import { computeDayStats } from "../lib/susuStats";

export default function useSusuStats(group) {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const instanceId = useId();

  // Extract group.id safely for dependency tracking
  const groupId = group?.id;

  const reload = useCallback(async () => {
    // 1. Guard clause: Stop if group or group.id is not available yet
    if (!groupId) return;

    const { data, error: queryError } = await supabase
      .from("members")
      .select(
        "id, name, momo_name, slots, joined_day, payments(id, amount, status, day_number)",
      )
      .eq("group_id", groupId)
      .order("name");

    if (queryError) {
      setError(queryError.message);
    } else {
      const memberList = data || [];
      setMembers(memberList);
      // 2. Safely calculate stats with fallbacks
      setStats(computeDayStats(memberList, group));
      setError("");
    }
    setLoading(false);
  }, [groupId, group]); // Depend on primitive groupId to prevent infinite loops

  useEffect(() => {
    // Stop early if no group ID
    if (!groupId) return;

    setLoading(true);
    reload();

    const channel = supabase
      .channel(`susu-stats-${groupId}-${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => reload(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        () => reload(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, reload, instanceId]);

  return { members, stats, loading, error, reload };
}
