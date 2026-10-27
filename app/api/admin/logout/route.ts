import { NextResponse } from "next/server";
import {
    ADMIN_AUTH_COOKIE,
    getAdminCookieOptions,
    revokeAuthSession,
    verifyAdminToken,
} from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST() {
    try {
        const token = (await cookies()).get(ADMIN_AUTH_COOKIE)?.value;
        if (token) {
            try { await revokeAuthSession(verifyAdminToken(token).jti); } catch { /* cookie is cleared below */ }
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