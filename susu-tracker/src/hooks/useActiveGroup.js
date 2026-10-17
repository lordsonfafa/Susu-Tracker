import { useGroups } from "../context/GroupContext";

export default function useActiveGroup() {
  const { group, loading, error } = useGroups();
  return { group, loading, error };
}
