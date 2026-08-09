// Secret Admin Entry Page — Server Component
// URL: /z4q8wx-postr-92k
import { cookies } from "next/headers";
import LoginForm from "./LoginForm";
import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: "Dashboard",
  robots: "noindex, nofollow", // Never indexed by search engines
};

export default async function SecretAdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const isAuthenticated =
    session?.value === process.env.ADMIN_SESSION_SECRET;

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <AdminDashboard />;
}
