"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogout, adminMe, adminUpdate } from "@/lib/admin-api";

export default function AdminProfilePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<{ email: string; name: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    adminMe()
      .then((data) => setAdmin(data.admin))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await adminUpdate("/api/admin/change-password", {
      currentPassword: form.get("currentPassword"),
      newPassword: form.get("newPassword"),
    });
    setMessage("Password updated.");
  }

  async function logout() {
    await adminLogout();
    router.push("/admin/login");
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Profile</h1>
      {admin ? (
        <p className="mt-2 text-charcoal-muted">
          {admin.name} — {admin.email}
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="mt-8 max-w-md space-y-3">
        <input name="currentPassword" type="password" required className="input-field" placeholder="Current password" />
        <input name="newPassword" type="password" required minLength={12} className="input-field" placeholder="New password" />
        <button type="submit" className="btn-primary">
          Change password
        </button>
        {message ? <p className="text-sm text-champagne-dark">{message}</p> : null}
      </form>
      <button type="button" className="btn-outline mt-8" onClick={logout}>
        Log out
      </button>
    </div>
  );
}
