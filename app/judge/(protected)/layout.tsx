import { redirect } from "next/navigation";
import { getCurrentJudge } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedJudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const judge = await getCurrentJudge();
  if (!judge) redirect("/judge/login");
  return children;
}
