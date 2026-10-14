import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getGroups } from "../lib/groups";

const GroupContext = createContext(null);

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await getGroups();
        const savedId = await AsyncStorage.getItem("activeGroupId");
        setGroups(all);
        setGroup(all.find((g) => g.id === savedId) ?? all[0] ?? null);
      } catch (e) {
        console.log("Could not load groups:", e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function selectGroup(g) {
    setGroup(g);
    await AsyncStorage.setItem("activeGroupId", g.id);
  }

  return (
    <GroupContext.Provider value={{ groups, group, selectGroup, loading }}>
      {children}
    </GroupContext.Provider>
  );
}

export const useGroup = () => useContext(GroupContext);
