import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

  const assets = await prisma.asset.findMany({
    where: { campaignId },
    include: { addedBy: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assets);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, url, campaignId } = await req.json();
  if (!url?.trim()) return NextResponse.json({ error: "URL required" }, { status: 400 });
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

  const provider = detectProvider(url);

  const asset = await prisma.asset.create({
    data: {
      title: title?.trim() || urlToTitle(url),
      url: url.trim(),
      provider,
      campaignId,
      addedById: session.user.id,
    },
    include: { addedBy: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(asset);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.asset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

function detectProvider(url: string): string {
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) return "google_drive";
  if (url.includes("onedrive.live.com") || url.includes("1drv.ms") || url.includes("sharepoint.com")) return "onedrive";
  return "other";
}

function urlToTitle(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace("www.", "");
  } catch {
    return "Untitled link";
  }
}
