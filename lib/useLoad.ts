import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

/**
 * Loads data for a screen and reloads it whenever the screen comes back into view
 * (e.g. after adding something on another page). Gives loading / error / refresh state.
 */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const load = useCallback(async (pull = false) => {
    if (pull) setRefreshing(true);
    try {
      setError(null);
      setData(await fnRef.current());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return {
    data,
    setData,
    error,
    loading: data === null && !error,
    refreshing,
    refresh: () => load(true),
    reload: () => load(),
  };
}
