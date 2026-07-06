import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth();
  const user = session!.user;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Admin</h1>
      <p className="mt-1 text-slate-500">Platform administration (Phase 0 shell)</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Signed in as</p>
          <p className="mt-1 font-medium">{user.email}</p>
          <p className="text-sm text-doora-orange">{user.role}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Auth & email</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>OTP email verification on signup</li>
            <li>
              <a href="/admin/emails" className="text-doora-orange hover:underline">
                View email delivery logs
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
