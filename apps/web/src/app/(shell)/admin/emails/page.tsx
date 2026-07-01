import { auth } from "@/lib/auth";
import { getRecentEmailLogs } from "@/lib/email/send";

function statusClass(status: string) {
  if (status === "sent") return "bg-green-100 text-green-700";
  if (status === "dev_preview") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
}

export default async function AdminEmailLogsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  const logs = await getRecentEmailLogs(100);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Email logs</h1>
      <p className="mt-1 text-slate-500">OTP and outbound email delivery history</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Time</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">To</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Subject</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Provider</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No emails logged yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {log.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-900">{log.to}</td>
                  <td className="px-4 py-3 text-slate-600">{log.type}</td>
                  <td className="px-4 py-3 text-slate-600">{log.subject}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(log.status)}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.provider || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
