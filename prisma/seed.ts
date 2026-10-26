import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error(
            "ADMIN_EMAIL and ADMIN_PASSWORD must be configured before seeding."
        );
    }

    if (password.length < 8) {
        throw new Error("ADMIN_PASSWORD must be at least 8 characters long.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.superAdmin.upsert({
        where: { email },
        update: {},
        create: {
            email,
            passwordHash,
        },
    });

    console.log(`Admin created or already exists: ${email}`);
}

main()
    .catch((error) => {
        console.error("Failed to seed admin:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });