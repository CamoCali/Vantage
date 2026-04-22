import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("vantage2026!", 12);

  const user = await prisma.user.upsert({
    where: { email: "derek@fendigital.com" },
    update: {},
    create: {
      email: "derek@fendigital.com",
      name: "Derek Feniger",
      hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✓ Created user:", user.email);
  console.log("  Password: vantage2026!");
  console.log("\nChange your password after first login.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
