import { useState, useEffect } from "react";

/**
 * useState that persists to localStorage.
 * Restores value on mount; writes on every change.
 */
export function usePersistentState<T>(
    key: string,
    defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // storage full or blocked — silently ignore
        }
    }, [key, value]);

    return [value, setValue];
}
