import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

function canUseLocalStorage(): boolean {
  try {
    if (typeof window === "undefined") return false;
    if (!("localStorage" in window)) return false;

    // Some browsers (or private mode) can throw on access.
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

let secureStoreAvailablePromise: Promise<boolean> | null = null;
async function isSecureStoreAvailable(): Promise<boolean> {
  if (!secureStoreAvailablePromise) {
    secureStoreAvailablePromise = SecureStore.isAvailableAsync().catch(() => false);
  }
  return secureStoreAvailablePromise;
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return canUseLocalStorage() ? window.localStorage.getItem(key) : null;
  }

  if (!(await isSecureStoreAvailable())) return null;
  return SecureStore.getItemAsync(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (!canUseLocalStorage()) return;
    window.localStorage.setItem(key, value);
    return;
  }

  if (!(await isSecureStoreAvailable())) return;
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (!canUseLocalStorage()) return;
    window.localStorage.removeItem(key);
    return;
  }

  if (!(await isSecureStoreAvailable())) return;
  await SecureStore.deleteItemAsync(key);
}
