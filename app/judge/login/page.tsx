import { redirect } from "next/navigation";
import { getCurrentJudge } from "@/lib/auth";
import JudgeLoginForm from "./judge-login-form";

export default async function JudgeLoginPage() {
  const judge = await getCurrentJudge();
  if (judge) redirect("/judge/dashboard");

  return <JudgeLoginForm />;
}
