import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[70vh] bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col md:flex-row">
        <AdminNav />
        <div className="flex-1 px-4 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
