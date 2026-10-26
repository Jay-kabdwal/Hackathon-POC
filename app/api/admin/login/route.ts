import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    ADMIN_AUTH_COOKIE,
    getAdminCookieMaxAge,
    getAdminCookieOptions,
    signAdminToken,
} from "@/lib/auth";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid JSON body." },
            { status: 400 }
        );
    }

    if (!isRecord(body)) {
        return NextResponse.json(
            { success: false, message: "Request body must be an object." },
            { status: 400 }
        );
    }

    const email =
        typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !isValidEmail(email) || !password) {
        return NextResponse.json(
            { success: false, message: "A valid email and password are required." },
            { status: 400 }
        );
    }

    try {
        const admin = await prisma.superAdmin.findUnique({
            where: { email },
            select: { id: true, email: true, passwordHash: true },
        });

        if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password." },
                { status: 401 }
            );
        }

        const token = signAdminToken(admin.id);
        const response = NextResponse.json(
            {
                success: true,
                message: "Login successful.",
                data: { id: admin.id, email: admin.email },
            },
            { status: 200 }
        );

        response.cookies.set(ADMIN_AUTH_COOKIE, token, {
            ...getAdminCookieOptions(),
            maxAge: getAdminCookieMaxAge(),
        });

        return response;
    } catch (error) {
        console.error("Admin login failed:", error);

        if (
            error instanceof Error &&
            (error.message === "JWT_SECRET is not configured." ||
                error.message.startsWith("JWT_EXPIRES_IN must be"))
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication is not configured on the server.",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Unable to log in right now." },
            { status: 500 }
        );
    }
}