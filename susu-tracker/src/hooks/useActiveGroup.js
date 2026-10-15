import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

export default function useActiveGroup() {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data, error: queryError } = await supabase
        .from("groups")
        .select("*")
        .order("time_created", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (queryError) setError(queryError.message);
      else setGroup(data);
      setLoading(false);
    };
    load();
  }, []);

  return { group, loading, error };
}
