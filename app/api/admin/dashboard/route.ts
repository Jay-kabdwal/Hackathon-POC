import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    try {
        const admin = await getCurrentAdmin();

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const [teamCount, participantCount, judgeCount, activeJudgeCount, settings] =
            await prisma.$transaction([
                prisma.team.count(),
                prisma.teamMember.count(),
                prisma.judge.count(),
                prisma.judge.count({ where: { isActive: true } }),
                prisma.hackathonSettings.findUnique({ where: { id: 1 } }),
            ]);

        return NextResponse.json({
            success: true,
            message: "Dashboard data retrieved successfully.",
            data: {
                totalTeams: teamCount,
                totalParticipants: participantCount,
                totalJudges: judgeCount,
                activeJudges: activeJudgeCount,
                settings: settings ?? {
                    judgingEnabled: false,
                    resultStage: "HIDDEN",
                    updatedAt: null,
                },
            },
        });
    } catch (error) {
        console.error("Admin dashboard request failed:", error);
        return NextResponse.json(
            { success: false, message: "Unable to load dashboard data." },
            { status: 500 }
        );
    }
}