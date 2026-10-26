import { NextResponse } from "next/server";
import {
    ADMIN_AUTH_COOKIE,
    getAdminCookieOptions,
    getCurrentAdmin,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const response = NextResponse.json(
            { success: true, message: "Logout successful.", data: {} },
            { status: 200 }
        );

        response.cookies.set(ADMIN_AUTH_COOKIE, "", {
            ...getAdminCookieOptions(),
            maxAge: 0,
        });

        return response;
    } catch (error) {
        console.error("Admin logout failed:", error);
        return NextResponse.json(
            { success: false, message: "Unable to log out right now." },
            { status: 500 }
        );
    }
}