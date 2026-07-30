import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { backgroundData: true, backgroundMime: true },
  });

  if (!user?.backgroundData || !user.backgroundMime) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(user.backgroundData), {
    headers: {
      "Content-Type": user.backgroundMime,
      "Cache-Control": "private, max-age=60",
    },
  });
}
