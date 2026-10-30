"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminList, adminMe } from "@/lib/admin-api";

export default function AdminAuditPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<
    Array<{ id: string; action: string; createdAt: string; admin?: { email: string } }>
  >([]);

  useEffect(() => {
    adminMe()
      .then(() => adminList<{ logs: typeof logs }>("/api/admin/audit"))
      .then((data) => setLogs(data.logs))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  return (
    <div>
      <h1 className="font-display text-3xl">Audit log</h1>
      <ul className="mt-6 max-h-[60vh] overflow-auto text-sm">
        {logs.map((log) => (
          <li key={log.id} className="border-b border-charcoal/5 py-2">
            {new Date(log.createdAt).toLocaleString()} — {log.admin?.email} — {log.action}
          </li>
        ))}
      </ul>
    </div>
  );
}
