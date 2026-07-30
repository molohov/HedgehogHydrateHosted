import Link from "next/link";
import { Role } from "@prisma/client";
import { logoutAction } from "@/app/actions/auth";
import type { SessionUser } from "@/auth";

type AppShellProps = {
  user: SessionUser;
  children: React.ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  const backgroundStyle = user.hasBackground
    ? {
        backgroundImage: "url(/api/images/background)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundColor: user.backgroundColor,
      };

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <div className="min-h-screen bg-parchment/75 backdrop-blur-[1px]">
        <header className="sticky top-0 z-20 border-b border-moss/10 bg-soft-cream/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-moss/20 bg-soft-cream">
                {user.hasAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/api/images/avatar"
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl">
                    🦔
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-moss">Hedgehog Hydrate</p>
                <p className="text-xs text-woodland-muted">Hi, {user.username}</p>
              </div>
            </div>
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/settings"
                className="rounded-full bg-moss/10 px-3 py-1.5 font-medium text-moss-dark hover:bg-moss/20"
              >
                Settings
              </Link>
              {user.role === Role.ADMIN ? (
                <Link
                  href="/admin/users"
                  className="rounded-full bg-moss/10 px-3 py-1.5 font-medium text-moss-dark hover:bg-moss/20"
                >
                  Admin
                </Link>
              ) : null}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full bg-dusty-rose/20 px-3 py-1.5 font-medium text-woodland hover:bg-dusty-rose/30"
                >
                  Log out
                </button>
              </form>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
