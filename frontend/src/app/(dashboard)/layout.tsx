import { AuthGuard } from "@/components/layout/AuthGuard";
import { DataRefreshListener } from "@/components/layout/DataRefreshListener";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard><DataRefreshListener />{children}</AuthGuard>;
}
