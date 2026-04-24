import { prisma } from "@/lib/db/client";

export type Provider = "HUBSPOT" | "GA4" | "META" | "GOOGLE_ADS" | "SALESFORCE";

export async function saveTokens(
  userId: string,
  provider: Provider,
  accessToken: string,
  refreshToken?: string | null,
  expiresAt?: Date | null
) {
  await prisma.integration.upsert({
    where: { userId_provider: { userId, provider } },
    update: { accessToken, refreshToken: refreshToken ?? null, expiresAt: expiresAt ?? null, updatedAt: new Date() },
    create: { userId, provider, accessToken, refreshToken: refreshToken ?? null, expiresAt: expiresAt ?? null },
  });
}

export async function getToken(userId: string, provider: Provider) {
  return prisma.integration.findUnique({ where: { userId_provider: { userId, provider } } });
}

export function appUrl() {
  return process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}
