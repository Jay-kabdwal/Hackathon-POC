import { NextResponse } from "next/server";
import { getCurrentJudge } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JudgingRound } from "@/generated/prisma/enums";

export const runtime = "nodejs";
const rounds = Object.values(JudgingRound);

function getMaxScore(): number {
    const configured = Number.parseInt(process.env.JUDGE_MAX_SCORE ?? "100", 10);
    return Number.isInteger(configured) && configured > 0 ? configured : 100;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
    try {
        const judge = await getCurrentJudge();
        if (!judge) {
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

        if (
            !isRecord(body) ||
            typeof body.teamId !== "string" ||
            typeof body.round !== "string" ||
            typeof body.points !== "number" ||
            !Number.isInteger(body.points) ||
            body.points < 0 ||
            body.points > getMaxScore() ||
            !rounds.includes(body.round as JudgingRound)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: `teamId, round, and integer points between 0 and ${getMaxScore()} are required.`,
                },
                { status: 400 }
            );
        }

        const settings = await prisma.hackathonSettings.findUnique({
            where: { id: 1 },
            select: { judgingEnabled: true, judgingRound: true, resultStage: true },
        });
        if (!settings?.judgingEnabled) {
            return NextResponse.json(
                { success: false, message: "Judging is not currently enabled." },
                { status: 403 }
            );
        }

        const requestedRound = body.round as JudgingRound;
        if (settings.judgingRound !== requestedRound) {
            return NextResponse.json(
                { success: false, message: `Judging is not currently open for the ${requestedRound} round.` },
                { status: 403 }
            );
        }

        const roundAlreadyRevealed =
            settings.resultStage === "FINAL_REVEALED" ||
            (requestedRound === JudgingRound.IDEA &&
                settings.resultStage === "IDEA_REVEALED");
        if (roundAlreadyRevealed) {
            return NextResponse.json(
                { success: false, message: "Scores for this round are locked after results are revealed." },
                { status: 403 }
            );
        }

        const team = await prisma.team.findFirst({
            where: { id: body.teamId, assignments: { some: { judgeId: judge.id } } },
            select: { id: true },
        });
        if (!team) {
            return NextResponse.json(
                { success: false, message: "Team not found." },
                { status: 404 }
            );
        }

        const score = await prisma.score.upsert({
            where: {
                teamId_judgeId_round: {
                    teamId: team.id,
                    judgeId: judge.id,
                    round: requestedRound,
                },
            },
            create: {
                teamId: team.id,
                judgeId: judge.id,
                round: requestedRound,
                points: body.points,
            },
            update: { points: body.points },
            select: {
                id: true,
                teamId: true,
                round: true,
                points: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Score saved successfully.",
            data: score,
        });
    } catch (error) {
        console.error("Judge score request failed:", error);
        return NextResponse.json(
            { success: false, message: "Unable to save the score." },
            { status: 500 }
        );
    }
}