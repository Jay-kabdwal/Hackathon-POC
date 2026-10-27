import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import AdminLoginForm from "./admin-login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin/dashboard");

  return <AdminLoginForm />;
}
