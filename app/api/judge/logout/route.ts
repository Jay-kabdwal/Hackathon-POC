import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getJudgeCookieOptions,
  JUDGE_AUTH_COOKIE,
  revokeAuthSession,
  verifyJudgeToken,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const token = (await cookies()).get(JUDGE_AUTH_COOKIE)?.value;
  if (token) {
    try {
      await revokeAuthSession(verifyJudgeToken(token).jti);
    } catch {
      /* cookie is cleared below */
    }
  }
  const response = NextResponse.json({
    success: true,
    message: "Logout successful.",
  });
  response.cookies.set(JUDGE_AUTH_COOKIE, "", {
    ...getJudgeCookieOptions(),
    maxAge: 0,
  });
  return response;
}
