function getApiBase(): string {
  if (typeof window !== "undefined") return "";
  return process.env.BACKEND_URL ?? "http://localhost:4000";
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = getApiBase();
  const url = path.startsWith("/") ? `${base}${path}` : path;
  const res = await fetch(url, {
    credentials: "include",
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
  const base = getApiBase();
  const url = path.startsWith("/") ? `${base}${path}` : path;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Request failed: ${res.status}`);
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
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Request failed: ${res.status}`);
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
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Request failed: ${res.status}`);
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
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchAdminCsrf(): Promise<string> {
  const data = await apiGet<{ csrfToken: string }>("/api/admin/csrf");
  return data.csrfToken;
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
