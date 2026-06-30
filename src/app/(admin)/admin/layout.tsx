import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { ShieldCheck, Users, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin — ViralForge.ai" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 p-4 md:flex">
        <div className="px-2 py-2">
          <Logo href="/dashboard" />
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Admin Panel</span>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border pt-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      <main className="flex-1">
        <div className="container max-w-6xl py-8">{children}</div>
      </main>
    </div>
  );
}
