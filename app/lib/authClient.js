"use client";

const AUTH_STORAGE_KEY = "kiraydar-owner-session";

export async function getAppConfig() {
  try {
    const res = await fetch("/api/config");
    if (!res.ok) return { isDatabaseConfigured: false };
    return res.json();
  } catch {
    return { isDatabaseConfigured: false };
  }
}

export function getStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }
}

export async function signIn(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to sign in");
  }

  saveSession(data);
  return data;
}

export async function signOut() {
  saveSession(null);
}
