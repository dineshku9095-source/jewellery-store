import { apiDelete, apiGet, apiPatch, apiPost, apiPut, fetchAdminCsrf } from "@/lib/api";

async function adminHeaders(): Promise<HeadersInit> {
  const csrfToken = await fetchAdminCsrf();
  return { "x-csrf-token": csrfToken };
}

export async function adminLogin(email: string, password: string) {
  const headers = await adminHeaders();
  return apiPost("/api/admin/login", { email, password }, headers);
}

export async function adminLogout() {
  const headers = await adminHeaders();
  return apiPost("/api/admin/logout", {}, headers);
}

export async function adminMe() {
  return apiGet<{ admin: { id: string; email: string; name: string } }>("/api/admin/me");
}

export async function adminDashboard() {
  return apiGet<{ stats: { productCount: number; orderCount: number; pendingOrders: number } }>(
    "/api/admin/dashboard"
  );
}

export async function adminList<T>(path: string): Promise<T> {
  return apiGet<T>(path);
}

export async function adminCreate<T = unknown>(path: string, body: unknown): Promise<T> {
  const headers = await adminHeaders();
  return apiPost<T>(path, body, headers);
}

export async function adminUpdate<T = unknown>(path: string, body: unknown): Promise<T> {
  const headers = await adminHeaders();
  return apiPatch<T>(path, body, headers);
}

export async function adminPut<T = unknown>(path: string, body: unknown): Promise<T> {
  const headers = await adminHeaders();
  return apiPut<T>(path, body, headers);
}

export async function adminDelete<T = unknown>(path: string): Promise<T> {
  const headers = await adminHeaders();
  return apiDelete<T>(path, headers);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
