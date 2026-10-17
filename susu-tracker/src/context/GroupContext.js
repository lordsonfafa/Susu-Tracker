import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getGroups } from "../lib/groups";

const GroupContext = createContext(null);
const KEY = "activeGroupId";

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    const { groups: list, error: err } = await getGroups();
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    let saved = null;
    try {
      saved = await AsyncStorage.getItem(KEY);
    } catch {}

    setGroups(list);
    setError("");
    setActiveId((prev) => {
      const wanted = prev ?? saved;
      const match = list.find((g) => String(g.id) === String(wanted));
      return match ? match.id : (list[0]?.id ?? null);
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const selectGroup = (id) => {
    setActiveId(id);
    AsyncStorage.setItem(KEY, String(id)).catch(() => {});
  };

  const group = groups.find((g) => String(g.id) === String(activeId)) ?? null;

  return (
    <GroupContext.Provider
      value={{ groups, group, loading, error, reload, selectGroup }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export const useGroups = () => useContext(GroupContext);
