import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JudgingRound, ResultStage } from "@/generated/prisma/enums";

export const runtime = "nodejs";

const resultStages = Object.values(ResultStage);
const judgingRounds = Object.values(JudgingRound);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function PATCH(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body." },
        { status: 400 },
      );
    }

    if (!isRecord(body) || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one setting must be updated." },
        { status: 400 },
      );
    }

    const data: {
      judgingEnabled?: boolean;
      judgingRound?: JudgingRound;
      resultStage?: ResultStage;
    } = {};

    if ("judgingEnabled" in body) {
      if (typeof body.judgingEnabled !== "boolean") {
        return NextResponse.json(
          { success: false, message: "judgingEnabled must be a boolean." },
          { status: 400 },
        );
      }
      data.judgingEnabled = body.judgingEnabled;
    }

    if ("judgingRound" in body) {
      if (
        typeof body.judgingRound !== "string" ||
        !judgingRounds.includes(body.judgingRound as JudgingRound)
      ) {
        return NextResponse.json(
          { success: false, message: "judgingRound is invalid." },
          { status: 400 },
        );
      }
      data.judgingRound = body.judgingRound as JudgingRound;
    }

    if ("resultStage" in body) {
      if (
        typeof body.resultStage !== "string" ||
        !resultStages.includes(body.resultStage as ResultStage)
      ) {
        return NextResponse.json(
          { success: false, message: "resultStage is invalid." },
          { status: 400 },
        );
      }
      data.resultStage = body.resultStage as ResultStage;
    }

    const allowedFields = new Set([
      "judgingEnabled",
      "judgingRound",
      "resultStage",
    ]);
    if (
      Object.keys(body).some((field) => !allowedFields.has(field)) ||
      Object.keys(data).length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only judgingEnabled, judgingRound, and resultStage may be updated.",
        },
        { status: 400 },
      );
    }

    const settings = await prisma.hackathonSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        judgingEnabled: data.judgingEnabled ?? false,
        judgingRound: data.judgingRound ?? JudgingRound.IDEA,
        resultStage: data.resultStage ?? ResultStage.HIDDEN,
      },
      update: data,
      select: {
        id: true,
        judgingEnabled: true,
        judgingRound: true,
        resultStage: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("Admin settings update failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update settings." },
      { status: 500 },
    );
  }
}
