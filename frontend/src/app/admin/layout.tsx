import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[70vh] bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col md:flex-row">
        <AdminNav />
        <div className="min-w-0 flex-1 px-3 py-6 sm:px-4 sm:py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
