import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JudgingRound, ResultStage } from "@/generated/prisma/enums";

export const runtime = "nodejs";

type RoundScores = {
  idea: number;
  solution: number;
};

type RankedResult = {
  teamId: string;
  teamNumber: number;
  teamName: string;
  ideaScore: number;
  solutionScore?: number;
  totalScore: number;
  rank: number;
};

function rankResults(results: RankedResult[]): RankedResult[] {
  let previousTotal: number | undefined;
  let previousRank = 0;

  return results.map((result, index) => {
    const rank = previousTotal === result.totalScore ? previousRank : index + 1;
    previousTotal = result.totalScore;
    previousRank = rank;
    return { ...result, rank };
  });
}

export async function GET() {
  try {
    const settings = await prisma.hackathonSettings.findUnique({
      where: { id: 1 },
      select: { resultStage: true },
    });
    const resultStage = settings?.resultStage ?? ResultStage.HIDDEN;

    if (resultStage === ResultStage.HIDDEN) {
      return NextResponse.json({
        success: true,
        message: "Results have not been released yet.",
        data: {
          resultStage,
          released: false,
          results: [],
        },
      });
    }

    const teams = await prisma.team.findMany({
      orderBy: { teamNumber: "asc" },
      select: {
        id: true,
        teamNumber: true,
        name: true,
        scores: {
          select: {
            round: true,
            points: true,
          },
        },
      },
    });

    const roundScores = new Map<string, RoundScores>();
    for (const team of teams) {
      const scores: RoundScores = { idea: 0, solution: 0 };
      for (const score of team.scores) {
        if (score.round === JudgingRound.IDEA) {
          scores.idea += score.points;
        } else if (score.round === JudgingRound.SOLUTION) {
          scores.solution += score.points;
        }
      }
      roundScores.set(team.id, scores);
    }

    const results = teams
      .map((team): RankedResult => {
        const scores = roundScores.get(team.id) ?? {
          idea: 0,
          solution: 0,
        };
        const isFinal = resultStage === ResultStage.FINAL_REVEALED;

        return {
          teamId: team.id,
          teamNumber: team.teamNumber,
          teamName: team.name,
          ideaScore: scores.idea,
          ...(isFinal ? { solutionScore: scores.solution } : {}),
          totalScore: isFinal ? scores.idea + scores.solution : scores.idea,
          rank: 0,
        };
      })
      .sort(
        (left, right) =>
          right.totalScore - left.totalScore ||
          left.teamNumber - right.teamNumber,
      );

    return NextResponse.json({
      success: true,
      message:
        resultStage === ResultStage.IDEA_REVEALED
          ? "Idea results retrieved successfully."
          : "Final results retrieved successfully.",
      data: {
        resultStage,
        released: true,
        results: rankResults(results),
      },
    });
  } catch (error) {
    console.error("Results request failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load results." },
      { status: 500 },
    );
  }
}
