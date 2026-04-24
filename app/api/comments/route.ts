import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { campaignId },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, campaignId, metricKey } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      authorId: session.user.id,
      campaignId: campaignId ?? null,
      metricKey: metricKey ?? null,
    },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(comment);
}
