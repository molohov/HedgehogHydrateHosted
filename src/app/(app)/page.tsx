import { getHydrationDashboard } from "@/app/actions/hydration";
import { requireSessionUser } from "@/auth";
import { HydrationDashboard } from "@/components/hydration/HydrationDashboard";
import { AppShell } from "@/components/layout/AppShell";

export default async function DashboardPage() {
  const user = await requireSessionUser();
  const dashboard = await getHydrationDashboard();

  return (
    <AppShell user={user}>
      <HydrationDashboard {...dashboard} hasAvatar={user.hasAvatar} />
    </AppShell>
  );
}
