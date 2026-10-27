import { NextResponse } from "next/server";
import { getCurrentJudge } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const MAX_LIMIT = 100;

function parsePositiveInteger(
  value: string | null,
  fallback: number,
): number | null {
  if (value === null) return fallback;
  if (!/^[1-9]\d*$/.test(value)) return null;
  return Number(value);
}

export async function GET(request: Request) {
  try {
    const judge = await getCurrentJudge();
    if (!judge) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const page = parsePositiveInteger(url.searchParams.get("page"), 1);
    const limit = parsePositiveInteger(url.searchParams.get("limit"), 20);
    if (page === null || limit === null || limit > MAX_LIMIT) {
      return NextResponse.json(
        { success: false, message: "Invalid pagination parameters." },
        { status: 400 },
      );
    }

    const assignmentWhere = { assignments: { some: { judgeId: judge.id } } };
    const [total, teams, settings] = await prisma.$transaction([
      prisma.team.count({ where: assignmentWhere }),
      prisma.team.findMany({
        where: assignmentWhere,
        orderBy: { teamNumber: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          teamNumber: true,
          name: true,
          members: { select: { name: true } },
        },
      }),
      prisma.hackathonSettings.findUnique({
        where: { id: 1 },
        select: { judgingEnabled: true, judgingRound: true, resultStage: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Teams retrieved successfully.",
      data: {
        teams: teams.map((team) => ({
          id: team.id,
          teamNumber: team.teamNumber,
          teamName: team.name,
          members: team.members.map((member) => member.name),
          memberCount: team.members.length,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        settings: settings ?? {
          judgingEnabled: false,
          judgingRound: "IDEA",
          resultStage: "HIDDEN",
        },
      },
    });
  } catch (error) {
    console.error("Judge teams request failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load teams." },
      { status: 500 },
    );
  }
}
