import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, currentPassword, newPassword } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: { name?: string; hashedPassword?: string } = {};

  if (name !== undefined) {
    updates.name = name.trim() || (user.name ?? "");
  }

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 });
    const valid = user.hashedPassword && await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    updates.hashedPassword = await bcrypt.hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: updates,
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(updated);
}
