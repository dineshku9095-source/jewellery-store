function getApiBase(): string {
  if (typeof window !== "undefined") {
    // Prefer same-origin rewrite; optional direct API for cold-start resilience
    return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  }
  return process.env.BACKEND_URL ?? "http://localhost:4000";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number) {
  return status === 502 || status === 503 || status === 504 || status === 520;
}

/** Render free APIs sleep; rewrites 502 until the dyno wakes (~30–60s). */
async function fetchWithRetry(
  url: string,
  init: RequestInit | undefined,
  opts?: { retries?: number; baseDelayMs?: number }
): Promise<Response> {
  const retries = opts?.retries ?? 5;
  const baseDelayMs = opts?.baseDelayMs ?? 2500;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok || !isRetryableStatus(res.status) || attempt === retries) {
        return res;
      }
    } catch (err) {
      lastError = err;
      if (attempt === retries) throw err;
    }
    await sleep(baseDelayMs * Math.pow(1.6, attempt));
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

async function readError(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({} as { error?: string }));
  return body.error ?? `Request failed: ${res.status}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = getApiBase();
  const url = path.startsWith("/") ? `${base}${path}` : path;
  const res = await fetchWithRetry(url, {
    credentials: "include",
    // Avoid Next Data Cache holding a cold-start 502
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
  const base = getApiBase();
  const url = path.startsWith("/") ? `${base}${path}` : path;
  const res = await fetchWithRetry(
    url,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    },
    { retries: 2, baseDelayMs: 1500 }
  );
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return res.json();
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  headers?: HeadersInit
): Promise<T> {
  const base = getApiBase();
  const url = path.startsWith("/") ? `${base}${path}` : path;
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return res.json();
}

export async function apiPut<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
  const base = getApiBase();
  const url = path.startsWith("/") ? `${base}${path}` : path;
  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return res.json();
}

export async function apiDelete<T>(path: string, headers?: HeadersInit): Promise<T> {
  const base = getApiBase();
  const url = path.startsWith("/") ? `${base}${path}` : path;
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: { ...headers },
  });
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return res.json();
}

export async function fetchAdminCsrf(): Promise<string> {
  const data = await apiGet<{ csrfToken: string }>("/api/admin/csrf");
  return data.csrfToken;
}

/** Soft public settings fetch for chrome — never throws. */
export async function fetchPublicSettingsSoft(): Promise<{
  settings?: Record<string, unknown>;
} | null> {
  try {
    return await apiGet("/api/settings/public");
  } catch {
    return null;
  }
}

export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: Array<{ url: string; alt: string | null }>;
  variants: Array<{ id: string; label: string; price: string; stock: number }>;
}

export interface StoreSettingsPublic {
  storeName: string;
  tagline?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  whatsappNumber: string;
  address?: string | null;
  currency: string;
}

export function formatINR(amount: string): string {
  return `₹${parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}
