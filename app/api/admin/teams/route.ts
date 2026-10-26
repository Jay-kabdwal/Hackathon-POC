import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_LIMIT = 100;

function parsePositiveInteger(value: string | null, fallback: number): number | null {
    if (value === null) return fallback;
    if (!/^[1-9]\d*$/.test(value)) return null;
    return Number(value);
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
        const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
        const sortOrder = url.searchParams.get("sortOrder") ?? "desc";

        if (
            page === null ||
            limit === null ||
            limit > MAX_LIMIT ||
            !["createdAt", "teamNumber"].includes(sortBy) ||
            !["asc", "desc"].includes(sortOrder)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid pagination or sorting parameters." },
                { status: 400 }
            );
        }

        const numericSearch = /^\d+$/.test(search) ? Number(search) : undefined;
        const where = search
            ? {
                  OR: [
                      { name: { contains: search, mode: "insensitive" as const } },
                      ...(numericSearch === undefined
                          ? []
                          : [{ teamNumber: numericSearch }]),
                      {
                          members: {
                              some: {
                                  OR: [
                                      {
                                          name: {
                                              contains: search,
                                              mode: "insensitive" as const,
                                          },
                                      },
                                      {
                                          email: {
                                              contains: search,
                                              mode: "insensitive" as const,
                                          },
                                      },
                                      {
                                          employeeId: {
                                              contains: search,
                                              mode: "insensitive" as const,
                                          },
                                      },
                                  ],
                              },
                          },
                      },
                  ],
              }
            : {};

        const orderBy =
            sortBy === "teamNumber"
                ? { teamNumber: sortOrder as "asc" | "desc" }
                : { createdAt: sortOrder as "asc" | "desc" };
        const skip = (page - 1) * limit;

        const [total, teams] = await prisma.$transaction([
            prisma.team.count({ where }),
            prisma.team.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    teamNumber: true,
                    name: true,
                    createdAt: true,
                    members: {
                        select: {
                            name: true,
                            email: true,
                            employeeId: true,
                            isLeader: true,
                        },
                        orderBy: { name: "asc" },
                    },
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: "Teams retrieved successfully.",
            data: {
                teams: teams.map((team) => ({
                    ...team,
                    memberCount: team.members.length,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("Admin teams request failed:", error);
        return NextResponse.json(
            { success: false, message: "Unable to load teams." },
            { status: 500 }
        );
    }
}