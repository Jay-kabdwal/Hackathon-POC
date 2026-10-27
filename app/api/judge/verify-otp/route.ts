import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    getJudgeCookieMaxAge,
    getJudgeCookieOptions,
    JUDGE_AUTH_COOKIE,
    signJudgeToken,
    createAuthSession,
    cleanupExpiredAuthData,
} from "@/lib/auth";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;
const VERIFY_WINDOW_MS = 15 * 60 * 1000;
const MAX_VERIFY_REQUESTS = 10;
const verificationAttempts = new Map<string, number[]>();

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const recent = (verificationAttempts.get(key) ?? []).filter(
        (timestamp) => now - timestamp < VERIFY_WINDOW_MS
    );
    if (recent.length >= MAX_VERIFY_REQUESTS) {
        verificationAttempts.set(key, recent);
        return true;
    }
    recent.push(now);
    verificationAttempts.set(key, recent);
    return false;
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

    const email =
        isRecord(body) && typeof body.email === "string"
            ? body.email.trim().toLowerCase()
            : "";
    const otp = isRecord(body) && typeof body.otp === "string" ? body.otp : "";

    if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
        return NextResponse.json(
            { success: false, message: "A valid email and 6-digit OTP are required." },
            { status: 400 }
        );
    }

    const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0].trim();
    if (isRateLimited(`${clientKey || "unknown"}:${email}`)) {
        return NextResponse.json(
            { success: false, message: "Too many verification attempts. Try again later." },
            { status: 429 }
        );
    }

    try {
        await cleanupExpiredAuthData();
        const judge = await prisma.judge.findUnique({
            where: { email },
            select: { id: true, name: true, email: true, isActive: true },
        });
        if (!judge || !judge.isActive) {
            return NextResponse.json(
                { success: false, message: "Judge account not found or inactive." },
                { status: 401 }
            );
        }

        const now = new Date();
        const otpRecord = await prisma.judgeOTP.findFirst({
            where: {
                judgeId: judge.id,
                usedAt: null,
                expiresAt: { gt: now },
                attempts: { lt: MAX_ATTEMPTS },
            },
            orderBy: { createdAt: "desc" },
        });

        if (!otpRecord) {
            return NextResponse.json(
                { success: false, message: "The verification code is invalid or expired." },
                { status: 401 }
            );
        }

        const matches = await bcrypt.compare(otp, otpRecord.codeHash);
        if (!matches) {
            const attemptUpdate = await prisma.judgeOTP.updateMany({
                where: {
                    id: otpRecord.id,
                    usedAt: null,
                    attempts: { lt: MAX_ATTEMPTS },
                },
                data: { attempts: { increment: 1 } },
            });

            if (attemptUpdate.count > 0) {
                await prisma.judgeOTP.deleteMany({
                    where: { id: otpRecord.id, attempts: { gte: MAX_ATTEMPTS } },
                });
            }

            return NextResponse.json(
                { success: false, message: "The verification code is invalid." },
                { status: 401 }
            );
        }

        const consumed = await prisma.judgeOTP.deleteMany({
            where: {
                id: otpRecord.id,
                judgeId: judge.id,
                usedAt: null,
                expiresAt: { gt: new Date() },
                attempts: { lt: MAX_ATTEMPTS },
            },
        });

        if (consumed.count !== 1) {
            return NextResponse.json(
                { success: false, message: "The verification code is invalid or expired." },
                { status: 401 }
            );
        }

        const jti = randomUUID();
        const token = signJudgeToken(judge.id, jti);
        await createAuthSession(judge.id, "JUDGE", jti);
        const response = NextResponse.json({
            success: true,
            message: "Judge login successful.",
            data: { id: judge.id, name: judge.name, email: judge.email },
        });
        response.cookies.set(JUDGE_AUTH_COOKIE, token, {
            ...getJudgeCookieOptions(),
            maxAge: getJudgeCookieMaxAge(),
        });
        return response;
    } catch (error) {
        console.error("Judge OTP verification failed:", error);
        return NextResponse.json(
            { success: false, message: "Unable to verify the code." },
            { status: 500 }
        );
    }
}