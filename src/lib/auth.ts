import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

export const ADMIN_AUTH_COOKIE = "admin_token";
export const JUDGE_AUTH_COOKIE = "judge_token";

type AdminTokenPayload = {
    adminId: string;
};

type JudgeTokenPayload = {
    judgeId: string;
    role: "judge";
};

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }
    return secret;
}

function getJwtExpiresIn(): number {
    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
    const match = expiresIn.match(/^(\d+)\s*(s|m|h|d|w)$/i);
    if (!match) {
        throw new Error(
            "JWT_EXPIRES_IN must be a number followed by s, m, h, d, or w."
        );
    }

    const value = Number(match[1]);
    switch (match[2].toLowerCase()) {
        case "s":
            return value;
        case "m":
            return value * 60;
        case "h":
            return value * 60 * 60;
        case "d":
            return value * 24 * 60 * 60;
        case "w":
            return value * 7 * 24 * 60 * 60;
        default:
            throw new Error("Unsupported JWT_EXPIRES_IN unit.");
    }
}

export function signAdminToken(adminId: string): string {
    return jwt.sign({ adminId } satisfies AdminTokenPayload, getJwtSecret(), {
        expiresIn: getJwtExpiresIn(),
    });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
    const payload = jwt.verify(token, getJwtSecret());
    if (
        typeof payload !== "object" ||
        payload === null ||
        typeof payload.adminId !== "string" ||
        payload.adminId.length === 0
    ) {
        throw new Error("Invalid admin token payload.");
    }
    return { adminId: payload.adminId };
}

export function signJudgeToken(judgeId: string): string {
    return jwt.sign(
        { judgeId, role: "judge" } satisfies JudgeTokenPayload,
        getJwtSecret(),
        { expiresIn: getJwtExpiresIn() }
    );
}

export function verifyJudgeToken(token: string): JudgeTokenPayload {
    const payload = jwt.verify(token, getJwtSecret());
    if (
        typeof payload !== "object" ||
        payload === null ||
        typeof payload.judgeId !== "string" ||
        payload.judgeId.length === 0 ||
        payload.role !== "judge"
    ) {
        throw new Error("Invalid judge token payload.");
    }
    return { judgeId: payload.judgeId, role: "judge" };
}

export async function getCurrentAdmin() {
    const token = (await cookies()).get(ADMIN_AUTH_COOKIE)?.value;
    if (!token) return null;

    let payload: AdminTokenPayload;
    try {
        payload = verifyAdminToken(token);
    } catch {
        return null;
    }

    return prisma.superAdmin.findUnique({
        where: { id: payload.adminId },
        select: { id: true, email: true, createdAt: true },
    });
}

export async function getCurrentJudge() {
    const token = (await cookies()).get(JUDGE_AUTH_COOKIE)?.value;
    if (!token) return null;

    let payload: JudgeTokenPayload;
    try {
        payload = verifyJudgeToken(token);
    } catch {
        return null;
    }

    return prisma.judge.findFirst({
        where: { id: payload.judgeId, isActive: true },
        select: { id: true, name: true, email: true, isActive: true },
    });
}

export function getAdminCookieOptions() {
    return {
        httpOnly: true,
        sameSite: "strict" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
    };
}

export function getAdminCookieMaxAge(): number {
    return getJwtExpiresIn();
}

export function getJudgeCookieOptions() {
    return getAdminCookieOptions();
}

export function getJudgeCookieMaxAge(): number {
    return getJwtExpiresIn();
}
