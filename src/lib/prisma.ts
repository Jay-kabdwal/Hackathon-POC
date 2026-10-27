import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const configuredConnectionString = process.env.DATABASE_URL;

  if (!configuredConnectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const connectionUrl = new URL(configuredConnectionString);
  const sslMode = connectionUrl.searchParams.get("sslmode")?.toLowerCase();
  if (
    sslMode === "require" ||
    sslMode === "prefer" ||
    sslMode === "verify-ca"
  ) {
    connectionUrl.searchParams.set("sslmode", "verify-full");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionUrl.toString() }),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
