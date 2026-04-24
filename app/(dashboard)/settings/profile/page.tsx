import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import ProfileClient from "@/components/settings/ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) return null;

  return <ProfileClient user={user} />;
}
