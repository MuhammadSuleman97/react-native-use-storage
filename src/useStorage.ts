import { useCallback, useEffect, useRef, useState } from 'react';
import type { Storage } from './Storage';

/**
 * React hook for typed persistent state backed by any Storage adapter.
 *
 * - Reads from storage on mount
 * - Writes to storage on every change
 * - Subscribes to external changes (other tabs, native code)
 */
export function useStorage<T>(
  storage: Storage,
  key: string,
  fallback: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(fallback);
  const valueRef = useRef<T>(fallback);

  // Load initial value from storage
  useEffect(() => {
    let cancelled = false;
    storage.get(key, fallback).then((v) => {
      if (!cancelled) {
        valueRef.current = v as T;
        setValue(v as T);
      }
    });
    return () => { cancelled = true; };
  }, [storage, key]);

  // Subscribe to external changes
  useEffect(() => {
    return storage.subscribe(key, (newValue: unknown) => {
      if (newValue !== undefined) {
        valueRef.current = newValue as T;
        setValue(newValue as T);
      }
    });
  }, [storage, key]);

  const set = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const next =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(valueRef.current)
          : newValue;

      valueRef.current = next;
      setValue(next);
      storage.set(key, next);
    },
    [storage, key],
  );

  return [value, set];
}
