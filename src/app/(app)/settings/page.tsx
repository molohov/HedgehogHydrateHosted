import { requireSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export default async function SettingsPage() {
  const user = await requireSessionUser();
  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      dailyGoalOz: true,
      timezone: true,
      backgroundColor: true,
      presets: { orderBy: [{ builtin: "desc" }, { oz: "asc" }] },
    },
  });

  return (
    <AppShell user={user}>
      <SettingsPanel
        dailyGoalOz={dbUser.dailyGoalOz}
        timezone={dbUser.timezone}
        backgroundColor={dbUser.backgroundColor}
        hasAvatar={user.hasAvatar}
        hasBackground={user.hasBackground}
        presets={dbUser.presets}
      />
    </AppShell>
  );
}
