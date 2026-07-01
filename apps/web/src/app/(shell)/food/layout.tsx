import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { FoodHeader } from "@/components/food/food-header";

export default async function FoodLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return null;

  if (session.user.role === "CAFETERIA" && !session.user.cafeteriaId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-col">
      <FoodHeader />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
