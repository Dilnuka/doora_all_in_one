import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/shell/sidebar";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
    </div>
  );
}
