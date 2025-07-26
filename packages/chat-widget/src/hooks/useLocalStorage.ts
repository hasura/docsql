import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;

    try {
      const item = window.localStorage.getItem(key);

      // Check for null, undefined, or the string "undefined"
      if (item === null || item === undefined || item === "undefined") {
        return defaultValue;
      }

      return JSON.parse(item);
    } catch (error) {
      console.error(`Error loading from localStorage [${key}]:`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = typeof newValue === "function" ? (newValue as (prev: T) => T)(value) : newValue;

      if (valueToStore === undefined) {
        console.error(`Attempting to save undefined to localStorage [${key}]`);
        console.trace();
        return;
      }

      setValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving to localStorage [${key}]:`, error);
    }
  };

  return [value, setStoredValue];
}
