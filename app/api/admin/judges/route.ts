import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUniqueConstraintError(error: unknown): boolean {
    return (
        isRecord(error) &&
        error.code === "P2002"
    );
}

function parsePositiveInteger(value: string | null, fallback: number): number | null {
    if (value === null) return fallback;
    if (!/^[1-9]\d*$/.test(value)) return null;
    return Number(value);
}

export async function POST(request: Request) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid JSON body." },
                { status: 400 }
            );
        }

        if (!isRecord(body) || typeof body.name !== "string" || typeof body.email !== "string") {
            return NextResponse.json(
                { success: false, message: "Name and email are required." },
                { status: 400 }
            );
        }

        const name = body.name.trim();
        const email = body.email.trim().toLowerCase();
        if (!name || !isValidEmail(email)) {
            return NextResponse.json(
                { success: false, message: "A non-empty name and valid email are required." },
                { status: 400 }
            );
        }

        const judge = await prisma.$transaction(async (transaction) => {
            const createdJudge = await transaction.judge.create({
                data: { name, email },
                select: { id: true, name: true, email: true, isActive: true, createdAt: true },
            });
            const teams = await transaction.team.findMany({ select: { id: true } });
            if (teams.length > 0) {
                await transaction.judgeTeamAssignment.createMany({
                    data: teams.map((team) => ({ judgeId: createdJudge.id, teamId: team.id })),
                    skipDuplicates: true,
                });
            }
            return createdJudge;
        });

        return NextResponse.json(
            {
                success: true,
                message: "Judge created successfully.",
                data: judge,
            },
            { status: 201 }
        );
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            return NextResponse.json(
                { success: false, message: "A judge with this email already exists." },
                { status: 409 }
            );
        }

        console.error("Admin judge creation failed:", error);
        return NextResponse.json(
            { success: false, message: "Unable to create the judge." },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const page = parsePositiveInteger(url.searchParams.get("page"), 1);
        const limit = parsePositiveInteger(url.searchParams.get("limit"), 20);
        const search = url.searchParams.get("search")?.trim() ?? "";

        if (page === null || limit === null || limit > 100) {
            return NextResponse.json(
                { success: false, message: "Invalid pagination parameters." },
                { status: 400 }
            );
        }

        const where = search
            ? {
                  OR: [
                      { name: { contains: search, mode: "insensitive" as const } },
                      { email: { contains: search, mode: "insensitive" as const } },
                  ],
              }
            : {};
        const skip = (page - 1) * limit;

        const [total, judges] = await prisma.$transaction([
            prisma.judge.count({ where }),
            prisma.judge.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isActive: true,
                    createdAt: true,
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: "Judges retrieved successfully.",
            data: {
                judges,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("Admin judges request failed:", error);
        return NextResponse.json(
            { success: false, message: "Unable to load judges." },
            { status: 500 }
        );
    }
}