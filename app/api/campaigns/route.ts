import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: { select: { status: true } },
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, status, startDate, endDate, budget } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const campaign = await prisma.campaign.create({
    data: {
      name: name.trim(),
      description: description?.trim() ?? null,
      status: status ?? "DRAFT",
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      budget: budget ? parseFloat(budget) : null,
      ownerId: session.user.id,
    },
    include: {
      tasks: { select: { status: true } },
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(campaign);
}
