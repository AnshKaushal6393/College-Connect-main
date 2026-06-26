import { useState } from "react";
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  const setStoredValue = (newValue: T) => {
    try {
        setValue(newValue);
        window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue] as const;
};
