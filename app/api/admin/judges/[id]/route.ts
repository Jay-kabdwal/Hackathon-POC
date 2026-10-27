import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUniqueConstraintError(error: unknown): boolean {
  return isRecord(error) && error.code === "P2002";
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    if (
      !(await prisma.judge.findUnique({ where: { id }, select: { id: true } }))
    ) {
      return NextResponse.json(
        { success: false, message: "Judge not found." },
        { status: 404 },
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
        { success: false, message: "At least one field must be updated." },
        { status: 400 },
      );
    }

    const data: { name?: string; email?: string; isActive?: boolean } = {};
    if ("name" in body) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { success: false, message: "Name must be a non-empty string." },
          { status: 400 },
        );
      }
      data.name = body.name.trim();
    }
    if ("email" in body) {
      if (typeof body.email !== "string" || !isValidEmail(body.email.trim())) {
        return NextResponse.json(
          { success: false, message: "Email must be valid." },
          { status: 400 },
        );
      }
      data.email = body.email.trim().toLowerCase();
    }
    if ("isActive" in body) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { success: false, message: "isActive must be a boolean." },
          { status: 400 },
        );
      }
      data.isActive = body.isActive;
    }

    const allowedFields = new Set(["name", "email", "isActive"]);
    if (
      Object.keys(body).some((field) => !allowedFields.has(field)) ||
      Object.keys(data).length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only name, email, and isActive may be updated.",
        },
        { status: 400 },
      );
    }

    const judge = await prisma.judge.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Judge updated successfully.",
      data: judge,
    });
  } catch (error) {
    if (isRecord(error) && error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Judge not found." },
        { status: 404 },
      );
    }
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { success: false, message: "A judge with this email already exists." },
        { status: 409 },
      );
    }

    console.error("Admin judge update failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update the judge." },
      { status: 500 },
    );
  }
}
