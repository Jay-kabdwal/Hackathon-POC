
import { NextResponse } from "next/server";
import { sendRegistrationConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type MemberInput = {
    name: string;
    email: string;
    employeeId: string;
    isLeader: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

    if (!isRecord(body)) {
        return NextResponse.json(
            { success: false, message: "Request body must be an object." },
            { status: 400 }
        );
    }

    const teamName = body.teamName;
    const rawMembers = body.members;

    if (!isNonEmptyString(teamName)) {
        return NextResponse.json(
            { success: false, message: "Team name is required." },
            { status: 400 }
        );
    }

    if (!Array.isArray(rawMembers) || rawMembers.length < 1 || rawMembers.length > 4) {
        return NextResponse.json(
            { success: false, message: "A team must have between 1 and 4 members." },
            { status: 400 }
        );
    }

    const members: MemberInput[] = [];

    for (const member of rawMembers) {
        if (
            !isRecord(member) ||
            !isNonEmptyString(member.name) ||
            !isNonEmptyString(member.email) ||
            !isNonEmptyString(member.employeeId) ||
            typeof member.isLeader !== "boolean"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Each member must have a name, email, employee ID, and boolean isLeader.",
                },
                { status: 400 }
            );
        }

        const normalizedMember: MemberInput = {
            name: member.name.trim(),
            email: member.email.trim().toLowerCase(),
            employeeId: member.employeeId.trim(),
            isLeader: member.isLeader,
        };

        if (!isValidEmail(normalizedMember.email)) {
            return NextResponse.json(
                { success: false, message: "One or more email addresses are invalid." },
                { status: 400 }
            );
        }

        members.push(normalizedMember);
    }

    if (members.filter((member) => member.isLeader).length !== 1) {
        return NextResponse.json(
            { success: false, message: "Exactly one team leader is required." },
            { status: 400 }
        );
    }

    const emails = members.map((member) => member.email);
    const employeeIds = members.map((member) => member.employeeId);

    if (new Set(emails).size !== emails.length) {
        return NextResponse.json(
            { success: false, message: "A member email is repeated within this team." },
            { status: 409 }
        );
    }

    if (new Set(employeeIds).size !== employeeIds.length) {
        return NextResponse.json(
            { success: false, message: "An employee ID is repeated within this team." },
            { status: 409 }
        );
    }

    const normalizedTeamName = teamName.trim();
    const leader = members.find((member) => member.isLeader)!;

    try {
        const team = await prisma.$transaction(async (transaction) => {
            const createdTeam = await transaction.team.create({
                data: {
                    name: normalizedTeamName,
                    members: {
                        create: members.map((member) => ({
                            name: member.name,
                            email: member.email,
                            employeeId: member.employeeId,
                            isLeader: member.isLeader,
                        })),
                    },
                },
                select: { id: true, name: true, teamNumber: true, createdAt: true },
            });
            const judges = await transaction.judge.findMany({
                where: { isActive: true },
                select: { id: true },
            });
            if (judges.length > 0) {
                await transaction.judgeTeamAssignment.createMany({
                    data: judges.map((judge) => ({ judgeId: judge.id, teamId: createdTeam.id })),
                    skipDuplicates: true,
                });
            }
            return createdTeam;
        });

        // Email delivery happens after the database commit and cannot roll it back.
        const emailSent = await sendRegistrationConfirmationEmail({
            leaderName: leader.name,
            leaderEmail: leader.email,
            teamName: team.name,
            teamNumber: team.teamNumber,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Team registered successfully.",
                data: {
                    id: team.id,
                    teamName: team.name,
                    teamNumber: team.teamNumber,
                    registeredAt: team.createdAt,
                    emailSent,
                },
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        // Prisma unique constraint violation.
        if (
            isRecord(error) &&
            error.code === "P2002"
        ) {
            const target = isRecord(error.meta) ? error.meta.target : undefined;
            const fields = Array.isArray(target)
                ? target.map(String)
                : typeof target === "string"
                    ? [target]
                    : [];

            if (fields.includes("email")) {
                return NextResponse.json(
                    { success: false, message: "A member email is already registered." },
                    { status: 409 }
                );
            }

            if (fields.includes("employeeId")) {
                return NextResponse.json(
                    { success: false, message: "An employee ID is already registered." },
                    { status: 409 }
                );
            }

            if (fields.includes("name")) {
                return NextResponse.json(
                    { success: false, message: "This team name is already taken." },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { success: false, message: "A unique field already exists." },
                { status: 409 }
            );
        }

        console.error("Team registration failed:", error);

        return NextResponse.json(
            { success: false, message: "Unable to register the team right now." },
            { status: 500 }
        );
    }
}
