import { AuthGuard } from "@/components/layout/AuthGuard";
import { DataRefreshListener } from "@/components/layout/DataRefreshListener";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="campus-ambient-bg">
      <AuthGuard>
        <DataRefreshListener />
        {children}
      </AuthGuard>
    </div>
  );
}