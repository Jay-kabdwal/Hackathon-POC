import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendJudgeOtpEmail } from "@/lib/email";

export const runtime = "nodejs";

const OTP_EXPIRATION_MINUTES = 5;
const REQUEST_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;
const requestAttempts = new Map<string, number[]>();
const GENERIC_LOGIN_MESSAGE =
    "If the account is eligible, a verification code will be sent.";

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const recent = (requestAttempts.get(key) ?? []).filter(
        (timestamp) => now - timestamp < REQUEST_WINDOW_MS
    );

    if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
        requestAttempts.set(key, recent);
        return true;
    }

    recent.push(now);
    requestAttempts.set(key, recent);
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

    if (!isValidEmail(email)) {
        return NextResponse.json(
            { success: false, message: "A valid email is required." },
            { status: 400 }
        );
    }

    const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0].trim();
    const rateLimitKey = `${clientKey || "unknown"}:${email}`;
    if (isRateLimited(rateLimitKey)) {
        return NextResponse.json(
            { success: false, message: "Too many OTP requests. Try again later." },
            { status: 429 }
        );
    }

    try {
        const judge = await prisma.judge.findUnique({
            where: { email },
            select: { id: true, name: true, email: true, isActive: true },
        });

        if (!judge || !judge.isActive) {
            return NextResponse.json(
                {
                    success: true,
                    message: GENERIC_LOGIN_MESSAGE,
                    data: { email, expiresInSeconds: OTP_EXPIRATION_MINUTES * 60 },
                },
                { status: 202 }
            );
        }

        const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
        const codeHash = await bcrypt.hash(otp, 12);
        const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

        const otpRecord = await prisma.$transaction(async (transaction) => {
            await transaction.judgeOTP.updateMany({
                where: { judgeId: judge.id, usedAt: null },
                data: { usedAt: new Date() },
            });

            return transaction.judgeOTP.create({
                data: { judgeId: judge.id, codeHash, expiresAt },
                select: { id: true },
            });
        });

        const emailSent = await sendJudgeOtpEmail({
            judgeName: judge.name,
            judgeEmail: judge.email,
            otp,
            expiresInMinutes: OTP_EXPIRATION_MINUTES,
        });

        if (!emailSent) {
            await prisma.judgeOTP.updateMany({
                where: { id: otpRecord.id, usedAt: null },
                data: { usedAt: new Date() },
            });

            console.error("Judge OTP email delivery failed.");
            return NextResponse.json(
                {
                    success: true,
                    message: GENERIC_LOGIN_MESSAGE,
                    data: { email, expiresInSeconds: OTP_EXPIRATION_MINUTES * 60 },
                },
                { status: 202 }
            );
        }

        return NextResponse.json({
            success: true,
            message: GENERIC_LOGIN_MESSAGE,
            data: { email, expiresInSeconds: OTP_EXPIRATION_MINUTES * 60 },
        }, { status: 202 });
    } catch (error) {
        console.error("Judge login failed:", error);
        return NextResponse.json(
            { success: false, message: "Unable to start judge login." },
            { status: 500 }
        );
    }
}