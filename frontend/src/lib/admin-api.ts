import { apiGet, apiPatch, apiPost, apiPut, fetchAdminCsrf } from "@/lib/api";

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

export async function adminCreate(path: string, body: unknown) {
  const headers = await adminHeaders();
  return apiPost(path, body, headers);
}

export async function adminUpdate(path: string, body: unknown) {
  const headers = await adminHeaders();
  return apiPatch(path, body, headers);
}

export async function adminPut(path: string, body: unknown) {
  const headers = await adminHeaders();
  return apiPut(path, body, headers);
}
