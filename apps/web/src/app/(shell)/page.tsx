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
      color: "bg-doora-orange-soft text-doora-orange-dark",
    },
    {
      href: "/chat",
      title: "Chat",
      description: "Message residents and staff in real time",
      icon: MessageSquare,
      color: "bg-slate-200 text-doora-navy",
    },
    {
      href: "/room",
      title: "Smart Room",
      description: "Control lights, climate, and routines",
      icon: Zap,
      color: "bg-doora-success-soft text-doora-success",
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
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-doora-orange/40 hover:shadow-md"
          >
            <div className={`mb-4 inline-flex rounded-xl p-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-doora-orange-soft bg-doora-orange-soft p-6">
        <h2 className="font-semibold text-doora-navy">Food + Chat + Room live</h2>
        <p className="mt-1 text-sm text-doora-navy-light">
          Order food, chat in real time, and control your smart room. Doora AI cross-domain tools are next.
        </p>
      </div>
    </div>
  );
}
