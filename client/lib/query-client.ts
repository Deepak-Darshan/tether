import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  let host = (process.env.EXPO_PUBLIC_DOMAIN || "").trim();

  // Fallback for development if not set or invalid
  const devFallback = "http://localhost:5000";

  if (!host) {
    return devFallback;
  }

  // If a full URL is provided (e.g., http://localhost:5000 or https://app.example.com), use it as-is.
  try {
    const asUrl = new URL(host);
    return asUrl.href;
  } catch {}

  // If only a port or ":port" was provided, assume localhost
  if (/^:?\d{2,5}$/.test(host)) {
    const port = host.replace(":", "");
    host = `localhost:${port}`;
  }

  // Otherwise, infer protocol: use http for local hosts, https for public domains.
  const isLocalHost =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    /^(10\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.)/.test(host) ||
    /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(host) ||
    host.endsWith(".local") ||
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:");

  const protocol = isLocalHost ? "http" : "https";

  try {
    return new URL(`${protocol}://${host}`).href;
  } catch {
    // As a last resort, fall back to localhost:5000 in dev
    return devFallback;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = `${baseUrl.replace(/\/$/, "")}${route.startsWith("/") ? route : `/${route}`}`;

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const route = queryKey.join("/") as string;
    const url = `${baseUrl.replace(/\/$/, "")}${route.startsWith("/") ? route : `/${route}`}`;

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
