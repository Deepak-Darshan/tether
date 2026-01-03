import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getApiUrl, queryClient } from "@/lib/query-client";

interface User {
  id: string;
  username: string;
  name: string;
  headline?: string | null;
  bio?: string | null;
  skills?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "tether_auth_token";

async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function removeToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await getToken();
      if (storedToken) {
        const baseUrl = getApiUrl();
        const response = await fetch(new URL("/api/auth/me", baseUrl).href, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setTokenState(storedToken);
          setUser(userData);
        } else {
          await removeToken();
        }
      }
    } catch (error) {
      await removeToken();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const baseUrl = getApiUrl();
    const response = await fetch(new URL("/api/auth/login", baseUrl).href, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    await setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    queryClient.clear();
  }

  async function register(username: string, password: string, name: string) {
    const baseUrl = getApiUrl();
    const response = await fetch(new URL("/api/auth/register", baseUrl).href, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();
    await setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    queryClient.clear();
  }

  async function logout() {
    try {
      if (token) {
        const baseUrl = getApiUrl();
        await fetch(new URL("/api/auth/logout", baseUrl).href, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
    } finally {
      await removeToken();
      setTokenState(null);
      setUser(null);
      queryClient.clear();
    }
  }

  function updateUser(data: Partial<User>) {
    if (user) {
      setUser({ ...user, ...data });
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
