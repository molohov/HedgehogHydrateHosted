import { requireAdminUser } from "@/auth";
import { prisma } from "@/lib/db";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { AppShell } from "@/components/layout/AppShell";

export default async function AdminUsersPage() {
  const admin = await requireAdminUser();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <AppShell user={admin}>
      <AdminUsersPanel
        currentUserId={admin.id}
        users={users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        }))}
      />
    </AppShell>
  );
}
