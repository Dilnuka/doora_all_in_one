import { auth } from "@/lib/auth";
import Link from "next/link";
import { MessageSquare, UtensilsCrossed, Zap } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const user = session!.user;

  const cards = [
    {
      href: "/food",
      title: "Food",
      description: "Order from campus cafeterias",
      icon: UtensilsCrossed,
      color: "bg-orange-100 text-orange-700",
    },
    {
      href: "/chat",
      title: "Chat",
      description: "Message residents and staff in real time",
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-700",
    },
    {
      href: "/room",
      title: "Smart Room",
      description: "Control lights, climate, and routines",
      icon: Zap,
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Hello, {user.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-slate-500">
          Welcome to Doora — your food, chat, and room in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, title, description, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
          >
            <div className={`mb-4 inline-flex rounded-xl p-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50 p-6">
        <h2 className="font-semibold text-violet-900">Food + Chat + Room live</h2>
        <p className="mt-1 text-sm text-violet-700">
          Order food, chat in real time, and control your smart room. Doora AI cross-domain tools are next.
        </p>
      </div>
    </div>
  );
}
