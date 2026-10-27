import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const team = await prisma.team.findUnique({
      where: { id },
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
    });

    if (!team) {
      return NextResponse.json(
        { success: false, message: "Team not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team retrieved successfully.",
      data: team,
    });
  } catch (error) {
    console.error("Admin team request failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load the team." },
      { status: 500 },
    );
  }
}
