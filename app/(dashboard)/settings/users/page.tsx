import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import UsersClient from "@/components/settings/UsersClient";

export default async function UsersPage() {
  const session = await auth();

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const currentUser = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { role: true },
  });

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <UsersClient
      initialUsers={users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
      currentUserId={session?.user?.id}
      isAdmin={isAdmin ?? false}
    />
  );
}
